import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useMortgageStore } from '../store/mortgageStore';

import { Input } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

function suggestScenarioName(args: {
  extraMonthlyRaw: string;
  extraYearlyRaw: string;
  extraOneTimeRaw: string;
}): string {
  const parts: string[] = [];

  const monthly = args.extraMonthlyRaw.trim();
  if (monthly) parts.push(`+$${monthly}/mo`);

  const yearly = args.extraYearlyRaw.trim();
  if (yearly) parts.push(`+$${yearly}/yr`);

  const oneTime = args.extraOneTimeRaw.trim();
  if (oneTime) parts.push(`+$${oneTime} once`);

  return parts.length ? parts.join(' ') : 'My scenario';
}

export function SaveScenarioCard(props: { className?: string }) {
  const saveScenario = useMortgageStore((s) => s.saveScenario);

  const extraMonthlyRaw = useMortgageStore((s) => s.extraMonthlyRaw);
  const extraYearlyRaw = useMortgageStore((s) => s.extraYearlyRaw);
  const extraOneTimeRaw = useMortgageStore((s) => s.extraOneTimeRaw);

  const suggested = useMemo(
    () =>
      suggestScenarioName({
        extraMonthlyRaw,
        extraYearlyRaw,
        extraOneTimeRaw,
      }),
    [extraMonthlyRaw, extraOneTimeRaw, extraYearlyRaw],
  );

  const [name, setName] = useState('');

  return (
    <div
      className={
        'max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900 ' +
        (props.className ?? '')
      }
    >
      <SectionHeader
        title="Save scenario"
        description="Save the current calculator inputs so you can compare later."
        right={
          <Link
            to="/scenarios"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
          >
            Open scenarios
          </Link>
        }
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-sm">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Scenario name
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={suggested}
            aria-label="Scenario name"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            saveScenario(name || suggested);
            setName('');
          }}
          className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:w-auto"
        >
          Save scenario
        </button>
      </div>
    </div>
  );
}
