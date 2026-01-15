import type { DownPaymentType } from './mortgage';

export type InterestTypeRaw = 'fixed' | 'arm';

export type ArmPresetRaw = '5/1' | '7/6' | '5/6' | 'custom';

export type ArmRateChangeRaw = {
  id: string;
  effectiveMonthIndex0: number;
  effectiveYearRaw: string;
  rateAnnualPercentRaw: string;
};

export type ExtraMonthlyRangeRaw = {
  id: string;
  amountRaw: string;
  startMonthIndex0: number;
  startYearRaw: string;
  endEnabled: boolean;
  endMonthIndex0: number;
  endYearRaw: string;
};

export type ExtraYearlyRangeRaw = {
  id: string;
  amountRaw: string;
  paymentMonthIndex0: number;
  startMonthIndex0: number;
  startYearRaw: string;
  endEnabled: boolean;
  endMonthIndex0: number;
  endYearRaw: string;
};

export type MortgageInputsRaw = {
  homePriceRaw: string;
  downPaymentType: DownPaymentType;
  downPaymentRaw: string;
  loanTermYearsRaw: string;
  interestRateRaw: string;

  interestType?: InterestTypeRaw;
  armPreset?: ArmPresetRaw;
  armRateChanges?: ArmRateChangeRaw[];
  armAdvancedMode?: boolean;

  startMonthIndex0: number;
  startYearRaw: string;

  includeTaxesCosts: boolean;
  propertyTaxAnnualRaw: string;
  homeInsuranceAnnualRaw: string;
  pmiMonthlyRaw: string;
  hoaMonthlyRaw: string;
  otherCostsMonthlyRaw: string;

  extraMonthlyRaw: string;
  extraMonthlyStartMonthIndex0?: number;
  extraMonthlyStartYearRaw?: string;

  extraMonthlyRanges?: ExtraMonthlyRangeRaw[];

  extraYearlyRaw: string;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYearRaw: string;

  extraYearlyRanges?: ExtraYearlyRangeRaw[];

  extraOneTimeRaw: string;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYearRaw: string;
};
