import { useMemo, useState } from 'react';
import {
  IconCheck,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';

import { calculateMortgage } from '../lib/mortgage';
import { formatCurrency, formatInteger, formatMonthYear } from '../lib/format';
import { parseMortgageInputs } from '../lib/parseMortgageInputs';
import { useMortgageStore } from '../store/mortgageStore';

import { Input } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

function ScenarioRow(props: {
  id: string;
  name: string;
  onApply: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  summary: {
    totalMonthlyPayment: number;
    payoffMonthIndex0: number;
    payoffYear: number;
    totalInterest: number;
    totalOutOfPocket: number;
    interestSaved: number;
    monthsSaved: number;
  };
}) {
  const { summary } = props;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800">
      <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
        {props.name}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatCurrency(summary.totalMonthlyPayment)}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatMonthYear(summary.payoffMonthIndex0, summary.payoffYear)}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatCurrency(summary.totalInterest)}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatCurrency(summary.totalOutOfPocket)}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatCurrency(summary.interestSaved)}
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatInteger(summary.monthsSaved)}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={props.onApply}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
          >
            <IconCheck size={14} aria-hidden="true" />
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              const next = window.prompt('Rename scenario', props.name);
              if (next) props.onRename(next);
            }}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
          >
            <IconPencil size={14} aria-hidden="true" />
            Rename
          </button>
          <button
            type="button"
            onClick={props.onDelete}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 shadow-sm transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60 dark:focus:ring-rose-900/50"
          >
            <IconTrash size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ScenarioComparisonSection() {
  const scenarios = useMortgageStore((s) => s.scenarios);
  const saveScenario = useMortgageStore((s) => s.saveScenario);
  const applyScenario = useMortgageStore((s) => s.applyScenario);
  const deleteScenario = useMortgageStore((s) => s.deleteScenario);
  const renameScenario = useMortgageStore((s) => s.renameScenario);

  const [newName, setNewName] = useState('');

  const computed = useMemo(() => {
    return scenarios.map((s) => {
      const inputs = parseMortgageInputs(s.inputs);
      const { summary } = calculateMortgage(inputs);
      const monthlyTaxesCosts = inputs.includeTaxesCosts
        ? summary.monthlyTaxesCosts
        : 0;
      const totalMonthlyPayment =
        summary.scheduledMonthlyPI + monthlyTaxesCosts;

      return {
        id: s.id,
        name: s.name,
        metrics: {
          totalMonthlyPayment,
          payoffMonthIndex0: summary.payoffMonthIndex0,
          payoffYear: summary.payoffYear,
          totalInterest: summary.totalInterest,
          totalOutOfPocket: summary.totalOutOfPocket,
          interestSaved: summary.interestSaved,
          monthsSaved: summary.monthsSaved,
        },
      };
    });
  }, [scenarios]);

  return (
    <div className="max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Scenarios"
        description="Save and compare multiple mortgage setups side-by-side."
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-sm">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            New scenario name
          </div>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., +$200/mo extra"
            aria-label="New scenario name"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            saveScenario(newName);
            setNewName('');
          }}
          className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:w-auto"
        >
          <IconDeviceFloppy size={18} aria-hidden="true" />
          Save current
        </button>
      </div>

      {computed.length ? (
        <div className="mt-4 w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Scenario</th>
                <th className="px-3 py-2 whitespace-nowrap">Monthly</th>
                <th className="px-3 py-2 whitespace-nowrap">Payoff</th>
                <th className="px-3 py-2 whitespace-nowrap">Interest</th>
                <th className="px-3 py-2 whitespace-nowrap">Out-of-pocket</th>
                <th className="px-3 py-2 whitespace-nowrap">Interest saved</th>
                <th className="px-3 py-2 whitespace-nowrap">Months saved</th>
                <th className="px-3 py-2 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {computed.map((row) => (
                <ScenarioRow
                  key={row.id}
                  id={row.id}
                  name={row.name}
                  summary={row.metrics}
                  onApply={() => applyScenario(row.id)}
                  onDelete={() => deleteScenario(row.id)}
                  onRename={(name) => renameScenario(row.id, name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Save your first scenario to compare.
        </div>
      )}
    </div>
  );
}
