---
name: resolve-merge-conflicts
description: Resolve git merge or rebase conflicts in this repo and verify the result compiles. Use when files show UU/AA status or contain conflict markers, or after "accept both" resolutions.
---

# Resolve merge conflicts

1. `git status --short | grep -E '^(UU|AA|DU|UD)'` to list unresolved files.
2. For each: `grep -nE '^(<<<<<<<|=======|>>>>>>>)' <file>`, then read the whole file. "Accept both" often leaves duplicated blocks, undefined helpers, or truncated JSX — check for these even when no markers remain.
3. Decide which side is intended with the user if the two versions are different designs; do not guess.
4. Remove dead imports and duplicate components left over.
5. Verify syntax: `npx esbuild <file> --loader:.js=jsx --log-level=warning >/dev/null`, then `npm run lint` and the related tests.
6. `git add <file>` only after verification. Do not commit or continue the rebase unless asked.
