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

  ## UI theme / styling notes (important)

  This app has started moving toward a “paper + subtle grid” theme (inspired by Greptile’s marketing site) implemented via CSS custom properties.
  - Theme tokens live in `src/App.css` under `:root` / `.dark` as `--mc-*` variables (background/surface/text/border + primary brand + focus ring).
  - The optional shell background is `.mc-shell` (warm paper background + subtle grid). Apply this class to the top-level wrapper to enable the grid.
  - Prefer consuming tokens via Tailwind arbitrary values, e.g. `bg-[color:var(--mc-surface)]`, `text-[color:var(--mc-ink)]`, `border-[color:var(--mc-line)]`, `focus:ring-[color:var(--mc-focus)]`.
  - Some components may still use older Tailwind `slate/*` classes; if restyling, migrate toward the `--mc-*` tokens so the app can be themed by editing a single file.
  - Primary color can be swapped (e.g. to Tailwind `sky`) by adjusting `--mc-brand` / `--mc-brand-hover` / `--mc-focus` in `src/App.css`.

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
