---
name: write-tests
description: Write or extend Jest and Testing Library tests for a component, hook, store, or lib module in this repo. Use when asked to add tests or raise coverage.
---

# Write tests

1. Read the target file and the nearest existing test in `__tests__/` for conventions; follow `.claude/rules/testing.md`.
2. Mock `@/lib/api/*`, child components, and `next/dynamic` charts. No network.
3. Cover: render states (loading, error, empty, populated), user interactions, and edge cases in data shaping.
4. Place the file at the mirrored path under `__tests__/`.
5. Run `npx jest <file>` until green, then `npm run test:coverage -- <file>` to confirm the new lines are covered. Report any test you could not make pass.
