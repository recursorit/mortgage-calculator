import { addMonths } from './format';

export type DownPaymentType = 'percent' | 'amount';

export interface MortgageInputs {
  homePrice: number;
  downPaymentType: DownPaymentType;
  downPaymentValue: number;

  loanTermYears: number;
  interestRateAnnualPercent: number;

  startMonthIndex0: number; // 0-11
  startYear: number;

  includeTaxesCosts: boolean;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  pmiMonthly: number;
  hoaMonthly: number;
  otherCostsMonthly: number;

  extraMonthly: number;
  extraYearly: number;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYear: number;

  extraOneTime: number;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYear: number;
}

export interface MortgageSummary {
  homePrice: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanAmount: number;

  termMonths: number;
  annualRatePercent: number;
  monthlyRate: number;

  scheduledMonthlyPI: number;
  monthlyTaxesCosts: number;

  monthsToPayoff: number;
  payoffMonthIndex0: number;
  payoffYear: number;

  totalInterest: number;
  totalToLender: number;
  totalTaxesCosts: number;
  totalOutOfPocket: number;

  baselineMonthsToPayoff: number;
  baselineTotalInterest: number;
  interestSaved: number;
  monthsSaved: number;
}

export interface AmortizationRow {
  index: number; // 1-based
  monthIndex0: number;
  year: number;

  paymentPI: number;
  interest: number;
  principal: number;
  extraPrincipal: number;

  totalToLender: number;
  balance: number;
}

export interface MortgageCalculation {
  summary: MortgageSummary;
  schedule: AmortizationRow[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function computeDownPayment(homePrice: number, type: DownPaymentType, value: number): {
  downPaymentAmount: number;
  downPaymentPercent: number;
} {
  const hp = Math.max(0, safeNumber(homePrice));
  const v = Math.max(0, safeNumber(value));
  if (hp === 0) {
    return { downPaymentAmount: 0, downPaymentPercent: 0 };
  }

  if (type === 'amount') {
    const amount = clamp(v, 0, hp);
    return { downPaymentAmount: amount, downPaymentPercent: (amount / hp) * 100 };
  }

  const pct = clamp(v, 0, 100);
  const amount = (pct / 100) * hp;
  return { downPaymentAmount: clamp(amount, 0, hp), downPaymentPercent: pct };
}

export function monthlyPaymentPI(
  loanAmount: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  const principal = Math.max(0, safeNumber(loanAmount));
  const n = Math.max(0, Math.floor(safeNumber(termMonths)));
  const annual = Math.max(0, safeNumber(annualRatePercent));

  if (n === 0) return 0;

  const r = annual / 100 / 12;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return principal * ((r * pow) / (pow - 1));
}

function shouldApplyYearlyExtra(
  rowMonthIndex0: number,
  rowYear: number,
  extraYearly: number,
  extraYearlyMonthIndex0: number,
  extraYearlyStartYear: number,
): boolean {
  if (extraYearly <= 0) return false;
  if (rowYear < extraYearlyStartYear) return false;
  return rowMonthIndex0 === extraYearlyMonthIndex0;
}

function shouldApplyOneTimeExtra(
  rowMonthIndex0: number,
  rowYear: number,
  oneTime: number,
  oneTimeMonthIndex0: number,
  oneTimeYear: number,
): boolean {
  if (oneTime <= 0) return false;
  return rowYear === oneTimeYear && rowMonthIndex0 === oneTimeMonthIndex0;
}

export function calculateMortgage(inputs: MortgageInputs): MortgageCalculation {
  const homePrice = Math.max(0, safeNumber(inputs.homePrice));
  const termMonths = Math.max(0, Math.floor(safeNumber(inputs.loanTermYears) * 12));
  const annualRatePercent = Math.max(0, safeNumber(inputs.interestRateAnnualPercent));

  const { downPaymentAmount, downPaymentPercent } = computeDownPayment(
    homePrice,
    inputs.downPaymentType,
    inputs.downPaymentValue,
  );

  const loanAmount = Math.max(0, homePrice - downPaymentAmount);
  const scheduledMonthlyPI = monthlyPaymentPI(loanAmount, annualRatePercent, termMonths);
  const monthlyRate = annualRatePercent / 100 / 12;

  const monthlyTaxesCosts =
    Math.max(0, safeNumber(inputs.propertyTaxAnnual)) / 12 +
    Math.max(0, safeNumber(inputs.homeInsuranceAnnual)) / 12 +
    Math.max(0, safeNumber(inputs.pmiMonthly)) +
    Math.max(0, safeNumber(inputs.hoaMonthly)) +
    Math.max(0, safeNumber(inputs.otherCostsMonthly));

  const schedule = buildSchedule({
    loanAmount,
    termMonths,
    annualRatePercent,
    startMonthIndex0: clamp(inputs.startMonthIndex0, 0, 11),
    startYear: Math.max(0, Math.floor(safeNumber(inputs.startYear))),
    scheduledMonthlyPI,
    extraMonthly: Math.max(0, safeNumber(inputs.extraMonthly)),
    extraYearly: Math.max(0, safeNumber(inputs.extraYearly)),
    extraYearlyMonthIndex0: clamp(inputs.extraYearlyMonthIndex0, 0, 11),
    extraYearlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraYearlyStartYear))),
    extraOneTime: Math.max(0, safeNumber(inputs.extraOneTime)),
    extraOneTimeMonthIndex0: clamp(inputs.extraOneTimeMonthIndex0, 0, 11),
    extraOneTimeYear: Math.max(0, Math.floor(safeNumber(inputs.extraOneTimeYear))),
  });

  const baselineSchedule = buildSchedule({
    loanAmount,
    termMonths,
    annualRatePercent,
    startMonthIndex0: clamp(inputs.startMonthIndex0, 0, 11),
    startYear: Math.max(0, Math.floor(safeNumber(inputs.startYear))),
    scheduledMonthlyPI,
    extraMonthly: 0,
    extraYearly: 0,
    extraYearlyMonthIndex0: clamp(inputs.extraYearlyMonthIndex0, 0, 11),
    extraYearlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraYearlyStartYear))),
    extraOneTime: 0,
    extraOneTimeMonthIndex0: clamp(inputs.extraOneTimeMonthIndex0, 0, 11),
    extraOneTimeYear: Math.max(0, Math.floor(safeNumber(inputs.extraOneTimeYear))),
  });

  const totals = summarizeSchedule(schedule);
  const baselineTotals = summarizeSchedule(baselineSchedule);

  const monthsToPayoff = schedule.length;
  const payoff = monthsToPayoff
    ? schedule[schedule.length - 1]
    : { monthIndex0: inputs.startMonthIndex0, year: inputs.startYear };

  const totalTaxesCosts = inputs.includeTaxesCosts ? monthlyTaxesCosts * monthsToPayoff : 0;
  const totalOutOfPocket = totals.totalToLender + totalTaxesCosts;

  const interestSaved = Math.max(0, baselineTotals.totalInterest - totals.totalInterest);
  const monthsSaved = Math.max(0, baselineSchedule.length - schedule.length);

  return {
    summary: {
      homePrice,
      downPaymentAmount,
      downPaymentPercent,
      loanAmount,

      termMonths,
      annualRatePercent,
      monthlyRate,

      scheduledMonthlyPI,
      monthlyTaxesCosts,

      monthsToPayoff,
      payoffMonthIndex0: payoff.monthIndex0,
      payoffYear: payoff.year,

      totalInterest: totals.totalInterest,
      totalToLender: totals.totalToLender,
      totalTaxesCosts,
      totalOutOfPocket,

      baselineMonthsToPayoff: baselineSchedule.length,
      baselineTotalInterest: baselineTotals.totalInterest,
      interestSaved,
      monthsSaved,
    },
    schedule,
  };
}

function buildSchedule(args: {
  loanAmount: number;
  termMonths: number;
  annualRatePercent: number;
  startMonthIndex0: number;
  startYear: number;
  scheduledMonthlyPI: number;
  extraMonthly: number;
  extraYearly: number;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYear: number;
  extraOneTime: number;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYear: number;
}): AmortizationRow[] {
  const loanAmount = Math.max(0, safeNumber(args.loanAmount));
  const termMonths = Math.max(0, Math.floor(safeNumber(args.termMonths)));
  const monthlyRate = Math.max(0, safeNumber(args.annualRatePercent)) / 100 / 12;

  let balance = loanAmount;
  const schedule: AmortizationRow[] = [];

  for (let i = 0; i < termMonths && balance > 0.005; i += 1) {
    const { monthIndex0, year } = addMonths(args.startMonthIndex0, args.startYear, i);

    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;

    // Scheduled payment (P&I) cannot exceed what's needed to close.
    const scheduledPI = Math.max(0, safeNumber(args.scheduledMonthlyPI));
    const maxNeededPI = balance + interest;
    const paymentPI = Math.min(scheduledPI, maxNeededPI);

    let principal = Math.max(0, paymentPI - interest);
    principal = Math.min(principal, balance);

    const yearlyExtra = shouldApplyYearlyExtra(
      monthIndex0,
      year,
      args.extraYearly,
      args.extraYearlyMonthIndex0,
      args.extraYearlyStartYear,
    )
      ? args.extraYearly
      : 0;

    const oneTimeExtra = shouldApplyOneTimeExtra(
      monthIndex0,
      year,
      args.extraOneTime,
      args.extraOneTimeMonthIndex0,
      args.extraOneTimeYear,
    )
      ? args.extraOneTime
      : 0;

    const rawExtra = Math.max(0, args.extraMonthly) + Math.max(0, yearlyExtra) + Math.max(0, oneTimeExtra);
    const extraPrincipal = Math.min(rawExtra, Math.max(0, balance - principal));

    balance = Math.max(0, balance - principal - extraPrincipal);

    schedule.push({
      index: i + 1,
      monthIndex0,
      year,
      paymentPI,
      interest,
      principal,
      extraPrincipal,
      totalToLender: paymentPI + extraPrincipal,
      balance,
    });
  }

  return schedule;
}

function summarizeSchedule(schedule: AmortizationRow[]): {
  totalInterest: number;
  totalToLender: number;
} {
  let totalInterest = 0;
  let totalToLender = 0;

  for (const row of schedule) {
    totalInterest += row.interest;
    totalToLender += row.totalToLender;
  }

  return { totalInterest, totalToLender };
}
