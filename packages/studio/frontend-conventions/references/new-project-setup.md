# New Project Setup

Bootstrap sequence for a project that follows the house conventions from commit one. Work through it in order — later steps assume earlier ones.

## 1. Scaffold

```bash
npm create vite@latest <app-name> -- --template react-ts
cd <app-name>
npm install
```

## 2. Dependencies

```bash
# runtime
npm install \
  @tanstack/react-query \
  @reduxjs/toolkit react-redux redux-persist \
  react-router-dom \
  react-hook-form \
  axios \
  radix-ui \
  lucide-react \
  class-variance-authority clsx tailwind-merge \
  recharts \
  sonner

# build / styling
npm install -D tailwindcss @tailwindcss/vite @types/node

# formatting (wire this up now, not later)
npm install -D prettier prettier-plugin-tailwindcss husky lint-staged
```

Confirm the versions Vite pulls are the current majors (React 19, TanStack Query v5, react-router v7, Tailwind v4). If a major has moved on, check the migration notes before pinning back.

## 3. Vite config

`vite.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

## 4. TypeScript config

In `tsconfig.app.json` (`compilerOptions`), make sure all of these are set:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Mirror `baseUrl`/`paths` in `tsconfig.json` if the project uses a solution-style root config, so editors resolve the alias too.

## 5. Tailwind v4 + design tokens

There is no `tailwind.config.*` in v4. `src/index.css` is the config:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;

  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-border: oklch(0.922 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* …dark values for every token above… */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

Every token gets a light and a dark value. A component that needs a new color adds a token here — never a hex literal in JSX.

## 6. Folder skeleton

```bash
mkdir -p src/{components,pages,hooks,services,store,lib}
```

Create these before the first feature:

- `src/lib/utils.ts` — the `cn()` helper
- `src/services/httpClient.ts` — the single axios instance
- `src/services/types.ts` — empty, with a header comment explaining it mirrors backend contracts
- `src/hooks/useGet.ts`, `usePost.ts`, `usePatch.ts`, `useInfiniteGet.ts` — generic typed wrappers
- `src/store/index.ts`, `authSlice.ts`, `themeSlice.ts` — persisted store
- `src/components/Routes/index.tsx` — all route declarations
- `src/components/Layout/` — app chrome, with `constants.ts` holding the `NAV` array

All of these have starting points in `references/code-templates.md`.

## 7. Environment

`.env` (and a committed `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

Only `VITE_`-prefixed vars reach the client. Never put a secret here — it ships in the bundle.

## 8. Provider stack

`src/main.tsx` — order matters:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { store, persistor } from "@/store";
import Routes from "@/components/Routes";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 5_000 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
```

Those three query defaults are set once here. Overriding them per-query needs a reason.

## 9. Formatting and hooks

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

`package.json`:

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "preview": "vite preview"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "src/**/*.css": ["prettier --write"]
  }
}
```

Wiring this up on day one is the whole reason the convention is enforceable — retrofitting a formatter onto a codebase with mixed style means a diff nobody can review.

## 10. Verify before the first feature

```bash
npm run lint && npm run build
```

Both must pass on the empty skeleton. Then build the first page as a full `pages/<name>/` folder with its `use<Name>Page.ts` hook — even if the hook starts nearly empty. Starting with the right shape costs nothing; retrofitting it costs a refactor.
