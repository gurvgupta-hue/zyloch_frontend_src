---
name: pre-pr-check
description: Run the lint, test, and build checks required before opening a pull request, and scan the diff for secrets and leftover debug code.
---

# Pre-PR check

1. `git status` and `git diff main...HEAD --stat` to see the scope.
2. `npm run lint`, `npm test`, `npm run build` — report failures with output; do not claim success otherwise.
3. Grep the diff for conflict markers, `console.log` debug leftovers, hard-coded colors/URLs, and anything resembling a token or key.
4. Confirm any new env var is in `.env.example`.
5. Summarize: what changed, what was verified, what was not.
