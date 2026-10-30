import type { NextRequest } from "next/server";
import { MARKETS, type Market, type Mover, type TopMoversResponse } from "@/lib/types";
import { UNIVERSE } from "@/lib/universe";
import type { MonthlySeries } from "@/lib/types";
import { getMonthly, mapLimit } from "@/lib/market-data";
import { mockSeries } from "@/lib/mock";
import { FIRST_YEAR, monthStart, nowYM, parseYM, prevYM, ymKey } from "@/lib/dates";
import { badRequest, json } from "@/lib/http";

// GET /api/top-movers?market=KOSPI&year=2024&month=3&limit=5
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const market = (params.get("market") ?? "KOSPI").toUpperCase() as Market;
  if (!MARKETS.includes(market)) return badRequest(`market must be one of ${MARKETS.join(", ")}`);
  const ym = parseYM(params);
  if (!ym) return badRequest("year/month must be between 2002-01 and the current month");
  const limit = Math.min(Math.max(Number(params.get("limit")) || 5, 1), 20);

  const universe = UNIVERSE[market];
  const settled = await mapLimit(universe, 6, (e) => getMonthly(e.symbol, { allowMock: false }));
  const live = settled.filter((r) => r.status === "fulfilled").length;

  // If Yahoo is entirely unreachable, rank mock data instead of returning an empty list.
  const source = live > 0 ? "yahoo" : "mock";
  const seriesFor = (i: number): MonthlySeries | null => {
    const r = settled[i];
    if (r.status === "fulfilled") return r.value;
    return source === "mock" ? mockSeries(universe[i].symbol) : null;
  };

  const ymStr = ymKey(ym.year, ym.month);
  const p = prevYM(ym.year, ym.month);
  const prevKey = monthStart(p.year, p.month);

  const ranked: Omit<Mover, "rank">[] = [];
  universe.forEach((entry, i) => {
    const series = seriesFor(i);
    if (!series) return;
    const idx = series.bars.findIndex((b) => b.time === `${ymStr}-01`);
    if (idx < 0) return;
    const bar = series.bars[idx];

    // Listing month: no previous close exists, so measure close vs. first-day open.
    const isNewListing = idx === 0 && series.listedYm === ymStr;
    let base: number | undefined;
    if (isNewListing) base = bar.open;
    else if (idx > 0 && series.bars[idx - 1].time === prevKey) base = series.bars[idx - 1].close;
    else if (idx === 0 && ymStr === `${FIRST_YEAR}-01`) base = series.baseClose ?? undefined;
    if (!base || !(base > 0)) return;

    ranked.push({
      symbol: entry.symbol,
      name: entry.name,
      returnPct: (bar.close / base - 1) * 100,
      close: bar.close,
      currency: series.currency,
      isNewListing,
    });
  });

  ranked.sort((a, b) => b.returnPct - a.returnPct);
  const body: TopMoversResponse = {
    market,
    year: ym.year,
    month: ym.month,
    items: ranked.slice(0, limit).map((m, i) => ({ ...m, rank: i + 1 })),
    universeSize: ranked.length,
    source,
  };
  const now = nowYM();
  const partial = ym.year === now.year && ym.month === now.month;
  return json(body, { immutable: !partial && source === "yahoo" });
}
