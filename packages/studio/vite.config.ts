import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * The KB Studio front-end bundle. The zero-dep node:http server (src/server.ts) stays the JSON API;
 * Vite owns only the browser bundle. In dev, `/api` is proxied to the node API (see src/dev.ts, which
 * boots both); in a build, the server serves the emitted `dist/`.
 */
const apiPort = Number(process.env["KB_API_PORT"] ?? "4318");

/**
 * The sub-path the app is served under. Root by default (`pnpm studio` dev stays at `/`); a hosted
 * subpath sets `KB_BASE_PATH=/kb-studio` at BUILD time so every emitted asset + fetch URL is prefixed.
 * Normalised to exactly one leading and trailing slash, which Vite requires. Must match the server's
 * `KB_BASE_PATH` at runtime (see src/server.ts).
 */
const rawBase = process.env["KB_BASE_PATH"] ?? "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  root: "src/ui",
  base,
  plugins: [react()],
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env["KB_STUDIO_PORT"] ?? "7674"),
    // Fail loudly on a port conflict instead of silently shifting to another port.
    strictPort: true,
    proxy: {
      "/api/": `http://127.0.0.1:${String(apiPort)}`,
    },
  },
});
