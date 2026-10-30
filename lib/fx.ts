import type { Candle, DataSource, MonthlySeries, SeriesPoint } from "./types";
import { FIRST_YEAR } from "./dates";
import { getDaily, getMonthly } from "./market-data";

/** Yahoo USD/KRW — units of KRW per 1 USD. */
export const USD_KRW_SYMBOL = "KRW=X";

export type FxRates = Map<string, number>;

export function needsKrwConversion(currency: string) {
  return currency.toUpperCase() !== "KRW";
}

/** Prefer exact month, else walk backward, else earliest known rate. */
export function rateAt(rates: FxRates, ym: string): number | null {
  if (rates.has(ym)) return rates.get(ym)!;
  let [y, m] = ym.split("-").map(Number);
  for (let i = 0; i < 24; i++) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (rates.has(key)) return rates.get(key)!;
  }
  const first = [...rates.entries()].sort(([a], [b]) => a.localeCompare(b))[0];
  return first?.[1] ?? null;
}

export async function getUsdKrwMonthly(): Promise<{ rates: FxRates; source: DataSource }> {
  const series = await getMonthly(USD_KRW_SYMBOL);
  const rates: FxRates = new Map();
  if (series.baseClose != null) rates.set(`${FIRST_YEAR - 1}-12`, series.baseClose);
  for (const bar of series.bars) rates.set(bar.time.slice(0, 7), bar.close);
  return { rates, source: series.source };
}

function convertCandle(bar: Candle, rate: number): Candle {
  return {
    ...bar,
    open: bar.open * rate,
    high: bar.high * rate,
    low: bar.low * rate,
    close: bar.close * rate,
  };
}

/** Convert a foreign-currency monthly series into KRW using that month's USD/KRW close. */
export function toKrwSeries(series: MonthlySeries, rates: FxRates): MonthlySeries {
  if (!needsKrwConversion(series.currency)) return series;

  const bars: Candle[] = [];
  for (const bar of series.bars) {
    const rate = rateAt(rates, bar.time.slice(0, 7));
    if (rate == null || !(rate > 0)) continue;
    bars.push(convertCandle(bar, rate));
  }

  const baseRate = rateAt(rates, `${FIRST_YEAR - 1}-12`) ?? (bars[0] ? rateAt(rates, bars[0].time.slice(0, 7)) : null);
  return {
    ...series,
    bars,
    currency: "KRW",
    baseClose: series.baseClose != null && baseRate != null ? series.baseClose * baseRate : null,
  };
}

/** Convert daily closes: prefer same-day FX, else that month's FX rate. */
export async function toKrwDaily(
  points: SeriesPoint[],
  year: number,
  month: number,
  monthRate: number | null,
): Promise<SeriesPoint[]> {
  if (!points.length) return points;
  let fxByDay = new Map<string, number>();
  try {
    const fx = await getDaily(USD_KRW_SYMBOL, year, month, {
      from: monthRate ?? 1300,
      to: monthRate ?? 1300,
    });
    for (const p of fx.points) fxByDay.set(p.time, p.value);
  } catch {
    fxByDay = new Map();
  }

  return points
    .map((p) => {
      const rate = fxByDay.get(p.time) ?? monthRate;
      if (rate == null || !(rate > 0)) return null;
      return { time: p.time, value: p.value * rate };
    })
    .filter((p): p is SeriesPoint => p != null);
}
