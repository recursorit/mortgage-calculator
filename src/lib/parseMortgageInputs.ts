import type {
  ExtraMonthlyRange,
  ExtraYearlyRange,
  MortgageInputs,
} from './mortgage';
import type {
  ExtraMonthlyRangeRaw,
  ExtraYearlyRangeRaw,
  MortgageInputsRaw,
} from './mortgageInputsRaw';

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

function monthYearToIndex(monthIndex0: number, year: number): number {
  return year * 12 + monthIndex0;
}

function validateNonOverlapping(intervals: Array<{ start: number; end: number }>): boolean {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  let prevEnd = -Infinity;
  for (const it of sorted) {
    if (it.start <= prevEnd) return false;
    prevEnd = Math.max(prevEnd, it.end);
  }
  return true;
}

function parseMonthlyRanges(
  rawRanges: ExtraMonthlyRangeRaw[] | undefined,
  defaultStartMonthIndex0: number,
  defaultStartYear: number,
): { ranges: ExtraMonthlyRange[]; valid: boolean } {
  const input = Array.isArray(rawRanges) ? rawRanges : [];
  const ranges: ExtraMonthlyRange[] = [];
  const intervals: Array<{ start: number; end: number }> = [];

  let valid = true;
  for (const r of input) {
    const amount = numberFromInput(r.amountRaw);
    const startYear = clampInt(
      (() => {
        const parsed = numberFromInput(r.startYearRaw);
        return parsed > 0 ? parsed : defaultStartYear;
      })(),
      1900,
      3000,
    );

    const startMonthIndex0 = clampInt(
      Number.isFinite(r.startMonthIndex0) ? r.startMonthIndex0 : defaultStartMonthIndex0,
      0,
      11,
    );

    const startIndex = monthYearToIndex(startMonthIndex0, startYear);

    let endIndex = Infinity;
    if (r.endEnabled) {
      const endYear = clampInt(
        (() => {
          const parsed = numberFromInput(r.endYearRaw);
          return parsed > 0 ? parsed : startYear;
        })(),
        1900,
        3000,
      );
      const endMonthIndex0 = clampInt(
        Number.isFinite(r.endMonthIndex0) ? r.endMonthIndex0 : startMonthIndex0,
        0,
        11,
      );
      endIndex = monthYearToIndex(endMonthIndex0, endYear);
      if (endIndex < startIndex) valid = false;
    }

    ranges.push({ amount, startIndex, endIndex });
    intervals.push({ start: startIndex, end: endIndex });
  }

  if (!validateNonOverlapping(intervals)) valid = false;
  return { ranges, valid };
}

function parseYearlyRanges(
  rawRanges: ExtraYearlyRangeRaw[] | undefined,
  defaultStartMonthIndex0: number,
  defaultStartYear: number,
): { ranges: ExtraYearlyRange[]; valid: boolean } {
  const input = Array.isArray(rawRanges) ? rawRanges : [];
  const ranges: ExtraYearlyRange[] = [];
  const intervals: Array<{ start: number; end: number }> = [];

  let valid = true;
  for (const r of input) {
    const amount = numberFromInput(r.amountRaw);
    const startYear = clampInt(
      (() => {
        const parsed = numberFromInput(r.startYearRaw);
        return parsed > 0 ? parsed : defaultStartYear;
      })(),
      1900,
      3000,
    );

    const startMonthIndex0 = clampInt(
      Number.isFinite(r.startMonthIndex0) ? r.startMonthIndex0 : defaultStartMonthIndex0,
      0,
      11,
    );
    const startIndex = monthYearToIndex(startMonthIndex0, startYear);

    let endIndex = Infinity;
    if (r.endEnabled) {
      const endYear = clampInt(
        (() => {
          const parsed = numberFromInput(r.endYearRaw);
          return parsed > 0 ? parsed : startYear;
        })(),
        1900,
        3000,
      );
      const endMonthIndex0 = clampInt(
        Number.isFinite(r.endMonthIndex0) ? r.endMonthIndex0 : startMonthIndex0,
        0,
        11,
      );
      endIndex = monthYearToIndex(endMonthIndex0, endYear);
      if (endIndex < startIndex) valid = false;
    }

    const paymentMonthIndex0 = clampInt(
      Number.isFinite(r.paymentMonthIndex0) ? r.paymentMonthIndex0 : 0,
      0,
      11,
    );

    ranges.push({ amount, paymentMonthIndex0, startIndex, endIndex });
    intervals.push({ start: startIndex, end: endIndex });
  }

  if (!validateNonOverlapping(intervals)) valid = false;
  return { ranges, valid };
}

export function parseMortgageInputs(raw: MortgageInputsRaw): MortgageInputs {
  const startYear = clampInt(
    (() => {
      const parsed = numberFromInput(raw.startYearRaw);
      return parsed > 0 ? parsed : currentYear;
    })(),
    1900,
    3000,
  );

  const extraMonthlyStartMonthIndex0 =
    raw.extraMonthlyStartMonthIndex0 ?? raw.startMonthIndex0;

  const extraMonthlyStartYear = clampInt(
    (() => {
      const parsed = numberFromInput(raw.extraMonthlyStartYearRaw ?? '');
      return parsed > 0 ? parsed : startYear;
    })(),
    1900,
    3000,
  );

  const monthlyRangesParsed = parseMonthlyRanges(
    raw.extraMonthlyRanges,
    raw.startMonthIndex0,
    startYear,
  );
  const yearlyRangesParsed = parseYearlyRanges(
    raw.extraYearlyRanges,
    raw.startMonthIndex0,
    startYear,
  );

  const rangeModeEnabled =
    Array.isArray(raw.extraMonthlyRanges) || Array.isArray(raw.extraYearlyRanges);

  const hasAnyRanges =
    (raw.extraMonthlyRanges?.length ?? 0) > 0 ||
    (raw.extraYearlyRanges?.length ?? 0) > 0;
  const extraRangesValid =
    !hasAnyRanges || (monthlyRangesParsed.valid && yearlyRangesParsed.valid);

  // Range UI replaced legacy monthly/yearly extra fields.
  // If range arrays are present (even empty), ignore legacy fields to avoid "invisible" extras.
  const finalMonthlyExtra = rangeModeEnabled ? 0 : numberFromInput(raw.extraMonthlyRaw);
  const finalYearlyExtra = rangeModeEnabled ? 0 : numberFromInput(raw.extraYearlyRaw);

  return {
    homePrice: numberFromInput(raw.homePriceRaw),
    downPaymentType: raw.downPaymentType,
    downPaymentValue: numberFromInput(raw.downPaymentRaw),
    loanTermYears: numberFromInput(raw.loanTermYearsRaw),
    interestRateAnnualPercent: numberFromInput(raw.interestRateRaw),

    startMonthIndex0: raw.startMonthIndex0,
    startYear,

    includeTaxesCosts: raw.includeTaxesCosts,
    propertyTaxAnnual: numberFromInput(raw.propertyTaxAnnualRaw),
    homeInsuranceAnnual: numberFromInput(raw.homeInsuranceAnnualRaw),
    pmiMonthly: numberFromInput(raw.pmiMonthlyRaw),
    hoaMonthly: numberFromInput(raw.hoaMonthlyRaw),
    otherCostsMonthly: numberFromInput(raw.otherCostsMonthlyRaw),

    extraMonthly: finalMonthlyExtra,
    extraMonthlyStartMonthIndex0,
    extraMonthlyStartYear,
    extraMonthlyRanges: extraRangesValid ? monthlyRangesParsed.ranges : [],

    extraYearly: finalYearlyExtra,
    extraYearlyMonthIndex0: raw.extraYearlyMonthIndex0,
    extraYearlyStartYear: clampInt(
      (() => {
        const parsed = numberFromInput(raw.extraYearlyStartYearRaw);
        return parsed > 0 ? parsed : currentYear + 1;
      })(),
      1900,
      3000,
    ),

    extraYearlyRanges: extraRangesValid ? yearlyRangesParsed.ranges : [],

    extraRangesValid,

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
