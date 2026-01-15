import {
  IconCheck,
  IconChevronDown,
  IconDeviceFloppy,
  IconFolderCog,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const scenarios = useMortgageStore((s) => s.scenarios);
  const applyScenario = useMortgageStore((s) => s.applyScenario);
  const scenarioDraftName = useMortgageStore((s) => s.scenarioDraftName);
  const setScenarioDraftName = useMortgageStore((s) => s.setScenarioDraftName);

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

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerButtonRef = useRef<HTMLButtonElement | null>(null);
  const pickerMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPickerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
        pickerButtonRef.current?.focus();
      }
    };

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const btn = pickerButtonRef.current;
      const menu = pickerMenuRef.current;

      if (btn?.contains(target)) return;
      if (menu?.contains(target)) return;
      setIsPickerOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isPickerOpen]);

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
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="relative col-span-2 sm:col-span-1">
          <button
            ref={pickerButtonRef}
            type="button"
            onClick={() => setIsPickerOpen((v) => !v)}
            disabled={scenarios.length === 0}
            className={
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900 ' +
              (scenarios.length === 0
                ? 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'
                : 'border-slate-200 text-slate-900 hover:bg-slate-50 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800')
            }
            aria-haspopup="menu"
            aria-expanded={isPickerOpen}
            aria-label="Open saved scenarios"
          >
            Saved scenarios
            <IconChevronDown
              size={16}
              aria-hidden="true"
              className={
                'transition ' + (isPickerOpen ? 'rotate-180' : 'rotate-0')
              }
            />
          </button>

          {isPickerOpen ? (
            <div
              ref={pickerMenuRef}
              role="menu"
              aria-label="Saved scenarios"
              className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="max-h-72 overflow-auto p-1">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      applyScenario(s.id);
                      setIsPickerOpen(false);
                    }}
                    className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                    title={s.name}
                  >
                    <IconCheck
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
                      Apply
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                Picking one applies it to the calculator.
              </div>
            </div>
          ) : null}
        </div>

        <Link
          to="/scenarios"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
        >
          <IconFolderCog size={18} aria-hidden="true" />
          Manage
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Scenario name
          </div>
          <Input
            value={scenarioDraftName}
            onChange={(e) => setScenarioDraftName(e.target.value)}
            placeholder={suggested}
            aria-label="Scenario name"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const nextName = (scenarioDraftName || suggested).trim();
            saveScenario(nextName);
          }}
          className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
        >
          <IconDeviceFloppy size={18} aria-hidden="true" />
          Save scenario
        </button>
      </div>
    </div>
  );
}
