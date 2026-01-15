import { create } from 'zustand';
import {
  persist,
  type PersistOptions,
  type PersistStorage,
  type StorageValue,
} from 'zustand/middleware';

import type { DownPaymentType } from '../lib/mortgage';
import type {
  ArmPresetRaw,
  ArmRateChangeRaw,
  ExtraMonthlyRangeRaw,
  ExtraYearlyRangeRaw,
  InterestTypeRaw,
  MortgageInputsRaw,
} from '../lib/mortgageInputsRaw';

type Theme = 'light' | 'dark';

export type MortgageFormState = {
  theme: Theme;

  scenarios: Scenario[];
  activeScenarioId: string | null;
  scenarioDraftName: string;

  homePriceRaw: string;
  downPaymentType: DownPaymentType;
  downPaymentRaw: string;
  loanTermYearsRaw: string;
  interestRateRaw: string;

  interestType: InterestTypeRaw;
  armPreset: ArmPresetRaw;
  armRateChanges: ArmRateChangeRaw[];
  armAdvancedMode: boolean;

  startMonthIndex0: number;
  startYearRaw: string;

  includeTaxesCosts: boolean;
  propertyTaxAnnualRaw: string;
  homeInsuranceAnnualRaw: string;
  pmiMonthlyRaw: string;
  hoaMonthlyRaw: string;
  otherCostsMonthlyRaw: string;

  extraMonthlyRaw: string;
  extraMonthlyStartMonthIndex0: number;
  extraMonthlyStartYearRaw: string;
  extraMonthlyRanges: ExtraMonthlyRangeRaw[];

  extraYearlyRaw: string;
  extraYearlyMonthIndex0: number;
  extraYearlyStartYearRaw: string;
  extraYearlyRanges: ExtraYearlyRangeRaw[];

  extraOneTimeRaw: string;
  extraOneTimeMonthIndex0: number;
  extraOneTimeYearRaw: string;

  scheduleJumpYear: number;

  extraRangeValidationMessage: string;
  armRateValidationMessage: string;
};

export type Scenario = {
  id: string;
  name: string;
  createdAtIso: string;
  inputs: MortgageInputsRaw;
};

export type MortgageFormActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  setHomePriceRaw: (value: string) => void;
  setDownPaymentType: (value: DownPaymentType) => void;
  setDownPaymentRaw: (value: string) => void;
  setLoanTermYearsRaw: (value: string) => void;
  setInterestRateRaw: (value: string) => void;

  setInterestType: (value: InterestTypeRaw) => void;
  setArmPreset: (value: ArmPresetRaw) => void;
  addArmRateChange: () => void;
  updateArmRateChange: (
    id: string,
    patch: Partial<Omit<ArmRateChangeRaw, 'id'>>,
  ) => void;
  removeArmRateChange: (id: string) => void;
  setArmAdvancedMode: (value: boolean) => void;

  setStartMonthIndex0: (value: number) => void;
  setStartYearRaw: (value: string) => void;

  setIncludeTaxesCosts: (value: boolean) => void;
  setPropertyTaxAnnualRaw: (value: string) => void;
  setHomeInsuranceAnnualRaw: (value: string) => void;
  setPmiMonthlyRaw: (value: string) => void;
  setHoaMonthlyRaw: (value: string) => void;
  setOtherCostsMonthlyRaw: (value: string) => void;

  setExtraMonthlyRaw: (value: string) => void;
  setExtraMonthlyStartMonthIndex0: (value: number) => void;
  setExtraMonthlyStartYearRaw: (value: string) => void;
  addExtraMonthlyRange: () => void;
  updateExtraMonthlyRange: (
    id: string,
    patch: Partial<Omit<ExtraMonthlyRangeRaw, 'id'>>,
  ) => void;
  removeExtraMonthlyRange: (id: string) => void;

  setExtraYearlyRaw: (value: string) => void;
  setExtraYearlyMonthIndex0: (value: number) => void;
  setExtraYearlyStartYearRaw: (value: string) => void;
  addExtraYearlyRange: () => void;
  updateExtraYearlyRange: (
    id: string,
    patch: Partial<Omit<ExtraYearlyRangeRaw, 'id'>>,
  ) => void;
  removeExtraYearlyRange: (id: string) => void;

  setExtraOneTimeRaw: (value: string) => void;
  setExtraOneTimeMonthIndex0: (value: number) => void;
  setExtraOneTimeYearRaw: (value: string) => void;

  setScheduleJumpYear: (value: number) => void;

  saveScenario: (name: string) => void;
  setScenarioDraftName: (name: string) => void;
  deleteScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  applyScenario: (id: string) => void;
  setScenarios: (scenarios: Scenario[]) => void;

  resetToDefaults: () => void;
  clearPersisted: () => void;
};

export type MortgageStore = MortgageFormState & MortgageFormActions;

const STORE_KEY = 'mortgageCalculator:store:v1';

const LEGACY_FORM_KEY = 'mortgageCalculator:form:v1';
const LEGACY_THEME_KEY = 'mortgageCalculator:theme:v1';

function getCurrentYear(): number {
  return new Date().getFullYear();
}

const ZERO_TO_EMPTY_STRING_KEYS = [
  'homePriceRaw',
  'downPaymentRaw',
  'loanTermYearsRaw',
  'interestRateRaw',
  'propertyTaxAnnualRaw',
  'homeInsuranceAnnualRaw',
  'pmiMonthlyRaw',
  'hoaMonthlyRaw',
  'otherCostsMonthlyRaw',
  'extraMonthlyRaw',
  'extraYearlyRaw',
  'extraOneTimeRaw',
] as const;

function migrateZeroStringsToEmpty(
  state: MortgageFormState,
): MortgageFormState {
  const next: MortgageFormState = { ...state };
  for (const key of ZERO_TO_EMPTY_STRING_KEYS) {
    if (next[key] === '0') next[key] = '';
  }
  return next;
}

export function getDefaultMortgageFormState(): MortgageFormState {
  const currentYear = getCurrentYear();
  return {
    theme: 'light',

    scenarios: [],
    activeScenarioId: null,
    scenarioDraftName: '',

    homePriceRaw: '',
    downPaymentType: 'percent',
    downPaymentRaw: '',
    loanTermYearsRaw: '',
    interestRateRaw: '',

    interestType: 'fixed',
    armPreset: '5/1',
    armRateChanges: [],
    armAdvancedMode: false,

    startMonthIndex0: 0,
    startYearRaw: String(currentYear),

    includeTaxesCosts: false,
    propertyTaxAnnualRaw: '',
    homeInsuranceAnnualRaw: '',
    pmiMonthlyRaw: '',
    hoaMonthlyRaw: '',
    otherCostsMonthlyRaw: '',

    extraMonthlyRaw: '',
    extraMonthlyStartMonthIndex0: 0,
    extraMonthlyStartYearRaw: String(currentYear),
    extraMonthlyRanges: [],

    extraYearlyRaw: '',
    extraYearlyMonthIndex0: 0,
    extraYearlyStartYearRaw: String(currentYear + 1),
    extraYearlyRanges: [],

    extraOneTimeRaw: '',
    extraOneTimeMonthIndex0: 0,
    extraOneTimeYearRaw: String(currentYear),

    scheduleJumpYear: 1,

    extraRangeValidationMessage: '',
    armRateValidationMessage: '',
  };
}

function createId(): string {
  // Prefer crypto.randomUUID when available.
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeScenarioName(name: string): string {
  return name.trim().toLowerCase();
}

function monthYearToSerial(monthIndex0: number, year: number): number {
  return year * 12 + monthIndex0;
}

function serialToMonthYear(serial: number): { monthIndex0: number; year: number } {
  const year = Math.floor(serial / 12);
  const monthIndex0 = serial - year * 12;
  return { monthIndex0, year };
}

function parseYearRaw(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function validateArmRateChanges(
  loanStartMonthIndex0: number,
  loanStartYearRaw: string,
  changes: ArmRateChangeRaw[],
): string {
  if (!Array.isArray(changes) || changes.length === 0) return '';

  const startYear = parseYearRaw(loanStartYearRaw);
  if (startYear === null) return 'Enter a valid loan start year.';
  const startSerial = monthYearToSerial(loanStartMonthIndex0, startYear);

  const serials: number[] = [];
  for (const ch of changes) {
    const y = parseYearRaw(ch.effectiveYearRaw);
    if (y === null) return 'ARM changes must have a valid year.';
    const m = Number.isFinite(ch.effectiveMonthIndex0)
      ? Math.min(11, Math.max(0, Math.trunc(ch.effectiveMonthIndex0)))
      : loanStartMonthIndex0;
    const serial = monthYearToSerial(m, y);
    if (serial < startSerial) return 'ARM change dates must be on/after the loan start.';
    serials.push(serial);
  }

  const sorted = [...serials].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] <= sorted[i - 1]) {
      return 'ARM change dates must be unique and in increasing order.';
    }
  }
  return '';
}

function validateNonOverlappingIntervals(
  intervals: Array<{ start: number; end: number }>,
): boolean {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  let prevEnd = -Infinity;
  for (const it of sorted) {
    if (it.start <= prevEnd) return false;
    prevEnd = Math.max(prevEnd, it.end);
  }
  return true;
}

function validateMonthlyRanges(ranges: ExtraMonthlyRangeRaw[]): string {
  const intervals: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const startYear = parseYearRaw(r.startYearRaw);
    if (startYear === null) continue;
    const start = monthYearToSerial(r.startMonthIndex0, startYear);

    let end = Infinity;
    if (r.endEnabled) {
      const endYear = parseYearRaw(r.endYearRaw);
      if (endYear === null) continue;
      end = monthYearToSerial(r.endMonthIndex0, endYear);
      if (end < start) return 'Monthly end date must be after start date.';
    }
    intervals.push({ start, end });
  }

  if (!validateNonOverlappingIntervals(intervals)) {
    return 'Monthly ranges cannot overlap.';
  }
  return '';
}

function validateYearlyRanges(ranges: ExtraYearlyRangeRaw[]): string {
  const intervals: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const startYear = parseYearRaw(r.startYearRaw);
    if (startYear === null) continue;
    const start = monthYearToSerial(r.startMonthIndex0, startYear);

    let end = Infinity;
    if (r.endEnabled) {
      const endYear = parseYearRaw(r.endYearRaw);
      if (endYear === null) continue;
      end = monthYearToSerial(r.endMonthIndex0, endYear);
      if (end < start) return 'Yearly end date must be after start date.';
    }
    intervals.push({ start, end });
  }

  if (!validateNonOverlappingIntervals(intervals)) {
    return 'Yearly ranges cannot overlap.';
  }
  return '';
}

function validateAllRanges(
  monthly: ExtraMonthlyRangeRaw[],
  yearly: ExtraYearlyRangeRaw[],
): string {
  return validateMonthlyRanges(monthly) || validateYearlyRanges(yearly);
}

function migrateLegacyInputsToRanges(inputs: MortgageInputsRaw): MortgageInputsRaw {
  const monthlyStartMonthIndex0 =
    inputs.extraMonthlyStartMonthIndex0 ?? inputs.startMonthIndex0;
  const monthlyStartYearRaw = inputs.extraMonthlyStartYearRaw ?? inputs.startYearRaw;

  const existingMonthly = Array.isArray(inputs.extraMonthlyRanges)
    ? (inputs.extraMonthlyRanges as ExtraMonthlyRangeRaw[])
    : [];
  const existingYearly = Array.isArray(inputs.extraYearlyRanges)
    ? (inputs.extraYearlyRanges as ExtraYearlyRangeRaw[])
    : [];

  const nextMonthly = [...existingMonthly];
  const nextYearly = [...existingYearly];

  const monthlyAmount = Number(inputs.extraMonthlyRaw || '0');
  if (!existingMonthly.length && Number.isFinite(monthlyAmount) && monthlyAmount > 0) {
    nextMonthly.push({
      id: createId(),
      amountRaw: inputs.extraMonthlyRaw,
      startMonthIndex0: monthlyStartMonthIndex0,
      startYearRaw: monthlyStartYearRaw,
      endEnabled: false,
      endMonthIndex0: monthlyStartMonthIndex0,
      endYearRaw: '',
    });
  }

  const yearlyAmount = Number(inputs.extraYearlyRaw || '0');
  if (!existingYearly.length && Number.isFinite(yearlyAmount) && yearlyAmount > 0) {
    nextYearly.push({
      id: createId(),
      amountRaw: inputs.extraYearlyRaw,
      paymentMonthIndex0: inputs.extraYearlyMonthIndex0,
      startMonthIndex0: inputs.extraYearlyMonthIndex0,
      startYearRaw: inputs.extraYearlyStartYearRaw,
      endEnabled: false,
      endMonthIndex0: inputs.extraYearlyMonthIndex0,
      endYearRaw: '',
    });
  }

  return {
    ...inputs,
    extraMonthlyRanges: nextMonthly,
    extraYearlyRanges: nextYearly,
  };
}

function pickInputsRaw(state: MortgageFormState): MortgageInputsRaw {
  return {
    homePriceRaw: state.homePriceRaw,
    downPaymentType: state.downPaymentType,
    downPaymentRaw: state.downPaymentRaw,
    loanTermYearsRaw: state.loanTermYearsRaw,
    interestRateRaw: state.interestRateRaw,

    interestType: state.interestType,
    armPreset: state.armPreset,
    armRateChanges: state.armRateChanges,
    armAdvancedMode: state.armAdvancedMode,

    startMonthIndex0: state.startMonthIndex0,
    startYearRaw: state.startYearRaw,

    includeTaxesCosts: state.includeTaxesCosts,
    propertyTaxAnnualRaw: state.propertyTaxAnnualRaw,
    homeInsuranceAnnualRaw: state.homeInsuranceAnnualRaw,
    pmiMonthlyRaw: state.pmiMonthlyRaw,
    hoaMonthlyRaw: state.hoaMonthlyRaw,
    otherCostsMonthlyRaw: state.otherCostsMonthlyRaw,

    extraMonthlyRaw: state.extraMonthlyRaw,
    extraMonthlyStartMonthIndex0: state.extraMonthlyStartMonthIndex0,
    extraMonthlyStartYearRaw: state.extraMonthlyStartYearRaw,
    extraMonthlyRanges: state.extraMonthlyRanges,

    extraYearlyRaw: state.extraYearlyRaw,
    extraYearlyMonthIndex0: state.extraYearlyMonthIndex0,
    extraYearlyStartYearRaw: state.extraYearlyStartYearRaw,
    extraYearlyRanges: state.extraYearlyRanges,

    extraOneTimeRaw: state.extraOneTimeRaw,
    extraOneTimeMonthIndex0: state.extraOneTimeMonthIndex0,
    extraOneTimeYearRaw: state.extraOneTimeYearRaw,
  };
}

function applyInputsRaw(set: (partial: Partial<MortgageFormState>) => void, raw: MortgageInputsRaw) {
  const extraMonthlyStartMonthIndex0 =
    raw.extraMonthlyStartMonthIndex0 ?? raw.startMonthIndex0;
  const extraMonthlyStartYearRaw =
    raw.extraMonthlyStartYearRaw ?? raw.startYearRaw;

  set({
    homePriceRaw: raw.homePriceRaw,
    downPaymentType: raw.downPaymentType,
    downPaymentRaw: raw.downPaymentRaw,
    loanTermYearsRaw: raw.loanTermYearsRaw,
    interestRateRaw: raw.interestRateRaw,

    interestType: raw.interestType === 'arm' ? 'arm' : 'fixed',
    armPreset: raw.armPreset ?? '5/1',
    armRateChanges: Array.isArray(raw.armRateChanges)
      ? (raw.armRateChanges as ArmRateChangeRaw[])
      : [],
    armAdvancedMode: Boolean(raw.armAdvancedMode),

    startMonthIndex0: raw.startMonthIndex0,
    startYearRaw: raw.startYearRaw,

    includeTaxesCosts: raw.includeTaxesCosts,
    propertyTaxAnnualRaw: raw.propertyTaxAnnualRaw,
    homeInsuranceAnnualRaw: raw.homeInsuranceAnnualRaw,
    pmiMonthlyRaw: raw.pmiMonthlyRaw,
    hoaMonthlyRaw: raw.hoaMonthlyRaw,
    otherCostsMonthlyRaw: raw.otherCostsMonthlyRaw,

    extraMonthlyRaw: raw.extraMonthlyRaw,
    extraMonthlyStartMonthIndex0,
    extraMonthlyStartYearRaw,
    extraMonthlyRanges: Array.isArray(raw.extraMonthlyRanges)
      ? (raw.extraMonthlyRanges as ExtraMonthlyRangeRaw[])
      : [],

    extraYearlyRaw: raw.extraYearlyRaw,
    extraYearlyMonthIndex0: raw.extraYearlyMonthIndex0,
    extraYearlyStartYearRaw: raw.extraYearlyStartYearRaw,
    extraYearlyRanges: Array.isArray(raw.extraYearlyRanges)
      ? (raw.extraYearlyRanges as ExtraYearlyRangeRaw[])
      : [],

    extraOneTimeRaw: raw.extraOneTimeRaw,
    extraOneTimeMonthIndex0: raw.extraOneTimeMonthIndex0,
    extraOneTimeYearRaw: raw.extraOneTimeYearRaw,

    extraRangeValidationMessage: '',
    armRateValidationMessage: '',
  });
}

function createDebouncedLocalStorage(delayMs: number): Storage {
  const timeouts = new Map<string, number>();

  const scheduleWrite = (key: string, write: () => void) => {
    const existing = timeouts.get(key);
    if (existing !== undefined) window.clearTimeout(existing);
    const handle = window.setTimeout(() => {
      write();
      timeouts.delete(key);
    }, delayMs);
    timeouts.set(key, handle);
  };

  return {
    get length() {
      return window.localStorage.length;
    },
    clear() {
      window.localStorage.clear();
    },
    getItem(key: string) {
      return window.localStorage.getItem(key);
    },
    key(index: number) {
      return window.localStorage.key(index);
    },
    removeItem(key: string) {
      const existing = timeouts.get(key);
      if (existing !== undefined) {
        window.clearTimeout(existing);
        timeouts.delete(key);
      }
      window.localStorage.removeItem(key);
    },
    setItem(key: string, value: string) {
      scheduleWrite(key, () => window.localStorage.setItem(key, value));
    },
  };
}

let debouncedLocalStorage: Storage | null = null;
function getDebouncedLocalStorage(): Storage {
  if (debouncedLocalStorage) return debouncedLocalStorage;
  debouncedLocalStorage = createDebouncedLocalStorage(250);
  return debouncedLocalStorage;
}

function applyThemeToDom(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function tryMigrateLegacyStorage(): StorageValue<MortgageFormState> | null {
  try {
    const legacyFormRaw = window.localStorage.getItem(LEGACY_FORM_KEY);
    const legacyThemeRaw = window.localStorage.getItem(LEGACY_THEME_KEY);
    if (!legacyFormRaw && !legacyThemeRaw) return null;

    const defaults = getDefaultMortgageFormState();

    const legacyForm = legacyFormRaw
      ? (JSON.parse(legacyFormRaw) as Partial<MortgageFormState>)
      : null;

    const legacyTheme: Theme | null =
      legacyThemeRaw === 'dark' ? 'dark' : legacyThemeRaw === 'light' ? 'light' : null;

    const migrated: MortgageFormState = {
      ...defaults,
      ...(legacyForm ?? {}),
      theme: legacyTheme ?? (legacyForm?.theme ?? defaults.theme),
    };

    return { state: migrated, version: 0 };
  } catch {
    return null;
  }
}

const persistedStorage: PersistStorage<MortgageFormState> = {
  getItem: (name) => {
    try {
      if (typeof window === 'undefined') return null;
      const existingRaw = window.localStorage.getItem(name);
      if (existingRaw) {
        return JSON.parse(existingRaw) as StorageValue<MortgageFormState>;
      }

      if (name !== STORE_KEY) return null;
      return tryMigrateLegacyStorage();
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window === 'undefined') return;
      getDebouncedLocalStorage().setItem(name, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useMortgageStore = create<MortgageStore>()(
  persist(
    (set, get) => ({
      ...getDefaultMortgageFormState(),

      setTheme: (theme) => {
        set({ theme });
        applyThemeToDom(theme);
      },
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyThemeToDom(next);
      },

      setHomePriceRaw: (value) => set({ homePriceRaw: value }),
      setDownPaymentType: (value) => set({ downPaymentType: value }),
      setDownPaymentRaw: (value) => set({ downPaymentRaw: value }),
      setLoanTermYearsRaw: (value) => set({ loanTermYearsRaw: value }),
      setInterestRateRaw: (value) => set({ interestRateRaw: value }),

      setInterestType: (value) => {
        const next: InterestTypeRaw = value === 'arm' ? 'arm' : 'fixed';
        set({
          interestType: next,
          armRateValidationMessage:
            next === 'arm'
              ? validateArmRateChanges(
                  get().startMonthIndex0,
                  get().startYearRaw,
                  get().armRateChanges,
                )
              : '',
        });
      },

      setArmPreset: (value) => {
        const preset: ArmPresetRaw =
          value === '5/1' || value === '7/6' || value === '5/6' || value === 'custom'
            ? value
            : '5/1';

        const state = get();
        if (preset === 'custom') {
          set({ armPreset: preset });
          return;
        }

        const startYear = parseYearRaw(state.startYearRaw) ?? getCurrentYear();
        const startSerial = monthYearToSerial(state.startMonthIndex0, startYear);
        const firstChangeMonths = preset === '7/6' ? 84 : 60;
        const firstSerial = startSerial + firstChangeMonths;
        const { monthIndex0, year } = serialToMonthYear(firstSerial);
        const seeded: ArmRateChangeRaw[] = [
          {
            id: createId(),
            effectiveMonthIndex0: monthIndex0,
            effectiveYearRaw: String(year),
            rateAnnualPercentRaw: '',
          },
        ];

        set({
          armPreset: preset,
          armRateChanges: seeded,
          armRateValidationMessage: validateArmRateChanges(
            state.startMonthIndex0,
            state.startYearRaw,
            seeded,
          ),
        });
      },

      addArmRateChange: () => {
        const state = get();
        const startYear = parseYearRaw(state.startYearRaw);
        if (startYear === null) {
          set({ armRateValidationMessage: 'Enter a valid loan start year first.' });
          return;
        }

        const stepMonths =
          state.armPreset === '5/6' || state.armPreset === '7/6' ? 6 : 12;

        const startSerial = monthYearToSerial(state.startMonthIndex0, startYear);

        const existingSerials = state.armRateChanges
          .map((c) => {
            const y = parseYearRaw(c.effectiveYearRaw);
            if (y === null) return null;
            return monthYearToSerial(c.effectiveMonthIndex0, y);
          })
          .filter((x): x is number => x !== null)
          .sort((a, b) => a - b);

        const fixedMonths = state.armPreset === '7/6' ? 84 : state.armPreset === '5/1' || state.armPreset === '5/6' ? 60 : 12;
        const baseSerial = existingSerials.length
          ? existingSerials[existingSerials.length - 1] + stepMonths
          : startSerial + fixedMonths;

        const { monthIndex0, year } = serialToMonthYear(baseSerial);
        const next: ArmRateChangeRaw = {
          id: createId(),
          effectiveMonthIndex0: monthIndex0,
          effectiveYearRaw: String(year),
          rateAnnualPercentRaw: '',
        };

        const nextChanges = [...state.armRateChanges, next];
        set({
          armRateChanges: nextChanges,
          armRateValidationMessage: validateArmRateChanges(
            state.startMonthIndex0,
            state.startYearRaw,
            nextChanges,
          ),
        });
      },

      updateArmRateChange: (id, patch) => {
        const state = get();
        const nextChanges = state.armRateChanges.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        );
        set({
          armRateChanges: nextChanges,
          armRateValidationMessage: validateArmRateChanges(
            state.startMonthIndex0,
            state.startYearRaw,
            nextChanges,
          ),
        });
      },

      removeArmRateChange: (id) => {
        const state = get();
        const nextChanges = state.armRateChanges.filter((c) => c.id !== id);
        set({
          armRateChanges: nextChanges,
          armRateValidationMessage: validateArmRateChanges(
            state.startMonthIndex0,
            state.startYearRaw,
            nextChanges,
          ),
        });
      },

      setArmAdvancedMode: (value) => set({ armAdvancedMode: value }),

      setStartMonthIndex0: (value) => {
        const state = get();
        set({
          startMonthIndex0: value,
          armRateValidationMessage:
            state.interestType === 'arm'
              ? validateArmRateChanges(value, state.startYearRaw, state.armRateChanges)
              : state.armRateValidationMessage,
        });
      },
      setStartYearRaw: (value) => {
        const state = get();
        set({
          startYearRaw: value,
          armRateValidationMessage:
            state.interestType === 'arm'
              ? validateArmRateChanges(state.startMonthIndex0, value, state.armRateChanges)
              : state.armRateValidationMessage,
        });
      },

      setIncludeTaxesCosts: (value) => set({ includeTaxesCosts: value }),
      setPropertyTaxAnnualRaw: (value) => set({ propertyTaxAnnualRaw: value }),
      setHomeInsuranceAnnualRaw: (value) =>
        set({ homeInsuranceAnnualRaw: value }),
      setPmiMonthlyRaw: (value) => set({ pmiMonthlyRaw: value }),
      setHoaMonthlyRaw: (value) => set({ hoaMonthlyRaw: value }),
      setOtherCostsMonthlyRaw: (value) => set({ otherCostsMonthlyRaw: value }),

      setExtraMonthlyRaw: (value) => set({ extraMonthlyRaw: value }),
      setExtraMonthlyStartMonthIndex0: (value) =>
        set({ extraMonthlyStartMonthIndex0: value }),
      setExtraMonthlyStartYearRaw: (value) =>
        set({ extraMonthlyStartYearRaw: value }),

      addExtraMonthlyRange: () => {
        const state = get();
        if (state.extraMonthlyRanges.some((r) => !r.endEnabled)) {
          set({
            extraRangeValidationMessage:
              'Monthly ranges cannot overlap. Set an end date before adding another monthly range.',
          });
          return;
        }
        const loanStartYear = parseYearRaw(state.startYearRaw) ?? getCurrentYear();
        const loanStartSerial = monthYearToSerial(state.startMonthIndex0, loanStartYear);

        const lastEndSerial = state.extraMonthlyRanges
          .map((r) => {
            const sy = parseYearRaw(r.startYearRaw);
            if (sy === null) return null;
            const start = monthYearToSerial(r.startMonthIndex0, sy);
            if (!r.endEnabled) return Infinity;
            const ey = parseYearRaw(r.endYearRaw);
            if (ey === null) return null;
            const end = monthYearToSerial(r.endMonthIndex0, ey);
            return Math.max(start, end);
          })
          .filter((x): x is number => x !== null)
          .reduce((acc, x) => Math.max(acc, x), -Infinity);

        const nextStartSerial =
          lastEndSerial === -Infinity || lastEndSerial === Infinity
            ? loanStartSerial
            : Math.max(loanStartSerial, lastEndSerial + 1);

        const { monthIndex0, year } = serialToMonthYear(nextStartSerial);
        const newRange: ExtraMonthlyRangeRaw = {
          id: createId(),
          amountRaw: '',
          startMonthIndex0: monthIndex0,
          startYearRaw: String(year),
          endEnabled: false,
          endMonthIndex0: monthIndex0,
          endYearRaw: '',
        };

        const nextRanges = [...state.extraMonthlyRanges, newRange];
        set({
          extraMonthlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            nextRanges,
            state.extraYearlyRanges,
          ),
        });
      },

      updateExtraMonthlyRange: (id, patch) => {
        const state = get();
        const nextRanges = state.extraMonthlyRanges.map((r) =>
          r.id === id ? { ...r, ...patch } : r,
        );
        set({
          extraMonthlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            nextRanges,
            state.extraYearlyRanges,
          ),
        });
      },

      removeExtraMonthlyRange: (id) => {
        const state = get();
        const nextRanges = state.extraMonthlyRanges.filter((r) => r.id !== id);
        set({
          extraMonthlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            nextRanges,
            state.extraYearlyRanges,
          ),
        });
      },

      setExtraYearlyRaw: (value) => set({ extraYearlyRaw: value }),
      setExtraYearlyMonthIndex0: (value) =>
        set({ extraYearlyMonthIndex0: value }),
      setExtraYearlyStartYearRaw: (value) =>
        set({ extraYearlyStartYearRaw: value }),

      addExtraYearlyRange: () => {
        const state = get();
        if (state.extraYearlyRanges.some((r) => !r.endEnabled)) {
          set({
            extraRangeValidationMessage:
              'Yearly ranges cannot overlap. Set an end date before adding another yearly range.',
          });
          return;
        }
        const loanStartYear = parseYearRaw(state.startYearRaw) ?? getCurrentYear();
        const loanStartSerial = monthYearToSerial(state.startMonthIndex0, loanStartYear);

        const lastEndSerial = state.extraYearlyRanges
          .map((r) => {
            const sy = parseYearRaw(r.startYearRaw);
            if (sy === null) return null;
            const start = monthYearToSerial(r.startMonthIndex0, sy);
            if (!r.endEnabled) return Infinity;
            const ey = parseYearRaw(r.endYearRaw);
            if (ey === null) return null;
            const end = monthYearToSerial(r.endMonthIndex0, ey);
            return Math.max(start, end);
          })
          .filter((x): x is number => x !== null)
          .reduce((acc, x) => Math.max(acc, x), -Infinity);

        const nextStartSerial =
          lastEndSerial === -Infinity || lastEndSerial === Infinity
            ? loanStartSerial
            : Math.max(loanStartSerial, lastEndSerial + 1);

        const { monthIndex0, year } = serialToMonthYear(nextStartSerial);
        const newRange: ExtraYearlyRangeRaw = {
          id: createId(),
          amountRaw: '',
          paymentMonthIndex0: state.extraYearlyMonthIndex0,
          startMonthIndex0: monthIndex0,
          startYearRaw: String(year),
          endEnabled: false,
          endMonthIndex0: monthIndex0,
          endYearRaw: '',
        };

        const nextRanges = [...state.extraYearlyRanges, newRange];
        set({
          extraYearlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            state.extraMonthlyRanges,
            nextRanges,
          ),
        });
      },

      updateExtraYearlyRange: (id, patch) => {
        const state = get();
        const nextRanges = state.extraYearlyRanges.map((r) =>
          r.id === id ? { ...r, ...patch } : r,
        );
        set({
          extraYearlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            state.extraMonthlyRanges,
            nextRanges,
          ),
        });
      },

      removeExtraYearlyRange: (id) => {
        const state = get();
        const nextRanges = state.extraYearlyRanges.filter((r) => r.id !== id);
        set({
          extraYearlyRanges: nextRanges,
          extraRangeValidationMessage: validateAllRanges(
            state.extraMonthlyRanges,
            nextRanges,
          ),
        });
      },

      setExtraOneTimeRaw: (value) => set({ extraOneTimeRaw: value }),
      setExtraOneTimeMonthIndex0: (value) =>
        set({ extraOneTimeMonthIndex0: value }),
      setExtraOneTimeYearRaw: (value) => set({ extraOneTimeYearRaw: value }),

      setScheduleJumpYear: (value) => set({ scheduleJumpYear: value }),

      saveScenario: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const state = get();
        const normalized = normalizeScenarioName(trimmed);
        const existing = state.scenarios.find(
          (s) => normalizeScenarioName(s.name) === normalized,
        );

        if (existing) {
          const updated: Scenario = {
            ...existing,
            name: trimmed,
            inputs: pickInputsRaw(state),
          };
          set({
            scenarios: [
              updated,
              ...state.scenarios.filter((s) => s.id !== existing.id),
            ],
            activeScenarioId: existing.id,
            scenarioDraftName: trimmed,
          });
          return;
        }

        const scenario: Scenario = {
          id: createId(),
          name: trimmed,
          createdAtIso: new Date().toISOString(),
          inputs: pickInputsRaw(state),
        };
        set({
          scenarios: [scenario, ...state.scenarios],
          activeScenarioId: scenario.id,
          scenarioDraftName: trimmed,
        });
      },

      setScenarioDraftName: (name) => {
        set({ scenarioDraftName: name });
      },

      deleteScenario: (id) => {
        const state = get();
        const isActive = state.activeScenarioId === id;
        set({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          activeScenarioId: isActive ? null : state.activeScenarioId,
          scenarioDraftName: isActive ? '' : state.scenarioDraftName,
        });
      },

      renameScenario: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const nextNorm = normalizeScenarioName(trimmed);
        const state = get();
        const collision = state.scenarios.some(
          (s) => s.id !== id && normalizeScenarioName(s.name) === nextNorm,
        );
        if (collision) return;
        set({
          scenarios: get().scenarios.map((s) =>
            s.id === id ? { ...s, name: trimmed } : s,
          ),
        });
      },

      applyScenario: (id) => {
        const scenario = get().scenarios.find((s) => s.id === id);
        if (!scenario) return;
        applyInputsRaw(set, scenario.inputs);
        set({ activeScenarioId: id, scenarioDraftName: scenario.name });
      },

      setScenarios: (scenarios) => {
        set({ scenarios: Array.isArray(scenarios) ? scenarios : [] });
      },

      resetToDefaults: () => {
        const defaults = getDefaultMortgageFormState();
        set({ ...defaults, theme: get().theme });
      },

      clearPersisted: () => {
        useMortgageStore.persist.clearStorage();
      },
    }),
    {
      name: STORE_KEY,
      storage: persistedStorage,
      version: 5,
      migrate: (persisted, version) => {
        const persistedObj: Partial<MortgageFormState> =
          persisted && typeof persisted === 'object'
            ? (persisted as Partial<MortgageFormState>)
            : {};

        // v0: legacy migrate only
        // v1: zero-strings-to-empty
        // v2: add scenarios array
        // v3: add extraMonthly start date fields
        // v4: add extra payment ranges
        // v5: add ARM fields
        const migrateScenarioInputs = (scenario: Scenario): Scenario => {
          const inputs =
            scenario && typeof scenario.inputs === 'object' && scenario.inputs
              ? (scenario.inputs as MortgageInputsRaw)
              : ({} as MortgageInputsRaw);

          const nextInputs: MortgageInputsRaw = {
            ...inputs,
            extraMonthlyStartMonthIndex0:
              inputs.extraMonthlyStartMonthIndex0 ?? inputs.startMonthIndex0,
            extraMonthlyStartYearRaw:
              inputs.extraMonthlyStartYearRaw ?? inputs.startYearRaw,
            interestType: inputs.interestType === 'arm' ? 'arm' : 'fixed',
            armPreset: inputs.armPreset ?? '5/1',
            armRateChanges: Array.isArray(inputs.armRateChanges)
              ? (inputs.armRateChanges as ArmRateChangeRaw[])
              : [],
            armAdvancedMode: Boolean(inputs.armAdvancedMode),
          };

          const ranged = version < 4 ? migrateLegacyInputsToRanges(nextInputs) : nextInputs;
          return { ...scenario, inputs: ranged };
        };

        if (version >= 2) {
          const merged: MortgageFormState = {
            ...getDefaultMortgageFormState(),
            ...persistedObj,
          };
          merged.scenarios = Array.isArray(persistedObj.scenarios)
            ? (persistedObj.scenarios as Scenario[])
            : [];

          if (version < 3) {
            merged.extraMonthlyStartMonthIndex0 = merged.startMonthIndex0;
            merged.extraMonthlyStartYearRaw = merged.startYearRaw;
          }

          if (version < 4) {
            merged.scenarios = merged.scenarios.map(migrateScenarioInputs);
            const ranged = migrateLegacyInputsToRanges(pickInputsRaw(merged));
            merged.extraMonthlyRanges = Array.isArray(ranged.extraMonthlyRanges)
              ? (ranged.extraMonthlyRanges as ExtraMonthlyRangeRaw[])
              : [];
            merged.extraYearlyRanges = Array.isArray(ranged.extraYearlyRanges)
              ? (ranged.extraYearlyRanges as ExtraYearlyRangeRaw[])
              : [];
          }

          if (version >= 4 && version < 5) {
            merged.scenarios = merged.scenarios.map(migrateScenarioInputs);
            merged.interestType = merged.interestType === 'arm' ? 'arm' : 'fixed';
            merged.armPreset = merged.armPreset ?? '5/1';
            merged.armRateChanges = Array.isArray(merged.armRateChanges)
              ? (merged.armRateChanges as ArmRateChangeRaw[])
              : [];
            merged.armAdvancedMode = Boolean(merged.armAdvancedMode);
          }

          merged.extraRangeValidationMessage = '';
          merged.armRateValidationMessage = '';

          return merged;
        }

        const merged: MortgageFormState = {
          ...getDefaultMortgageFormState(),
          ...persistedObj,
        };
        const upgraded = migrateZeroStringsToEmpty(merged);
        upgraded.extraMonthlyStartMonthIndex0 = upgraded.startMonthIndex0;
        upgraded.extraMonthlyStartYearRaw = upgraded.startYearRaw;
        const ranged = migrateLegacyInputsToRanges(pickInputsRaw(upgraded));
        upgraded.extraMonthlyRanges = Array.isArray(ranged.extraMonthlyRanges)
          ? (ranged.extraMonthlyRanges as ExtraMonthlyRangeRaw[])
          : [];
        upgraded.extraYearlyRanges = Array.isArray(ranged.extraYearlyRanges)
          ? (ranged.extraYearlyRanges as ExtraYearlyRangeRaw[])
          : [];
        upgraded.extraRangeValidationMessage = '';
        upgraded.armRateValidationMessage = '';
        upgraded.scenarios = [];
        return upgraded;
      },
      partialize: (state) => ({
        theme: state.theme,

        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
        scenarioDraftName: state.scenarioDraftName,

        homePriceRaw: state.homePriceRaw,
        downPaymentType: state.downPaymentType,
        downPaymentRaw: state.downPaymentRaw,
        loanTermYearsRaw: state.loanTermYearsRaw,
        interestRateRaw: state.interestRateRaw,

        interestType: state.interestType,
        armPreset: state.armPreset,
        armRateChanges: state.armRateChanges,
        armAdvancedMode: state.armAdvancedMode,

        startMonthIndex0: state.startMonthIndex0,
        startYearRaw: state.startYearRaw,

        includeTaxesCosts: state.includeTaxesCosts,
        propertyTaxAnnualRaw: state.propertyTaxAnnualRaw,
        homeInsuranceAnnualRaw: state.homeInsuranceAnnualRaw,
        pmiMonthlyRaw: state.pmiMonthlyRaw,
        hoaMonthlyRaw: state.hoaMonthlyRaw,
        otherCostsMonthlyRaw: state.otherCostsMonthlyRaw,

        extraMonthlyRaw: state.extraMonthlyRaw,
        extraMonthlyStartMonthIndex0: state.extraMonthlyStartMonthIndex0,
        extraMonthlyStartYearRaw: state.extraMonthlyStartYearRaw,
        extraMonthlyRanges: state.extraMonthlyRanges,

        extraYearlyRaw: state.extraYearlyRaw,
        extraYearlyMonthIndex0: state.extraYearlyMonthIndex0,
        extraYearlyStartYearRaw: state.extraYearlyStartYearRaw,
        extraYearlyRanges: state.extraYearlyRanges,

        extraOneTimeRaw: state.extraOneTimeRaw,
        extraOneTimeMonthIndex0: state.extraOneTimeMonthIndex0,
        extraOneTimeYearRaw: state.extraOneTimeYearRaw,

        scheduleJumpYear: state.scheduleJumpYear,

        extraRangeValidationMessage: state.extraRangeValidationMessage,
        armRateValidationMessage: state.armRateValidationMessage,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyThemeToDom(state.theme);
      },
    } as PersistOptions<MortgageStore, MortgageFormState>,
  ),
);
