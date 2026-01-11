import { monthShortName } from '../lib/format';
import type { DownPaymentType } from '../lib/mortgage';
import { useMortgageStore } from '../store/mortgageStore';

import { LabeledField, Input, Select, Toggle } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

const currentYear = new Date().getFullYear();

export function InputsPanel() {
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

  const extraMonthlyRaw = useMortgageStore((s) => s.extraMonthlyRaw);
  const setExtraMonthlyRaw = useMortgageStore((s) => s.setExtraMonthlyRaw);

  const extraYearlyRaw = useMortgageStore((s) => s.extraYearlyRaw);
  const setExtraYearlyRaw = useMortgageStore((s) => s.setExtraYearlyRaw);

  const extraYearlyMonthIndex0 = useMortgageStore(
    (s) => s.extraYearlyMonthIndex0,
  );
  const setExtraYearlyMonthIndex0 = useMortgageStore(
    (s) => s.setExtraYearlyMonthIndex0,
  );

  const extraYearlyStartYearRaw = useMortgageStore(
    (s) => s.extraYearlyStartYearRaw,
  );
  const setExtraYearlyStartYearRaw = useMortgageStore(
    (s) => s.setExtraYearlyStartYearRaw,
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

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Inputs"
        description="Adjust values to see monthly payment and payoff details."
      />

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

        <LabeledField label="Interest rate" hint="APR %">
          <Input
            inputMode="decimal"
            value={interestRateRaw}
            onChange={(e) => setInterestRateRaw(e.target.value)}
            aria-label="Interest rate"
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

      <div className="space-y-3">
        <Toggle
          checked={includeTaxesCosts}
          onChange={setIncludeTaxesCosts}
          label="Include taxes & costs"
        />

        <div
          className={
            'grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition dark:border-slate-800 dark:bg-slate-950/40 ' +
            (includeTaxesCosts ? '' : 'opacity-50')
          }
          aria-disabled={!includeTaxesCosts}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LabeledField label="Property tax" hint="per year">
              <Input
                inputMode="decimal"
                value={propertyTaxAnnualRaw}
                onChange={(e) => setPropertyTaxAnnualRaw(e.target.value)}
                aria-label="Property taxes per year"
                placeholder="0"
                disabled={!includeTaxesCosts}
              />
            </LabeledField>
            <LabeledField label="Home insurance" hint="per year">
              <Input
                inputMode="decimal"
                value={homeInsuranceAnnualRaw}
                onChange={(e) => setHomeInsuranceAnnualRaw(e.target.value)}
                aria-label="Home insurance per year"
                placeholder="0"
                disabled={!includeTaxesCosts}
              />
            </LabeledField>
            <LabeledField label="PMI" hint="per month">
              <Input
                inputMode="decimal"
                value={pmiMonthlyRaw}
                onChange={(e) => setPmiMonthlyRaw(e.target.value)}
                aria-label="PMI per month"
                placeholder="0"
                disabled={!includeTaxesCosts}
              />
            </LabeledField>
            <LabeledField label="HOA" hint="per month">
              <Input
                inputMode="decimal"
                value={hoaMonthlyRaw}
                onChange={(e) => setHoaMonthlyRaw(e.target.value)}
                aria-label="HOA per month"
                placeholder="0"
                disabled={!includeTaxesCosts}
              />
            </LabeledField>
            <LabeledField label="Other costs" hint="per month">
              <Input
                inputMode="decimal"
                value={otherCostsMonthlyRaw}
                onChange={(e) => setOtherCostsMonthlyRaw(e.target.value)}
                aria-label="Other costs per month"
                placeholder="0"
                disabled={!includeTaxesCosts}
              />
            </LabeledField>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Extra payments"
          description="Optional extra principal payments to pay off sooner."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LabeledField label="Extra monthly" hint="per month">
            <Input
              inputMode="decimal"
              value={extraMonthlyRaw}
              onChange={(e) => setExtraMonthlyRaw(e.target.value)}
              aria-label="Extra monthly payment"
              placeholder="0"
            />
          </LabeledField>

          <LabeledField label="Extra yearly" hint="once per year">
            <Input
              inputMode="decimal"
              value={extraYearlyRaw}
              onChange={(e) => setExtraYearlyRaw(e.target.value)}
              aria-label="Extra yearly payment"
              placeholder="0"
            />
          </LabeledField>

          <LabeledField label="Yearly month">
            <Select
              value={extraYearlyMonthIndex0}
              onChange={(e) =>
                setExtraYearlyMonthIndex0(Number(e.target.value))
              }
              aria-label="Extra yearly month"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {monthShortName(i)}
                </option>
              ))}
            </Select>
          </LabeledField>

          <LabeledField label="Yearly starts">
            <Input
              inputMode="numeric"
              value={extraYearlyStartYearRaw}
              onChange={(e) => setExtraYearlyStartYearRaw(e.target.value)}
              aria-label="Extra yearly start year"
            />
          </LabeledField>

          <LabeledField label="One-time extra" hint="single payment">
            <Input
              inputMode="decimal"
              value={extraOneTimeRaw}
              onChange={(e) => setExtraOneTimeRaw(e.target.value)}
              aria-label="One time extra payment"
              placeholder="0"
            />
          </LabeledField>

          <LabeledField label="One-time date">
            <div className="flex gap-2">
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
              <Input
                inputMode="numeric"
                value={extraOneTimeYearRaw}
                onChange={(e) => setExtraOneTimeYearRaw(e.target.value)}
                aria-label="One time extra year"
              />
            </div>
          </LabeledField>
        </div>
      </div>
    </div>
  );
}
