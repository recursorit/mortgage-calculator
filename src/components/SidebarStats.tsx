import {
  formatCurrency,
  formatInteger,
  formatMonthYear,
  formatPercent,
} from '../lib/format';
import { addMonths } from '../lib/format';
import type { MortgageInputs, MortgageSummary } from '../lib/mortgage';

import { StatCard } from './ui/StatCard';

export function SidebarStats(props: {
  inputs: MortgageInputs;
  summary: MortgageSummary;
  monthlyTaxesCosts: number;
  totalMonthlyPayment: number;
}) {
  const { inputs, summary, monthlyTaxesCosts, totalMonthlyPayment } = props;

  const hasExtraPayments =
    inputs.extraMonthly > 0 ||
    inputs.extraYearly > 0 ||
    inputs.extraOneTime > 0 ||
    inputs.extraMonthlyRanges.some((r) => r.amount > 0) ||
    inputs.extraYearlyRanges.some((r) => r.amount > 0);

  const baselinePayoff =
    summary.baselineMonthsToPayoff > 0
      ? addMonths(
          inputs.startMonthIndex0,
          inputs.startYear,
          summary.baselineMonthsToPayoff - 1,
        )
      : { monthIndex0: summary.payoffMonthIndex0, year: summary.payoffYear };
  const baselinePayoffText = formatMonthYear(
    baselinePayoff.monthIndex0,
    baselinePayoff.year,
  );
  const baselineDurationYears = Math.floor(summary.baselineMonthsToPayoff / 12);
  const baselineDurationMonths = summary.baselineMonthsToPayoff % 12;

  const payoffText = formatMonthYear(
    summary.payoffMonthIndex0,
    summary.payoffYear,
  );
  const payoffDurationYears = Math.floor(summary.monthsToPayoff / 12);
  const payoffDurationMonths = summary.monthsToPayoff % 12;

  return (
    <div className="grid gap-4">
      <StatCard
        title="Monthly payment"
        value={formatCurrency(totalMonthlyPayment)}
        subtitle={
          inputs.includeTaxesCosts
            ? `${formatCurrency(summary.scheduledMonthlyPI)} P&I + ${formatCurrency(monthlyTaxesCosts)} taxes/costs`
            : `${formatCurrency(summary.scheduledMonthlyPI)} principal & interest`
        }
        accent="sky"
      />
      <StatCard
        title="Loan amount"
        value={formatCurrency(summary.loanAmount)}
        subtitle={`${formatPercent(summary.downPaymentPercent, 2)} down (${formatCurrency(summary.downPaymentAmount)})`}
        accent="violet"
      />
      <StatCard
        title="Payoff"
        value={payoffText}
        subtitle={`In ${formatInteger(payoffDurationYears)} years ${formatInteger(payoffDurationMonths)} months`}
        accent="emerald"
      />
      <StatCard
        title="Interest saved"
        value={formatCurrency(summary.interestSaved)}
        subtitle={
          inputs.interestType === 'arm'
            ? `${formatInteger(summary.monthsSaved)} months sooner vs. no extra payments (same ARM schedule)`
            : `${formatInteger(summary.monthsSaved)} months sooner vs. no extra payments`
        }
        accent="amber"
      />

      {hasExtraPayments &&
      (summary.interestSaved > 0 || summary.monthsSaved > 0) ? (
        <div className="rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100">
          <div className="font-bold">Savings vs. no extra payments</div>
          <div className="mt-1">
            Baseline payoff:{' '}
            <span className="font-bold">{baselinePayoffText}</span> (in{' '}
            <span className="font-bold">
              {formatInteger(baselineDurationYears)}y{' '}
              {formatInteger(baselineDurationMonths)}m
            </span>
            ) → With extras: <span className="font-bold">{payoffText}</span> (in{' '}
            <span className="font-bold">
              {formatInteger(payoffDurationYears)}y{' '}
              {formatInteger(payoffDurationMonths)}m
            </span>
            )
          </div>
          <div className="mt-2">
            Time saved:{' '}
            <span className="font-bold">
              {formatInteger(summary.monthsSaved)} months
            </span>{' '}
            • Interest saved:{' '}
            <span className="font-bold">
              {formatCurrency(summary.interestSaved)}
            </span>
          </div>
          {inputs.interestType === 'arm' ? (
            <div className="mt-2 text-xs text-sky-800 dark:text-sky-200">
              Note: Baseline uses the same ARM reset schedule you entered
              (payments are recast on each reset).
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
