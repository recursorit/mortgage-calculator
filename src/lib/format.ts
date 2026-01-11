const currencyFormatters = new Map<string, Intl.NumberFormat>();
const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
const monthNames = Array.from({ length: 12 }).map((_, monthIndex0) =>
  monthFormatter.format(new Date(2000, monthIndex0, 1)),
);

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  const key = currency || 'USD';
  const existing = currencyFormatters.get(key);
  if (existing) return existing;

  const created = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: key,
    maximumFractionDigits: 2,
  });
  currencyFormatters.set(key, created);
  return created;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!Number.isFinite(amount)) return '—';
  return getCurrencyFormatter(currency).format(amount);
}

export function formatPercent(value: number, fractionDigits: number = 3): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return integerFormatter.format(Math.round(value));
}

export function monthShortName(monthIndex0: number): string {
  return monthNames[monthIndex0] ?? '';
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
