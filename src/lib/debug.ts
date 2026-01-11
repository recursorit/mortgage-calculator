export function isDebugAuthEnabled(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('debugAuth') === '1') return true;
    return window.localStorage.getItem('mortgageCalculator:debugAuth') === '1';
  } catch {
    return false;
  }
}

export function debugAuthLog(
  ...args: Array<string | number | boolean | null | undefined | object>
): void {
  if (!isDebugAuthEnabled()) return;
  console.info('[debugAuth]', ...args);
}
