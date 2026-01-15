import { useMemo, useState } from 'react';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  formatCurrency,
  formatInteger,
  formatMonthYear,
  formatPercent,
} from '../lib/format';
import { calculateMortgage } from '../lib/mortgage';
import type { AmortizationRow } from '../lib/mortgage';
import { parseMortgageInputs } from '../lib/parseMortgageInputs';
import { useMortgageStore } from '../store/mortgageStore';

import { Select } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

function formatDelta(value: number, format: (n: number) => string): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${format(value)}`;
}

function monthSerial(
  row: Pick<AmortizationRow, 'monthIndex0' | 'year'>,
): number {
  return row.year * 12 + row.monthIndex0;
}

function formatMoneyMaybe(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return formatCurrency(value);
}

function formatPercentMaybe(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return formatPercent(value);
}

function getEventSerials(schedule: AmortizationRow[]): Set<number> {
  const serials = new Set<number>();
  for (let i = 0; i < schedule.length; i += 1) {
    const row = schedule[i];
    const prev = i > 0 ? schedule[i - 1] : null;
    const isPayoff = i === schedule.length - 1;
    const isFirst = i === 0;
    const scheduledChanged =
      Boolean(prev) &&
      Math.abs(row.scheduledMonthlyPI - prev!.scheduledMonthlyPI) > 0.005;
    const extraChanged =
      Boolean(prev) &&
      Math.abs(row.extraPrincipal - prev!.extraPrincipal) > 0.005;

    if (
      isFirst ||
      isPayoff ||
      row.isRateChangeMonth ||
      scheduledChanged ||
      extraChanged
    ) {
      serials.add(monthSerial(row));
    }
  }
  return serials;
}

function buildRowTags(args: {
  row: AmortizationRow | null;
  prevRow: AmortizationRow | null;
  isPayoff: boolean;
  isFirst: boolean;
}): string[] {
  const tags: string[] = [];
  const { row, prevRow, isPayoff, isFirst } = args;

  if (!row) return tags;
  if (isFirst) tags.push('Start');
  if (row.isRateChangeMonth) tags.push('ARM reset');

  if (prevRow) {
    if (Math.abs(row.scheduledMonthlyPI - prevRow.scheduledMonthlyPI) > 0.005) {
      tags.push('Recast');
    }
    if (Math.abs(row.extraPrincipal - prevRow.extraPrincipal) > 0.005) {
      tags.push('Extra changed');
    }
  }

  if (isPayoff) tags.push('Payoff');
  return tags;
}

function totalMonthlyOutflow(args: {
  row: Pick<AmortizationRow, 'paymentPI' | 'extraPrincipal'>;
  monthlyTaxesCosts: number;
}): number {
  return args.row.paymentPI + args.row.extraPrincipal + args.monthlyTaxesCosts;
}

function clampArrayCount<T>(arr: T[], count: number): T[] {
  if (count <= 0) return [];
  return arr.slice(0, Math.min(count, arr.length));
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

function findMax<T>(
  items: T[],
  getValue: (t: T) => number,
): {
  item: T | null;
  value: number;
} {
  let best: T | null = null;
  let bestValue = -Infinity;
  for (const it of items) {
    const v = getValue(it);
    if (!Number.isFinite(v)) continue;
    if (v > bestValue) {
      bestValue = v;
      best = it;
    }
  }
  return { item: best, value: Number.isFinite(bestValue) ? bestValue : 0 };
}

function findMin<T>(
  items: T[],
  getValue: (t: T) => number,
): {
  item: T | null;
  value: number;
} {
  let best: T | null = null;
  let bestValue = Infinity;
  for (const it of items) {
    const v = getValue(it);
    if (!Number.isFinite(v)) continue;
    if (v < bestValue) {
      bestValue = v;
      best = it;
    }
  }
  return { item: best, value: Number.isFinite(bestValue) ? bestValue : 0 };
}

type RiskSummary = {
  minTotal: { value: number; monthIndex0: number; year: number } | null;
  maxTotal: { value: number; monthIndex0: number; year: number } | null;
  maxRate: { value: number; monthIndex0: number; year: number } | null;
  firstResetJump: {
    deltaTotal: number;
    deltaPI: number;
    monthIndex0: number;
    year: number;
  } | null;
};

function buildRiskSummary(args: {
  schedule: AmortizationRow[];
  monthlyTaxesCosts: number;
}): RiskSummary {
  const { schedule, monthlyTaxesCosts } = args;
  if (!schedule.length) {
    return {
      minTotal: null,
      maxTotal: null,
      maxRate: null,
      firstResetJump: null,
    };
  }

  const totals = schedule.map((r) => ({
    r,
    v: totalMonthlyOutflow({ row: r, monthlyTaxesCosts }),
  }));
  const minTotal = findMin(totals, (x) => x.v);
  const maxTotal = findMax(totals, (x) => x.v);

  const maxRateRow = findMax(schedule, (r) => r.annualRatePercent);

  const firstResetIndex = schedule.findIndex((r) => r.isRateChangeMonth);
  const firstResetJump = (() => {
    if (firstResetIndex <= 0) return null;
    const prev = schedule[firstResetIndex - 1];
    const row = schedule[firstResetIndex];
    return {
      deltaTotal:
        totalMonthlyOutflow({ row, monthlyTaxesCosts }) -
        totalMonthlyOutflow({ row: prev, monthlyTaxesCosts }),
      deltaPI: row.paymentPI - prev.paymentPI,
      monthIndex0: row.monthIndex0,
      year: row.year,
    };
  })();

  return {
    minTotal: minTotal.item
      ? {
          value: minTotal.value,
          monthIndex0: minTotal.item.r.monthIndex0,
          year: minTotal.item.r.year,
        }
      : null,
    maxTotal: maxTotal.item
      ? {
          value: maxTotal.value,
          monthIndex0: maxTotal.item.r.monthIndex0,
          year: maxTotal.item.r.year,
        }
      : null,
    maxRate: maxRateRow.item
      ? {
          value: maxRateRow.value,
          monthIndex0: maxRateRow.item.monthIndex0,
          year: maxRateRow.item.year,
        }
      : null,
    firstResetJump,
  };
}

type PaymentChartPoint = {
  serial: number;
  monthIndex0: number;
  year: number;
  label: string;

  aTotal: number | null;
  bTotal: number | null;
  aPI: number | null;
  bPI: number | null;

  aReset: boolean;
  bReset: boolean;
};

function buildPaymentSeries(args: {
  scheduleA: AmortizationRow[];
  scheduleB: AmortizationRow[];
  monthlyTaxesCostsA: number;
  monthlyTaxesCostsB: number;
}): PaymentChartPoint[] {
  const { scheduleA, scheduleB, monthlyTaxesCostsA, monthlyTaxesCostsB } = args;

  const mapA = new Map<number, AmortizationRow>();
  const mapB = new Map<number, AmortizationRow>();
  for (const r of scheduleA) mapA.set(monthSerial(r), r);
  for (const r of scheduleB) mapB.set(monthSerial(r), r);

  const serials = [...new Set<number>([...mapA.keys(), ...mapB.keys()])].sort(
    (x, y) => x - y,
  );

  return serials.map((serial) => {
    const monthIndex0 = ((serial % 12) + 12) % 12;
    const year = Math.floor(serial / 12);
    const a = mapA.get(serial) ?? null;
    const b = mapB.get(serial) ?? null;

    return {
      serial,
      monthIndex0,
      year,
      label: formatMonthYear(monthIndex0, year),

      aTotal: a
        ? totalMonthlyOutflow({ row: a, monthlyTaxesCosts: monthlyTaxesCostsA })
        : null,
      bTotal: b
        ? totalMonthlyOutflow({ row: b, monthlyTaxesCosts: monthlyTaxesCostsB })
        : null,
      aPI: a ? a.paymentPI : null,
      bPI: b ? b.paymentPI : null,

      aReset: Boolean(a?.isRateChangeMonth),
      bReset: Boolean(b?.isRateChangeMonth),
    };
  });
}

function ChartDot(props: {
  cx?: number;
  cy?: number;
  payload?: PaymentChartPoint;
  dataKey?: string;
}) {
  const { cx, cy, payload, dataKey } = props;
  if (!payload || typeof cx !== 'number' || typeof cy !== 'number') return null;

  const isA = dataKey === 'aTotal' || dataKey === 'aPI';
  const isReset = isA ? payload.aReset : payload.bReset;
  if (!isReset) return null;

  const fill = isA ? '#0284c7' : '#a21caf';

  return (
    <circle cx={cx} cy={cy} r={4} fill={fill} stroke="white" strokeWidth={2} />
  );
}

function deltaClass(value: number): string {
  if (!Number.isFinite(value) || value === 0)
    return 'text-slate-700 dark:text-slate-200';
  return value < 0
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-rose-700 dark:text-rose-300';
}

function pickWinnerLabel(args: {
  a: number;
  b: number;
  lowerIsBetter?: boolean;
}): 'A' | 'B' | 'Tie' {
  const { a, b } = args;
  const lowerIsBetter = args.lowerIsBetter ?? true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Tie';
  if (Math.abs(a - b) < 0.01) return 'Tie';
  if (lowerIsBetter) return a < b ? 'A' : 'B';
  return a > b ? 'A' : 'B';
}

function InsightCard(props: {
  title: string;
  subtitle?: string;
  a: string;
  b: string;
  delta: string;
  deltaValueForColor: number;
  winner?: 'A' | 'B' | 'Tie';
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
            {props.title}
          </div>
          {props.subtitle ? (
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {props.subtitle}
            </div>
          ) : null}
        </div>

        {props.winner && props.winner !== 'Tie' ? (
          <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200">
            Winner: {props.winner}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            A
          </div>
          <div className="mt-1 font-extrabold text-slate-900 dark:text-slate-50">
            {props.a}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            B
          </div>
          <div className="mt-1 font-extrabold text-slate-900 dark:text-slate-50">
            {props.b}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Δ (B - A)
          </div>
          <div
            className={
              'mt-1 font-extrabold ' + deltaClass(props.deltaValueForColor)
            }
          >
            {props.delta}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScenarioComparisonDetailsSection() {
  const scenarios = useMortgageStore((s) => s.scenarios);

  const [scenarioAId, setScenarioAId] = useState('');
  const [scenarioBId, setScenarioBId] = useState('');
  const [showAllMonths, setShowAllMonths] = useState(false);

  const effectiveIds = useMemo(() => {
    const validIds = new Set(scenarios.map((s) => s.id));
    const first = scenarios[0]?.id ?? '';
    const second = scenarios[1]?.id ?? '';

    const a = validIds.has(scenarioAId) ? scenarioAId : first;
    const bCandidate = validIds.has(scenarioBId) ? scenarioBId : second;
    const b = bCandidate && bCandidate !== a ? bCandidate : second;

    return { a, b };
  }, [scenarioAId, scenarioBId, scenarios]);

  const scenarioA = useMemo(
    () => scenarios.find((s) => s.id === effectiveIds.a) ?? null,
    [effectiveIds.a, scenarios],
  );

  const scenarioB = useMemo(
    () => scenarios.find((s) => s.id === effectiveIds.b) ?? null,
    [effectiveIds.b, scenarios],
  );

  const calcA = useMemo(() => {
    if (!scenarioA) return null;
    const inputs = parseMortgageInputs(scenarioA.inputs);
    const calc = calculateMortgage(inputs);
    const monthlyTaxesCosts = inputs.includeTaxesCosts
      ? calc.summary.monthlyTaxesCosts
      : 0;
    const totalMonthlyPayment =
      calc.summary.scheduledMonthlyPI + monthlyTaxesCosts;
    return { inputs, calc, monthlyTaxesCosts, totalMonthlyPayment };
  }, [scenarioA]);

  const calcB = useMemo(() => {
    if (!scenarioB) return null;
    const inputs = parseMortgageInputs(scenarioB.inputs);
    const calc = calculateMortgage(inputs);
    const monthlyTaxesCosts = inputs.includeTaxesCosts
      ? calc.summary.monthlyTaxesCosts
      : 0;
    const totalMonthlyPayment =
      calc.summary.scheduledMonthlyPI + monthlyTaxesCosts;
    return { inputs, calc, monthlyTaxesCosts, totalMonthlyPayment };
  }, [scenarioB]);

  const insights = useMemo(() => {
    if (!calcA || !calcB) return null;

    const scheduleA = calcA.calc.schedule;
    const scheduleB = calcB.calc.schedule;

    const aFirst = scheduleA[0] ?? null;
    const bFirst = scheduleB[0] ?? null;
    const aFirstTotal = aFirst
      ? totalMonthlyOutflow({
          row: aFirst,
          monthlyTaxesCosts: calcA.monthlyTaxesCosts,
        })
      : 0;
    const bFirstTotal = bFirst
      ? totalMonthlyOutflow({
          row: bFirst,
          monthlyTaxesCosts: calcB.monthlyTaxesCosts,
        })
      : 0;

    const aFirst12 = clampArrayCount(scheduleA, 12).map((r) =>
      totalMonthlyOutflow({
        row: r,
        monthlyTaxesCosts: calcA.monthlyTaxesCosts,
      }),
    );
    const bFirst12 = clampArrayCount(scheduleB, 12).map((r) =>
      totalMonthlyOutflow({
        row: r,
        monthlyTaxesCosts: calcB.monthlyTaxesCosts,
      }),
    );
    const aAvg12 = avg(aFirst12);
    const bAvg12 = avg(bFirst12);

    const riskA = buildRiskSummary({
      schedule: scheduleA,
      monthlyTaxesCosts: calcA.monthlyTaxesCosts,
    });
    const riskB = buildRiskSummary({
      schedule: scheduleB,
      monthlyTaxesCosts: calcB.monthlyTaxesCosts,
    });

    const series = buildPaymentSeries({
      scheduleA,
      scheduleB,
      monthlyTaxesCostsA: calcA.monthlyTaxesCosts,
      monthlyTaxesCostsB: calcB.monthlyTaxesCosts,
    });

    return {
      aFirstTotal,
      bFirstTotal,
      aAvg12,
      bAvg12,
      riskA,
      riskB,
      series,
    };
  }, [calcA, calcB]);

  const scheduleRows = useMemo(() => {
    if (!calcA || !calcB)
      return [] as Array<{
        serial: number;
        monthIndex0: number;
        year: number;
        a: {
          row: AmortizationRow | null;
          prevRow: AmortizationRow | null;
          isPayoff: boolean;
          isFirst: boolean;
          tags: string[];
        };
        b: {
          row: AmortizationRow | null;
          prevRow: AmortizationRow | null;
          isPayoff: boolean;
          isFirst: boolean;
          tags: string[];
        };
        anyTag: boolean;
      }>;

    const scheduleA = calcA.calc.schedule;
    const scheduleB = calcB.calc.schedule;

    const mapA = new Map<
      number,
      {
        row: AmortizationRow;
        prevRow: AmortizationRow | null;
        isPayoff: boolean;
        isFirst: boolean;
      }
    >();
    for (let i = 0; i < scheduleA.length; i += 1) {
      const row = scheduleA[i];
      mapA.set(monthSerial(row), {
        row,
        prevRow: i > 0 ? scheduleA[i - 1] : null,
        isPayoff: i === scheduleA.length - 1,
        isFirst: i === 0,
      });
    }

    const mapB = new Map<
      number,
      {
        row: AmortizationRow;
        prevRow: AmortizationRow | null;
        isPayoff: boolean;
        isFirst: boolean;
      }
    >();
    for (let i = 0; i < scheduleB.length; i += 1) {
      const row = scheduleB[i];
      mapB.set(monthSerial(row), {
        row,
        prevRow: i > 0 ? scheduleB[i - 1] : null,
        isPayoff: i === scheduleB.length - 1,
        isFirst: i === 0,
      });
    }

    const serials = new Set<number>();
    if (showAllMonths) {
      for (const s of mapA.keys()) serials.add(s);
      for (const s of mapB.keys()) serials.add(s);
    } else {
      for (const s of getEventSerials(scheduleA)) serials.add(s);
      for (const s of getEventSerials(scheduleB)) serials.add(s);
    }

    const sortedSerials = [...serials.values()].sort((x, y) => x - y);

    return sortedSerials.map((serial) => {
      const a = mapA.get(serial) ?? null;
      const b = mapB.get(serial) ?? null;

      const monthIndex0 = ((serial % 12) + 12) % 12;
      const year = Math.floor(serial / 12);

      const aTags = buildRowTags({
        row: a?.row ?? null,
        prevRow: a?.prevRow ?? null,
        isPayoff: a?.isPayoff ?? false,
        isFirst: a?.isFirst ?? false,
      });

      const bTags = buildRowTags({
        row: b?.row ?? null,
        prevRow: b?.prevRow ?? null,
        isPayoff: b?.isPayoff ?? false,
        isFirst: b?.isFirst ?? false,
      });

      const tags = [...new Set([...aTags, ...bTags])];

      return {
        serial,
        monthIndex0,
        year,
        a: {
          row: a?.row ?? null,
          prevRow: a?.prevRow ?? null,
          isPayoff: a?.isPayoff ?? false,
          isFirst: a?.isFirst ?? false,
          tags: aTags,
        },
        b: {
          row: b?.row ?? null,
          prevRow: b?.prevRow ?? null,
          isPayoff: b?.isPayoff ?? false,
          isFirst: b?.isFirst ?? false,
          tags: bTags,
        },
        anyTag: tags.length > 0,
      };
    });
  }, [calcA, calcB, showAllMonths]);

  return (
    <div className="max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Compare scenarios"
        description="Pick two saved scenarios (A vs B) and compare the key metrics side-by-side."
      />

      {scenarios.length >= 2 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Scenario A
            </div>
            <Select
              value={effectiveIds.a}
              onChange={(e) => setScenarioAId(e.target.value)}
              aria-label="Select scenario A"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Scenario B
            </div>
            <Select
              value={effectiveIds.b}
              onChange={(e) => setScenarioBId(e.target.value)}
              aria-label="Select scenario B"
            >
              {scenarios
                .filter((s) => s.id !== effectiveIds.a)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Save at least two scenarios above to compare.
        </div>
      )}

      {calcA && calcB ? (
        <div className="mt-5 space-y-4">
          {insights ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <InsightCard
                title="First payment (total)"
                subtitle="P&I + extra + taxes/costs"
                a={formatCurrency(insights.aFirstTotal)}
                b={formatCurrency(insights.bFirstTotal)}
                delta={formatDelta(
                  insights.bFirstTotal - insights.aFirstTotal,
                  formatCurrency,
                )}
                deltaValueForColor={insights.bFirstTotal - insights.aFirstTotal}
                winner={pickWinnerLabel({
                  a: insights.aFirstTotal,
                  b: insights.bFirstTotal,
                })}
              />

              <InsightCard
                title="Avg monthly (first 12 months)"
                subtitle="Good for ‘how it feels’ year one"
                a={formatCurrency(insights.aAvg12)}
                b={formatCurrency(insights.bAvg12)}
                delta={formatDelta(
                  insights.bAvg12 - insights.aAvg12,
                  formatCurrency,
                )}
                deltaValueForColor={insights.bAvg12 - insights.aAvg12}
                winner={pickWinnerLabel({
                  a: insights.aAvg12,
                  b: insights.bAvg12,
                })}
              />

              <InsightCard
                title="Total interest"
                subtitle="Lower is better"
                a={formatCurrency(calcA.calc.summary.totalInterest)}
                b={formatCurrency(calcB.calc.summary.totalInterest)}
                delta={formatDelta(
                  calcB.calc.summary.totalInterest -
                    calcA.calc.summary.totalInterest,
                  formatCurrency,
                )}
                deltaValueForColor={
                  calcB.calc.summary.totalInterest -
                  calcA.calc.summary.totalInterest
                }
                winner={pickWinnerLabel({
                  a: calcA.calc.summary.totalInterest,
                  b: calcB.calc.summary.totalInterest,
                })}
              />
            </div>
          ) : null}

          {insights ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <SectionHeader
                title="Payment over time"
                description="Total payment (P&I + extra + taxes/costs). ARM reset months are marked with dots."
              />

              <div className="mt-4 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={insights.series}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />

                    <XAxis
                      dataKey="label"
                      minTickGap={28}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => formatCurrency(Number(v))}
                      width={84}
                    />
                    <Tooltip
                      formatter={(value: unknown, name) => {
                        const n = typeof value === 'number' ? value : null;
                        const key = typeof name === 'string' ? name : '';
                        const label =
                          key === 'aTotal'
                            ? 'A total'
                            : key === 'bTotal'
                              ? 'B total'
                              : key || 'Value';
                        return [formatMoneyMaybe(n), label];
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="aTotal"
                      name="A total"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={<ChartDot />}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="bTotal"
                      name="B total"
                      stroke="#a21caf"
                      strokeWidth={2.5}
                      dot={<ChartDot />}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                Tip: A reset dot means the interest rate changed that month and
                the payment may have been recast.
              </div>
            </div>
          ) : null}

          {insights ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <SectionHeader
                title="Risk & variability"
                description="Highlights the payment/rate ranges that tend to drive fixed vs ARM decisions."
              />

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {(
                  [
                    { label: 'A', risk: insights.riskA },
                    { label: 'B', risk: insights.riskB },
                  ] as const
                ).map((x) => (
                  <div
                    key={x.label}
                    className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                      Scenario {x.label}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-600 dark:text-slate-300">
                          Min total month
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-50">
                          {x.risk.minTotal
                            ? `${formatCurrency(x.risk.minTotal.value)} · ${formatMonthYear(
                                x.risk.minTotal.monthIndex0,
                                x.risk.minTotal.year,
                              )}`
                            : '—'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-600 dark:text-slate-300">
                          Max total month
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-50">
                          {x.risk.maxTotal
                            ? `${formatCurrency(x.risk.maxTotal.value)} · ${formatMonthYear(
                                x.risk.maxTotal.monthIndex0,
                                x.risk.maxTotal.year,
                              )}`
                            : '—'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-600 dark:text-slate-300">
                          Max rate
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-50">
                          {x.risk.maxRate
                            ? `${formatPercent(x.risk.maxRate.value)} · ${formatMonthYear(
                                x.risk.maxRate.monthIndex0,
                                x.risk.maxRate.year,
                              )}`
                            : '—'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-600 dark:text-slate-300">
                          First reset jump
                        </div>
                        <div className="text-right font-extrabold text-slate-900 dark:text-slate-50">
                          {x.risk.firstResetJump ? (
                            <>
                              <div
                                className={deltaClass(
                                  x.risk.firstResetJump.deltaTotal,
                                )}
                              >
                                {formatDelta(
                                  x.risk.firstResetJump.deltaTotal,
                                  formatCurrency,
                                )}{' '}
                                total
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                {formatMonthYear(
                                  x.risk.firstResetJump.monthIndex0,
                                  x.risk.firstResetJump.year,
                                )}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="w-full max-w-full overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2 whitespace-nowrap">Metric</th>
                  <th className="px-3 py-2 whitespace-nowrap">A</th>
                  <th className="px-3 py-2 whitespace-nowrap">B</th>
                  <th className="px-3 py-2 whitespace-nowrap">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    Total monthly payment
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcA.totalMonthlyPayment)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcB.totalMonthlyPayment)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDelta(
                      calcB.totalMonthlyPayment - calcA.totalMonthlyPayment,
                      formatCurrency,
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    Scheduled P&amp;I
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcA.calc.summary.scheduledMonthlyPI)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcB.calc.summary.scheduledMonthlyPI)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDelta(
                      calcB.calc.summary.scheduledMonthlyPI -
                        calcA.calc.summary.scheduledMonthlyPI,
                      formatCurrency,
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    Payoff date
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatMonthYear(
                      calcA.calc.summary.payoffMonthIndex0,
                      calcA.calc.summary.payoffYear,
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatMonthYear(
                      calcB.calc.summary.payoffMonthIndex0,
                      calcB.calc.summary.payoffYear,
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDelta(
                      calcB.calc.summary.monthsToPayoff -
                        calcA.calc.summary.monthsToPayoff,
                      formatInteger,
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    Total interest
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcA.calc.summary.totalInterest)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcB.calc.summary.totalInterest)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDelta(
                      calcB.calc.summary.totalInterest -
                        calcA.calc.summary.totalInterest,
                      formatCurrency,
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    Total out-of-pocket
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcA.calc.summary.totalOutOfPocket)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatCurrency(calcB.calc.summary.totalOutOfPocket)}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {formatDelta(
                      calcB.calc.summary.totalOutOfPocket -
                        calcA.calc.summary.totalOutOfPocket,
                      formatCurrency,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SectionHeader
              title="Schedule comparison"
              description={
                showAllMonths
                  ? 'Showing every month (minimal details).'
                  : 'Showing event months only: ARM resets, recasts, extra changes, and payoff.'
              }
              right={
                <button
                  type="button"
                  onClick={() => setShowAllMonths((v) => !v)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                >
                  {showAllMonths ? 'Show event months' : 'Show all months'}
                </button>
              }
            />

            <div className="mt-4 w-full max-w-full overflow-x-auto overscroll-x-contain">
              <table className="min-w-[1120px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap">Month</th>
                    <th className="px-3 py-2 whitespace-nowrap">Event</th>
                    <th className="px-3 py-2 whitespace-nowrap">A rate</th>
                    <th className="px-3 py-2 whitespace-nowrap">A P&amp;I</th>
                    <th className="px-3 py-2 whitespace-nowrap">A extra</th>
                    <th className="px-3 py-2 whitespace-nowrap">A balance</th>
                    <th className="px-3 py-2 whitespace-nowrap">B rate</th>
                    <th className="px-3 py-2 whitespace-nowrap">B P&amp;I</th>
                    <th className="px-3 py-2 whitespace-nowrap">B extra</th>
                    <th className="px-3 py-2 whitespace-nowrap">B balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {scheduleRows.map((r) => {
                    const aRow = r.a.row;
                    const bRow = r.b.row;
                    const eventText = (() => {
                      const merged = [...new Set([...r.a.tags, ...r.b.tags])];
                      return merged.length ? merged.join(' • ') : '—';
                    })();

                    const highlight = !showAllMonths && eventText !== '—';

                    return (
                      <tr
                        key={r.serial}
                        className={
                          highlight
                            ? 'bg-sky-50/60 hover:bg-sky-50 dark:bg-sky-950/30 dark:hover:bg-sky-950/35'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                      >
                        <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatMonthYear(r.monthIndex0, r.year)}
                        </td>

                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {eventText}
                        </td>

                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatPercentMaybe(aRow?.annualRatePercent)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(aRow?.scheduledMonthlyPI)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(aRow?.extraPrincipal)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(aRow?.balance)}
                        </td>

                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatPercentMaybe(bRow?.annualRatePercent)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(bRow?.scheduledMonthlyPI)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(bRow?.extraPrincipal)}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatMoneyMaybe(bRow?.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
