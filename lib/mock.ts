import type { Candle, MonthlySeries, SeriesPoint } from "./types";
import { FIRST_YEAR, monthStart, nowYM } from "./dates";
import { lookup, marketOf } from "./universe";

/**
 * Deterministic fake prices so the UI works offline or when Yahoo blocks requests.
 * Same symbol always produces the same series.
 */
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  return Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
}

/**
 * Approximate listing months of post-2002 IPOs in the universe, so mock data
 * exercises the "신규상장" path. Used for mock data only; live data detects listings from Yahoo.
 */
const MOCK_LISTED: Record<string, string> = {
  "373220.KS": "2022-01", "207940.KS": "2016-11", "018260.KS": "2014-11", "251270.KS": "2017-05",
  "267260.KS": "2017-05", "316140.KS": "2019-02", "329180.KS": "2021-09",
  "247540.KQ": "2019-03", "293490.KQ": "2020-09", "263750.KQ": "2017-09", "403870.KQ": "2022-07",
  "277810.KQ": "2021-02", "328130.KQ": "2022-07", "298380.KQ": "2018-12", "196170.KQ": "2014-12",
  META: "2012-05", TSLA: "2010-06", ABNB: "2020-12", CRWD: "2019-06", PDD: "2018-07",
  PYPL: "2015-07", AVGO: "2009-08", MELI: "2007-08", DXCM: "2005-04",
};

export function mockSeries(symbol: string): MonthlySeries {
  const listedYm = MOCK_LISTED[symbol] ?? null;
  const all = mockMonthly(symbol);
  const bars = listedYm ? all.filter((b) => b.time.slice(0, 7) >= listedYm) : all;
  return {
    bars,
    currency: marketOf(symbol) === "NASDAQ" || symbol.endsWith("=F") ? "USD" : "KRW",
    name: lookup(symbol)?.name,
    listedYm,
    // Pretend pre-2002 listings closed Dec 2001 at their Jan 2002 open.
    baseClose: listedYm ? null : all[0].open,
  };
}

export function mockMonthly(symbol: string): Candle[] {
  const rand = rng(hash(symbol));
  const korean = /\.(KS|KQ)$/.test(symbol);
  const vol = symbol.endsWith(".KQ") ? 0.16 : symbol === "NQ=F" ? 0.055 : 0.1;
  const drift = 0.006 + (rand() - 0.5) * 0.01;
  let price = symbol === "NQ=F" ? 1000 : korean ? 5000 + rand() * 60000 : 10 + rand() * 90;

  const { year: endY, month: endM } = nowYM();
  const bars: Candle[] = [];
  for (let y = FIRST_YEAR; y <= endY; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === endY && m > endM) break;
      const open = price;
      const close = Math.max(open * Math.exp(drift + vol * gaussian(rand)), 0.01);
      const high = Math.max(open, close) * (1 + rand() * vol * 0.6);
      const low = Math.min(open, close) * (1 - rand() * vol * 0.6);
      const round = (v: number) => (korean ? Math.round(v) : Math.round(v * 100) / 100);
      bars.push({ time: monthStart(y, m), open: round(open), high: round(high), low: round(low), close: round(close) });
      price = close;
    }
  }
  return bars;
}

/** ~21 trading-day closes that walk from the previous month's close to this month's close. */
export function mockDaily(symbol: string, year: number, month: number, from: number, to: number): SeriesPoint[] {
  const rand = rng(hash(`${symbol}:${year}-${month}`));
  const points: SeriesPoint[] = [];
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const tradingDays: number[] = [];
  for (let d = 1; d <= days; d++) {
    const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (dow !== 0 && dow !== 6) tradingDays.push(d);
  }
  tradingDays.forEach((d, i) => {
    const t = (i + 1) / tradingDays.length;
    const noise = i === tradingDays.length - 1 ? 0 : gaussian(rand) * 0.012 * from;
    points.push({
      time: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      value: Math.round((from + (to - from) * t + noise) * 100) / 100,
    });
  });
  return points;
}
