import { useDeferredValue, useMemo } from 'react';

import { HeaderBar } from '../components/HeaderBar';
import { RefinanceBreakEvenSection } from '../components/RefinanceBreakEvenSection';

import { useMortgageInputs } from '../hooks/useMortgageInputs';
import { calculateMortgage } from '../lib/mortgage';

export function RefinanceBreakEvenPage(props: { onOpenNav?: () => void }) {
  const inputs = useMortgageInputs();
  const deferredInputs = useDeferredValue(inputs);

  const calc = useMemo(
    () => calculateMortgage(deferredInputs),
    [deferredInputs],
  );
  const { summary, schedule } = calc;

  const monthlyTaxesCosts = deferredInputs.includeTaxesCosts
    ? summary.monthlyTaxesCosts
    : 0;

  return (
    <>
      <HeaderBar onOpenNav={props.onOpenNav} />

      <main className="py-6 sm:py-10">
        <div className="grid gap-6 print:hidden">
          <RefinanceBreakEvenSection
            summary={summary}
            schedule={schedule}
            monthlyTaxesCosts={monthlyTaxesCosts}
          />
        </div>
      </main>
    </>
  );
}
