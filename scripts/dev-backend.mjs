// Starts the FastAPI backend with the project's virtualenv, on any OS.
// Port defaults to 8010 (see frontend/.env.local); override with BACKEND_PORT.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const backendDir = join(import.meta.dirname, "..", "backend");
const python =
  process.platform === "win32"
    ? join(backendDir, ".venv", "Scripts", "python.exe")
    : join(backendDir, ".venv", "bin", "python");

if (!existsSync(python)) {
  console.error(`Backend virtualenv not found at ${python}\nRun "npm run setup" first.`);
  process.exit(1);
}

const port = process.env.BACKEND_PORT ?? "8010";
const child = spawn(
  python,
  ["-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", port],
  { cwd: backendDir, stdio: "inherit" },
);

child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
