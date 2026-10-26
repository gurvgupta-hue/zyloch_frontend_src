# Zyloch-Frontend

Next.js 16 (App Router, JavaScript — no TypeScript), React 19, Tailwind 4, MUI, zustand, Jest + Testing Library. Node version is pinned in `.nvmrc`.

## Commands
- `npm run dev` / `npm run build` — both use `--webpack`; do not drop the flag.
- `npm run lint` (`lint:fix` to autofix) — must pass before a PR.
- `npm test`; single file: `npx jest path/to/file.test.js`; `npm run test:coverage`.

## Layout
- `app/` routes. Scanner pages live under `app/scanops/<scanner>/`; their UI pieces under `app/scanops/components/scan/<scanner>/`.
- `components/` shared UI, `hooks/`, `store/` (zustand), `context/`, `lib/api/` (backend calls), `lib/graphql/`.
- `proxy.js` is the route/session guard. `app/api/` holds server routes.
- Tests mirror source under `__tests__/` (or colocated `__tests__` dirs inside `app/settings`).
- Import with the `@/` alias, not deep relative paths, for anything outside the same feature folder.

## Rules that matter
- Never commit secrets or real `.env`/`.vault.env` values. New env vars go in `.env.example` with a comment; see `.claude/rules/env-and-security.md`.
- Backend calls go through `lib/api/*`; components do not call `fetch` directly.
- Scan state is shared via `useScanStore`; scanner dashboards read it, they do not refetch on their own.
- Style with the CSS variables in `app/globals.css` (`var(--surface)`, `var(--border)`, `var(--muted)`…), so light/dark both work. No hard-coded hex colors.
- Keep scanner dashboards consistent: reuse `LoadingState`, `ErrorState`, `EmptyState`, `FilterBar`, `FindingsTable` from `scan/skill-scanner`.

More detail in `.claude/rules/` (loaded by path) and `.claude/skills/` (invoked on demand).
