"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import type { StockHistoryResponse } from "@/lib/types";
import { useFetch } from "@/lib/use-fetch";
import { useFavorites } from "@/lib/favorites";
import { displayTicker, formatPct, formatPrice, toneClass } from "@/lib/format";
import { marketOf } from "@/lib/universe";
import { MARKET_LABEL } from "./MarketTabs";
import CandleChart from "./CandleChart";
import ReturnHeatmap from "./ReturnHeatmap";
import SourceBadge from "./SourceBadge";
import FavoriteButton from "./FavoriteButton";

type Timeframe = "monthly" | "yearly";

export default function StockDetail({ symbol }: { symbol: string }) {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const { data, error, loading } = useFetch<StockHistoryResponse>(`/api/stock/${encodeURIComponent(symbol)}`);
  const { rename } = useFavorites();

  useEffect(() => {
    if (data?.name) rename(symbol, data.name);
  }, [data?.name, rename, symbol]);

  const stats = useMemo(() => {
    if (!data || data.monthly.length < 2) return null;
    const first = data.monthly[0];
    const last = data.monthly[data.monthly.length - 1];
    const prev = data.monthly[data.monthly.length - 2];
    const years = data.monthly.length / 12;
    const total = last.close / first.open;
    const all = data.heatmap.flatMap((r) => r.months).filter((v): v is number => v != null);
    return {
      last,
      lastChange: (last.close / prev.close - 1) * 100,
      since: first.time.slice(0, 7),
      totalPct: (total - 1) * 100,
      cagr: (Math.pow(total, 1 / years) - 1) * 100,
      winRate: (all.filter((v) => v > 0).length / all.length) * 100,
    };
  }, [data]);

  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-20 flex items-center gap-2 bg-bg/90 px-2 pt-[env(safe-area-inset-top)] backdrop-blur">
        <button aria-label="뒤로" onClick={back} className="grid size-11 place-items-center rounded-full hover:bg-card">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 py-2">
          <h1 className="truncate text-base font-bold">{data?.name ?? displayTicker(symbol)}</h1>
          <p className="font-mono text-xs text-dim">
            {displayTicker(symbol)} · {MARKET_LABEL[marketOf(symbol)]}
            {data?.listedYm && ` · ${data.listedYm.replace("-", ".")} 상장`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-0.5 pr-1">
          <SourceBadge source={data?.source} />
          <FavoriteButton symbol={symbol} name={data?.name} />
        </div>
      </header>

      <div className="space-y-4 px-4 pt-2">
        {error ? (
          <p className="rounded-2xl bg-card px-4 py-10 text-center text-sm text-muted">
            데이터를 불러오지 못했어요 ({error})
          </p>
        ) : (
          <>
            <section>
              {stats ? (
                <>
                  <p className="text-3xl font-bold tracking-tight">{formatPrice(stats.last.close, data!.currency)}</p>
                  <p className={clsx("mt-1 text-sm font-semibold", toneClass(stats.lastChange))}>
                    {formatPct(stats.lastChange)} <span className="font-normal text-dim">이번 달</span>
                  </p>
                </>
              ) : (
                <div className="skeleton h-16 w-48 rounded-lg" />
              )}
            </section>

            <section className="rounded-2xl bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="pl-1 text-sm font-semibold">가격 차트</h2>
                <div className="grid grid-cols-2 rounded-lg bg-bg p-0.5 text-xs font-semibold">
                  {(["monthly", "yearly"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setTimeframe(v)}
                      className={clsx(
                        "rounded-md px-3 py-1.5",
                        timeframe === v ? "bg-card-hi text-fg" : "text-muted",
                      )}
                    >
                      {v === "monthly" ? "월봉" : "연봉"}
                    </button>
                  ))}
                </div>
              </div>
              {loading && !data ? (
                <div className="skeleton h-72 rounded-xl" />
              ) : data && data.monthly.length ? (
                <CandleChart
                  candles={timeframe === "monthly" ? data.monthly : data.yearly}
                  currency={data.currency}
                  visibleBars={timeframe === "monthly" ? 72 : undefined}
                />
              ) : (
                <p className="py-16 text-center text-sm text-muted">차트 데이터가 없어요</p>
              )}
            </section>

            {stats && (
              <section className="grid grid-cols-3 gap-2">
                <Stat label={data?.listedYm ? "상장 후 누적" : `${stats.since.slice(0, 4)}년~ 누적`} value={formatPct(stats.totalPct, 0)} tone={stats.totalPct} />
                <Stat label="연평균 (CAGR)" value={formatPct(stats.cagr, 1)} tone={stats.cagr} />
                <Stat label="상승 월 비율" value={`${stats.winRate.toFixed(0)}%`} />
              </section>
            )}

            <section className="rounded-2xl bg-card p-3">
              <h2 className="mb-1 pl-1 text-sm font-semibold">연·월별 수익률 (%)</h2>
              {loading && !data ? (
                <div className="skeleton h-96 rounded-xl" />
              ) : data?.heatmap.length ? (
                <ReturnHeatmap rows={data.heatmap} listedYm={data.listedYm} />
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div className="rounded-xl bg-card px-3 py-2.5">
      <p className="truncate text-[11px] text-dim">{label}</p>
      <p className={clsx("mt-0.5 text-sm font-bold", tone === undefined ? "text-fg" : toneClass(tone))}>{value}</p>
    </div>
  );
}
