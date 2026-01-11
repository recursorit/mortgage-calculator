import { useMemo, useState } from 'react';
import './App.css';
import {
  formatCurrency,
  formatInteger,
  formatMonthYear,
  formatPercent,
  monthShortName,
} from './lib/format';
import {
  calculateMortgage,
  type DownPaymentType,
  type MortgageInputs,
} from './lib/mortgage';

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

function LabeledField(props: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-slate-900">
          {props.label}
        </label>
        {props.hint ? (
          <span className="text-xs text-slate-500">{props.hint}</span>
        ) : null}
      </div>
      {props.children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ' +
        'transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 ' +
        (props.className ?? '')
      }
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ' +
        'transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 ' +
        (props.className ?? '')
      }
    />
  );
}

function Toggle(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      className={
        'flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm transition ' +
        (props.checked
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white hover:bg-slate-50')
      }
    >
      <span className="text-sm font-semibold text-slate-900">
        {props.label}
      </span>
      <span
        className={
          'relative inline-flex h-6 w-11 flex-none items-center rounded-full transition ' +
          (props.checked ? 'bg-emerald-500' : 'bg-slate-300')
        }
      >
        <span
          className={
            'inline-block h-5 w-5 rounded-full bg-white shadow transition ' +
            (props.checked ? 'translate-x-5' : 'translate-x-1')
          }
        />
      </span>
    </button>
  );
}

function StatCard(props: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: 'sky' | 'violet' | 'emerald' | 'amber';
}) {
  const accent = props.accent ?? 'sky';
  const accents: Record<NonNullable<typeof props.accent>, string> = {
    sky: 'from-sky-500 to-cyan-500',
    violet: 'from-violet-500 to-fuchsia-500',
    emerald: 'from-emerald-500 to-lime-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        aria-hidden="true"
        className={
          'pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br opacity-20 ' +
          accents[accent]
        }
      />
      <div className="relative space-y-1">
        <div className="text-sm font-semibold text-slate-600">
          {props.title}
        </div>
        <div className="text-3xl font-black tracking-tight text-slate-900">
          {props.value}
        </div>
        {props.subtitle ? (
          <div className="text-sm text-slate-600">{props.subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeader(props: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-1 text-sm text-slate-600">{props.description}</p>
        ) : null}
      </div>
      {props.right ? <div className="print:hidden">{props.right}</div> : null}
    </div>
  );
}

function PrintButton(props: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
    >
      <span
        className="h-2 w-2 rounded-full bg-emerald-400"
        aria-hidden="true"
      />
      Print / Share
    </button>
  );
}

const App = () => {
  const [homePriceRaw, setHomePriceRaw] = useState('0');
  const [downPaymentType, setDownPaymentType] =
    useState<DownPaymentType>('percent');
  const [downPaymentRaw, setDownPaymentRaw] = useState('0');
  const [loanTermYearsRaw, setLoanTermYearsRaw] = useState('0');
  const [interestRateRaw, setInterestRateRaw] = useState('0');

  const [startMonthIndex0, setStartMonthIndex0] = useState(0);
  const [startYearRaw, setStartYearRaw] = useState(String(currentYear));

  const [includeTaxesCosts, setIncludeTaxesCosts] = useState(false);
  const [propertyTaxAnnualRaw, setPropertyTaxAnnualRaw] = useState('0');
  const [homeInsuranceAnnualRaw, setHomeInsuranceAnnualRaw] = useState('0');
  const [pmiMonthlyRaw, setPmiMonthlyRaw] = useState('0');
  const [hoaMonthlyRaw, setHoaMonthlyRaw] = useState('0');
  const [otherCostsMonthlyRaw, setOtherCostsMonthlyRaw] = useState('0');

  const [extraMonthlyRaw, setExtraMonthlyRaw] = useState('0');
  const [extraYearlyRaw, setExtraYearlyRaw] = useState('0');
  const [extraYearlyMonthIndex0, setExtraYearlyMonthIndex0] = useState(0);
  const [extraYearlyStartYearRaw, setExtraYearlyStartYearRaw] = useState(
    String(currentYear + 1),
  );

  const [extraOneTimeRaw, setExtraOneTimeRaw] = useState('0');
  const [extraOneTimeMonthIndex0, setExtraOneTimeMonthIndex0] = useState(0);
  const [extraOneTimeYearRaw, setExtraOneTimeYearRaw] = useState(
    String(currentYear),
  );

  const [scheduleJumpYear, setScheduleJumpYear] = useState(1);

  const inputs: MortgageInputs = useMemo(
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

  const calc = useMemo(() => calculateMortgage(inputs), [inputs]);
  const { summary, schedule } = calc;

  const monthlyTaxesCosts = inputs.includeTaxesCosts
    ? summary.monthlyTaxesCosts
    : 0;

  const totalMonthlyPayment = summary.scheduledMonthlyPI + monthlyTaxesCosts;

  const payoffText = formatMonthYear(
    summary.payoffMonthIndex0,
    summary.payoffYear,
  );
  const payoffDurationYears = Math.floor(summary.monthsToPayoff / 12);
  const payoffDurationMonths = summary.monthsToPayoff % 12;

  const topRows = schedule.slice(0, 12);
  const remainingBalance = schedule.length
    ? schedule[schedule.length - 1].balance
    : 0;

  const topTotals = topRows.reduce(
    (acc, r) => {
      const totalPayment = r.totalToLender + monthlyTaxesCosts;
      return {
        pi: acc.pi + r.paymentPI,
        extra: acc.extra + r.extraPrincipal,
        interest: acc.interest + r.interest,
        principal: acc.principal + r.principal + r.extraPrincipal,
        taxesCosts: acc.taxesCosts + monthlyTaxesCosts,
        totalPayment: acc.totalPayment + totalPayment,
      };
    },
    {
      pi: 0,
      extra: 0,
      interest: 0,
      principal: 0,
      taxesCosts: 0,
      totalPayment: 0,
    },
  );

  const loanYearGroups = useMemo(() => {
    type LoanYearTotals = {
      pi: number;
      extra: number;
      interest: number;
      principal: number;
      taxesCosts: number;
      totalPayment: number;
    };

    type LoanYearGroup = {
      loanYear: number;
      startLabel: string;
      endLabel: string;
      startBalance: number;
      endBalance: number;
      rows: typeof schedule;
      totals: LoanYearTotals;
    };

    if (!schedule.length) return [] as LoanYearGroup[];

    const groups = new Map<number, LoanYearGroup>();

    for (const row of schedule) {
      const loanYear = Math.floor((row.index - 1) / 12) + 1;
      const existing = groups.get(loanYear);
      const rowLabel = formatMonthYear(row.monthIndex0, row.year);

      if (!existing) {
        const startBalance =
          row.index === 1
            ? summary.loanAmount
            : (schedule[row.index - 2]?.balance ?? summary.loanAmount);

        const totals: LoanYearTotals = {
          pi: row.paymentPI,
          extra: row.extraPrincipal,
          interest: row.interest,
          principal: row.principal + row.extraPrincipal,
          taxesCosts: monthlyTaxesCosts,
          totalPayment: row.totalToLender + monthlyTaxesCosts,
        };

        groups.set(loanYear, {
          loanYear,
          startLabel: rowLabel,
          endLabel: rowLabel,
          startBalance,
          endBalance: row.balance,
          rows: [row],
          totals,
        });
        continue;
      }

      existing.endLabel = rowLabel;
      existing.endBalance = row.balance;
      existing.rows.push(row);
      existing.totals.pi += row.paymentPI;
      existing.totals.extra += row.extraPrincipal;
      existing.totals.interest += row.interest;
      existing.totals.principal += row.principal + row.extraPrincipal;
      existing.totals.taxesCosts += monthlyTaxesCosts;
      existing.totals.totalPayment += row.totalToLender + monthlyTaxesCosts;
    }

    return Array.from(groups.values()).sort((a, b) => a.loanYear - b.loanYear);
  }, [monthlyTaxesCosts, schedule, summary.loanAmount]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.14),transparent_55%),linear-gradient(to_bottom,#ffffff,#f8fafc)]">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur print:border-0 print:bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500" />
              <div>
                <div className="text-xl font-black tracking-tight text-slate-900">
                  Mortgage Calculator
                </div>
                <div className="text-sm text-slate-600">
                  Bright, shareable estimates with print-ready output.
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <PrintButton onClick={() => window.print()} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8 print:hidden">
            <div className="space-y-6">
              <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
                        placeholder={
                          downPaymentType === 'percent' ? '20' : '150000'
                        }
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
                      onChange={(e) =>
                        setStartMonthIndex0(Number(e.target.value))
                      }
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
                      'grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition ' +
                      (includeTaxesCosts ? '' : 'opacity-50')
                    }
                    aria-disabled={!includeTaxesCosts}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <LabeledField label="Property tax" hint="per year">
                        <Input
                          inputMode="decimal"
                          value={propertyTaxAnnualRaw}
                          onChange={(e) =>
                            setPropertyTaxAnnualRaw(e.target.value)
                          }
                          aria-label="Property taxes per year"
                          disabled={!includeTaxesCosts}
                        />
                      </LabeledField>
                      <LabeledField label="Home insurance" hint="per year">
                        <Input
                          inputMode="decimal"
                          value={homeInsuranceAnnualRaw}
                          onChange={(e) =>
                            setHomeInsuranceAnnualRaw(e.target.value)
                          }
                          aria-label="Home insurance per year"
                          disabled={!includeTaxesCosts}
                        />
                      </LabeledField>
                      <LabeledField label="PMI" hint="per month">
                        <Input
                          inputMode="decimal"
                          value={pmiMonthlyRaw}
                          onChange={(e) => setPmiMonthlyRaw(e.target.value)}
                          aria-label="PMI per month"
                          disabled={!includeTaxesCosts}
                        />
                      </LabeledField>
                      <LabeledField label="HOA" hint="per month">
                        <Input
                          inputMode="decimal"
                          value={hoaMonthlyRaw}
                          onChange={(e) => setHoaMonthlyRaw(e.target.value)}
                          aria-label="HOA per month"
                          disabled={!includeTaxesCosts}
                        />
                      </LabeledField>
                      <LabeledField label="Other costs" hint="per month">
                        <Input
                          inputMode="decimal"
                          value={otherCostsMonthlyRaw}
                          onChange={(e) =>
                            setOtherCostsMonthlyRaw(e.target.value)
                          }
                          aria-label="Other costs per month"
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
                      />
                    </LabeledField>

                    <LabeledField label="Extra yearly" hint="once per year">
                      <Input
                        inputMode="decimal"
                        value={extraYearlyRaw}
                        onChange={(e) => setExtraYearlyRaw(e.target.value)}
                        aria-label="Extra yearly payment"
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
                        onChange={(e) =>
                          setExtraYearlyStartYearRaw(e.target.value)
                        }
                        aria-label="Extra yearly start year"
                      />
                    </LabeledField>

                    <LabeledField label="One-time extra" hint="single payment">
                      <Input
                        inputMode="decimal"
                        value={extraOneTimeRaw}
                        onChange={(e) => setExtraOneTimeRaw(e.target.value)}
                        aria-label="One time extra payment"
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
                          onChange={(e) =>
                            setExtraOneTimeYearRaw(e.target.value)
                          }
                          aria-label="One time extra year"
                        />
                      </div>
                    </LabeledField>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Cost summary"
                  description="Totals over the payoff period."
                  right={<PrintButton onClick={() => window.print()} />}
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Total to lender
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">
                      {formatCurrency(summary.totalToLender)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Total interest
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">
                      {formatCurrency(summary.totalInterest)}
                    </div>
                  </div>

                  {inputs.includeTaxesCosts ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        Taxes & costs
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">
                        {formatCurrency(summary.totalTaxesCosts)}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Total out-of-pocket
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">
                      {formatCurrency(summary.totalOutOfPocket)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900">
                    Rate & term
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <div className="flex justify-between gap-3">
                      <span>Interest rate</span>
                      <span className="font-semibold">
                        {formatPercent(summary.annualRatePercent, 3)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Term</span>
                      <span className="font-semibold">
                        {formatInteger(summary.termMonths)} months
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 sm:col-span-2">
                      <span>Remaining balance</span>
                      <span className="font-semibold">
                        {schedule.length
                          ? formatCurrency(remainingBalance)
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-4">
            <div className="grid gap-4">
              <StatCard
                title="Monthly payment"
                value={formatCurrency(totalMonthlyPayment)}
                subtitle={
                  inputs.includeTaxesCosts
                    ? `${formatCurrency(summary.scheduledMonthlyPI)} P&I + ${formatCurrency(summary.monthlyTaxesCosts)} taxes/costs`
                    : `${formatCurrency(summary.scheduledMonthlyPI)} principal & interest`
                }
                accent="sky"
              />
              <StatCard
                title="Loan amount"
                value={formatCurrency(summary.loanAmount)}
                subtitle={`${formatPercent(summary.downPaymentPercent, 2)} down (${formatCurrency(summary.downPaymentAmount)})`}
                accent="violet"
              />
              <StatCard
                title="Payoff"
                value={payoffText}
                subtitle={`In ${formatInteger(payoffDurationYears)} years ${formatInteger(payoffDurationMonths)} months`}
                accent="emerald"
              />
              <StatCard
                title="Interest saved"
                value={formatCurrency(summary.interestSaved)}
                subtitle={`${formatInteger(summary.monthsSaved)} months sooner vs. no extra payments`}
                accent="amber"
              />
            </div>
          </section>

          <section className="lg:col-span-12">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Full schedule"
                description="Payments grouped by loan year (Year 1 = first 12 payments)."
                right={
                  loanYearGroups.length ? (
                    <div className="w-56">
                      <Select
                        value={scheduleJumpYear}
                        onChange={(e) => {
                          const year = Number(e.target.value);
                          setScheduleJumpYear(year);
                          document
                            .getElementById(`loan-year-${year}`)
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                        }}
                        aria-label="Jump to loan year"
                      >
                        {loanYearGroups.map((g) => (
                          <option key={g.loanYear} value={g.loanYear}>
                            Year {g.loanYear}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null
                }
              />

              {loanYearGroups.length ? (
                <div className="mt-4 space-y-3">
                  {loanYearGroups.map((g) => (
                    <details
                      key={g.loanYear}
                      className="rounded-2xl border border-slate-200 bg-white"
                      open
                    >
                      <summary
                        id={`loan-year-${g.loanYear}`}
                        className="cursor-pointer list-none px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">
                              Year {g.loanYear}
                            </div>
                            <div className="text-xs text-slate-600">
                              {g.startLabel} – {g.endLabel} • {g.rows.length}{' '}
                              payments
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 sm:flex sm:items-center sm:gap-6">
                            <div>
                              <div className="font-bold uppercase tracking-wide">
                                Total
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(g.totals.totalPayment)}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold uppercase tracking-wide">
                                Interest
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(g.totals.interest)}
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="font-bold uppercase tracking-wide">
                                Start bal
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(g.startBalance)}
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="font-bold uppercase tracking-wide">
                                End bal
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                {formatCurrency(g.endBalance)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-slate-200">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
                              <tr>
                                <th className="px-3 py-2">Month</th>
                                <th className="px-3 py-2">Total</th>
                                <th className="px-3 py-2 hidden md:table-cell">
                                  P&amp;I
                                </th>
                                <th className="px-3 py-2 hidden md:table-cell">
                                  Extra
                                </th>
                                <th className="px-3 py-2 hidden md:table-cell">
                                  Taxes/costs
                                </th>
                                <th className="px-3 py-2 hidden lg:table-cell">
                                  Interest
                                </th>
                                <th className="px-3 py-2 hidden lg:table-cell">
                                  Principal
                                </th>
                                <th className="px-3 py-2">Balance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {g.rows.map((r) => (
                                <tr key={r.index} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-semibold text-slate-900">
                                    {formatMonthYear(r.monthIndex0, r.year)}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">
                                    {formatCurrency(
                                      r.totalToLender + monthlyTaxesCosts,
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 hidden md:table-cell">
                                    {formatCurrency(r.paymentPI)}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 hidden md:table-cell">
                                    {formatCurrency(r.extraPrincipal)}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 hidden md:table-cell">
                                    {monthlyTaxesCosts
                                      ? formatCurrency(monthlyTaxesCosts)
                                      : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 hidden lg:table-cell">
                                    {formatCurrency(r.interest)}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 hidden lg:table-cell">
                                    {formatCurrency(
                                      r.principal + r.extraPrincipal,
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">
                                    {formatCurrency(r.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-slate-50 text-sm">
                              <tr>
                                <td className="px-3 py-2 font-extrabold text-slate-900">
                                  Total
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900">
                                  {formatCurrency(g.totals.totalPayment)}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900 hidden md:table-cell">
                                  {formatCurrency(g.totals.pi)}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900 hidden md:table-cell">
                                  {formatCurrency(g.totals.extra)}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900 hidden md:table-cell">
                                  {g.totals.taxesCosts
                                    ? formatCurrency(g.totals.taxesCosts)
                                    : '—'}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900 hidden lg:table-cell">
                                  {formatCurrency(g.totals.interest)}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900 hidden lg:table-cell">
                                  {formatCurrency(g.totals.principal)}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900">
                                  {formatCurrency(g.endBalance)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                  Enter values to generate a full schedule.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Print-only report */}
        <section className="hidden print:block">
          <div className="mt-0 rounded-none border-0 bg-white p-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-slate-900">
                  Mortgage Summary
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Generated {new Date().toLocaleDateString()} • Start{' '}
                  {formatMonthYear(inputs.startMonthIndex0, inputs.startYear)}
                </div>
              </div>
              <div className="text-right text-sm text-slate-600">
                <div className="font-semibold text-slate-900">Inputs</div>
                <div>Home price: {formatCurrency(summary.homePrice)}</div>
                <div>
                  Down: {formatCurrency(summary.downPaymentAmount)} (
                  {formatPercent(summary.downPaymentPercent, 2)})
                </div>
                <div>
                  Rate: {formatPercent(summary.annualRatePercent, 3)} • Term:{' '}
                  {formatInteger(summary.termMonths)} mo
                </div>
              </div>
            </div>

            <div
              className="mt-5 grid gap-3"
              style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
            >
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Monthly
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  {formatCurrency(totalMonthlyPayment)}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {formatCurrency(summary.scheduledMonthlyPI)} P&I
                  {inputs.includeTaxesCosts
                    ? ` + ${formatCurrency(summary.monthlyTaxesCosts)} taxes/costs`
                    : ''}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Payoff
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  {payoffText}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {formatInteger(payoffDurationYears)}y{' '}
                  {formatInteger(payoffDurationMonths)}m
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Savings
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900">
                  {formatCurrency(summary.interestSaved)}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {formatInteger(summary.monthsSaved)} months sooner
                </div>
              </div>
            </div>

            <div
              className="mt-6 grid gap-4"
              style={{ gridTemplateColumns: '1.1fr 0.9fr' }}
            >
              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-sm font-extrabold text-slate-900">
                    Totals
                  </div>
                </div>
                <div className="px-4 py-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Total to lender</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(summary.totalToLender)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Total interest</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(summary.totalInterest)}
                    </span>
                  </div>
                  {inputs.includeTaxesCosts ? (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Taxes & costs</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(summary.totalTaxesCosts)}
                      </span>
                    </div>
                  ) : null}
                  <div className="my-2 h-px bg-slate-200" />
                  <div className="flex justify-between py-1">
                    <span className="text-slate-900 font-extrabold">
                      Total out-of-pocket
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(summary.totalOutOfPocket)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-sm font-extrabold text-slate-900">
                    Extra payments
                  </div>
                </div>
                <div className="px-4 py-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Extra monthly</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(inputs.extraMonthly)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Extra yearly</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(inputs.extraYearly)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Yearly month</span>
                    <span className="font-bold text-slate-900">
                      {monthShortName(inputs.extraYearlyMonthIndex0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">One-time extra</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(inputs.extraOneTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm font-extrabold text-slate-900">
                  Amortization (first 12 months)
                </div>
              </div>
              <div className="px-4 py-3">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="py-2">Month</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">P&amp;I</th>
                      <th className="py-2">Extra</th>
                      <th className="py-2">Taxes/costs</th>
                      <th className="py-2">Interest</th>
                      <th className="py-2">Principal</th>
                      <th className="py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="border-t border-slate-200">
                    {topRows.map((r) => (
                      <tr key={r.index} className="border-b border-slate-100">
                        <td className="py-2 font-semibold text-slate-900">
                          {formatMonthYear(r.monthIndex0, r.year)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.totalToLender + monthlyTaxesCosts)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.paymentPI)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.extraPrincipal)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {monthlyTaxesCosts
                            ? formatCurrency(monthlyTaxesCosts)
                            : '—'}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.interest)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.principal + r.extraPrincipal)}
                        </td>
                        <td className="py-2 text-slate-700">
                          {formatCurrency(r.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {topRows.length ? (
                    <tfoot className="border-t border-slate-200">
                      <tr>
                        <td className="py-2 font-extrabold text-slate-900">
                          Total
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {formatCurrency(topTotals.totalPayment)}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {formatCurrency(topTotals.pi)}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {formatCurrency(topTotals.extra)}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {topTotals.taxesCosts
                            ? formatCurrency(topTotals.taxesCosts)
                            : '—'}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {formatCurrency(topTotals.interest)}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {formatCurrency(topTotals.principal)}
                        </td>
                        <td className="py-2 font-bold text-slate-900">
                          {topRows.length
                            ? formatCurrency(
                                topRows[topRows.length - 1].balance,
                              )
                            : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Numbers are estimates for planning and comparison.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
