import { isVoiceId, MAX_CHARS } from "@/lib/voices";

/**
 * Thin proxy in front of the FastAPI/edge-tts microservice.
 *
 * Keeps the backend URL server-side (no CORS dance from the browser, no
 * exposed origin) and pipes the audio stream straight through without
 * buffering, so the client sees progress as bytes arrive.
 *
 * Long-form note: a 40-minute narration takes ~90 s to synthesize. `maxDuration`
 * raises the function limit on Vercel; if your plan caps lower, set
 * NEXT_PUBLIC_TTS_API_URL so the browser calls the backend directly instead.
 */

export const maxDuration = 300;

const BACKEND_URL = (process.env.TTS_BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const UPSTREAM_TIMEOUT_MS = 280_000;

type GeneratePayload = { text?: unknown; voice?: unknown };

export async function POST(request: Request) {
  let payload: GeneratePayload;
  try {
    payload = (await request.json()) as GeneratePayload;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return Response.json(
      { error: `Text must be ${MAX_CHARS.toLocaleString("en-US")} characters or fewer.` },
      { status: 400 },
    );
  }
  if (!isVoiceId(payload.voice)) {
    return Response.json({ error: "Unknown voice." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/api/generate-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: payload.voice }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
      cache: "no-store",
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return Response.json(
      { error: timedOut ? "The voice service timed out." : "The voice service is unreachable." },
      { status: 504 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Surface the backend's own error message when it sent one.
    const detail = await upstream
      .json()
      .then((j: { detail?: unknown }) => (typeof j.detail === "string" ? j.detail : null))
      .catch(() => null);
    return Response.json(
      { error: detail ?? "The voice service failed to generate audio." },
      { status: upstream.status >= 500 ? 502 : upstream.status },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="yarani-speech.mp3"',
    },
  });
}
