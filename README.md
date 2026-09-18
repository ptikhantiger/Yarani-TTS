# Yarani TTS — free long-form neural text-to-speech

A minimal, light-mode TTS web app. Next.js 16 (App Router, Tailwind v4, shadcn/ui) on the front, a stateless FastAPI microservice on the back that streams MP3 audio from Microsoft Edge's free neural voices via [`edge-tts`](https://github.com/rany2/edge-tts).

- **150+ curated voices** in 40+ languages (the backend accepts all 320+ from the live catalogue).
- **Up to 40,000 characters (~40 minutes) per request.** Long text is split at sentence boundaries and synthesized in parallel, then streamed back in order — a 38-minute narration generates in about 50 seconds.
- Live progress and cancel while generating; MP3 download; nothing stored server-side.

```
├── frontend/                      Next.js app (deploy to Vercel, root dir = frontend)
│   ├── src/app/
│   │   ├── layout.tsx             Fonts, metadata, light-only theme
│   │   ├── page.tsx               Landing + converter panel
│   │   ├── globals.css            Zinc palette tokens, no dark mode
│   │   └── api/generate-tts/route.ts   Streaming proxy → Python service
│   ├── src/components/
│   │   ├── navbar.tsx             Sticky logo + GitHub link
│   │   ├── tts-converter.tsx      Textarea, grouped voice select, progress, cancel
│   │   ├── audio-player.tsx       <audio> widget + download
│   │   └── ui/                    shadcn primitives (button, select, textarea, label)
│   ├── src/lib/voices.ts          Curated voice groups + limits (generated from the live catalogue)
│   └── .env.example
└── backend/                       FastAPI + edge-tts (deploy to Render / HF Spaces)
    ├── main.py
    ├── requirements.txt
    ├── Procfile
    └── .env.example
```

## Run locally

One-time setup (creates the Python venv, installs backend + frontend deps, writes `frontend/.env.local`):

```bash
npm install && npm run setup
```

Then start both servers with a single command:

```bash
npm run dev
```

- Frontend: <http://localhost:3000>
- Backend: <http://127.0.0.1:8010> (Swagger UI at `/docs`). Override the port with `BACKEND_PORT=8000 npm run dev` and update `TTS_BACKEND_URL` in `frontend/.env.local` to match.

Ctrl+C stops both. To run them separately: `npm run dev:backend` / `npm run dev:frontend`.

## How requests flow

```
browser ──POST /api/generate-tts──▶ Next.js route handler ──POST /api/generate-tts──▶ FastAPI ──▶ edge-tts ×N
        ◀──── audio/mpeg (streamed) ◀──── pipes upstream body ◀──── StreamingResponse ◀──── ordered chunks
```

- The route handler validates `text` (≤ 40,000 chars) and `voice` before calling upstream, and pipes the response body straight through — nothing is buffered or written to disk.
- The backend splits the text into ~500-character sentence-aligned chunks (the first one ~300 chars for a fast first byte), synthesizes up to `TTS_CONCURRENCY` chunks at once, and yields their bytes in order. Failed chunks are retried before any audio for that chunk has been emitted.
- The first audio bytes are awaited before headers go out, so upstream failures surface as `502` with a message instead of an empty `200`.
- Voice ids are checked against the live edge-tts catalogue (cached 24 h). If the catalogue can't be fetched, validation degrades to a shape check.

## Long-form audio and hosting limits

Edge-TTS synthesizes at roughly 2× real-time per connection, so throughput comes from concurrency. Measured on a home connection:

| Text | Audio | Generation time |
| --- | --- | --- |
| 3,600 chars | 3.8 min | 7 s (12 concurrent) |
| 20,000 chars | 19 min | 42 s |
| 39,500 chars | 38 min | 53 s (through the Next.js proxy) |

The proxy sets `maxDuration = 300`, which is enough on Vercel Pro and on Hobby with Fluid Compute. If your plan caps functions lower, set `NEXT_PUBLIC_TTS_API_URL` so the browser talks to the FastAPI service directly (and add your site's origin to the backend's `ALLOWED_ORIGINS`). To allow even longer inputs, raise `TTS_MAX_CHARS` on the backend and `MAX_CHARS` in `voices.ts` together.

## Environment variables

| Where | Variable | Purpose |
| --- | --- | --- |
| frontend | `TTS_BACKEND_URL` | Base URL of the FastAPI service used by the proxy (`.env.example` uses `http://127.0.0.1:8010`, matching `npm run dev`) |
| frontend | `NEXT_PUBLIC_TTS_API_URL` | Optional: call the backend directly from the browser, bypassing the proxy |
| frontend | `NEXT_PUBLIC_GITHUB_URL` | Link in the navbar |
| backend | `ALLOWED_ORIGINS` | Comma-separated CORS origins (default `http://localhost:3000`) |
| backend | `TTS_MAX_CHARS` | Character limit (default `40000`) |
| backend | `TTS_CHUNK_CHARS` / `TTS_FIRST_CHUNK_CHARS` | Chunk sizes (default `500` / `300`) |
| backend | `TTS_CONCURRENCY` / `TTS_GLOBAL_CONCURRENCY` | Parallel chunks per request / across all requests (default `10` / `24`) |
| backend | `TTS_CHUNK_RETRIES` | Retries per chunk before failing (default `3`) |

## Deploy (free)

Push the repo to GitHub first. Then:

**1. Backend** — pick one:

- **Render** (Python web service, sleeps after 15 min idle): New → Blueprint → select the repo. `render.yaml` sets everything; fill in `ALLOWED_ORIGINS` when prompted (you can update it after the Vercel URL exists). Copy the service URL, e.g. `https://yarani-tts.onrender.com`.
- **Hugging Face Spaces** (Docker, sleeps after 48 h idle): New Space → SDK *Docker* → push only the `backend/` folder to the Space repo (`git subtree push --prefix backend <space-remote> main`). Add `ALLOWED_ORIGINS` under Settings → Variables. URL is `https://<user>-<space>.hf.space`.

Check `https://<backend>/health` returns `{"status":"ok"}`.

**2. Frontend on Vercel**: Add New Project → import the repo → **Root Directory: `frontend`** → Environment Variables: `TTS_BACKEND_URL=https://<backend>` and `NEXT_PUBLIC_GITHUB_URL=<repo url>` → Deploy.

**3. Lock CORS**: set the backend's `ALLOWED_ORIGINS` to your Vercel URL (`https://<project>.vercel.app`), comma-separate any custom domain. Only needed if you also set `NEXT_PUBLIC_TTS_API_URL`; the proxy path is server-to-server and needs no CORS.

Free-tier notes: the first request after the backend has been idle takes 30–60 s on Render (the proxy waits up to 280 s, so it succeeds). Vercel Hobby with Fluid Compute honours the proxy's `maxDuration = 300`, which covers a 40-minute narration (~55 s).

## Adding voices

Add the edge-tts `ShortName` to `frontend/src/lib/voices.ts` — the backend already accepts every voice in the live catalogue. List all of them with:

```bash
cd backend && .venv/Scripts/python -m edge_tts --list-voices
```
