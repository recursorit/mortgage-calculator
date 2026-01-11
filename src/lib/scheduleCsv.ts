import { formatMonthYear } from './format';
import type { AmortizationRow } from './mortgage';

function csvEscape(value: string): string {
  return /[\n\r",]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function createScheduleCsv(
  rows: AmortizationRow[],
  monthlyTaxesCosts: number,
): string {
  const header = [
    'LoanYear',
    'PaymentNumber',
    'Date',
    'TotalPayment',
    'PI',
    'ExtraPrincipal',
    'TaxesCosts',
    'Interest',
    'PrincipalPaid',
    'Balance',
  ];

  const lines = rows.map((r) => {
    const loanYear = Math.floor((r.index - 1) / 12) + 1;
    const date = formatMonthYear(r.monthIndex0, r.year);
    const taxes = monthlyTaxesCosts;
    const principalPaid = r.principal + r.extraPrincipal;
    const totalPayment = r.totalToLender + taxes;

    const num = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '0.00');

    return [
      String(loanYear),
      String(r.index),
      csvEscape(date),
      num(totalPayment),
      num(r.paymentPI),
      num(r.extraPrincipal),
      num(taxes),
      num(r.interest),
      num(principalPaid),
      num(r.balance),
    ].join(',');
  });

  return [header.join(','), ...lines].join('\r\n');
}
