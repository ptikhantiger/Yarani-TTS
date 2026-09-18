import Link from "next/link";
import { AudioLines } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900"
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-zinc-50">
            <AudioLines className="size-3.5" strokeWidth={2.25} />
          </span>
          Yarani TTS
        </Link>

        <span className="hidden text-xs text-zinc-400 sm:inline">
          Free neural text to speech
        </span>
      </nav>
    </header>
  );
}
