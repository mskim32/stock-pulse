import type { NextRequest } from "next/server";
import type { FuturesResponse } from "@/lib/types";
import { FUTURES_NAME, FUTURES_SYMBOL } from "@/lib/universe";
import { getDaily, getMonthly } from "@/lib/market-data";
import { monthStart, nowYM, parseYM, prevYM } from "@/lib/dates";
import { badRequest, json } from "@/lib/http";

// GET /api/futures?year=2024&month=3
export async function GET(req: NextRequest) {
  const ym = parseYM(req.nextUrl.searchParams);
  if (!ym) return badRequest("year/month must be between 2002-01 and the current month");
  const { year, month } = ym;

  const series = await getMonthly(FUTURES_SYMBOL);
  const prev = prevYM(year, month);
  const bar = series.bars.find((b) => b.time === monthStart(year, month));
  const prevBar = series.bars.find((b) => b.time === monthStart(prev.year, prev.month));

  const close = bar?.close ?? null;
  const prevClose = prevBar?.close ?? bar?.open ?? null;
  const daily = bar
    ? await getDaily(FUTURES_SYMBOL, year, month, { from: prevClose ?? bar.open, to: bar.close })
    : { points: [], source: series.source };

  const now = nowYM();
  const body: FuturesResponse = {
    symbol: FUTURES_SYMBOL,
    name: FUTURES_NAME,
    year,
    month,
    close,
    prevClose,
    changePct: close != null && prevClose ? (close / prevClose - 1) * 100 : null,
    daily: daily.points,
    partial: year === now.year && month === now.month,
    source: series.source === "mock" || daily.source === "mock" ? "mock" : "yahoo",
  };
  return json(body, { immutable: !body.partial && body.source === "yahoo" });
}
