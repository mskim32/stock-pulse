import type { NextRequest } from "next/server";
import type { FuturesResponse } from "@/lib/types";
import { FUTURES_NAME, FUTURES_SYMBOL } from "@/lib/universe";
import { getDaily, getMonthly } from "@/lib/market-data";
import { getUsdKrwMonthly, rateAt, toKrwDaily } from "@/lib/fx";
import { monthStart, nowYM, parseYM, prevYM, ymKey } from "@/lib/dates";
import { badRequest, json } from "@/lib/http";

// GET /api/futures?year=2024&month=3
export async function GET(req: NextRequest) {
  const ym = parseYM(req.nextUrl.searchParams);
  if (!ym) return badRequest("year/month must be between 2002-01 and the current month");
  const { year, month } = ym;

  const series = await getMonthly(FUTURES_SYMBOL);
  const fx = await getUsdKrwMonthly();
  const prev = prevYM(year, month);
  const bar = series.bars.find((b) => b.time === monthStart(year, month));
  const prevBar = series.bars.find((b) => b.time === monthStart(prev.year, prev.month));

  const thisRate = rateAt(fx.rates, ymKey(year, month));
  const prevRate = rateAt(fx.rates, ymKey(prev.year, prev.month)) ?? thisRate;

  const closeUsd = bar?.close ?? null;
  const prevCloseUsd = prevBar?.close ?? bar?.open ?? null;
  const close = closeUsd != null && thisRate ? closeUsd * thisRate : null;
  const prevClose = prevCloseUsd != null && prevRate ? prevCloseUsd * prevRate : null;

  const dailyUsd = bar
    ? await getDaily(FUTURES_SYMBOL, year, month, { from: prevCloseUsd ?? bar.open, to: bar.close })
    : { points: [], source: series.source };
  const daily = await toKrwDaily(dailyUsd.points, year, month, thisRate);

  const now = nowYM();
  const body: FuturesResponse = {
    symbol: FUTURES_SYMBOL,
    name: FUTURES_NAME,
    year,
    month,
    close,
    prevClose,
    changePct: close != null && prevClose ? (close / prevClose - 1) * 100 : null,
    currency: "KRW",
    daily,
    partial: year === now.year && month === now.month,
    source:
      series.source === "mock" || dailyUsd.source === "mock" || fx.source === "mock" ? "mock" : "yahoo",
  };
  return json(body, { immutable: !body.partial && body.source === "yahoo" });
}
