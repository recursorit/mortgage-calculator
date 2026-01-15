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

  const interestType = useMortgageStore((s) => s.interestType);
  const armPreset = useMortgageStore((s) => s.armPreset);
  const armRateChanges = useMortgageStore((s) => s.armRateChanges);
  const armAdvancedMode = useMortgageStore((s) => s.armAdvancedMode);

  const startMonthIndex0 = useMortgageStore((s) => s.startMonthIndex0);
  const startYearRaw = useMortgageStore((s) => s.startYearRaw);

  const includeTaxesCosts = useMortgageStore((s) => s.includeTaxesCosts);
  const propertyTaxAnnualRaw = useMortgageStore((s) => s.propertyTaxAnnualRaw);
  const homeInsuranceAnnualRaw = useMortgageStore((s) => s.homeInsuranceAnnualRaw);
  const pmiMonthlyRaw = useMortgageStore((s) => s.pmiMonthlyRaw);
  const hoaMonthlyRaw = useMortgageStore((s) => s.hoaMonthlyRaw);
  const otherCostsMonthlyRaw = useMortgageStore((s) => s.otherCostsMonthlyRaw);

  const extraMonthlyRaw = useMortgageStore((s) => s.extraMonthlyRaw);
  const extraMonthlyStartMonthIndex0 = useMortgageStore(
    (s) => s.extraMonthlyStartMonthIndex0,
  );
  const extraMonthlyStartYearRaw = useMortgageStore(
    (s) => s.extraMonthlyStartYearRaw,
  );
  const extraMonthlyRanges = useMortgageStore((s) => s.extraMonthlyRanges);
  const extraYearlyRaw = useMortgageStore((s) => s.extraYearlyRaw);
  const extraYearlyMonthIndex0 = useMortgageStore((s) => s.extraYearlyMonthIndex0);
  const extraYearlyStartYearRaw = useMortgageStore((s) => s.extraYearlyStartYearRaw);
  const extraYearlyRanges = useMortgageStore((s) => s.extraYearlyRanges);

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

        interestType,
        armPreset,
        armRateChanges,
        armAdvancedMode,

        startMonthIndex0,
        startYearRaw,

        includeTaxesCosts,
        propertyTaxAnnualRaw,
        homeInsuranceAnnualRaw,
        pmiMonthlyRaw,
        hoaMonthlyRaw,
        otherCostsMonthlyRaw,

        extraMonthlyRaw,
        extraMonthlyStartMonthIndex0,
        extraMonthlyStartYearRaw,
        extraMonthlyRanges,
        extraYearlyRaw,
        extraYearlyMonthIndex0,
        extraYearlyStartYearRaw,
        extraYearlyRanges,

        extraOneTimeRaw,
        extraOneTimeMonthIndex0,
        extraOneTimeYearRaw,
      }),
    [
      downPaymentRaw,
      downPaymentType,
      interestType,
      armPreset,
      armRateChanges,
      armAdvancedMode,
      extraMonthlyRaw,
      extraMonthlyStartMonthIndex0,
      extraMonthlyStartYearRaw,
      extraMonthlyRanges,
      extraOneTimeMonthIndex0,
      extraOneTimeRaw,
      extraOneTimeYearRaw,
      extraYearlyMonthIndex0,
      extraYearlyRaw,
      extraYearlyStartYearRaw,
      extraYearlyRanges,
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
