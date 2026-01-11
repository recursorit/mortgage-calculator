import { useMemo } from 'react';
import { formatMonthYear } from '../lib/format';
import type { AmortizationRow } from '../lib/mortgage';

export type LoanYearTotals = {
  pi: number;
  extra: number;
  interest: number;
  principal: number;
  taxesCosts: number;
  totalPayment: number;
};

export type LoanYearGroup = {
  loanYear: number;
  startLabel: string;
  endLabel: string;
  startBalance: number;
  endBalance: number;
  rows: AmortizationRow[];
  totals: LoanYearTotals;
};

export function useLoanYearGroups(args: {
  schedule: AmortizationRow[];
  monthlyTaxesCosts: number;
  loanAmount: number;
}): LoanYearGroup[] {
  const { schedule, monthlyTaxesCosts, loanAmount } = args;

  return useMemo(() => {
    if (!schedule.length) return [] as LoanYearGroup[];

    const groups = new Map<number, LoanYearGroup>();

    for (const row of schedule) {
      const loanYear = Math.floor((row.index - 1) / 12) + 1;
      const existing = groups.get(loanYear);
      const rowLabel = formatMonthYear(row.monthIndex0, row.year);

      if (!existing) {
        const startBalance =
          row.index === 1
            ? loanAmount
            : (schedule[row.index - 2]?.balance ?? loanAmount);

        const totals: LoanYearTotals = {
          pi: row.paymentPI,
          extra: row.extraPrincipal,
          interest: row.interest,
          principal: row.principal + row.extraPrincipal,
          taxesCosts: monthlyTaxesCosts,
          totalPayment: row.totalToLender + monthlyTaxesCosts,
        };

        groups.set(loanYear, {
          loanYear,
          startLabel: rowLabel,
          endLabel: rowLabel,
          startBalance,
          endBalance: row.balance,
          rows: [row],
          totals,
        });
        continue;
      }

      existing.endLabel = rowLabel;
      existing.endBalance = row.balance;
      existing.rows.push(row);
      existing.totals.pi += row.paymentPI;
      existing.totals.extra += row.extraPrincipal;
      existing.totals.interest += row.interest;
      existing.totals.principal += row.principal + row.extraPrincipal;
      existing.totals.taxesCosts += monthlyTaxesCosts;
      existing.totals.totalPayment += row.totalToLender + monthlyTaxesCosts;
    }

    return Array.from(groups.values()).sort((a, b) => a.loanYear - b.loanYear);
  }, [loanAmount, monthlyTaxesCosts, schedule]);
}
