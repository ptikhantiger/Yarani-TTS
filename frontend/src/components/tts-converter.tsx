"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer, type GeneratedAudio } from "@/components/audio-player";
import {
  CHARS_PER_MINUTE,
  DEFAULT_VOICE,
  MAX_CHARS,
  MP3_BYTES_PER_SECOND,
  VOICES,
  VOICE_GROUPS,
  voiceById,
} from "@/lib/voices";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "error";

type Progress = {
  bytes: number;
  startedAt: number;
};

/**
 * Where to send generation requests. By default the Next.js proxy is used.
 * Set NEXT_PUBLIC_TTS_API_URL to call the FastAPI service directly from the
 * browser, which sidesteps serverless function time limits for very long
 * narrations (the backend must list this site in ALLOWED_ORIGINS).
 */
const DIRECT_API_URL = process.env.NEXT_PUBLIC_TTS_API_URL?.replace(/\/+$/, "");
const GENERATE_ENDPOINT = DIRECT_API_URL
  ? `${DIRECT_API_URL}/api/generate-tts`
  : "/api/generate-tts";

// Base UI's Select resolves the trigger label from this map.
const SELECT_ITEMS = VOICES.map((v) => ({
  value: v.id,
  label: `${v.name} · ${v.lang}`,
}));

function downloadName(voiceName: string) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const slug = voiceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `yarani-${slug}-${stamp}.mp3`;
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
}

function estimateMinutes(chars: number) {
  return chars / CHARS_PER_MINUTE;
}

async function readErrorMessage(res: Response, fallback: string) {
  // The proxy answers `{ error }`; the backend answers `{ detail }`.
  const body = (await res.json().catch(() => null)) as
    | { error?: unknown; detail?: unknown }
    | null;
  if (typeof body?.error === "string") return body.error;
  if (typeof body?.detail === "string") return body.detail;
  return fallback;
}

export function TtsConverter() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<string>(DEFAULT_VOICE);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<GeneratedAudio | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [, forceTick] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const textareaId = useId();
  const voiceId = useId();

  const remaining = MAX_CHARS - text.length;
  const nearLimit = remaining <= MAX_CHARS * 0.05;
  const isLoading = status === "loading";
  const canSubmit = !isLoading && text.trim().length > 0;
  const estMinutes = estimateMinutes(text.trim().length);

  // Object URLs are not garbage-collected; release the previous one whenever
  // a new blob replaces it, and on unmount.
  useEffect(() => {
    return () => {
      if (audio) URL.revokeObjectURL(audio.url);
    };
  }, [audio]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Re-render once a second while generating so the elapsed timer moves even
  // when no bytes arrive (e.g. while waiting for the first chunk).
  useEffect(() => {
    if (!isLoading) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLoading]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress(null);
    setStatus("idle");
  }, []);

  const generate = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);
    setProgress({ bytes: 0, startedAt: Date.now() });

    try {
      const res = await fetch(GENERATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, voice }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, `Request failed (${res.status}).`));
      }
      if (!res.body) throw new Error("The voice service returned an empty response.");

      // Consume the stream chunk by chunk so we can show live progress; the
      // pieces are stitched into a single Blob at the end.
      const reader = res.body.getReader();
      const parts: Uint8Array[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          parts.push(value);
          received += value.byteLength;
          setProgress((p) => (p ? { ...p, bytes: received } : p));
        }
      }
      if (received === 0) throw new Error("The voice service returned empty audio.");

      const blob = new Blob(parts as BlobPart[], { type: "audio/mpeg" });
      const selected = voiceById(voice);
      setAudio({
        url: URL.createObjectURL(blob),
        filename: downloadName(selected.name),
        voiceLabel: selected.name,
        bytes: blob.size,
      });
      setStatus("idle");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setProgress(null);
      }
    }
  }, [text, voice, isLoading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void generate();
    }
  };

  const elapsed = progress ? (Date.now() - progress.startedAt) / 1000 : 0;
  const audioSoFar = progress ? progress.bytes / MP3_BYTES_PER_SECOND : 0;
  const expectedSeconds = estMinutes * 60;
  const percent =
    progress && expectedSeconds > 0
      ? Math.min(99, Math.round((audioSoFar / expectedSeconds) * 100))
      : 0;

  return (
    <section className="mx-auto mt-12 w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
        className="flex flex-col gap-5"
      >
        {/* Text input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={textareaId} className="text-zinc-700">
              Text
            </Label>
            <span
              aria-live="polite"
              className={cn(
                "text-xs tabular-nums",
                nearLimit ? "text-amber-600" : "text-zinc-400",
                remaining === 0 && "text-red-600",
              )}
            >
              {text.trim().length > 0 && (
                <span className="text-zinc-400">
                  {"≈"} {estMinutes < 1 ? "<1" : Math.round(estMinutes)} min
                  <span className="mx-1.5 text-zinc-300">{"·"}</span>
                </span>
              )}
              {text.length.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")}
            </span>
          </div>
          <Textarea
            id={textareaId}
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={onKeyDown}
            maxLength={MAX_CHARS}
            rows={7}
            spellCheck
            disabled={isLoading}
            placeholder="Paste anything from a single line to a full chapter, then pick a voice."
            aria-describedby={`${textareaId}-hint`}
            className="max-h-[60vh] min-h-40 resize-y overflow-y-auto bg-white px-3.5 py-3 text-[15px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 md:text-[15px]"
          />
          <p id={`${textareaId}-hint`} className="text-xs text-zinc-400">
            Up to {MAX_CHARS.toLocaleString("en-US")} characters, about 40 minutes of speech. Press{" "}
            <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to generate.
          </p>
        </div>

        {/* Voice + action row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor={voiceId} className="text-zinc-700">
              Voice
              <span className="font-normal text-zinc-400">
                {"·"} {VOICES.length} voices, {VOICE_GROUPS.length} groups
              </span>
            </Label>
            <Select
              items={SELECT_ITEMS}
              value={voice}
              onValueChange={(v) => v && setVoice(v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id={voiceId}
                className="w-full bg-white px-3.5 data-[size=default]:h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {VOICE_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="sticky top-0 z-10 bg-white/95 px-2 py-1.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase backdrop-blur">
                      {group.label}
                    </SelectLabel>
                    {group.voices.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="py-1.5 pl-2.5">
                        <span>{v.name}</span>
                        <span className="truncate text-xs text-zinc-400">
                          {v.lang} {"·"} {v.gender}
                          {v.note ? ` · ${v.note}` : ""}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={cancel}
              className="h-10 w-full px-5 sm:w-auto"
            >
              <X data-icon="inline-start" />
              Cancel
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="h-10 w-full px-5 sm:w-auto"
            >
              <Sparkles data-icon="inline-start" />
              Generate Audio
            </Button>
          )}
        </div>

        {/* Progress: visible while a generation is in flight */}
        {isLoading && progress && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-600">
              <span className="flex items-center gap-2">
                <LoaderCircle className="size-3.5 animate-spin text-zinc-400" />
                {progress.bytes === 0
                  ? "Contacting voice service"
                  : `Generating ${"·"} ${formatDuration(audioSoFar)} of audio ready`}
              </span>
              <span className="tabular-nums text-zinc-400">{formatDuration(elapsed)} elapsed</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-900 transition-[width] duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Player: rendered only after a successful generation */}
        {audio && <AudioPlayer audio={audio} />}
      </form>
    </section>
  );
}
