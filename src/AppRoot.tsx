import { useDeferredValue, useMemo } from 'react';

import './App.css';

import { calculateMortgage } from './lib/mortgage';

import { HeaderBar } from './components/HeaderBar';
import { InputsPanel } from './components/InputsPanel';
import { CostSummaryCard } from './components/CostSummaryCard';
import { SidebarStats } from './components/SidebarStats';
import { ScheduleSection } from './components/ScheduleSection';

import { useMortgageInputs } from './hooks/useMortgageInputs';
import { useLoanYearGroups } from './hooks/useLoanYearGroups';
import { useMortgageStore } from './store/mortgageStore';

export default function AppRoot() {
  const inputs = useMortgageInputs();
  const deferredInputs = useDeferredValue(inputs);

  const resetToDefaults = useMortgageStore((s) => s.resetToDefaults);
  const clearPersisted = useMortgageStore((s) => s.clearPersisted);

  const calc = useMemo(
    () => calculateMortgage(deferredInputs),
    [deferredInputs],
  );
  const { summary, schedule } = calc;

  const monthlyTaxesCosts = deferredInputs.includeTaxesCosts
    ? summary.monthlyTaxesCosts
    : 0;

  const totalMonthlyPayment = summary.scheduledMonthlyPI + monthlyTaxesCosts;

  const remainingBalance = schedule.length
    ? schedule[schedule.length - 1].balance
    : 0;

  const loanYearGroups = useLoanYearGroups({
    schedule,
    monthlyTaxesCosts,
    loanAmount: summary.loanAmount,
  });

  const onReset = () => {
    const confirmed = window.confirm('Reset all inputs to fresh defaults?');
    if (!confirmed) return;

    clearPersisted();
    resetToDefaults();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.14),transparent_55%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.10),transparent_55%),linear-gradient(to_bottom,#020617,#0b1220)]">
      <HeaderBar onReset={onReset} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-12 print:hidden">
          <section className="min-w-0 lg:col-span-8 print:hidden">
            <div className="space-y-6">
              <InputsPanel />

              <CostSummaryCard
                inputs={deferredInputs}
                summary={summary}
                remainingBalance={remainingBalance}
              />
            </div>
          </section>

          <section className="min-w-0 lg:col-span-4">
            <SidebarStats
              inputs={deferredInputs}
              summary={summary}
              monthlyTaxesCosts={monthlyTaxesCosts}
              totalMonthlyPayment={totalMonthlyPayment}
            />
          </section>

          <section className="min-w-0 lg:col-span-12">
            <ScheduleSection
              schedule={schedule}
              loanYearGroups={loanYearGroups}
              monthlyTaxesCosts={monthlyTaxesCosts}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
