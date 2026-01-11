import type { DownPaymentType } from './mortgage';

export type MortgageInputsRaw = {
  homePriceRaw: string;
  downPaymentType: DownPaymentType;
  downPaymentRaw: string;
  loanTermYearsRaw: string;
  interestRateRaw: string;

  startMonthIndex0: number;
  startYearRaw: string;

  includeTaxesCosts: boolean;
  propertyTaxAnnualRaw: string;
  homeInsuranceAnnualRaw: string;
  pmiMonthlyRaw: string;
  hoaMonthlyRaw: string;
  otherCostsMonthlyRaw: string;

  extraMonthlyRaw: string;
  extraYearlyRaw: string;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYearRaw: string;

  extraOneTimeRaw: string;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYearRaw: string;
};
