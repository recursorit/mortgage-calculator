import { useMemo, useState } from 'react';
import {
  IconHelpCircle,
  IconInfoCircle,
  IconListDetails,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import { monthShortName } from '../lib/format';
import type { DownPaymentType } from '../lib/mortgage';
import { useMortgageStore } from '../store/mortgageStore';

import { LabeledField, Input, Select, Switch, Toggle } from './ui/FormControls';
import { InfoModal } from './ui/InfoModal';
import { SectionHeader } from './ui/SectionHeader';

const currentYear = new Date().getFullYear();

type HelpTopic = 'monthly' | 'yearly';
type HelpTab = 'explanation' | 'example';
type InputsHelpTab = 'basics' | 'arm';

export function InputsPanel() {
  const [inputsHelpOpen, setInputsHelpOpen] = useState(false);
  const [inputsHelpTab, setInputsHelpTab] = useState<InputsHelpTab>('basics');

  const [helpOpen, setHelpOpen] = useState<HelpTopic | null>(null);
  const [helpTab, setHelpTab] = useState<HelpTab>('explanation');

  const homePriceRaw = useMortgageStore((s) => s.homePriceRaw);
  const setHomePriceRaw = useMortgageStore((s) => s.setHomePriceRaw);

  const downPaymentType = useMortgageStore((s) => s.downPaymentType);
  const setDownPaymentType = useMortgageStore((s) => s.setDownPaymentType);

  const downPaymentRaw = useMortgageStore((s) => s.downPaymentRaw);
  const setDownPaymentRaw = useMortgageStore((s) => s.setDownPaymentRaw);

  const loanTermYearsRaw = useMortgageStore((s) => s.loanTermYearsRaw);
  const setLoanTermYearsRaw = useMortgageStore((s) => s.setLoanTermYearsRaw);

  const interestRateRaw = useMortgageStore((s) => s.interestRateRaw);
  const setInterestRateRaw = useMortgageStore((s) => s.setInterestRateRaw);

  const interestType = useMortgageStore((s) => s.interestType);
  const setInterestType = useMortgageStore((s) => s.setInterestType);

  const armPreset = useMortgageStore((s) => s.armPreset);
  const setArmPreset = useMortgageStore((s) => s.setArmPreset);
  const armRateChanges = useMortgageStore((s) => s.armRateChanges);
  const addArmRateChange = useMortgageStore((s) => s.addArmRateChange);
  const updateArmRateChange = useMortgageStore((s) => s.updateArmRateChange);
  const removeArmRateChange = useMortgageStore((s) => s.removeArmRateChange);
  const armRateValidationMessage = useMortgageStore(
    (s) => s.armRateValidationMessage,
  );

  const startMonthIndex0 = useMortgageStore((s) => s.startMonthIndex0);
  const setStartMonthIndex0 = useMortgageStore((s) => s.setStartMonthIndex0);

  const startYearRaw = useMortgageStore((s) => s.startYearRaw);
  const setStartYearRaw = useMortgageStore((s) => s.setStartYearRaw);

  const includeTaxesCosts = useMortgageStore((s) => s.includeTaxesCosts);
  const setIncludeTaxesCosts = useMortgageStore((s) => s.setIncludeTaxesCosts);

  const propertyTaxAnnualRaw = useMortgageStore((s) => s.propertyTaxAnnualRaw);
  const setPropertyTaxAnnualRaw = useMortgageStore(
    (s) => s.setPropertyTaxAnnualRaw,
  );

  const homeInsuranceAnnualRaw = useMortgageStore(
    (s) => s.homeInsuranceAnnualRaw,
  );
  const setHomeInsuranceAnnualRaw = useMortgageStore(
    (s) => s.setHomeInsuranceAnnualRaw,
  );

  const pmiMonthlyRaw = useMortgageStore((s) => s.pmiMonthlyRaw);
  const setPmiMonthlyRaw = useMortgageStore((s) => s.setPmiMonthlyRaw);

  const hoaMonthlyRaw = useMortgageStore((s) => s.hoaMonthlyRaw);
  const setHoaMonthlyRaw = useMortgageStore((s) => s.setHoaMonthlyRaw);

  const otherCostsMonthlyRaw = useMortgageStore((s) => s.otherCostsMonthlyRaw);
  const setOtherCostsMonthlyRaw = useMortgageStore(
    (s) => s.setOtherCostsMonthlyRaw,
  );

  const extraMonthlyRanges = useMortgageStore((s) => s.extraMonthlyRanges);
  const addExtraMonthlyRange = useMortgageStore((s) => s.addExtraMonthlyRange);
  const updateExtraMonthlyRange = useMortgageStore(
    (s) => s.updateExtraMonthlyRange,
  );
  const removeExtraMonthlyRange = useMortgageStore(
    (s) => s.removeExtraMonthlyRange,
  );

  const extraYearlyRanges = useMortgageStore((s) => s.extraYearlyRanges);
  const addExtraYearlyRange = useMortgageStore((s) => s.addExtraYearlyRange);
  const updateExtraYearlyRange = useMortgageStore(
    (s) => s.updateExtraYearlyRange,
  );
  const removeExtraYearlyRange = useMortgageStore(
    (s) => s.removeExtraYearlyRange,
  );

  const extraRangeValidationMessage = useMortgageStore(
    (s) => s.extraRangeValidationMessage,
  );

  const extraOneTimeRaw = useMortgageStore((s) => s.extraOneTimeRaw);
  const setExtraOneTimeRaw = useMortgageStore((s) => s.setExtraOneTimeRaw);

  const extraOneTimeMonthIndex0 = useMortgageStore(
    (s) => s.extraOneTimeMonthIndex0,
  );
  const setExtraOneTimeMonthIndex0 = useMortgageStore(
    (s) => s.setExtraOneTimeMonthIndex0,
  );

  const extraOneTimeYearRaw = useMortgageStore((s) => s.extraOneTimeYearRaw);
  const setExtraOneTimeYearRaw = useMortgageStore(
    (s) => s.setExtraOneTimeYearRaw,
  );

  const actionButtonClassName =
    'inline-flex items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800';

  const helpButtonClassName =
    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800';

  const dangerIconButtonClassName =
    'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 shadow-sm transition ' +
    'hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 ' +
    'dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60 dark:focus:ring-rose-900/50';

  const helpTitle = useMemo(() => {
    if (helpOpen === 'monthly') return 'How monthly extra ranges work';
    if (helpOpen === 'yearly') return 'How yearly extra ranges work';
    return '';
  }, [helpOpen]);

  const helpDescription = useMemo(() => {
    if (!helpOpen) return undefined;
    return 'Use ranges to schedule extra principal over specific time windows.';
  }, [helpOpen]);

  const openHelp = (topic: HelpTopic) => {
    setHelpOpen(topic);
    setHelpTab('explanation');
  };

  const closeHelp = () => setHelpOpen(null);

  const openInputsHelp = () => {
    setInputsHelpOpen(true);
    setInputsHelpTab(interestType === 'arm' ? 'arm' : 'basics');
  };

  const closeInputsHelp = () => setInputsHelpOpen(false);

  const tabButtonClassName = (active: boolean) =>
    'inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4 ' +
    (active
      ? 'border-sky-200 bg-sky-50 text-slate-900 focus:ring-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-slate-50 dark:focus:ring-sky-900/40'
      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800');

  const armRateChangeMetaById = useMemo(() => {
    const parseYear = (value: string): number | null => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return null;
      return Math.trunc(parsed);
    };

    const startYear = parseYear(startYearRaw);
    const startSerial =
      startYear === null ? null : startYear * 12 + startMonthIndex0;

    const base = armRateChanges.map((c) => {
      const effectiveYear = parseYear(c.effectiveYearRaw);
      const effectiveMonthIndex0 = Number.isFinite(c.effectiveMonthIndex0)
        ? Math.min(11, Math.max(0, Math.trunc(c.effectiveMonthIndex0)))
        : 0;

      const serial =
        effectiveYear === null
          ? null
          : effectiveYear * 12 + effectiveMonthIndex0;

      return {
        id: c.id,
        effectiveYear,
        effectiveMonthIndex0,
        serial,
      };
    });

    const serialCounts = new Map<number, number>();
    for (const row of base) {
      if (row.serial === null) continue;
      serialCounts.set(row.serial, (serialCounts.get(row.serial) ?? 0) + 1);
    }

    const sortedValid = base
      .filter((r) => r.serial !== null)
      .map((r) => ({ ...r, serial: r.serial as number }))
      .sort((a, b) => a.serial - b.serial);

    const orderIndexById = new Map<string, number>();
    const deltaMonthsById = new Map<string, number | null>();
    for (let i = 0; i < sortedValid.length; i += 1) {
      const row = sortedValid[i];
      orderIndexById.set(row.id, i + 1);
      const prev = i > 0 ? sortedValid[i - 1] : null;
      deltaMonthsById.set(row.id, prev ? row.serial - prev.serial : null);
    }

    const metaById = new Map<
      string,
      {
        effectiveLabel: string;
        loanMonthLabel: string;
        orderLabel: string;
        deltaLabel: string;
        warning: string | null;
        hasWarning: boolean;
      }
    >();

    for (const row of base) {
      const effectiveLabel =
        row.effectiveYear === null
          ? 'Effective: —'
          : `Effective: ${monthShortName(row.effectiveMonthIndex0)} ${row.effectiveYear}`;

      const monthsFromStart =
        startSerial === null || row.serial === null
          ? null
          : row.serial - startSerial;

      const loanMonthLabel =
        monthsFromStart === null
          ? 'Loan month: —'
          : monthsFromStart < 0
            ? 'Loan month: (before start)'
            : `Loan month: ${monthsFromStart + 1}`;

      const order = orderIndexById.get(row.id) ?? null;
      const orderLabel = order === null ? 'Order: —' : `Order: ${order}`;

      const delta = deltaMonthsById.get(row.id) ?? null;
      const deltaLabel =
        delta === null ? 'Δ: —' : delta === 0 ? 'Δ: 0 mo' : `Δ: +${delta} mo`;

      let warning: string | null = null;
      if (row.effectiveYear === null) {
        warning = 'Enter a valid effective year.';
      } else if (
        row.serial !== null &&
        startSerial !== null &&
        row.serial < startSerial
      ) {
        warning = 'This change is before the loan start date.';
      } else if (
        row.serial !== null &&
        (serialCounts.get(row.serial) ?? 0) > 1
      ) {
        warning = 'Duplicate effective date. Each change month must be unique.';
      }

      metaById.set(row.id, {
        effectiveLabel,
        loanMonthLabel,
        orderLabel,
        deltaLabel,
        warning,
        hasWarning: Boolean(warning),
      });
    }

    return metaById;
  }, [armRateChanges, startMonthIndex0, startYearRaw]);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Inputs"
        description="Adjust values to see monthly payment and payoff details."
        right={
          <button
            type="button"
            className={helpButtonClassName}
            onClick={openInputsHelp}
            aria-label="How inputs work"
            title="How inputs work"
          >
            <IconHelpCircle size={18} aria-hidden="true" />
          </button>
        }
      />

      <InfoModal
        open={inputsHelpOpen}
        title="How Inputs work"
        description="What each input affects, plus how ARM rate changes are applied."
        onClose={closeInputsHelp}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabButtonClassName(inputsHelpTab === 'basics')}
            onClick={() => setInputsHelpTab('basics')}
          >
            <IconInfoCircle size={16} aria-hidden="true" />
            Basics
          </button>
          <button
            type="button"
            className={tabButtonClassName(inputsHelpTab === 'arm')}
            onClick={() => setInputsHelpTab('arm')}
          >
            <IconListDetails size={16} aria-hidden="true" />
            ARM
          </button>
        </div>

        {inputsHelpTab === 'basics' ? (
          <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                Loan amount
              </div>
              <div className="mt-1">
                <span className="font-semibold">Home price</span> minus{' '}
                <span className="font-semibold">down payment</span> determines
                your starting loan balance.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                Monthly payment (P&I)
              </div>
              <div className="mt-1">
                The calculator computes your scheduled monthly principal &amp;
                interest payment from the{' '}
                <span className="font-semibold">term</span> and{' '}
                <span className="font-semibold">interest rate</span>.
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  If the rate is 0%, payments are straight-line principal.
                </li>
                <li>
                  Scheduled P&amp;I is never more than the amount needed to
                  close.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                Start month/year
              </div>
              <div className="mt-1">
                This sets the first payment in the schedule and is also the
                reference point for features that use dates (like ARM changes
                and extra payment ranges).
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                Taxes &amp; costs toggle
              </div>
              <div className="mt-1">
                Taxes/costs are added to your out-of-pocket totals, but they do
                not change the loan balance payoff math.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                What ARM means here
              </div>
              <div className="mt-1">
                ARM support is currently{' '}
                <span className="font-semibold">manual</span>: you enter the
                future reset rates you want to model.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                How rate changes apply
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  A change is effective at the{' '}
                  <span className="font-semibold">start of that month</span>.
                </li>
                <li>
                  On each change month, the scheduled P&amp;I payment is{' '}
                  <span className="font-semibold">recast</span> based on the
                  remaining balance and remaining term.
                </li>
                <li>
                  If the ARM change list shows a validation warning, the
                  calculator ignores the change list and uses the initial rate
                  only.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-extrabold text-slate-900 dark:text-slate-50">
                Presets
              </div>
              <div className="mt-1">
                Presets help you seed the first reset date (you still enter the
                actual reset rate). Use “Add change” to add more resets.
              </div>
            </div>
          </div>
        )}
      </InfoModal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LabeledField label="Home price">
          <Input
            inputMode="decimal"
            value={homePriceRaw}
            onChange={(e) => setHomePriceRaw(e.target.value)}
            aria-label="Home price"
            placeholder="750000"
          />
        </LabeledField>

        <LabeledField label="Loan term" hint="years">
          <Input
            inputMode="numeric"
            value={loanTermYearsRaw}
            onChange={(e) => setLoanTermYearsRaw(e.target.value)}
            aria-label="Loan term in years"
            placeholder="30"
          />
        </LabeledField>

        <LabeledField label="Down payment">
          <div className="flex gap-2">
            <Input
              inputMode="decimal"
              value={downPaymentRaw}
              onChange={(e) => setDownPaymentRaw(e.target.value)}
              aria-label="Down payment value"
              placeholder={downPaymentType === 'percent' ? '20' : '150000'}
            />
            <Select
              value={downPaymentType}
              onChange={(e) =>
                setDownPaymentType(e.target.value as DownPaymentType)
              }
              aria-label="Down payment type"
              className="w-28"
            >
              <option value="percent">%</option>
              <option value="amount">$</option>
            </Select>
          </div>
        </LabeledField>

        <LabeledField label="Interest type">
          <Select
            value={interestType}
            onChange={(e) => setInterestType(e.target.value as 'fixed' | 'arm')}
            aria-label="Interest type"
          >
            <option value="fixed">Fixed</option>
            <option value="arm">ARM</option>
          </Select>
        </LabeledField>

        <LabeledField
          label={interestType === 'arm' ? 'Initial rate' : 'Interest rate'}
          hint="APR %"
        >
          <Input
            inputMode="decimal"
            value={interestRateRaw}
            onChange={(e) => setInterestRateRaw(e.target.value)}
            aria-label={
              interestType === 'arm' ? 'Initial interest rate' : 'Interest rate'
            }
            placeholder="5.875"
          />
        </LabeledField>

        <LabeledField label="Start month">
          <Select
            value={startMonthIndex0}
            onChange={(e) => setStartMonthIndex0(Number(e.target.value))}
            aria-label="Start month"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {monthShortName(i)}
              </option>
            ))}
          </Select>
        </LabeledField>

        <LabeledField label="Start year">
          <Input
            inputMode="numeric"
            value={startYearRaw}
            onChange={(e) => setStartYearRaw(e.target.value)}
            aria-label="Start year"
            placeholder={String(currentYear)}
          />
        </LabeledField>
      </div>

      {interestType === 'arm' ? (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-[14rem]">
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                ARM rate changes
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Enter your expected future reset rates. Payment is recast on
                each change month.
              </p>
            </div>

            <button
              type="button"
              className={actionButtonClassName}
              onClick={addArmRateChange}
            >
              <IconPlus className="h-4 w-4" />
              Add change
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField label="Preset">
              <Select
                value={armPreset}
                onChange={(e) =>
                  setArmPreset(
                    e.target.value as '5/1' | '7/6' | '5/6' | 'custom',
                  )
                }
                aria-label="ARM preset"
              >
                <option value="5/1">5/1</option>
                <option value="7/6">7/6</option>
                <option value="5/6">5/6</option>
                <option value="custom">Custom</option>
              </Select>
            </LabeledField>
          </div>

          {armRateValidationMessage ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              {armRateValidationMessage}
            </div>
          ) : null}

          {armRateChanges.length ? (
            <div className="space-y-3">
              {armRateChanges.map((c, idx) =>
                (() => {
                  const meta = armRateChangeMetaById.get(c.id);
                  const cardClassName =
                    'grid items-end gap-3 rounded-3xl border p-3 ' +
                    (meta?.hasWarning
                      ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900');

                  const pillClassName =
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                    (meta?.hasWarning
                      ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200');

                  return (
                    <div key={c.id} className={cardClassName}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                            Change {idx + 1}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={pillClassName}>
                              {meta?.effectiveLabel ?? 'Effective: —'}
                            </span>
                            <span className={pillClassName}>
                              {meta?.loanMonthLabel ?? 'Loan month: —'}
                            </span>
                            <span className={pillClassName}>
                              {meta?.orderLabel ?? 'Order: —'}
                            </span>
                            <span className={pillClassName}>
                              {meta?.deltaLabel ?? 'Δ: —'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={dangerIconButtonClassName}
                          onClick={() => removeArmRateChange(c.id)}
                          aria-label="Remove rate change"
                          title="Remove"
                        >
                          <IconTrash className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <LabeledField
                          label={idx === 0 ? 'Effective month' : 'Month'}
                        >
                          <Select
                            value={c.effectiveMonthIndex0}
                            onChange={(e) =>
                              updateArmRateChange(c.id, {
                                effectiveMonthIndex0: Number(e.target.value),
                              })
                            }
                            aria-label="ARM change month"
                          >
                            {Array.from({ length: 12 }).map((_, i) => (
                              <option key={i} value={i}>
                                {monthShortName(i)}
                              </option>
                            ))}
                          </Select>
                        </LabeledField>

                        <LabeledField
                          label={idx === 0 ? 'Effective year' : 'Year'}
                        >
                          <Input
                            inputMode="numeric"
                            value={c.effectiveYearRaw}
                            onChange={(e) =>
                              updateArmRateChange(c.id, {
                                effectiveYearRaw: e.target.value,
                              })
                            }
                            aria-label="ARM change year"
                            placeholder={startYearRaw || String(currentYear)}
                          />
                        </LabeledField>

                        <LabeledField
                          label={idx === 0 ? 'New rate' : 'Rate'}
                          hint="APR %"
                        >
                          <Input
                            inputMode="decimal"
                            value={c.rateAnnualPercentRaw}
                            onChange={(e) =>
                              updateArmRateChange(c.id, {
                                rateAnnualPercentRaw: e.target.value,
                              })
                            }
                            aria-label="ARM new rate"
                            placeholder="7.25"
                          />
                        </LabeledField>
                      </div>

                      {meta?.warning ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                          {meta.warning}
                        </div>
                      ) : null}
                    </div>
                  );
                })(),
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-700 dark:text-slate-200">
              No rate changes yet. Add one for the first reset.
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        <Toggle
          checked={includeTaxesCosts}
          onChange={setIncludeTaxesCosts}
          label="Include taxes & costs"
        />

        {includeTaxesCosts ? (
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LabeledField label="Property tax" hint="per year">
                <Input
                  inputMode="decimal"
                  value={propertyTaxAnnualRaw}
                  onChange={(e) => setPropertyTaxAnnualRaw(e.target.value)}
                  aria-label="Property taxes per year"
                  placeholder="0"
                />
              </LabeledField>
              <LabeledField label="Home insurance" hint="per year">
                <Input
                  inputMode="decimal"
                  value={homeInsuranceAnnualRaw}
                  onChange={(e) => setHomeInsuranceAnnualRaw(e.target.value)}
                  aria-label="Home insurance per year"
                  placeholder="0"
                />
              </LabeledField>
              <LabeledField label="PMI" hint="per month">
                <Input
                  inputMode="decimal"
                  value={pmiMonthlyRaw}
                  onChange={(e) => setPmiMonthlyRaw(e.target.value)}
                  aria-label="PMI per month"
                  placeholder="0"
                />
              </LabeledField>
              <LabeledField label="HOA" hint="per month">
                <Input
                  inputMode="decimal"
                  value={hoaMonthlyRaw}
                  onChange={(e) => setHoaMonthlyRaw(e.target.value)}
                  aria-label="HOA per month"
                  placeholder="0"
                />
              </LabeledField>
              <LabeledField label="Other costs" hint="per month">
                <Input
                  inputMode="decimal"
                  value={otherCostsMonthlyRaw}
                  onChange={(e) => setOtherCostsMonthlyRaw(e.target.value)}
                  aria-label="Other costs per month"
                  placeholder="0"
                />
              </LabeledField>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Extra payments"
          description="Optional extra principal payments to pay off sooner."
        />

        <InfoModal
          open={helpOpen !== null}
          title={helpTitle}
          description={helpDescription}
          onClose={closeHelp}
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={tabButtonClassName(helpTab === 'explanation')}
              onClick={() => setHelpTab('explanation')}
            >
              <IconInfoCircle size={16} aria-hidden="true" />
              Explanation
            </button>
            <button
              type="button"
              className={tabButtonClassName(helpTab === 'example')}
              onClick={() => setHelpTab('example')}
            >
              <IconListDetails size={16} aria-hidden="true" />
              Example
            </button>
          </div>

          {helpTab === 'explanation' ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="font-extrabold text-slate-900 dark:text-slate-50">
                  What a range means
                </div>
                <div className="mt-1">
                  A range is a window of time where an extra payment applies.
                  Start and end are based on the loan schedule month/year.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="font-extrabold text-slate-900 dark:text-slate-50">
                  Key rules
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    End date is <span className="font-semibold">inclusive</span>
                    .
                  </li>
                  <li>
                    End date is optional. If you leave it off, the range runs
                    until payoff.
                  </li>
                  <li>
                    Ranges cannot overlap. Adjacent ranges are OK (e.g. one ends
                    Dec 2027, next starts Jan 2028).
                  </li>
                  <li>
                    If you see a red validation banner, the calculator ignores
                    range-based monthly/yearly extras until you fix the ranges.
                  </li>
                </ul>
              </div>

              {helpOpen === 'monthly' ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="font-extrabold text-slate-900 dark:text-slate-50">
                    Monthly ranges
                  </div>
                  <div className="mt-1">
                    The amount is applied every month within the range (as extra
                    principal).
                  </div>
                </div>
              ) : null}

              {helpOpen === 'yearly' ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="font-extrabold text-slate-900 dark:text-slate-50">
                    Yearly ranges
                  </div>
                  <div className="mt-1">
                    Pick a <span className="font-semibold">payment month</span>{' '}
                    (e.g. March). The amount is applied once per year in that
                    month, but only during the start/end window.
                  </div>
                  <div className="mt-2">
                    Tip: If your start month is after the payment month, the
                    first yearly payment will happen the next time that payment
                    month occurs.
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              {helpOpen === 'monthly' ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="font-extrabold text-slate-900 dark:text-slate-50">
                      Example: step up your extra payment
                    </div>
                    <div className="mt-1">
                      You want to pay $200/month extra for 2 years, then
                      $500/month extra after that.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-extrabold text-slate-900 dark:text-slate-50">
                      Range 1
                    </div>
                    <div className="mt-2 grid gap-1">
                      <div>
                        Amount: <span className="font-semibold">200</span>
                      </div>
                      <div>
                        Start: <span className="font-semibold">Jan 2026</span>
                      </div>
                      <div>
                        End: <span className="font-semibold">Dec 2027</span>{' '}
                        (inclusive)
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-extrabold text-slate-900 dark:text-slate-50">
                      Range 2
                    </div>
                    <div className="mt-2 grid gap-1">
                      <div>
                        Amount: <span className="font-semibold">500</span>
                      </div>
                      <div>
                        Start: <span className="font-semibold">Jan 2028</span>
                      </div>
                      <div>
                        End: <span className="font-semibold">(leave off)</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Note: Range 2 starts the month after Range 1 ends, so
                      there’s no overlap.
                    </div>
                  </div>
                </div>
              ) : null}

              {helpOpen === 'yearly' ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="font-extrabold text-slate-900 dark:text-slate-50">
                      Example: annual bonus payment
                    </div>
                    <div className="mt-1">
                      You get a bonus every March and want to put $5,000 toward
                      principal from 2026 through 2029.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-extrabold text-slate-900 dark:text-slate-50">
                      Range 1
                    </div>
                    <div className="mt-2 grid gap-1">
                      <div>
                        Amount: <span className="font-semibold">5000</span>
                      </div>
                      <div>
                        Payment month:{' '}
                        <span className="font-semibold">Mar</span>
                      </div>
                      <div>
                        Start: <span className="font-semibold">Jan 2026</span>
                      </div>
                      <div>
                        End: <span className="font-semibold">Dec 2029</span>{' '}
                        (inclusive)
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      This applies a $5,000 extra payment each March in 2026,
                      2027, 2028, and 2029.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </InfoModal>

        {extraRangeValidationMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {extraRangeValidationMessage}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
              Monthly extra ranges
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openHelp('monthly')}
                className={helpButtonClassName}
                aria-label="Help for monthly extra ranges"
                title="Help"
              >
                <IconHelpCircle size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={addExtraMonthlyRange}
                className={actionButtonClassName + ' gap-2'}
              >
                <IconPlus size={18} aria-hidden="true" />
                Add monthly range
              </button>
            </div>
          </div>

          {extraMonthlyRanges.length ? (
            <div className="space-y-3">
              {extraMonthlyRanges.map((r, idx) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Range {idx + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.endEnabled}
                        onChange={(checked) =>
                          updateExtraMonthlyRange(r.id, {
                            endEnabled: checked,
                          })
                        }
                        label="End date"
                        ariaLabel={`Monthly range ${idx + 1} has end date`}
                        className="py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraMonthlyRange(r.id)}
                        className={dangerIconButtonClassName}
                        aria-label={`Remove monthly range ${idx + 1}`}
                        title="Remove"
                      >
                        <IconTrash size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <LabeledField label="Amount" hint="per month">
                      <Input
                        inputMode="decimal"
                        value={r.amountRaw}
                        onChange={(e) =>
                          updateExtraMonthlyRange(r.id, {
                            amountRaw: e.target.value,
                          })
                        }
                        aria-label={`Monthly range ${idx + 1} amount`}
                        placeholder="0"
                      />
                    </LabeledField>

                    <LabeledField label="Start" hint="month">
                      <Select
                        value={r.startMonthIndex0}
                        onChange={(e) =>
                          updateExtraMonthlyRange(r.id, {
                            startMonthIndex0: Number(e.target.value),
                          })
                        }
                        aria-label={`Monthly range ${idx + 1} start month`}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={i}>
                            {monthShortName(i)}
                          </option>
                        ))}
                      </Select>
                    </LabeledField>

                    <LabeledField label="Start" hint="year">
                      <Input
                        inputMode="numeric"
                        value={r.startYearRaw}
                        onChange={(e) =>
                          updateExtraMonthlyRange(r.id, {
                            startYearRaw: e.target.value,
                          })
                        }
                        aria-label={`Monthly range ${idx + 1} start year`}
                        placeholder={startYearRaw}
                      />
                    </LabeledField>

                    {r.endEnabled ? (
                      <>
                        <LabeledField label="End" hint="month">
                          <Select
                            value={r.endMonthIndex0}
                            onChange={(e) =>
                              updateExtraMonthlyRange(r.id, {
                                endMonthIndex0: Number(e.target.value),
                              })
                            }
                            aria-label={`Monthly range ${idx + 1} end month`}
                          >
                            {Array.from({ length: 12 }).map((_, i) => (
                              <option key={i} value={i}>
                                {monthShortName(i)}
                              </option>
                            ))}
                          </Select>
                        </LabeledField>

                        <LabeledField label="End" hint="year">
                          <Input
                            inputMode="numeric"
                            value={r.endYearRaw}
                            onChange={(e) =>
                              updateExtraMonthlyRange(r.id, {
                                endYearRaw: e.target.value,
                              })
                            }
                            aria-label={`Monthly range ${idx + 1} end year`}
                            placeholder={r.startYearRaw || startYearRaw}
                          />
                        </LabeledField>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Add a monthly range to apply extra principal over time.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
              Yearly extra ranges
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openHelp('yearly')}
                className={helpButtonClassName}
                aria-label="Help for yearly extra ranges"
                title="Help"
              >
                <IconHelpCircle size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={addExtraYearlyRange}
                className={actionButtonClassName + ' gap-2'}
              >
                <IconPlus size={18} aria-hidden="true" />
                Add yearly range
              </button>
            </div>
          </div>

          {extraYearlyRanges.length ? (
            <div className="space-y-3">
              {extraYearlyRanges.map((r, idx) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Range {idx + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.endEnabled}
                        onChange={(checked) =>
                          updateExtraYearlyRange(r.id, {
                            endEnabled: checked,
                          })
                        }
                        label="End date"
                        ariaLabel={`Yearly range ${idx + 1} has end date`}
                        className="py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraYearlyRange(r.id)}
                        className={dangerIconButtonClassName}
                        aria-label={`Remove yearly range ${idx + 1}`}
                        title="Remove"
                      >
                        <IconTrash size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-4">
                      <LabeledField label="Amount" hint="once per year">
                        <Input
                          inputMode="decimal"
                          value={r.amountRaw}
                          onChange={(e) =>
                            updateExtraYearlyRange(r.id, {
                              amountRaw: e.target.value,
                            })
                          }
                          aria-label={`Yearly range ${idx + 1} amount`}
                          placeholder="0"
                        />
                      </LabeledField>

                      <LabeledField label="Payment month" hint="each year">
                        <Select
                          value={r.paymentMonthIndex0}
                          onChange={(e) =>
                            updateExtraYearlyRange(r.id, {
                              paymentMonthIndex0: Number(e.target.value),
                            })
                          }
                          aria-label={`Yearly range ${idx + 1} payment month`}
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>
                              {monthShortName(i)}
                            </option>
                          ))}
                        </Select>
                      </LabeledField>
                    </div>

                    <LabeledField label="Start" hint="month">
                      <Select
                        value={r.startMonthIndex0}
                        onChange={(e) =>
                          updateExtraYearlyRange(r.id, {
                            startMonthIndex0: Number(e.target.value),
                          })
                        }
                        aria-label={`Yearly range ${idx + 1} start month`}
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={i}>
                            {monthShortName(i)}
                          </option>
                        ))}
                      </Select>
                    </LabeledField>

                    <LabeledField label="Start" hint="year">
                      <Input
                        inputMode="numeric"
                        value={r.startYearRaw}
                        onChange={(e) =>
                          updateExtraYearlyRange(r.id, {
                            startYearRaw: e.target.value,
                          })
                        }
                        aria-label={`Yearly range ${idx + 1} start year`}
                        placeholder={startYearRaw}
                      />
                    </LabeledField>

                    {r.endEnabled ? (
                      <>
                        <div className="md:col-start-2">
                          <LabeledField label="End" hint="month">
                            <Select
                              value={r.endMonthIndex0}
                              onChange={(e) =>
                                updateExtraYearlyRange(r.id, {
                                  endMonthIndex0: Number(e.target.value),
                                })
                              }
                              aria-label={`Yearly range ${idx + 1} end month`}
                            >
                              {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i}>
                                  {monthShortName(i)}
                                </option>
                              ))}
                            </Select>
                          </LabeledField>
                        </div>

                        <div className="md:col-start-3">
                          <LabeledField label="End" hint="year">
                            <Input
                              inputMode="numeric"
                              value={r.endYearRaw}
                              onChange={(e) =>
                                updateExtraYearlyRange(r.id, {
                                  endYearRaw: e.target.value,
                                })
                              }
                              aria-label={`Yearly range ${idx + 1} end year`}
                              placeholder={r.startYearRaw || startYearRaw}
                            />
                          </LabeledField>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Add a yearly range to apply an annual extra payment.
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LabeledField label="One-time extra" hint="single payment">
            <Input
              inputMode="decimal"
              value={extraOneTimeRaw}
              onChange={(e) => setExtraOneTimeRaw(e.target.value)}
              aria-label="One time extra payment"
              placeholder="0"
            />
          </LabeledField>

          <LabeledField label="One-time date" hint="month">
            <Select
              value={extraOneTimeMonthIndex0}
              onChange={(e) =>
                setExtraOneTimeMonthIndex0(Number(e.target.value))
              }
              aria-label="One time extra month"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {monthShortName(i)}
                </option>
              ))}
            </Select>
          </LabeledField>

          <LabeledField label="One-time date" hint="year">
            <Input
              inputMode="numeric"
              value={extraOneTimeYearRaw}
              onChange={(e) => setExtraOneTimeYearRaw(e.target.value)}
              aria-label="One time extra year"
              placeholder={startYearRaw}
            />
          </LabeledField>
        </div>
      </div>
    </div>
  );
}
