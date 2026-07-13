# Carrier Sourcing — Pearl Reporting UI

Enterprise reporting table built on **ChargerFleet / Pearl** design tokens.

## Live

- App: https://carrier-sourcing-web.vercel.app
- Repo: https://github.com/dhilllon001/carrier-sourcing-web

## Deliverables

1. `src/styles/report-tokens.css` — light report + dark sidebar tokens
2. `src/styles/sr-table.css` — `.sr-table*` enterprise table system
3. Filter strip + applied chips — `ReportFilterStrip`, `AppliedFiltersRow`
4. `usePieChartFilter` + applied filter helpers in `src/lib/report/filters.ts`
5. `useRowHover` + `RowHoverPopover`
6. Example page — `src/pages/CarrierSourcingReportPage.tsx`

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
