// One-time setup: Python venv + backend deps, frontend deps, local env file.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const backendDir = join(root, "backend");
const frontendDir = join(root, "frontend");
const win = process.platform === "win32";
const venvPython = win
  ? join(backendDir, ".venv", "Scripts", "python.exe")
  : join(backendDir, ".venv", "bin", "python");

const run = (cmd, cwd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
};

if (!existsSync(venvPython)) run(`${win ? "python" : "python3"} -m venv .venv`, backendDir);
run(`"${venvPython}" -m pip install -q -r requirements.txt`, backendDir);

run("npm install", frontendDir);

const envLocal = join(frontendDir, ".env.local");
if (!existsSync(envLocal)) {
  copyFileSync(join(frontendDir, ".env.example"), envLocal);
  console.log("\nCreated frontend/.env.local from .env.example");
}

console.log("\nSetup complete. Start everything with: npm run dev");
