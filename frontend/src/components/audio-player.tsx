"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MP3_BYTES_PER_SECOND } from "@/lib/voices";

export type GeneratedAudio = {
  /** Object URL for the generated MP3 blob. Owned (and revoked) by the caller. */
  url: string;
  /** Suggested filename for downloads. */
  filename: string;
  /** Human-readable voice name, shown as metadata. */
  voiceLabel: string;
  /** Size of the generated file in bytes. */
  bytes: number;
};

function formatLength(bytes: number) {
  const total = Math.round(bytes / MP3_BYTES_PER_SECOND);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function AudioPlayer({ audio }: { audio: GeneratedAudio }) {
  return (
    <section
      aria-label="Generated audio"
      className="animate-in fade-in-0 slide-in-from-top-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 duration-200"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="truncate text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">{audio.voiceLabel}</span>
          <span className="mx-1.5 text-zinc-300">·</span>
          {formatLength(audio.bytes)}
          <span className="mx-1.5 text-zinc-300">·</span>
          MP3, {formatBytes(audio.bytes)}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 bg-white"
          nativeButton={false}
          render={<a href={audio.url} download={audio.filename} />}
        >
          <Download data-icon="inline-start" />
          Download
        </Button>
      </div>

      {/*
        `key` forces a fresh <audio> element per generation so the browser
        re-evaluates autoplay and resets the timeline instead of reusing the
        previous media state.
      */}
      <audio
        key={audio.url}
        src={audio.url}
        controls
        autoPlay
        preload="auto"
        className="h-10 w-full rounded-md"
      >
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}
