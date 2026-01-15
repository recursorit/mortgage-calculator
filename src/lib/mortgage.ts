import { addMonths } from './format';

export type DownPaymentType = 'percent' | 'amount';

export type InterestType = 'fixed' | 'arm';

export type ArmRateChange = {
  // Absolute month index: (year * 12 + monthIndex0)
  effectiveIndex: number;
  annualRatePercent: number;
};

export type ExtraMonthlyRange = {
  amount: number;
  startIndex: number; // inclusive, (year * 12 + monthIndex0)
  endIndex: number; // inclusive; Infinity means no end
};

export type ExtraYearlyRange = {
  amount: number;
  paymentMonthIndex0: number; // 0-11
  startIndex: number; // inclusive
  endIndex: number; // inclusive; Infinity means no end
};

export interface MortgageInputs {
  homePrice: number;
  downPaymentType: DownPaymentType;
  downPaymentValue: number;

  loanTermYears: number;
  interestRateAnnualPercent: number;

  interestType: InterestType;
  armRateChanges: ArmRateChange[];
  armRateChangesValid: boolean;

  startMonthIndex0: number; // 0-11
  startYear: number;

  includeTaxesCosts: boolean;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  pmiMonthly: number;
  hoaMonthly: number;
  otherCostsMonthly: number;

  extraMonthly: number;
  extraMonthlyStartMonthIndex0: number;
  extraMonthlyStartYear: number;

  extraMonthlyRanges: ExtraMonthlyRange[];

  extraYearly: number;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYear: number;

  extraYearlyRanges: ExtraYearlyRange[];

  extraRangesValid: boolean;

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

  annualRatePercent: number;
  scheduledMonthlyPI: number;
  isRateChangeMonth: boolean;

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

function shouldApplyMonthlyExtra(
  rowMonthIndex0: number,
  rowYear: number,
  extraMonthly: number,
  startMonthIndex0: number,
  startYear: number,
): boolean {
  if (extraMonthly <= 0) return false;
  const rowIndex = rowYear * 12 + rowMonthIndex0;
  const startIndex = startYear * 12 + startMonthIndex0;
  return rowIndex >= startIndex;
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

  const interestType: InterestType = inputs.interestType === 'arm' ? 'arm' : 'fixed';
  const armRateChanges: ArmRateChange[] =
    interestType === 'arm' && inputs.armRateChangesValid ? inputs.armRateChanges : [];

  const monthlyTaxesCosts =
    Math.max(0, safeNumber(inputs.propertyTaxAnnual)) / 12 +
    Math.max(0, safeNumber(inputs.homeInsuranceAnnual)) / 12 +
    Math.max(0, safeNumber(inputs.pmiMonthly)) +
    Math.max(0, safeNumber(inputs.hoaMonthly)) +
    Math.max(0, safeNumber(inputs.otherCostsMonthly));

  const useRanges =
    inputs.extraRangesValid &&
    (inputs.extraMonthlyRanges.length > 0 || inputs.extraYearlyRanges.length > 0);

  const schedule = buildSchedule({
    loanAmount,
    termMonths,
    annualRatePercent,
    interestType,
    armRateChanges,
    startMonthIndex0: clamp(inputs.startMonthIndex0, 0, 11),
    startYear: Math.max(0, Math.floor(safeNumber(inputs.startYear))),
    scheduledMonthlyPI,
    extraMonthly: useRanges ? 0 : Math.max(0, safeNumber(inputs.extraMonthly)),
    extraMonthlyStartMonthIndex0: clamp(inputs.extraMonthlyStartMonthIndex0, 0, 11),
    extraMonthlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraMonthlyStartYear))),
    extraMonthlyRanges: useRanges ? inputs.extraMonthlyRanges : [],
    extraYearly: useRanges ? 0 : Math.max(0, safeNumber(inputs.extraYearly)),
    extraYearlyMonthIndex0: clamp(inputs.extraYearlyMonthIndex0, 0, 11),
    extraYearlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraYearlyStartYear))),
    extraYearlyRanges: useRanges ? inputs.extraYearlyRanges : [],
    extraOneTime: Math.max(0, safeNumber(inputs.extraOneTime)),
    extraOneTimeMonthIndex0: clamp(inputs.extraOneTimeMonthIndex0, 0, 11),
    extraOneTimeYear: Math.max(0, Math.floor(safeNumber(inputs.extraOneTimeYear))),
  });

  const baselineSchedule = buildSchedule({
    loanAmount,
    termMonths,
    annualRatePercent,
    interestType,
    armRateChanges,
    startMonthIndex0: clamp(inputs.startMonthIndex0, 0, 11),
    startYear: Math.max(0, Math.floor(safeNumber(inputs.startYear))),
    scheduledMonthlyPI,
    extraMonthly: 0,
    extraMonthlyStartMonthIndex0: clamp(inputs.extraMonthlyStartMonthIndex0, 0, 11),
    extraMonthlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraMonthlyStartYear))),
    extraMonthlyRanges: [],
    extraYearly: 0,
    extraYearlyMonthIndex0: clamp(inputs.extraYearlyMonthIndex0, 0, 11),
    extraYearlyStartYear: Math.max(0, Math.floor(safeNumber(inputs.extraYearlyStartYear))),
    extraYearlyRanges: [],
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
  interestType: InterestType;
  armRateChanges: ArmRateChange[];
  startMonthIndex0: number;
  startYear: number;
  scheduledMonthlyPI: number;
  extraMonthly: number;
  extraMonthlyStartMonthIndex0: number;
  extraMonthlyStartYear: number;
  extraMonthlyRanges: ExtraMonthlyRange[];
  extraYearly: number;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYear: number;
  extraYearlyRanges: ExtraYearlyRange[];
  extraOneTime: number;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYear: number;
}): AmortizationRow[] {
  const loanAmount = Math.max(0, safeNumber(args.loanAmount));
  const termMonths = Math.max(0, Math.floor(safeNumber(args.termMonths)));
  const isArm = args.interestType === 'arm';
  const sortedArmChanges = isArm ? [...args.armRateChanges].sort((a, b) => a.effectiveIndex - b.effectiveIndex) : [];

  let currentAnnualRatePercent = Math.max(0, safeNumber(args.annualRatePercent));
  let monthlyRate = currentAnnualRatePercent / 100 / 12;
  let scheduledPI = Math.max(0, safeNumber(args.scheduledMonthlyPI));
  let nextChangeIdx = 0;

  let balance = loanAmount;
  const schedule: AmortizationRow[] = [];

  for (let i = 0; i < termMonths && balance > 0.005; i += 1) {
    const { monthIndex0, year } = addMonths(args.startMonthIndex0, args.startYear, i);
    const rowIndex = year * 12 + monthIndex0;

    let isRateChangeMonth = false;

    if (isArm) {
      // Apply rate change at the start of this month, and recast payment based on remaining term.
      while (nextChangeIdx < sortedArmChanges.length && rowIndex === sortedArmChanges[nextChangeIdx].effectiveIndex) {
        currentAnnualRatePercent = Math.max(0, safeNumber(sortedArmChanges[nextChangeIdx].annualRatePercent));
        monthlyRate = currentAnnualRatePercent / 100 / 12;
        const remainingMonths = Math.max(1, termMonths - i);
        scheduledPI = monthlyPaymentPI(balance, currentAnnualRatePercent, remainingMonths);
        nextChangeIdx += 1;
        isRateChangeMonth = true;
      }
    }

    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;

    // Scheduled payment (P&I) cannot exceed what's needed to close.
    const maxNeededPI = balance + interest;
    const paymentPI = Math.min(scheduledPI, maxNeededPI);

    let principal = Math.max(0, paymentPI - interest);
    principal = Math.min(principal, balance);

    const yearlyExtraLegacy = shouldApplyYearlyExtra(
      monthIndex0,
      year,
      args.extraYearly,
      args.extraYearlyMonthIndex0,
      args.extraYearlyStartYear,
    )
      ? args.extraYearly
      : 0;

    let yearlyExtraRanges = 0;
    if (args.extraYearlyRanges.length) {
      for (const r of args.extraYearlyRanges) {
        if (r.amount <= 0) continue;
        if (rowIndex < r.startIndex) continue;
        if (rowIndex > r.endIndex) continue;
        if (monthIndex0 !== r.paymentMonthIndex0) continue;
        yearlyExtraRanges += r.amount;
      }
    }

    const yearlyExtra = yearlyExtraLegacy + yearlyExtraRanges;

    const oneTimeExtra = shouldApplyOneTimeExtra(
      monthIndex0,
      year,
      args.extraOneTime,
      args.extraOneTimeMonthIndex0,
      args.extraOneTimeYear,
    )
      ? args.extraOneTime
      : 0;

    const monthlyExtraLegacy = shouldApplyMonthlyExtra(
      monthIndex0,
      year,
      args.extraMonthly,
      args.extraMonthlyStartMonthIndex0,
      args.extraMonthlyStartYear,
    )
      ? args.extraMonthly
      : 0;

    let monthlyExtraRanges = 0;
    if (args.extraMonthlyRanges.length) {
      for (const r of args.extraMonthlyRanges) {
        if (r.amount <= 0) continue;
        if (rowIndex < r.startIndex) continue;
        if (rowIndex > r.endIndex) continue;
        monthlyExtraRanges += r.amount;
      }
    }

    const monthlyExtra = monthlyExtraLegacy + monthlyExtraRanges;

    const rawExtra = Math.max(0, monthlyExtra) + Math.max(0, yearlyExtra) + Math.max(0, oneTimeExtra);
    const extraPrincipal = Math.min(rawExtra, Math.max(0, balance - principal));

    balance = Math.max(0, balance - principal - extraPrincipal);

    schedule.push({
      index: i + 1,
      monthIndex0,
      year,
      annualRatePercent: currentAnnualRatePercent,
      scheduledMonthlyPI: scheduledPI,
      isRateChangeMonth,
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
