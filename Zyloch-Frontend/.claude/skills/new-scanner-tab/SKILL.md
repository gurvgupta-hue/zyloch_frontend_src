---
name: new-scanner-tab
description: Add a new scanner dashboard (tab/page) under app/scanops following the existing scanner pattern. Use when asked to add or scaffold a scan type such as a new CIS-style or skill-scanner-style view.
---

# Add a scanner dashboard

1. Look at the closest existing scanner first (`app/scanops/skill-scanner/`, `app/scanops/components/scan/cis/CisScanner.js`) and copy its structure.
2. Register the backend scan type in `BACKEND_SCAN_TYPE_MAP` in `lib/api/scans.js` (both snake_case and kebab-case aliases).
3. Create `app/scanops/<scanner>/page.js` and the dashboard component in `app/scanops/components/scan/<scanner>/`.
4. Read from `useScanStore` (`latestScan`, `loading`, `error`, `startingScan`, `pollingScan`); do not fetch inside the component. Hook the tab into `app/scanops/layout.js`.
5. Put data shaping in `utils/dataProcessor.js` and memoize it with `useMemo`.
6. Reuse `LoadingState`, `ErrorState`, `EmptyState`, `FilterBar`, `FindingsTable`, `ScanMetadataOverview`. Use `PieChartUI` via `next/dynamic` for severity charts.
7. Add tests under `__tests__/app/scanops/` (loading, error, empty, populated, filter).
8. Run `npm run lint` and `npm test`.
