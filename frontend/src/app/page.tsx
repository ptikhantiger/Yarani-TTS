import { Navbar } from "@/components/navbar";
import { TtsConverter } from "@/components/tts-converter";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 px-4 pb-20 sm:px-6">
        <div className="mx-auto mt-14 max-w-2xl text-center sm:mt-20">
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">
            Free · 150+ voices · Up to 40 minutes
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Yarani TTS
            <span className="block text-zinc-500">Text to speech that sounds human.</span>
          </h1>
          <p className="mt-3 text-base text-zinc-500 sm:text-lg">
            Paste anything from a sentence to a full chapter, choose one of 150+
            neural voices in 40+ languages, and download studio-quality MP3.
          </p>
        </div>

        <TtsConverter />

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-zinc-400">
          Long texts are synthesized in parallel and streamed straight to your
          browser. Nothing is stored on our servers.
        </p>
      </main>

      <footer className="border-t border-zinc-200 py-6">
        <p className="mx-auto max-w-5xl px-4 text-center text-xs text-zinc-400 sm:px-6">
          &copy; {new Date().getFullYear()} Yarani TTS. Free neural text to speech.
        </p>
      </footer>
    </>
  );
}
