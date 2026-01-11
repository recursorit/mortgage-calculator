import { useMemo, useState } from 'react';

import { formatCurrency, formatInteger, formatMonthYear } from '../lib/format';
import { calculateMortgage } from '../lib/mortgage';
import { parseMortgageInputs } from '../lib/parseMortgageInputs';
import { useMortgageInputs } from '../hooks/useMortgageInputs';
import { useMortgageStore } from '../store/mortgageStore';

import { Select } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

function formatDelta(value: number, format: (n: number) => string): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${format(value)}`;
}

export function ScenarioComparisonDetailsSection() {
  const scenarios = useMortgageStore((s) => s.scenarios);

  const baselineInputs = useMortgageInputs();
  const baselineCalc = useMemo(
    () => calculateMortgage(baselineInputs),
    [baselineInputs],
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState('');

  const effectiveSelectedScenarioId = useMemo(() => {
    if (scenarios.some((s) => s.id === selectedScenarioId)) {
      return selectedScenarioId;
    }
    return scenarios[0]?.id ?? '';
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === effectiveSelectedScenarioId) ?? null,
    [effectiveSelectedScenarioId, scenarios],
  );

  const selectedCalc = useMemo(() => {
    if (!selectedScenario) return null;
    const inputs = parseMortgageInputs(selectedScenario.inputs);
    return { inputs, calc: calculateMortgage(inputs) };
  }, [selectedScenario]);

  const baselineMonthlyTaxesCosts = baselineInputs.includeTaxesCosts
    ? baselineCalc.summary.monthlyTaxesCosts
    : 0;
  const baselineTotalMonthlyPayment =
    baselineCalc.summary.scheduledMonthlyPI + baselineMonthlyTaxesCosts;

  const selectedMonthlyTaxesCosts = selectedCalc
    ? selectedCalc.inputs.includeTaxesCosts
      ? selectedCalc.calc.summary.monthlyTaxesCosts
      : 0
    : 0;
  const selectedTotalMonthlyPayment = selectedCalc
    ? selectedCalc.calc.summary.scheduledMonthlyPI + selectedMonthlyTaxesCosts
    : 0;

  return (
    <div className="max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Compare Scenario"
        description="Pick a saved scenario and compare it against your current calculator inputs."
      />

      {scenarios.length ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Scenario
            </div>
            <Select
              value={effectiveSelectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              aria-label="Select scenario to compare"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Save at least one scenario above to compare.
        </div>
      )}

      {selectedCalc ? (
        <div className="mt-5 w-full max-w-full overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Metric</th>
                <th className="px-3 py-2 whitespace-nowrap">Current</th>
                <th className="px-3 py-2 whitespace-nowrap">
                  {selectedScenario?.name ?? 'Scenario'}
                </th>
                <th className="px-3 py-2 whitespace-nowrap">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                  Total monthly payment
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(baselineTotalMonthlyPayment)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(selectedTotalMonthlyPayment)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatDelta(
                    selectedTotalMonthlyPayment - baselineTotalMonthlyPayment,
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
                    baselineCalc.summary.payoffMonthIndex0,
                    baselineCalc.summary.payoffYear,
                  )}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatMonthYear(
                    selectedCalc.calc.summary.payoffMonthIndex0,
                    selectedCalc.calc.summary.payoffYear,
                  )}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatDelta(
                    selectedCalc.calc.summary.monthsToPayoff -
                      baselineCalc.summary.monthsToPayoff,
                    formatInteger,
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                  Total interest
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(baselineCalc.summary.totalInterest)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(selectedCalc.calc.summary.totalInterest)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatDelta(
                    selectedCalc.calc.summary.totalInterest -
                      baselineCalc.summary.totalInterest,
                    formatCurrency,
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                  Total out-of-pocket
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(baselineCalc.summary.totalOutOfPocket)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatCurrency(selectedCalc.calc.summary.totalOutOfPocket)}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {formatDelta(
                    selectedCalc.calc.summary.totalOutOfPocket -
                      baselineCalc.summary.totalOutOfPocket,
                    formatCurrency,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
