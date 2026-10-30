import YahooFinance from "yahoo-finance2";
import type { Candle, MonthlySeries, SearchItem, SeriesPoint } from "./types";
import { FIRST_YEAR } from "./dates";

const yf = new YahooFinance();

/** Shift a Yahoo timestamp into the exchange's local time, then take the calendar date. */
function localDate(date: Date, gmtoffset: number) {
  return new Date(date.getTime() + gmtoffset * 1000).toISOString().slice(0, 10);
}

export async function fetchMonthly(symbol: string): Promise<MonthlySeries> {
  const res = await yf.chart(symbol, { period1: `${FIRST_YEAR - 1}-12-01`, interval: "1mo" });
  const offset = res.meta.gmtoffset ?? 0;

  // Yahoo sometimes returns an extra mid-month row for the running month;
  // keying by YYYY-MM keeps only the latest row per month.
  const byMonth = new Map<string, Candle>();
  let baseClose: number | null = null;
  for (const q of res.quotes) {
    if (q.close == null || q.open == null || q.high == null || q.low == null) continue;
    const ym = localDate(q.date, offset).slice(0, 7);
    if (Number(ym.slice(0, 4)) < FIRST_YEAR) {
      baseClose = q.close;
      continue;
    }
    byMonth.set(ym, {
      time: `${ym}-01`,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume ?? undefined,
    });
  }

  const bars = [...byMonth.values()].sort((a, b) => a.time.localeCompare(b.time));
  return {
    bars,
    currency: res.meta.currency ?? "USD",
    name: res.meta.longName ?? res.meta.shortName,
    listedYm: detectListing(bars, baseClose, res.meta.firstTradeDate, offset),
    baseClose,
  };
}

/**
 * The listing month is the first bar's month when Yahoo's firstTradeDate falls in it
 * (or, if firstTradeDate is missing, when there is no pre-2002 history at all).
 * Caveat: firstTradeDate is the start of Yahoo's coverage, which for some KRX names
 * is later than the real listing date. The Step 2 pipeline replaces this with KRX data.
 */
function detectListing(bars: Candle[], baseClose: number | null, firstTrade: Date | null, offset: number) {
  const first = bars[0]?.time.slice(0, 7);
  if (!first) return null;
  if (firstTrade) return localDate(firstTrade, offset).slice(0, 7) === first ? first : null;
  return baseClose == null ? first : null;
}

export async function fetchDaily(symbol: string, year: number, month: number): Promise<SeriesPoint[]> {
  const period1 = new Date(Date.UTC(year, month - 1, 1));
  const period2 = new Date(Date.UTC(year, month, 1));
  const res = await yf.chart(symbol, { period1, period2, interval: "1d" });
  const offset = res.meta.gmtoffset ?? 0;
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const byDay = new Map<string, number>();
  for (const q of res.quotes) {
    if (q.close == null) continue;
    const day = localDate(q.date, offset);
    if (day.startsWith(prefix)) byDay.set(day, q.close);
  }
  return [...byDay].sort(([a], [b]) => a.localeCompare(b)).map(([time, value]) => ({ time, value }));
}

const SEARCH_TYPES = new Set(["EQUITY", "ETF", "FUTURE", "INDEX"]);

export async function searchSymbols(query: string): Promise<SearchItem[]> {
  const res = await yf.search(query, { quotesCount: 10, newsCount: 0 });
  const items: SearchItem[] = [];
  for (const q of res.quotes) {
    if (!("isYahooFinance" in q) || !q.isYahooFinance) continue;
    if (!SEARCH_TYPES.has(String(q.quoteType))) continue;
    items.push({
      symbol: q.symbol,
      name: String(q.longname ?? q.shortname ?? q.symbol),
      exchange: String(q.exchDisp ?? q.exchange),
    });
  }
  return items;
}
