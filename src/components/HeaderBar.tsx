import { useEffect } from 'react';

import { useAuth } from '../auth/useAuth';
import { debugAuthLog } from '../lib/debug';
import { useMortgageStore } from '../store/mortgageStore';

export function HeaderBar(props: {
  onReset?: () => void;
  onOpenNav?: () => void;
}) {
  const auth = useAuth();
  const theme = useMortgageStore((s) => s.theme);
  const toggleTheme = useMortgageStore((s) => s.toggleTheme);

  useEffect(() => {
    // Ensure theme is applied on first mount (e.g. if persisted)
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    debugAuthLog('HeaderBar auth', {
      isEnabled: auth.isEnabled,
      isAuthReady: auth.isAuthReady,
      hasUser: Boolean(auth.user),
    });
  }, [auth.isAuthReady, auth.isEnabled, auth.user]);

  return (
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur print:border-0 print:bg-white dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="flex w-full flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            {props.onOpenNav ? (
              <button
                type="button"
                onClick={props.onOpenNav}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 print:hidden lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                aria-label="Open navigation"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}

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

        <div className="flex w-full flex-wrap items-center gap-2 print:hidden sm:w-auto sm:justify-end">
          {auth.isEnabled ? (
            auth.user ? (
              <>
                <div className="hidden max-w-[240px] truncate rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:block">
                  {auth.user.email ?? 'Signed in'}
                </div>

                {auth.scenarioSyncStatus !== 'idle' ? (
                  <div
                    className={
                      'inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-sm font-bold shadow-sm ' +
                      (auth.scenarioSyncStatus === 'saving'
                        ? 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100'
                        : auth.scenarioSyncStatus === 'error'
                          ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100')
                    }
                    title={(() => {
                      if (auth.scenarioSyncStatus === 'error') {
                        return auth.scenarioSyncError ?? 'Sync error';
                      }
                      if (
                        auth.scenarioSyncStatus === 'synced' &&
                        auth.scenarioLastSyncedAtMs
                      ) {
                        return `Last synced: ${new Date(auth.scenarioLastSyncedAtMs).toLocaleString()}`;
                      }
                      return undefined;
                    })()}
                  >
                    {auth.scenarioSyncStatus === 'saving'
                      ? 'Saving…'
                      : auth.scenarioSyncStatus === 'error'
                        ? 'Sync error'
                        : 'Synced'}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => void auth.signOut()}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void auth.signInWithGoogle()}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
              >
                Sign in with Google
              </button>
            )
          ) : null}

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
            aria-label="Toggle light/dark mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {props.onReset ? (
            <button
              type="button"
              onClick={props.onReset}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
