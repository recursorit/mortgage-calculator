export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, fractionDigits: number = 3): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Math.round(value),
  );
}

export function monthShortName(monthIndex0: number): string {
  const month = new Date(2000, monthIndex0, 1);
  return month.toLocaleString(undefined, { month: 'short' });
}

export function formatMonthYear(monthIndex0: number, year: number): string {
  return `${monthShortName(monthIndex0)} ${year}`;
}

export function addMonths(monthIndex0: number, year: number, deltaMonths: number): {
  monthIndex0: number;
  year: number;
} {
  const total = year * 12 + monthIndex0 + deltaMonths;
  const newYear = Math.floor(total / 12);
  const newMonth = total % 12;
  return { monthIndex0: newMonth, year: newYear };
}
