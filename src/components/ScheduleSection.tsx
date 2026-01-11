import { useState } from 'react';

import { formatCurrency, formatMonthYear } from '../lib/format';
import type { AmortizationRow } from '../lib/mortgage';
import { downloadBlobFile, downloadTextFile } from '../lib/download';
import { createScheduleCsv } from '../lib/scheduleCsv';
import { useMortgageStore } from '../store/mortgageStore';
import type { LoanYearGroup } from '../hooks/useLoanYearGroups';
import { useMortgageInputs } from '../hooks/useMortgageInputs';
import { calculateMortgage } from '../lib/mortgage';

import { Select } from './ui/FormControls';
import { SectionHeader } from './ui/SectionHeader';

export function ScheduleSection(props: {
  schedule: AmortizationRow[];
  loanYearGroups: LoanYearGroup[];
  monthlyTaxesCosts: number;
}) {
  const { schedule, loanYearGroups, monthlyTaxesCosts } = props;

  const [isPdfBusy, setIsPdfBusy] = useState(false);

  // Grab the same parsed inputs used by the app so the PDF matches.
  const inputs = useMortgageInputs();

  const scheduleJumpYear = useMortgageStore((s) => s.scheduleJumpYear);
  const setScheduleJumpYear = useMortgageStore((s) => s.setScheduleJumpYear);

  const scheduleJumpYearClamped = loanYearGroups.length
    ? Math.min(Math.max(1, scheduleJumpYear), loanYearGroups.length)
    : 1;

  const exportScheduleCsv = () => {
    if (!schedule.length) return;
    const csv = createScheduleCsv(schedule, monthlyTaxesCosts);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `mortgage-schedule-${dateStamp}.csv`,
      csv,
      'text/csv;charset=utf-8',
    );
  };

  const buildPdfData = () => {
    const generatedAtIso = new Date().toISOString();
    // Use an immediate calc so PDF doesn't lag behind if inputs are mid-deferred.
    const { summary } = calculateMortgage(inputs);
    const totalMonthlyPayment = summary.scheduledMonthlyPI + monthlyTaxesCosts;
    return {
      generatedAtIso,
      inputs,
      summary,
      loanYearGroups,
      monthlyTaxesCosts,
      totalMonthlyPayment,
    };
  };

  const exportPdf = async () => {
    if (!schedule.length) return;
    setIsPdfBusy(true);
    try {
      const { createMortgageReportPdfBlob } = await import('../lib/pdfReport');
      const blob = await createMortgageReportPdfBlob(buildPdfData());
      const dateStamp = new Date().toISOString().slice(0, 10);
      downloadBlobFile(`mortgage-report-${dateStamp}.pdf`, blob);
    } finally {
      setIsPdfBusy(false);
    }
  };

  const printPdf = async () => {
    if (!schedule.length) return;
    setIsPdfBusy(true);
    try {
      const { createMortgageReportPdfBlob, printPdfBlob } =
        await import('../lib/pdfReport');
      const blob = await createMortgageReportPdfBlob(buildPdfData());
      printPdfBlob(blob);
    } finally {
      setIsPdfBusy(false);
    }
  };

  return (
    <div className="max-w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <SectionHeader
        title="Full schedule"
        description="Payments grouped by loan year (Year 1 = first 12 payments)."
        right={
          loanYearGroups.length ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-56">
                <Select
                  value={scheduleJumpYearClamped}
                  onChange={(e) => {
                    const year = Number(e.target.value);
                    setScheduleJumpYear(year);
                    document
                      .getElementById(`loan-year-${year}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={exportScheduleCsv}
                  className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:w-auto"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={isPdfBusy}
                  className={
                    'inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:w-auto'
                  }
                >
                  {isPdfBusy ? 'Working…' : 'Export PDF'}
                </button>

                <button
                  type="button"
                  onClick={printPdf}
                  disabled={isPdfBusy}
                  className={
                    'col-span-2 inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:col-span-1 sm:w-auto'
                  }
                >
                  Print PDF
                </button>
              </div>
            </div>
          ) : null
        }
      />

      {loanYearGroups.length ? (
        <div className="mt-4 space-y-3">
          {loanYearGroups.map((g) => (
            <details
              key={g.loanYear}
              className="cv-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              open
            >
              <summary
                id={`loan-year-${g.loanYear}`}
                className="cursor-pointer list-none px-4 py-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                      Year {g.loanYear}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {g.startLabel} – {g.endLabel} • {g.rows.length} payments
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-300 sm:flex sm:items-center sm:gap-6">
                    <div>
                      <div className="font-bold uppercase tracking-wide">
                        Total
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                        {formatCurrency(g.totals.totalPayment)}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-wide">
                        Interest
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                        {formatCurrency(g.totals.interest)}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-bold uppercase tracking-wide">
                        Start bal
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                        {formatCurrency(g.startBalance)}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-bold uppercase tracking-wide">
                        End bal
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                        {formatCurrency(g.endBalance)}
                      </div>
                    </div>
                  </div>
                </div>
              </summary>

              <div className="border-t border-slate-200 dark:border-slate-800">
                {/* Contained horizontal scrolling: table scrolls, page doesn't */}
                <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain">
                  <table className="min-w-[920px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2 whitespace-nowrap">Month</th>
                        <th className="px-3 py-2 whitespace-nowrap">Total</th>
                        <th className="px-3 py-2 whitespace-nowrap">P&amp;I</th>
                        <th className="px-3 py-2 whitespace-nowrap">Extra</th>
                        <th className="px-3 py-2 whitespace-nowrap">
                          Taxes/costs
                        </th>
                        <th className="px-3 py-2 whitespace-nowrap">
                          Interest
                        </th>
                        <th className="px-3 py-2 whitespace-nowrap">
                          Principal
                        </th>
                        <th className="px-3 py-2 whitespace-nowrap">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {g.rows.map((r) => (
                        <tr
                          key={r.index}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                            {formatMonthYear(r.monthIndex0, r.year)}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(
                              r.totalToLender + monthlyTaxesCosts,
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(r.paymentPI)}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(r.extraPrincipal)}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {monthlyTaxesCosts
                              ? formatCurrency(monthlyTaxesCosts)
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(r.interest)}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(r.principal + r.extraPrincipal)}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {formatCurrency(r.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 text-sm dark:bg-slate-950/40">
                      <tr>
                        <td className="px-3 py-2 font-extrabold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          Total
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatCurrency(g.totals.totalPayment)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatCurrency(g.totals.pi)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatCurrency(g.totals.extra)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {g.totals.taxesCosts
                            ? formatCurrency(g.totals.taxesCosts)
                            : '—'}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatCurrency(g.totals.interest)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
                          {formatCurrency(g.totals.principal)}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
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
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
          Enter values to generate a full schedule.
        </div>
      )}
    </div>
  );
}
