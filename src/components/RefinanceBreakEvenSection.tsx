import { useMemo, useState } from 'react';

import type { AmortizationRow, MortgageSummary } from '../lib/mortgage';
import { formatCurrency, formatInteger } from '../lib/format';
import {
  computeRefinanceBreakEven,
  getRemainingBalanceAtPayment,
} from '../lib/refinance';

import { Input } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

function num(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RefinanceBreakEvenSection(props: {
  summary: MortgageSummary;
  schedule: AmortizationRow[];
  monthlyTaxesCosts: number;
}) {
  const { summary, schedule } = props;

  const [refiAtPaymentRaw, setRefiAtPaymentRaw] = useState('1');
  const [newRateRaw, setNewRateRaw] = useState('');
  const [newTermYearsRaw, setNewTermYearsRaw] = useState('30');
  const [closingCostsRaw, setClosingCostsRaw] = useState('');

  const result = useMemo(() => {
    if (!schedule.length) return null;

    const refiAtPayment = Math.max(1, Math.floor(num(refiAtPaymentRaw)));
    const remainingBalance = getRemainingBalanceAtPayment(
      summary,
      schedule,
      refiAtPayment,
    );
    const remainingTermMonths = Math.max(0, schedule.length - refiAtPayment);

    const newRateAnnualPercent = Math.max(0, num(newRateRaw));
    const newTermMonths = Math.max(1, Math.floor(num(newTermYearsRaw) * 12));
    const closingCosts = Math.max(0, num(closingCostsRaw));

    if (!(remainingBalance > 0) || !(newTermMonths > 0)) return null;

    return computeRefinanceBreakEven({
      remainingBalance,
      remainingTermMonths,
      currentMonthlyPI: summary.scheduledMonthlyPI,
      newRateAnnualPercent,
      newTermMonths,
      closingCosts,
    });
  }, [
    closingCostsRaw,
    newRateRaw,
    newTermYearsRaw,
    refiAtPaymentRaw,
    schedule,
    summary,
  ]);

  return (
    <div className="max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Refinance break-even"
        description="Estimate monthly savings and break-even time (P&I only)."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Refi at payment #
          </div>
          <Input
            inputMode="numeric"
            value={refiAtPaymentRaw}
            onChange={(e) => setRefiAtPaymentRaw(e.target.value)}
            placeholder="1"
            aria-label="Refinance at payment number"
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            New rate (APR %)
          </div>
          <Input
            inputMode="decimal"
            value={newRateRaw}
            onChange={(e) => setNewRateRaw(e.target.value)}
            placeholder="e.g., 5.25"
            aria-label="New refinance interest rate"
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            New term (years)
          </div>
          <Input
            inputMode="numeric"
            value={newTermYearsRaw}
            onChange={(e) => setNewTermYearsRaw(e.target.value)}
            placeholder="30"
            aria-label="New refinance term in years"
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Closing costs
          </div>
          <Input
            inputMode="decimal"
            value={closingCostsRaw}
            onChange={(e) => setClosingCostsRaw(e.target.value)}
            placeholder="e.g., 4500"
            aria-label="Refinance closing costs"
          />
        </div>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Remaining balance
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
              {formatCurrency(result.remainingBalance)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Monthly savings (P&I)
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
              {formatCurrency(result.monthlySavings)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Break-even
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
              {result.breakEvenMonths === null
                ? '—'
                : `${formatInteger(result.breakEvenMonths)} mo`}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Net savings
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
              {formatCurrency(result.totalSavingsOverRemainingTerm)}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Over remaining term (minus costs)
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Enter values to estimate refinance break-even.
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Note: Taxes/insurance/PMI may change after refinancing; this estimate
        focuses on principal & interest.
      </div>
    </div>
  );
}
