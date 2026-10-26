---
paths:
  - "__tests__/**/*.js"
  - "**/*.test.js"
---
# Testing

- Jest + `@testing-library/react`, jsdom. `@/` alias is mapped in `jest.config.js`.
- Mock child cards/components and `@/lib/api/*` modules with `jest.mock`; never hit the network.
- Query by role/text/`data-testid`, assert user-visible behavior, not implementation details.
- One behavior per test; name tests as what the user sees ("shows empty state when no findings").
- Run the touched test file first, then `npm test` before a PR. CI uses `npm run test:ci`.
