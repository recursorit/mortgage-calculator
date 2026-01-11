import { formatCurrency, formatInteger, formatPercent } from '../lib/format';
import type { MortgageInputs, MortgageSummary } from '../lib/mortgage';

import { SectionHeader } from './ui/SectionHeader';

export function CostSummaryCard(props: {
  inputs: MortgageInputs;
  summary: MortgageSummary;
  remainingBalance: number;
}) {
  const { inputs, summary, remainingBalance } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Cost summary"
        description="Totals over the payoff period."
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Total to lender
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
            {formatCurrency(summary.totalToLender)}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Total interest
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
            {formatCurrency(summary.totalInterest)}
          </div>
        </div>

        {inputs.includeTaxesCosts ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Taxes & costs
            </div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
              {formatCurrency(summary.totalTaxesCosts)}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Total out-of-pocket
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-50">
            {formatCurrency(summary.totalOutOfPocket)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-50">
          Rate & term
        </div>
        <div className="mt-2 grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <span>Interest rate</span>
            <span className="font-semibold">
              {formatPercent(summary.annualRatePercent, 3)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Term</span>
            <span className="font-semibold">
              {formatInteger(summary.termMonths)} months
            </span>
          </div>
          <div className="flex justify-between gap-3 sm:col-span-2">
            <span>Remaining balance</span>
            <span className="font-semibold">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
