"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { Market, TopMoversResponse } from "@/lib/types";
import { useFetch } from "@/lib/use-fetch";
import { displayTicker, formatPct, formatPrice, toneClass } from "@/lib/format";
import SourceBadge from "./SourceBadge";
import { MARKET_LABEL } from "./MarketTabs";

const RANK_STYLE = ["bg-amber-400/20 text-amber-300", "bg-slate-300/15 text-slate-200", "bg-orange-500/15 text-orange-300"];

interface Props {
  market: Market;
  year: number;
  month: number;
}

export default function TopMoversList({ market, year, month }: Props) {
  const { data, error, loading } = useFetch<TopMoversResponse>(
    `/api/top-movers?market=${market}&year=${year}&month=${month}`,
  );

  return (
    <section>
      <header className="mb-2 flex items-center gap-2 px-1">
        <h2 className="text-base font-bold">
          {MARKET_LABEL[market]} 상승률 TOP 5
        </h2>
        <SourceBadge source={data?.source} />
        {data && <span className="ml-auto text-xs text-dim">{data.universeSize}종목 중</span>}
      </header>

      {loading && !data ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="skeleton h-[68px] rounded-2xl" />
          ))}
        </ul>
      ) : error ? (
        <Empty>데이터를 불러오지 못했어요 ({error})</Empty>
      ) : !data?.items.length ? (
        <Empty>해당 월에 집계된 종목이 없어요</Empty>
      ) : (
        <ol className={clsx("space-y-2 transition-opacity", loading && "opacity-50")}>
          {data.items.map((item) => (
            <li key={item.symbol}>
              <Link
                href={`/stock/${encodeURIComponent(item.symbol)}`}
                className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 transition-colors hover:bg-card-hi active:scale-[0.99]"
              >
                <span
                  className={clsx(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                    RANK_STYLE[item.rank - 1] ?? "bg-bg text-muted",
                  )}
                >
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-dim">
                    <span className="font-mono">{displayTicker(item.symbol)}</span>
                    {item.isNewListing && <NewListingBadge />}
                  </p>
                </div>
                <div className="text-right">
                  <p className={clsx("font-bold", toneClass(item.returnPct))}>{formatPct(item.returnPct)}</p>
                  <p className="text-xs text-muted">{formatPrice(item.close, item.currency)}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-dim" />
              </Link>
            </li>
          ))}
        </ol>
      )}
      {data?.items.some((i) => i.isNewListing) && (
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-dim">
          <NewListingBadge /> 상장 첫 달은 첫 거래일 시가 대비 월말 종가 수익률입니다 (공모가 기준 아님).
        </p>
      )}
    </section>
  );
}

export function NewListingBadge() {
  return (
    <span className="rounded bg-emerald-500/15 px-1 py-px text-[10px] font-semibold text-emerald-400">신규상장</span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-card px-4 py-8 text-center text-sm text-muted">{children}</p>;
}
