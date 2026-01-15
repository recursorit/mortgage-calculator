# GitHub Copilot instructions

This repo is a React 18 + TypeScript mortgage calculator built with Rsbuild.

## Project summary (keep in mind)

- UI: React + Tailwind v4 (via PostCSS + `@import 'tailwindcss'` in `src/App.css`).
- State: Zustand store with `persist` (debounced localStorage writes) and legacy migration.
- Core math: `src/lib/mortgage.ts` calculates amortization schedule and summary (also computes baseline/no-extra scenario to derive `interestSaved` + `monthsSaved`).
- Schedule: grouped by “loan year” (Year 1 = first 12 payments).
- Exports:
  - CSV: generated client-side from schedule rows.
  - PDF: real PDF generation via `@react-pdf/renderer`, lazy-loaded on demand.
  - Printing: print the generated PDF Blob via hidden iframe (no HTML print report).

## Commands

- `npm run dev` – dev server
- `npm run lint` – ESLint
- `npm run format` – Prettier
- `npm run build` – production build
- `npm run preview` – serve production build

## Key files / architecture map

- Entry / composition:
  - `src/index.tsx` renders `AppRoot`.
  - `src/AppRoot.tsx` composes the main layout and wires inputs → calculation → UI.
  - `src/App.tsx` is a thin re-export of `AppRoot` (legacy monolith removed).

- State:
  - `src/store/mortgageStore.ts` – Zustand store + persistence key `mortgageCalculator:store:v1`.
    - Includes legacy migration from `mortgageCalculator:form:v1` and `mortgageCalculator:theme:v1`.
    - Debounced localStorage writes (~250ms) to keep typing responsive.

- Parsing/clamping raw inputs:
  - `src/hooks/useMortgageInputs.ts` – converts store raw strings into numeric `MortgageInputs`.

- Calculations:
  - `src/lib/mortgage.ts` – the single source of truth for amortization math.

- Schedule grouping:
  - `src/hooks/useLoanYearGroups.ts` – groups rows into loan-year buckets with totals.

- Exports:
  - `src/lib/scheduleCsv.ts` + `src/lib/download.ts` – CSV string + download.
  - `src/pdf/MortgageReportPdf.tsx` – React-PDF `Document` layout.
  - `src/lib/pdfReport.ts` – PDF blob creation + iframe printing.
  - `src/components/ScheduleSection.tsx` – export buttons; lazy-loads `../lib/pdfReport`.

## Implementation guidelines

- Prefer small, surgical changes. Avoid reformatting unrelated code.
- Keep TypeScript strict-mode happy (`noUnusedLocals`, `noUnusedParameters`).
- Avoid expensive work during render; memoize derived values.
- Don’t introduce `window.print()` HTML printing. Printing should stay “Print PDF”.
- Keep PDF code lazy-loaded (dynamic `import()` in the click handler) so initial bundle stays small.
- When changing persisted state shape, consider `version`ing and/or migration in `mortgageStore.ts`.

## Style / UX

- Components are small and focused (see `src/components/*` and `src/components/ui/*`).
- Accessibility: ensure buttons have clear labels; maintain keyboard focus styles.

## UI theme tokens

- Global theme tokens are defined in `src/App.css` as `--mc-*` CSS variables (in `:root` and `.dark`).
- `mc-shell` is an optional top-level class that applies a warm “paper” background with a subtle grid.
- Prefer using the tokens via Tailwind arbitrary values (e.g. `bg-[color:var(--mc-surface)]`, `text-[color:var(--mc-ink)]`, `border-[color:var(--mc-line)]`, `focus:ring-[color:var(--mc-focus)]`) so palette changes stay centralized.
- If changing the brand color (e.g. to Tailwind `sky`), do it by editing `--mc-brand`, `--mc-brand-hover`, and `--mc-focus` in `src/App.css`.
