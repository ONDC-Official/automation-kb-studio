---
name: frontend-conventions
description: House conventions for React frontends — React 19 + TypeScript strict + Vite + Tailwind v4 + TanStack Query + Redux Toolkit + react-hook-form + Radix, with a fixed folder layout, data-layer chain, and naming scheme. Use this skill whenever the user is starting a new frontend/React/web app, scaffolding a UI, or adding a page, component, hook, form, route, API call, or chart to an existing frontend — even if they don't mention conventions, standards, or a style guide. Also use it when reviewing frontend code or when asked where some frontend code should live.
---

# Frontend Conventions

The house standard for React frontends. Follow it exactly rather than reaching for whatever pattern is most familiar — most rules here exist because a plausible-looking alternative caused a real problem.

## First: which mode are you in?

**New project** → read `references/new-project-setup.md` and scaffold the full structure up front. Do not "start simple and refactor later" — the folder layout, path alias, httpClient, and generic query hooks all go in before the first feature.

**Existing project** → the conventions below are descriptive of a codebase that already exists. Before writing anything, find the nearest analogous file and match it. If `pages/logs/` exists and you're adding `pages/redis/`, mirror `pages/logs/` file for file. Local precedent beats this document when the two disagree — but say so out loud rather than silently diverging.

## Non-negotiables

These are the rules most often broken, and each one is a review rejection:

1. **Server data goes through TanStack Query.** Never `useEffect` + `fetch` + `useState`. Never server data in Redux.
2. **The data chain is component → domain hook → generic hook → httpClient.** No shortcuts. A component never imports `httpClient`, `axios`, or calls `fetch`.
3. **Page logic lives in `use<Page>Page.ts`.** `index.tsx` composes and renders; it holds no `useState`, no handlers, no derived data.
4. **classNames are composed with `cn()`.** Never template literals, never string concatenation, never conditional ternaries producing class strings.
5. **Colors come from CSS variables in `index.css`.** No hex values in components.
6. **Imports use the `@/` alias.** Never `../../..`.
7. **Redux is only auth + theme.** Page-local UI state is `useState` inside the page hook.

## Where does this code go?

| You're adding… | It goes… |
|---|---|
| A new route/screen | `pages/<lowercase-name>/` — `index.tsx` + `use<Page>Page.ts` (+ `constants.ts`, `utils.ts`, flat sub-components) |
| A shared UI component | `components/<PascalCase>/index.tsx` (+ `variants.ts` if it has variants, `types.ts` if props are non-trivial) |
| A component only one page uses | flat in that page's folder, e.g. `pages/logs/LogRow.tsx` — not a nested `components/` subfolder |
| A call to a new backend endpoint | a domain hook in `hooks/use<Domain>.ts`, wrapping `useGet`/`usePost`/`usePatch`, exporting a `<domain>Keys` factory |
| An API request/response type | `services/types.ts`, annotated with the backend file it mirrors — never inlined at the call site |
| A pure helper used by one page | that page's `utils.ts` |
| A pure helper used by 2+ places | `lib/` |
| Static option lists, defaults, ranges | `constants.ts` (page-local) or the component's own `constants.ts` |
| A design token (color, radius, chart color) | `src/index.css` under `:root` and `.dark` |
| A new sidebar entry | the `NAV` array in `components/Layout/constants.ts` |
| A new route declaration | `components/Routes/index.tsx`, as a child of `ProtectedLayout` if it needs auth |
| A new chart panel | a new entry in the page's `PANELS` list, consumed by `PromChart` — never new recharts code |

## Naming

- Component folders/files: `PascalCase`. Page folders: `lowercase` (the component inside is still PascalCase).
- Hooks: `useCamelCase`. Constants: `UPPER_SNAKE_CASE`. Helpers: `camelCase`.
- Component prop types inside a component's `types.ts`: `I`-prefixed (`IProps`, `IOption`). This prefix applies **only** there.
- Domain/API types in `services/types.ts`: plain PascalCase, no prefix (`HealthResponse`, `ScanResult`).
- Query key factories: `<domain>Keys`, camelCase object of `as const` tuples.

## TypeScript

`verbatimModuleSyntax` is on — use `import type { … }` for type-only imports or the build fails. Strict mode with `noUnusedLocals`/`noUnusedParameters`; no `any` without a comment justifying it. `interface` for object/prop shapes, `type` for unions and function signatures.

## Style and formatting

Double quotes, 2-space indentation. Tailwind v4 CSS-first (no `tailwind.config.*`). Variants via CVA in a sibling `variants.ts`, consumed with `VariantProps<typeof xVariants>`. Status colors are fixed: **emerald = ok/up, amber = warn/degraded, red = down/error**. Presentational primitives set `data-slot="<name>"` on their root.

## Before finishing any frontend task

- `npm run lint` and `npm run build` both pass (build runs `tsc -b`, so type errors fail it).
- No new `../../` imports, no inlined API types, no ad-hoc fetching, no hardcoded hex.
- Nothing was rebuilt that already exists in `components/` — check `PageHeader`, `JsonViewer`, `PromChart`, `Form*`, `Table`, `Tabs`, `Sheet`, `DropdownMenu`, `Tooltip` first.

## Reference files

Read these when the task calls for them rather than guessing:

- **`references/new-project-setup.md`** — bootstrap sequence for a new project: install list, Vite/TS/Tailwind config, folder skeleton, Prettier + husky. Read this whenever starting a project from scratch.
- **`references/code-templates.md`** — copy-paste starting points for `httpClient.ts`, the generic query hooks, a domain hook, a page folder, a CVA component, a form, the Redux slices, and the routes file. Read this when writing any of those file types for the first time in a project.
- **`references/conventions.md`** — the full standard with rationale, including the sections not summarized above (forms, routing, data layer, do/don't). Read this when reviewing code, resolving an ambiguity, or when the user asks *why* a rule exists.
