import type { NextRequest } from "next/server";
import type { StockHistoryResponse } from "@/lib/types";
import { getMonthly } from "@/lib/market-data";
import { buildHeatmap, toYearly } from "@/lib/returns";
import { lookup } from "@/lib/universe";
import { badRequest, json } from "@/lib/http";

// GET /api/stock/005930.KS  → monthly + yearly candles and the year x month heatmap since 2002
export async function GET(_req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  if (!/^[A-Z0-9.=^-]{1,20}$/.test(symbol)) return badRequest("invalid symbol");

  const series = await getMonthly(symbol);
  const body: StockHistoryResponse = {
    symbol,
    name: lookup(symbol)?.name ?? series.name ?? symbol,
    currency: series.currency,
    monthly: series.bars,
    yearly: toYearly(series.bars),
    heatmap: buildHeatmap(series.bars, series.baseClose),
    listedYm: series.listedYm,
    source: series.source,
  };
  return json(body);
}
