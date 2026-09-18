"""
Yarani TTS microservice.

A stateless FastAPI app that turns text into MP3 speech using Microsoft Edge's
free neural voices (via the `edge-tts` library) and streams the bytes straight
back to the caller. Nothing touches disk, which keeps the service friendly to
free-tier hosts with ephemeral storage.

Long-form support
-----------------
Edge synthesizes at roughly 2x real-time, so a 30-minute narration would take
~15 minutes if generated serially. To make long inputs practical the text is
split on sentence boundaries into chunks that are synthesized concurrently
(bounded by TTS_CONCURRENCY) and streamed back in the original order. The
first chunk is kept deliberately small so playback can begin within seconds.

Run locally (or `npm run dev` from the repo root to start both services):
    uvicorn main:app --reload --port 8010
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import edge_tts
from edge_tts.exceptions import NoAudioReceived
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, field_validator

# --------------------------------------------------------------------------- #
# Configuration (all overridable via environment)
# --------------------------------------------------------------------------- #

def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


# Hard cap on input size. ~950 characters of English ≈ 1 minute of speech, so
# 40,000 characters ≈ 40 minutes of audio.
MAX_CHARS = _env_int("TTS_MAX_CHARS", 40_000)

# Chunking / concurrency. Each chunk is its own edge-tts session.
CHUNK_CHARS = _env_int("TTS_CHUNK_CHARS", 500)            # target size per chunk
FIRST_CHUNK_CHARS = _env_int("TTS_FIRST_CHUNK_CHARS", 300)  # small → fast first byte
CONCURRENCY = _env_int("TTS_CONCURRENCY", 10)             # per request
GLOBAL_CONCURRENCY = _env_int("TTS_GLOBAL_CONCURRENCY", 24)  # across all requests
CHUNK_RETRIES = _env_int("TTS_CHUNK_RETRIES", 3)

# Comma-separated list of browser origins allowed to call this service
# directly. Needed when the frontend bypasses its own proxy (long-form mode).
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# How long to trust the cached voice catalogue before refreshing it.
VOICES_TTL_SECONDS = _env_int("TTS_VOICES_TTL", 24 * 60 * 60)

# Shape of an edge-tts ShortName, e.g. "en-US-AndrewNeural". Used as a fallback
# validator if the live catalogue cannot be fetched.
_VOICE_ID_RE = re.compile(r"^[a-z]{2,3}-[A-Za-z]{2,10}-[A-Za-z0-9]+Neural$")

_WHITESPACE_RE = re.compile(r"[ \t\f\v]+")
# Sentence terminators across Latin, CJK, Arabic/Urdu and Devanagari scripts.
_SENTENCE_END_RE = re.compile(r"(?<=[.!?。！？؟।])\s+|\n+")

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("yarani")


# --------------------------------------------------------------------------- #
# Voice catalogue (fetched lazily from edge-tts, cached in memory)
# --------------------------------------------------------------------------- #


class _VoiceCatalogue:
    def __init__(self) -> None:
        self._ids: frozenset[str] = frozenset()
        self._voices: list[dict[str, str]] = []
        self._fetched_at = 0.0
        self._lock = asyncio.Lock()

    async def _refresh(self) -> None:
        async with self._lock:
            if time.monotonic() - self._fetched_at < VOICES_TTL_SECONDS and self._ids:
                return
            raw = await edge_tts.list_voices()
            self._voices = [
                {
                    "id": v["ShortName"],
                    "locale": v["Locale"],
                    "gender": v["Gender"],
                    "name": v["FriendlyName"],
                }
                for v in raw
            ]
            self._ids = frozenset(v["id"] for v in self._voices)
            self._fetched_at = time.monotonic()
            log.info("voice catalogue refreshed: %d voices", len(self._ids))

    async def is_valid(self, voice_id: str) -> bool:
        if not _VOICE_ID_RE.match(voice_id):
            return False
        try:
            await self._refresh()
        except Exception:  # noqa: BLE001 - degrade to shape-only validation
            log.warning("could not fetch voice catalogue; using pattern validation", exc_info=True)
            return True
        return voice_id in self._ids

    async def all(self) -> list[dict[str, str]]:
        await self._refresh()
        return self._voices


catalogue = _VoiceCatalogue()

_global_sem = asyncio.Semaphore(GLOBAL_CONCURRENCY)


# --------------------------------------------------------------------------- #
# App
# --------------------------------------------------------------------------- #


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    log.info(
        "starting: max %d chars, chunk %d, concurrency %d/%d, origins=%s",
        MAX_CHARS, CHUNK_CHARS, CONCURRENCY, GLOBAL_CONCURRENCY, ALLOWED_ORIGINS,
    )
    # Warm the catalogue so the first request doesn't pay for it. Failure is
    # non-fatal: validation falls back to the ShortName pattern.
    try:
        await catalogue.all()
    except Exception:  # noqa: BLE001
        log.warning("voice catalogue warm-up failed", exc_info=True)
    yield
    log.info("shutting down")


app = FastAPI(
    title="Yarani TTS",
    description="Free long-form neural text-to-speech powered by edge-tts.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
    max_age=600,
)


@app.exception_handler(RequestValidationError)
async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Flatten pydantic's error list into a single human-readable `detail` string
    so callers (and the Next.js proxy) can show it verbatim.
    """
    first = exc.errors()[0] if exc.errors() else {}
    msg = str(first.get("msg", "Invalid request."))
    msg = msg.removeprefix("Value error, ")
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": msg})


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #


class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_CHARS, description="Text to speak.")
    voice: str = Field(..., description="edge-tts voice ShortName, e.g. en-US-AndrewNeural.")

    @field_validator("text")
    @classmethod
    def _clean_text(cls, value: str) -> str:
        cleaned = _WHITESPACE_RE.sub(" ", value).strip()
        if not cleaned:
            raise ValueError("Text must contain at least one non-whitespace character.")
        return cleaned

    @field_validator("voice")
    @classmethod
    def _check_voice_shape(cls, value: str) -> str:
        if not _VOICE_ID_RE.match(value):
            raise ValueError("Unknown voice.")
        return value


# --------------------------------------------------------------------------- #
# Text chunking
# --------------------------------------------------------------------------- #


def _hard_split(piece: str, limit: int) -> list[str]:
    """Split an over-long sentence on whitespace so no part exceeds `limit`."""
    out: list[str] = []
    while len(piece) > limit:
        cut = piece.rfind(" ", 0, limit)
        if cut <= 0:
            cut = limit
        out.append(piece[:cut].strip())
        piece = piece[cut:].strip()
    if piece:
        out.append(piece)
    return out


def split_text(text: str, chunk_chars: int = CHUNK_CHARS, first_chunk_chars: int = FIRST_CHUNK_CHARS) -> list[str]:
    """
    Pack sentences into chunks of at most `chunk_chars`, never splitting a
    sentence unless it alone exceeds the limit. The first chunk is capped at
    `first_chunk_chars` so the stream's first bytes arrive quickly.
    """
    sentences = [s.strip() for s in _SENTENCE_END_RE.split(text) if s and s.strip()]
    chunks: list[str] = []
    current = ""
    limit = min(first_chunk_chars, chunk_chars)

    for sentence in sentences:
        for part in _hard_split(sentence, limit):
            candidate = f"{current} {part}".strip() if current else part
            if len(candidate) <= limit:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                current = part
                limit = chunk_chars  # only the very first chunk is short
    if current:
        chunks.append(current)
    return chunks or [text]


# --------------------------------------------------------------------------- #
# Synthesis
# --------------------------------------------------------------------------- #

_END = object()  # sentinel marking the end of a chunk's byte stream


async def _synthesize_chunk(
    index: int,
    text: str,
    voice: str,
    queue: asyncio.Queue[bytes | BaseException | object],
    request_sem: asyncio.Semaphore,
) -> None:
    """
    Stream one chunk's MP3 bytes into `queue`, ending with `_END` (or an
    exception object on failure). Retries only if nothing has been emitted
    yet: once bytes are out we cannot take them back without duplicating audio.
    """
    async with request_sem, _global_sem:
        for attempt in range(1, CHUNK_RETRIES + 1):
            emitted = False
            try:
                async for chunk in edge_tts.Communicate(text, voice).stream():
                    if chunk["type"] == "audio" and chunk["data"]:
                        emitted = True
                        await queue.put(chunk["data"])
                if not emitted:
                    raise NoAudioReceived("No audio was received from the service.")
                await queue.put(_END)
                return
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001
                if emitted or attempt == CHUNK_RETRIES:
                    log.exception("chunk %d failed (attempt %d, emitted=%s)", index, attempt, emitted)
                    await queue.put(exc)
                    return
                log.warning("chunk %d attempt %d failed: %s; retrying", index, attempt, exc)
                await asyncio.sleep(0.5 * attempt)


async def _audio_stream(chunks: list[str], voice: str) -> AsyncIterator[bytes]:
    """
    Synthesize all chunks concurrently and yield their bytes in order.

    Each chunk owns a queue; producers fill them as fast as the semaphores
    allow while the consumer drains queue 0, then 1, and so on. Producer tasks
    are cancelled if the consumer stops early (client disconnect, error).
    """
    request_sem = asyncio.Semaphore(CONCURRENCY)
    queues: list[asyncio.Queue[bytes | BaseException | object]] = [asyncio.Queue() for _ in chunks]
    tasks = [
        asyncio.create_task(_synthesize_chunk(i, text, voice, q, request_sem))
        for i, (text, q) in enumerate(zip(chunks, queues, strict=True))
    ]
    try:
        for queue in queues:
            while True:
                item = await queue.get()
                if item is _END:
                    break
                if isinstance(item, BaseException):
                    raise item
                yield item  # type: ignore[misc]
    finally:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #


@app.get("/health", include_in_schema=False)
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/voices")
async def list_voices() -> dict[str, object]:
    """Every voice this deployment accepts, straight from the edge-tts catalogue."""
    try:
        voices = await catalogue.all()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not fetch the voice catalogue right now.",
        ) from exc
    return {"count": len(voices), "voices": voices}


@app.get("/api/limits")
async def limits() -> dict[str, int]:
    """Runtime limits, so a frontend can mirror them without redeploying."""
    return {"max_chars": MAX_CHARS, "chunk_chars": CHUNK_CHARS, "concurrency": CONCURRENCY}


@app.post(
    "/api/generate-tts",
    response_class=StreamingResponse,
    responses={200: {"content": {"audio/mpeg": {}}}},
)
async def generate_tts(payload: GenerateRequest) -> StreamingResponse:
    """
    Synthesize speech for `text` using `voice` and stream it back as MP3.

    The first audio bytes are awaited before the response starts so that
    upstream failures surface as a proper error status instead of an empty 200.
    """
    if not await catalogue.is_valid(payload.voice):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown voice.")

    chunks = split_text(payload.text)
    log.info("generate: voice=%s chars=%d chunks=%d", payload.voice, len(payload.text), len(chunks))

    stream = _audio_stream(chunks, payload.voice)
    try:
        first = await anext(stream)
    except NoAudioReceived:
        await stream.aclose()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The voice service produced no audio for this input.",
        ) from None
    except Exception as exc:  # noqa: BLE001
        await stream.aclose()
        log.exception("edge-tts failed for voice=%s", payload.voice)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The voice service is unavailable right now. Please try again.",
        ) from exc

    async def body() -> AsyncIterator[bytes]:
        yield first
        async for chunk in stream:
            yield chunk

    return StreamingResponse(
        body(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-store",
            "Content-Disposition": 'inline; filename="yarani-speech.mp3"',
            "X-Voice": payload.voice,
            "X-Chunks": str(len(chunks)),
        },
    )
