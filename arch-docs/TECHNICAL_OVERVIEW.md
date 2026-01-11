# Technical Overview (Maintainers)

## Stack

- React 18 + TypeScript
- Rsbuild (build/dev/preview)
- Tailwind CSS v4 via PostCSS (`src/App.css` imports Tailwind)
- Zustand (state) + `persist` middleware
- `@react-pdf/renderer` for real PDF generation

## High-level flow

1. **User edits inputs** in the UI (raw strings in store).
2. `useMortgageInputs()` parses/clamps store strings into numeric `MortgageInputs`.
3. `AppRoot` uses `useDeferredValue(inputs)` to keep typing responsive.
4. `calculateMortgage()` computes:
   - amortization schedule (`AmortizationRow[]`)
   - summary metrics (`MortgageSummary`)
   - baseline/no-extra schedule to derive `interestSaved` and `monthsSaved`
5. `useLoanYearGroups()` buckets schedule rows into “loan years” with totals.
6. Schedule section provides exports:
   - **CSV** via `createScheduleCsv()` + `downloadTextFile()`
   - **PDF** via lazy `import('../lib/pdfReport')` → generate blob → download/print

## Key modules

- App entry
  - `src/index.tsx` – renders `AppRoot`.
  - `src/App.tsx` – thin re-export of `AppRoot` (legacy monolith removed).

- Composition
  - `src/AppRoot.tsx` – main layout and wiring.

- State
  - `src/store/mortgageStore.ts`
    - Persist key: `mortgageCalculator:store:v1`
    - Debounced localStorage writes (~250ms) to keep typing responsive.
    - Migrates legacy keys: `mortgageCalculator:form:v1` and `mortgageCalculator:theme:v1`.

- Parsing
  - `src/hooks/useMortgageInputs.ts` – converts raw strings → numbers (also clamps years/months).

- Calculations
  - `src/lib/mortgage.ts`
    - `calculateMortgage(inputs)` is the single source of truth.
    - Builds a baseline schedule (no extra payments) to compute savings.

- Schedule grouping
  - `src/hooks/useLoanYearGroups.ts` – groups amortization rows by `loanYear` (Year 1 = first 12 payments).

- Exports
  - CSV
    - `src/lib/scheduleCsv.ts` – CSV generation.
    - `src/lib/download.ts` – downloads (text + blob).
  - PDF
    - `src/pdf/MortgageReportPdf.tsx` – React-PDF document layout.
    - `src/lib/pdfReport.ts` – creates PDF blob + prints via hidden iframe.
    - `src/components/ScheduleSection.tsx` – UI buttons; lazy-loads PDF code on click.

## UX/Performance decisions

- Use `useDeferredValue` for calculations to prevent UI jank while typing.
- Use `content-visibility: auto` for large schedule sections to reduce render cost.
- Keep PDF library code out of the initial bundle via dynamic `import()`.

## Printing policy

- Do **not** reintroduce HTML printing (`window.print()` on HTML report sections).
- Printing is supported via **Print PDF** only (prints the generated PDF blob).

## Testing / Quality

- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build`
