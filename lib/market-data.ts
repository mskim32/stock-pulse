import type { DataSource, MonthlySeries, SearchItem, SeriesPoint } from "./types";
import { fetchDaily, fetchMonthly, searchSymbols } from "./yahoo";
import { mockDaily, mockSeries } from "./mock";

/**
 * Single entry point for price data. Tries Yahoo first, caches in memory and
 * falls back to deterministic mock data so the UI never goes blank.
 * Step 2 swaps the Yahoo calls for reads from SQLite/Supabase.
 */

const MONTHLY_TTL = 6 * 3600_000;
const DAILY_TTL = 30 * 60_000;
const OUTAGE_BACKOFF = 60_000;

const useMock = () => process.env.USE_MOCK_DATA === "1";

type Entry<T> = { at: number; value: Promise<T> };
const cache = new Map<string, Entry<unknown>>();

function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = load();
  cache.set(key, { at: Date.now(), value });
  // Don't keep failed lookups around.
  value.catch(() => cache.delete(key));
  return value;
}

// After a network-level failure, skip Yahoo for a minute instead of timing out
// on every one of the ~50 tickers in a ranking request.
let yahooDownUntil = 0;

async function viaYahoo<T>(load: () => Promise<T>): Promise<T> {
  if (useMock()) throw new Error("mock mode");
  if (Date.now() < yahooDownUntil) throw new Error("yahoo backoff");
  try {
    return await load();
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    if (/fetch failed|ECONN|ENOTFOUND|ETIMEDOUT|429|Too Many/i.test(msg)) {
      yahooDownUntil = Date.now() + OUTAGE_BACKOFF;
    }
    throw err;
  }
}

export interface MonthlyResult extends MonthlySeries {
  source: DataSource;
}

export async function getMonthly(symbol: string, opts: { allowMock?: boolean } = {}): Promise<MonthlyResult> {
  const { allowMock = true } = opts;
  try {
    const series = await cached(`m:${symbol}`, MONTHLY_TTL, () => viaYahoo(() => fetchMonthly(symbol)));
    return { ...series, source: "yahoo" };
  } catch (err) {
    if (!allowMock) throw err;
    return { ...mockSeries(symbol), source: "mock" };
  }
}

export async function getDaily(
  symbol: string,
  year: number,
  month: number,
  fallback: { from: number; to: number },
): Promise<{ points: SeriesPoint[]; source: DataSource }> {
  try {
    const points = await cached(`d:${symbol}:${year}-${month}`, DAILY_TTL, () =>
      viaYahoo(() => fetchDaily(symbol, year, month)),
    );
    if (points.length) return { points, source: "yahoo" };
  } catch {
    /* fall through to mock */
  }
  return { points: mockDaily(symbol, year, month, fallback.from, fallback.to), source: "mock" };
}

export async function search(query: string): Promise<SearchItem[]> {
  try {
    return await cached(`s:${query.toLowerCase()}`, DAILY_TTL, () => viaYahoo(() => searchSymbols(query)));
  } catch {
    return [];
  }
}

/** Run async jobs with bounded concurrency (Yahoo rate-limits bursts). */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
