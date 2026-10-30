export type Market = "KOSPI" | "KOSDAQ" | "NASDAQ" | "CRYPTO";
export const MARKETS: Market[] = ["KOSPI", "KOSDAQ", "NASDAQ", "CRYPTO"];

/** Where a response's numbers came from. "mock" means Yahoo was unreachable or disabled. */
export type DataSource = "yahoo" | "mock";

/** One OHLC bar. `time` is "YYYY-MM-DD" (first day of the period for monthly/yearly bars). */
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SeriesPoint {
  time: string;
  value: number;
}

export interface Mover {
  rank: number;
  symbol: string;
  name: string;
  returnPct: number;
  close: number;
  currency: string;
  /** Listed this month: returnPct is close vs. first-day open, not vs. a previous close. */
  isNewListing: boolean;
}

/** Raw monthly series as loaded from Yahoo or mock. */
export interface MonthlySeries {
  bars: Candle[];
  currency: string;
  name?: string;
  /** "YYYY-MM" listing month when the stock listed in 2002 or later, else null. */
  listedYm: string | null;
  /** Close of 2001-12, used as the base for the January 2002 return. */
  baseClose: number | null;
}

export interface TopMoversResponse {
  market: Market;
  year: number;
  month: number;
  items: Mover[];
  /** How many tickers were ranked (the prototype ranks a curated universe, not the whole market). */
  universeSize: number;
  source: DataSource;
}

export interface FuturesResponse {
  symbol: string;
  name: string;
  year: number;
  month: number;
  close: number | null;
  prevClose: number | null;
  changePct: number | null;
  /** Display currency after FX conversion (KRW for overseas). */
  currency: string;
  /** Daily closes inside the selected month, for the mini chart. */
  daily: SeriesPoint[];
  /** True when the selected month is the current, still-running month. */
  partial: boolean;
  source: DataSource;
}

export interface HeatmapRow {
  year: number;
  /** Index 0 = January. null = no data for that month. */
  months: (number | null)[];
  yearReturn: number | null;
}

export interface StockHistoryResponse {
  symbol: string;
  name: string;
  currency: string;
  monthly: Candle[];
  yearly: Candle[];
  heatmap: HeatmapRow[];
  listedYm: string | null;
  source: DataSource;
}

export interface SearchItem {
  symbol: string;
  name: string;
  exchange: string;
}
