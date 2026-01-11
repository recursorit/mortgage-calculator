import { create } from 'zustand';
import {
  persist,
  type PersistOptions,
  type PersistStorage,
  type StorageValue,
} from 'zustand/middleware';

import type { DownPaymentType } from '../lib/mortgage';

type Theme = 'light' | 'dark';

export type MortgageFormState = {
  theme: Theme;

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

  scheduleJumpYear: number;
};

export type MortgageFormActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  setHomePriceRaw: (value: string) => void;
  setDownPaymentType: (value: DownPaymentType) => void;
  setDownPaymentRaw: (value: string) => void;
  setLoanTermYearsRaw: (value: string) => void;
  setInterestRateRaw: (value: string) => void;

  setStartMonthIndex0: (value: number) => void;
  setStartYearRaw: (value: string) => void;

  setIncludeTaxesCosts: (value: boolean) => void;
  setPropertyTaxAnnualRaw: (value: string) => void;
  setHomeInsuranceAnnualRaw: (value: string) => void;
  setPmiMonthlyRaw: (value: string) => void;
  setHoaMonthlyRaw: (value: string) => void;
  setOtherCostsMonthlyRaw: (value: string) => void;

  setExtraMonthlyRaw: (value: string) => void;
  setExtraYearlyRaw: (value: string) => void;
  setExtraYearlyMonthIndex0: (value: number) => void;
  setExtraYearlyStartYearRaw: (value: string) => void;

  setExtraOneTimeRaw: (value: string) => void;
  setExtraOneTimeMonthIndex0: (value: number) => void;
  setExtraOneTimeYearRaw: (value: string) => void;

  setScheduleJumpYear: (value: number) => void;

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

    homePriceRaw: '',
    downPaymentType: 'percent',
    downPaymentRaw: '',
    loanTermYearsRaw: '',
    interestRateRaw: '',

    startMonthIndex0: 0,
    startYearRaw: String(currentYear),

    includeTaxesCosts: false,
    propertyTaxAnnualRaw: '',
    homeInsuranceAnnualRaw: '',
    pmiMonthlyRaw: '',
    hoaMonthlyRaw: '',
    otherCostsMonthlyRaw: '',

    extraMonthlyRaw: '',
    extraYearlyRaw: '',
    extraYearlyMonthIndex0: 0,
    extraYearlyStartYearRaw: String(currentYear + 1),

    extraOneTimeRaw: '',
    extraOneTimeMonthIndex0: 0,
    extraOneTimeYearRaw: String(currentYear),

    scheduleJumpYear: 1,
  };
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

      setStartMonthIndex0: (value) => set({ startMonthIndex0: value }),
      setStartYearRaw: (value) => set({ startYearRaw: value }),

      setIncludeTaxesCosts: (value) => set({ includeTaxesCosts: value }),
      setPropertyTaxAnnualRaw: (value) => set({ propertyTaxAnnualRaw: value }),
      setHomeInsuranceAnnualRaw: (value) =>
        set({ homeInsuranceAnnualRaw: value }),
      setPmiMonthlyRaw: (value) => set({ pmiMonthlyRaw: value }),
      setHoaMonthlyRaw: (value) => set({ hoaMonthlyRaw: value }),
      setOtherCostsMonthlyRaw: (value) => set({ otherCostsMonthlyRaw: value }),

      setExtraMonthlyRaw: (value) => set({ extraMonthlyRaw: value }),
      setExtraYearlyRaw: (value) => set({ extraYearlyRaw: value }),
      setExtraYearlyMonthIndex0: (value) =>
        set({ extraYearlyMonthIndex0: value }),
      setExtraYearlyStartYearRaw: (value) =>
        set({ extraYearlyStartYearRaw: value }),

      setExtraOneTimeRaw: (value) => set({ extraOneTimeRaw: value }),
      setExtraOneTimeMonthIndex0: (value) =>
        set({ extraOneTimeMonthIndex0: value }),
      setExtraOneTimeYearRaw: (value) => set({ extraOneTimeYearRaw: value }),

      setScheduleJumpYear: (value) => set({ scheduleJumpYear: value }),

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
      version: 1,
      migrate: (persisted, version) => {
        if (version >= 1) return persisted;

        const merged: MortgageFormState = {
          ...getDefaultMortgageFormState(),
          ...persisted,
        };
        return migrateZeroStringsToEmpty(merged);
      },
      partialize: (state) => ({
        theme: state.theme,

        homePriceRaw: state.homePriceRaw,
        downPaymentType: state.downPaymentType,
        downPaymentRaw: state.downPaymentRaw,
        loanTermYearsRaw: state.loanTermYearsRaw,
        interestRateRaw: state.interestRateRaw,

        startMonthIndex0: state.startMonthIndex0,
        startYearRaw: state.startYearRaw,

        includeTaxesCosts: state.includeTaxesCosts,
        propertyTaxAnnualRaw: state.propertyTaxAnnualRaw,
        homeInsuranceAnnualRaw: state.homeInsuranceAnnualRaw,
        pmiMonthlyRaw: state.pmiMonthlyRaw,
        hoaMonthlyRaw: state.hoaMonthlyRaw,
        otherCostsMonthlyRaw: state.otherCostsMonthlyRaw,

        extraMonthlyRaw: state.extraMonthlyRaw,
        extraYearlyRaw: state.extraYearlyRaw,
        extraYearlyMonthIndex0: state.extraYearlyMonthIndex0,
        extraYearlyStartYearRaw: state.extraYearlyStartYearRaw,

        extraOneTimeRaw: state.extraOneTimeRaw,
        extraOneTimeMonthIndex0: state.extraOneTimeMonthIndex0,
        extraOneTimeYearRaw: state.extraOneTimeYearRaw,

        scheduleJumpYear: state.scheduleJumpYear,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyThemeToDom(state.theme);
      },
    } as PersistOptions<MortgageStore, MortgageFormState>,
  ),
);
