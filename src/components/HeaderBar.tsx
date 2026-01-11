import { useEffect } from 'react';

import { useMortgageStore } from '../store/mortgageStore';

export function HeaderBar(props: { onReset: () => void }) {
  const theme = useMortgageStore((s) => s.theme);
  const toggleTheme = useMortgageStore((s) => s.toggleTheme);

  useEffect(() => {
    // Ensure theme is applied on first mount (e.g. if persisted)
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur print:border-0 print:bg-white dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <div className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500" />
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Mortgage Calculator
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Bright estimates with print-ready output.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
            aria-label="Toggle light/dark mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <button
            type="button"
            onClick={props.onReset}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
