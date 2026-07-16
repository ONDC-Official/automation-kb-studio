/**
 * The dev runner: one command that boots BOTH halves of KB Studio.
 *
 * The node:http server (server.ts) owns `/api`; Vite owns the React UI + HMR and proxies `/api` back to
 * the node server (see vite.config.ts). Keeping them as two processes is why server.ts stays a zero-dep
 * API with no bundler in its own graph — this file just wires the two together for `pnpm studio`. A
 * production/preview run instead uses `vite build` (populates dist/) and server.ts serves it.
 *
 * Both ports fail LOUDLY on a conflict: the API prints a clear message and exits instead of crashing
 * with an unhandled EADDRINUSE, and Vite runs with strictPort so it never silently shifts to another
 * port. Vite is spawned only after the API binds, so a failed API never orphans it.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createStudioServer } from "./server";

const kbDir = process.env["KB_DIR"] ?? join(process.cwd(), "kb");
const coverageDir = process.env["KB_COVERAGE_DIR"] ?? join(process.cwd(), "kb-coverage");
const apiPort = Number(process.env["KB_API_PORT"] ?? "4318");
const uiPort = Number(process.env["KB_STUDIO_PORT"] ?? "4319");

const api = createStudioServer({ kbDir, coverageDir });

api.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    process.stderr.write(
      `\n  KB Studio API port ${String(apiPort)} is already in use — another instance is likely running.\n` +
        `  Stop it (e.g. \`lsof -ti tcp:${String(apiPort)} | xargs kill\`) or set KB_API_PORT, then retry.\n\n`,
    );
  } else {
    process.stderr.write(`\n  KB Studio API failed to start: ${err.message}\n\n`);
  }
  process.exit(1);
});

api.listen(apiPort, "127.0.0.1", () => {
  process.stdout.write(`\n  KB Studio API  → http://127.0.0.1:${String(apiPort)}  (authoring ${kbDir})\n`);
  process.stdout.write(`  KB Studio UI   → http://127.0.0.1:${String(uiPort)}  (open this one)\n\n`);

  // Vite owns the UI + HMR, proxying /api to the node API above. Spawned only now — after the API bound.
  const pkgDir = fileURLToPath(new URL("..", import.meta.url));
  const vite = spawn("npx", ["--no-install", "vite", "--port", String(uiPort), "--strictPort"], {
    cwd: pkgDir,
    stdio: "inherit",
    env: { ...process.env, KB_API_PORT: String(apiPort) },
  });
  vite.on("exit", (code) => process.exit(code ?? 0));
});
