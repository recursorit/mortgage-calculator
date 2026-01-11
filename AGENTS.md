# AGENTS.md

You are an expert in JavaScript, Rsbuild, and web application development. You write maintainable, performant, and accessible code.

## Repository context

- Stack: React 18 + TypeScript + Rsbuild.
- Styling: Tailwind v4 (via PostCSS) + custom print utilities in `src/App.css`.
- State: Zustand store with `persist` to localStorage (debounced writes). Includes legacy migration.
- Core logic: amortization and summaries in `src/lib/mortgage.ts`.
- Exports:
  - CSV: client-side generation from schedule rows.
  - PDF: `@react-pdf/renderer` generates a real PDF; generation/printing is lazy-loaded.
  - Printing: prints the generated PDF Blob (no HTML print report).

## Commands

- `npm run dev` - Start the dev server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt

## Tools

### ESLint

- Run `npm run lint` to lint your code

### Prettier

- Run `npm run format` to format your code

## Important files

- App entry: `src/index.tsx` (renders `AppRoot`).
- Composition root: `src/AppRoot.tsx`.
- Compatibility: `src/App.tsx` re-exports `AppRoot`.
- Store: `src/store/mortgageStore.ts` (key `mortgageCalculator:store:v1`).
- Input parsing: `src/hooks/useMortgageInputs.ts`.
- Loan-year grouping: `src/hooks/useLoanYearGroups.ts`.
- PDF:
  - Layout: `src/pdf/MortgageReportPdf.tsx`
  - Blob + print: `src/lib/pdfReport.ts`
  - UI entry points: `src/components/ScheduleSection.tsx` (dynamic import)

## Conventions / guardrails

- Avoid reintroducing `window.print()` HTML printing. Only “Print PDF” is supported.
- Keep PDF generation code lazy-loaded (dynamic `import()` inside button handlers).
- Prefer small, targeted diffs; don’t reformat unrelated code.
- Keep TypeScript strict-mode happy (`noUnusedLocals`, `noUnusedParameters`).
