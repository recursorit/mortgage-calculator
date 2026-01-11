import './App.css';

import { useCallback, useEffect, useState } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';

import { MortgageCalculatorPage } from './pages/MortgageCalculatorPage';
import { RefinanceBreakEvenPage } from './pages/RefinanceBreakEvenPage';
import { ScenarioComparisonPage } from './pages/ScenarioComparisonPage';

function SideNav(props: { onNavigate?: () => void }) {
  const onNavigate = props.onNavigate;

  const linkClassName = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      'rounded-2xl px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 ' +
      (isActive
        ? 'bg-slate-900 text-white focus:ring-slate-200 dark:bg-white dark:text-slate-900 dark:focus:ring-slate-800'
        : 'text-slate-700 hover:bg-slate-50 focus:ring-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-800'),
    [],
  );

  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-slate-200/70 bg-white/70 px-4 pb-4 pt-5 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="flex items-center gap-3 px-2">
        <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500" />
        <div className="min-w-0">
          <div className="truncate text-sm font-black tracking-tight text-slate-900 dark:text-slate-50">
            Mortgage Calculator
          </div>
          <div className="truncate text-xs text-slate-600 dark:text-slate-300">
            Tools & scenarios
          </div>
        </div>
      </div>

      <nav className="px-2">
        <div className="grid gap-1">
          <NavLink to="/" end className={linkClassName} onClick={onNavigate}>
            Mortgage Calculator
          </NavLink>

          <NavLink
            to="/scenarios"
            className={linkClassName}
            onClick={onNavigate}
          >
            Scenario Comparison
          </NavLink>

          <NavLink
            to="/refinance"
            className={linkClassName}
            onClick={onNavigate}
          >
            Refinance break-even
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default function AppRoot() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeMobileNav, isMobileNavOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.14),transparent_55%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.10),transparent_55%),linear-gradient(to_bottom,#020617,#0b1220)]">
      <HashRouter>
        <div>
          <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <SideNav />
          </aside>

          {isMobileNavOpen ? (
            <div
              className="fixed inset-0 z-50 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                onClick={closeMobileNav}
                aria-label="Close navigation"
              />

              <div
                className="absolute left-0 top-0 h-full w-72 max-w-[85vw] -translate-x-0 transform transition"
                role="presentation"
              >
                <SideNav onNavigate={closeMobileNav} />
              </div>
            </div>
          ) : null}

          <div className="lg:pl-72">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <div className="min-w-0">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <MortgageCalculatorPage onOpenNav={openMobileNav} />
                    }
                  />
                  <Route
                    path="/scenarios"
                    element={
                      <ScenarioComparisonPage onOpenNav={openMobileNav} />
                    }
                  />
                  <Route
                    path="/refinance"
                    element={
                      <RefinanceBreakEvenPage onOpenNav={openMobileNav} />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </HashRouter>
    </div>
  );
}
