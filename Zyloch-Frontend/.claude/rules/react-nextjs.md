---
paths:
  - "app/**/*.js"
  - "components/**/*.js"
  - "hooks/**/*.js"
---
# React / Next.js conventions

- Add `"use client"` only to files that use state, effects, browser APIs, or event handlers. Default to server components.
- Hooks must obey `react-hooks/*` lint rules; treat `exhaustive-deps` and `set-state-in-effect` warnings as things to fix, not silence.
- Memoize derived data with `useMemo` when it comes from store state (see `CisScanner.js`); do early returns for loading/error/empty only after all hooks have been called.
- Use `next/image` instead of `<img>` (lint warns), and `next/dynamic` with `{ ssr: false }` for chart libraries.
- Prefer small components over inline copies. Do not paste the same JSX block twice — extract it.
- Remove unused imports and variables; `no-unused-vars` is a warning, but the codebase should stay clean.
- Components are default or named exports consistent with neighbors in the same folder; file names are PascalCase for components, camelCase for hooks/utils.
