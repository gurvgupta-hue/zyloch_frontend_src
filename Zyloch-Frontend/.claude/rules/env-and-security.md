---
paths:
  - "proxy.js"
  - "lib/**/*.js"
  - "app/api/**/*.js"
  - "Dockerfile*"
  - "docker-entrypoint.sh"
  - ".env*"
---
# Env vars and security

- `NEXT_PUBLIC_*` vars are public and compiled into the bundle as placeholders substituted by `docker-entrypoint.sh` at container start. They must be browser-reachable addresses, never internal docker hostnames. Never put secrets in them.
- Server-only values (`API_INTERNAL_URL`, `SPEC_GENERATOR_URL`) must never be referenced from client components.
- Every new variable must be added to `.env.example` with a comment on whether it is required and where it is read.
- Do not read, print, or commit `.env`, `.vault.env`, or Vault tokens. `eslint-plugin-no-secrets` is on; do not bypass it.
- Auth cookie is `authToken`; route protection lives in `proxy.js`. Keep its fail-open behavior documented if changed.
- Render API-provided strings as text, never via `dangerouslySetInnerHTML` unless sanitized.
- Validate and encode user-provided values used in URLs (`encodeURIComponent`); `lib/api/scans.js` shows the `requireInstallationId` guard pattern.
