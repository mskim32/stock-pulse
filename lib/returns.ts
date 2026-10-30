import type { Candle, HeatmapRow } from "./types";

const ym = (time: string) => time.slice(0, 7);

/**
 * Month-over-month % return keyed by "YYYY-MM".
 * The first bar is measured against `baseClose` (Dec 2001 close) when there is one,
 * otherwise against its own open — which is the listing-month return for new listings.
 */
export function monthlyReturns(bars: Candle[], baseClose: number | null = null): Map<string, number> {
  const out = new Map<string, number>();
  bars.forEach((bar, i) => {
    const base = i === 0 ? (baseClose ?? bar.open) : bars[i - 1].close;
    if (base > 0) out.set(ym(bar.time), (bar.close / base - 1) * 100);
  });
  return out;
}

/** Aggregate monthly candles into yearly candles. */
export function toYearly(bars: Candle[]): Candle[] {
  const years = new Map<string, Candle>();
  for (const bar of bars) {
    const y = bar.time.slice(0, 4);
    const cur = years.get(y);
    if (!cur) {
      years.set(y, { ...bar, time: `${y}-01-01` });
    } else {
      cur.high = Math.max(cur.high, bar.high);
      cur.low = Math.min(cur.low, bar.low);
      cur.close = bar.close;
      cur.volume = (cur.volume ?? 0) + (bar.volume ?? 0);
    }
  }
  return [...years.values()];
}

/** Year x month return matrix, newest year first. */
export function buildHeatmap(bars: Candle[], baseClose: number | null = null): HeatmapRow[] {
  const returns = monthlyReturns(bars, baseClose);
  const yearly = toYearly(bars);
  return yearly
    .map((yc, i) => {
      const year = Number(yc.time.slice(0, 4));
      const months = Array.from({ length: 12 }, (_, m) => {
        const v = returns.get(`${year}-${String(m + 1).padStart(2, "0")}`);
        return v === undefined ? null : v;
      });
      const base = i === 0 ? (baseClose ?? yc.open) : yearly[i - 1].close;
      return { year, months, yearReturn: base > 0 ? (yc.close / base - 1) * 100 : null };
    })
    .reverse();
}
