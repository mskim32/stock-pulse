export const FIRST_YEAR = 2002;

const pad = (n: number) => String(n).padStart(2, "0");

export const ymKey = (year: number, month: number) => `${year}-${pad(month)}`;
export const monthStart = (year: number, month: number) => `${ymKey(year, month)}-01`;

/** Current year/month in KST, which is what a Korean user means by "this month". */
export function nowYM(): { year: number; month: number } {
  const kst = new Date(Date.now() + 9 * 3600_000);
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth() + 1 };
}

export function prevYM(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function nextYM(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export function isFutureYM(year: number, month: number) {
  const now = nowYM();
  return year > now.year || (year === now.year && month > now.month);
}

/** Parse and clamp ?year=&month= query params; defaults to the last completed month. */
export function parseYM(params: URLSearchParams) {
  const now = nowYM();
  const fallback = prevYM(now.year, now.month);
  const year = Number(params.get("year")) || fallback.year;
  const month = Number(params.get("month")) || fallback.month;
  if (year < FIRST_YEAR || month < 1 || month > 12 || isFutureYM(year, month)) return null;
  return { year, month };
}
