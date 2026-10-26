---
paths:
  - "**/*.js"
  - "**/*.css"
---
# Styling

- Use design tokens from `app/globals.css` (`--bg`, `--surface`, `--border`, `--text`, `--muted`, `--success`, `--warning`, `--danger`, `--shadow-2`). Never hard-code colors; dark mode depends on the tokens.
- Tailwind utilities for layout; CSS modules (`*.module.css`) for scanner page chrome (e.g. `Workflow.module.css`). Inline `style` only for dynamic values.
- Layouts must work at mobile width: use responsive grid classes (`grid-cols-1 lg:grid-cols-2`), no fixed widths that overflow.
- Severity order and colors are consistent everywhere: critical, high, medium, low.
