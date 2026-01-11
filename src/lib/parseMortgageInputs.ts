import type { MortgageInputs } from './mortgage';
import type { MortgageInputsRaw } from './mortgageInputsRaw';

const currentYear = new Date().getFullYear();

function numberFromInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampInt(value: number, min: number, max: number): number {
  const v = Math.floor(value);
  return Math.min(max, Math.max(min, v));
}

export function parseMortgageInputs(raw: MortgageInputsRaw): MortgageInputs {
  return {
    homePrice: numberFromInput(raw.homePriceRaw),
    downPaymentType: raw.downPaymentType,
    downPaymentValue: numberFromInput(raw.downPaymentRaw),
    loanTermYears: numberFromInput(raw.loanTermYearsRaw),
    interestRateAnnualPercent: numberFromInput(raw.interestRateRaw),

    startMonthIndex0: raw.startMonthIndex0,
    startYear: clampInt(
      (() => {
        const parsed = numberFromInput(raw.startYearRaw);
        return parsed > 0 ? parsed : currentYear;
      })(),
      1900,
      3000,
    ),

    includeTaxesCosts: raw.includeTaxesCosts,
    propertyTaxAnnual: numberFromInput(raw.propertyTaxAnnualRaw),
    homeInsuranceAnnual: numberFromInput(raw.homeInsuranceAnnualRaw),
    pmiMonthly: numberFromInput(raw.pmiMonthlyRaw),
    hoaMonthly: numberFromInput(raw.hoaMonthlyRaw),
    otherCostsMonthly: numberFromInput(raw.otherCostsMonthlyRaw),

    extraMonthly: numberFromInput(raw.extraMonthlyRaw),
    extraYearly: numberFromInput(raw.extraYearlyRaw),
    extraYearlyMonthIndex0: raw.extraYearlyMonthIndex0,
    extraYearlyStartYear: clampInt(
      (() => {
        const parsed = numberFromInput(raw.extraYearlyStartYearRaw);
        return parsed > 0 ? parsed : currentYear + 1;
      })(),
      1900,
      3000,
    ),

    extraOneTime: numberFromInput(raw.extraOneTimeRaw),
    extraOneTimeMonthIndex0: raw.extraOneTimeMonthIndex0,
    extraOneTimeYear: clampInt(
      (() => {
        const parsed = numberFromInput(raw.extraOneTimeYearRaw);
        return parsed > 0 ? parsed : currentYear;
      })(),
      1900,
      3000,
    ),
  };
}
