import type { MortgageSummary } from './mortgage';
import { monthlyPaymentPI } from './mortgage';

export type RefinanceResult = {
  remainingBalance: number;
  oldMonthlyPI: number;
  newMonthlyPI: number;
  monthlySavings: number;
  breakEvenMonths: number | null;
  totalSavingsOverRemainingTerm: number;
};

export function computeRefinanceBreakEven(args: {
  remainingBalance: number;
  remainingTermMonths: number;
  currentMonthlyPI: number;
  newRateAnnualPercent: number;
  newTermMonths: number;
  closingCosts: number;
}): RefinanceResult {
  const {
    remainingBalance,
    remainingTermMonths,
    currentMonthlyPI,
    newRateAnnualPercent,
    newTermMonths,
    closingCosts,
  } = args;

  const oldMonthlyPI = currentMonthlyPI;
  const newMonthlyPI = monthlyPaymentPI(
    remainingBalance,
    newRateAnnualPercent,
    newTermMonths,
  );

  const monthlySavings = oldMonthlyPI - newMonthlyPI;
  const breakEvenMonths =
    monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null;

  const months = Math.max(0, Math.min(remainingTermMonths, newTermMonths));
  const totalSavingsOverRemainingTerm = monthlySavings > 0 ? monthlySavings * months - closingCosts : -closingCosts;

  return {
    remainingBalance,
    oldMonthlyPI,
    newMonthlyPI,
    monthlySavings,
    breakEvenMonths,
    totalSavingsOverRemainingTerm,
  };
}

export function getRemainingBalanceAtPayment(summary: MortgageSummary, schedule: { index: number; balance: number }[], paymentIndex: number): number {
  if (!schedule.length) return summary.loanAmount;
  const idx = Math.max(1, Math.min(paymentIndex, schedule.length));
  return schedule[idx - 1]?.balance ?? 0;
}
