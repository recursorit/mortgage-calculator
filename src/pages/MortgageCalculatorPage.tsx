import { useCallback, useDeferredValue, useMemo, useState } from 'react';

import { calculateMortgage } from '../lib/mortgage';

import { HeaderBar } from '../components/HeaderBar';
import { InputsPanel } from '../components/InputsPanel';
import { CostSummaryCard } from '../components/CostSummaryCard';
import { SidebarStats } from '../components/SidebarStats';
import { ScheduleSection } from '../components/ScheduleSection';
import { SaveScenarioCard } from '../components/SaveScenarioCard';
import { ConfirmModal } from '../components/ui/ConfirmModal';

import { useMortgageInputs } from '../hooks/useMortgageInputs';
import { useLoanYearGroups } from '../hooks/useLoanYearGroups';
import { useMortgageStore } from '../store/mortgageStore';

export function MortgageCalculatorPage(props: { onOpenNav?: () => void }) {
  const inputs = useMortgageInputs();
  const deferredInputs = useDeferredValue(inputs);

  const [isResetOpen, setIsResetOpen] = useState(false);

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

  const onReset = useCallback(() => setIsResetOpen(true), []);

  const confirmReset = useCallback(() => {
    clearPersisted();
    resetToDefaults();
    setIsResetOpen(false);
  }, [clearPersisted, resetToDefaults]);

  return (
    <>
      <HeaderBar onReset={onReset} onOpenNav={props.onOpenNav} />

      <ConfirmModal
        open={isResetOpen}
        title="Reset calculator?"
        description="This will clear your current inputs (and saved scenarios) and restore fresh defaults."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        danger
        onClose={() => setIsResetOpen(false)}
        onConfirm={confirmReset}
      />

      <main className="py-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-12 print:hidden">
          <section className="min-w-0 lg:col-span-8 print:hidden">
            <div className="space-y-6">
              <InputsPanel />

              <SaveScenarioCard />

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
    </>
  );
}
