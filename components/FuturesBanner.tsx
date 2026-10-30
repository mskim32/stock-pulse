"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import clsx from "clsx";
import type { FuturesResponse } from "@/lib/types";
import { useFetch } from "@/lib/use-fetch";
import { formatPct, formatPrice, toneClass } from "@/lib/format";
import MiniChart from "./MiniChart";
import SourceBadge from "./SourceBadge";

export default function FuturesBanner({ year, month }: { year: number; month: number }) {
  const { data, error, loading } = useFetch<FuturesResponse>(`/api/futures?year=${year}&month=${month}`);
  const up = (data?.changePct ?? 0) >= 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card-hi to-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="rounded bg-bg/70 px-1.5 py-0.5 font-mono text-[11px] text-fg">NQ=F</span>
        나스닥 100 선물 · {month}월 종가
        {data?.partial && <span className="text-accent">진행 중</span>}
        <span className="ml-auto">
          <SourceBadge source={data?.source} />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading && !data ? (
            <>
              <div className="skeleton h-8 w-36 rounded-md" />
              <div className="skeleton mt-2 h-5 w-24 rounded-md" />
            </>
          ) : error ? (
            <p className="text-sm text-muted">데이터를 불러오지 못했어요</p>
          ) : data?.close == null ? (
            <p className="text-sm text-muted">해당 월 데이터가 없어요</p>
          ) : (
            <>
              <p className={clsx("text-[28px] font-bold leading-none tracking-tight", loading && "opacity-50")}>
                {formatPrice(data.close, "USD")}
              </p>
              <p className={clsx("mt-2 flex items-center gap-1 text-sm font-semibold", toneClass(data.changePct))}>
                {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {formatPct(data.changePct)}
              </p>
              <p className="mt-1 whitespace-nowrap text-xs text-dim">전월 {formatPrice(data.prevClose, "USD")}</p>
            </>
          )}
        </div>
        <div className="h-16 w-32 shrink-0">
          {data && data.daily.length > 0 && <MiniChart data={data.daily} up={up} />}
        </div>
      </div>
    </section>
  );
}
