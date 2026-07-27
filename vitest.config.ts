import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // The studio UI imports via the `@/` alias (→ packages/studio/src/ui); mirror it so its component
  // tests resolve the same way Vite/tsc do. Only the studio front-end uses `@`.
  resolve: {
    alias: { "@": fileURLToPath(new URL("./packages/studio/src/ui", import.meta.url)) },
  },
  test: {
    // Every package keeps its tests in `tests/`. No globals — suites import from "vitest"
    // explicitly, so the pure library never depends on an ambient test type.
    include: ["packages/*/tests/**/*.test.{ts,tsx}"],
    // The engine tests spin up REAL node:http servers that lie on demand; give them room.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
