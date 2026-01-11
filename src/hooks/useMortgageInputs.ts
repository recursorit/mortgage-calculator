import { useMemo } from 'react';

import type { MortgageInputs } from '../lib/mortgage';
import { useMortgageStore } from '../store/mortgageStore';

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

export function useMortgageInputs(): MortgageInputs {
  const homePriceRaw = useMortgageStore((s) => s.homePriceRaw);
  const downPaymentType = useMortgageStore((s) => s.downPaymentType);
  const downPaymentRaw = useMortgageStore((s) => s.downPaymentRaw);
  const loanTermYearsRaw = useMortgageStore((s) => s.loanTermYearsRaw);
  const interestRateRaw = useMortgageStore((s) => s.interestRateRaw);

  const startMonthIndex0 = useMortgageStore((s) => s.startMonthIndex0);
  const startYearRaw = useMortgageStore((s) => s.startYearRaw);

  const includeTaxesCosts = useMortgageStore((s) => s.includeTaxesCosts);
  const propertyTaxAnnualRaw = useMortgageStore((s) => s.propertyTaxAnnualRaw);
  const homeInsuranceAnnualRaw = useMortgageStore((s) => s.homeInsuranceAnnualRaw);
  const pmiMonthlyRaw = useMortgageStore((s) => s.pmiMonthlyRaw);
  const hoaMonthlyRaw = useMortgageStore((s) => s.hoaMonthlyRaw);
  const otherCostsMonthlyRaw = useMortgageStore((s) => s.otherCostsMonthlyRaw);

  const extraMonthlyRaw = useMortgageStore((s) => s.extraMonthlyRaw);
  const extraYearlyRaw = useMortgageStore((s) => s.extraYearlyRaw);
  const extraYearlyMonthIndex0 = useMortgageStore((s) => s.extraYearlyMonthIndex0);
  const extraYearlyStartYearRaw = useMortgageStore((s) => s.extraYearlyStartYearRaw);

  const extraOneTimeRaw = useMortgageStore((s) => s.extraOneTimeRaw);
  const extraOneTimeMonthIndex0 = useMortgageStore((s) => s.extraOneTimeMonthIndex0);
  const extraOneTimeYearRaw = useMortgageStore((s) => s.extraOneTimeYearRaw);

  return useMemo(
    () => ({
      homePrice: numberFromInput(homePriceRaw),
      downPaymentType,
      downPaymentValue: numberFromInput(downPaymentRaw),
      loanTermYears: numberFromInput(loanTermYearsRaw),
      interestRateAnnualPercent: numberFromInput(interestRateRaw),

      startMonthIndex0,
      startYear: clampInt(
        (() => {
          const parsed = numberFromInput(startYearRaw);
          return parsed > 0 ? parsed : currentYear;
        })(),
        1900,
        3000,
      ),

      includeTaxesCosts,
      propertyTaxAnnual: numberFromInput(propertyTaxAnnualRaw),
      homeInsuranceAnnual: numberFromInput(homeInsuranceAnnualRaw),
      pmiMonthly: numberFromInput(pmiMonthlyRaw),
      hoaMonthly: numberFromInput(hoaMonthlyRaw),
      otherCostsMonthly: numberFromInput(otherCostsMonthlyRaw),

      extraMonthly: numberFromInput(extraMonthlyRaw),
      extraYearly: numberFromInput(extraYearlyRaw),
      extraYearlyMonthIndex0,
      extraYearlyStartYear: clampInt(
        (() => {
          const parsed = numberFromInput(extraYearlyStartYearRaw);
          return parsed > 0 ? parsed : currentYear + 1;
        })(),
        1900,
        3000,
      ),

      extraOneTime: numberFromInput(extraOneTimeRaw),
      extraOneTimeMonthIndex0,
      extraOneTimeYear: clampInt(
        (() => {
          const parsed = numberFromInput(extraOneTimeYearRaw);
          return parsed > 0 ? parsed : currentYear;
        })(),
        1900,
        3000,
      ),
    }),
    [
      downPaymentRaw,
      downPaymentType,
      extraMonthlyRaw,
      extraOneTimeMonthIndex0,
      extraOneTimeRaw,
      extraOneTimeYearRaw,
      extraYearlyMonthIndex0,
      extraYearlyRaw,
      extraYearlyStartYearRaw,
      hoaMonthlyRaw,
      homeInsuranceAnnualRaw,
      homePriceRaw,
      includeTaxesCosts,
      interestRateRaw,
      loanTermYearsRaw,
      otherCostsMonthlyRaw,
      pmiMonthlyRaw,
      propertyTaxAnnualRaw,
      startMonthIndex0,
      startYearRaw,
    ],
  );
}
