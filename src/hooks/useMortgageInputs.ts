import { useMemo } from 'react';

import type { MortgageInputs } from '../lib/mortgage';
import { parseMortgageInputs } from '../lib/parseMortgageInputs';
import { useMortgageStore } from '../store/mortgageStore';

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
    () =>
      parseMortgageInputs({
        homePriceRaw,
        downPaymentType,
        downPaymentRaw,
        loanTermYearsRaw,
        interestRateRaw,

        startMonthIndex0,
        startYearRaw,

        includeTaxesCosts,
        propertyTaxAnnualRaw,
        homeInsuranceAnnualRaw,
        pmiMonthlyRaw,
        hoaMonthlyRaw,
        otherCostsMonthlyRaw,

        extraMonthlyRaw,
        extraYearlyRaw,
        extraYearlyMonthIndex0,
        extraYearlyStartYearRaw,

        extraOneTimeRaw,
        extraOneTimeMonthIndex0,
        extraOneTimeYearRaw,
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
