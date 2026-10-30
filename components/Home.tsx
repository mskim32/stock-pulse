"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity } from "lucide-react";
import { MARKETS, type Market } from "@/lib/types";
import { FIRST_YEAR, isFutureYM, nowYM } from "@/lib/dates";
import YearMonthPicker from "./YearMonthPicker";
import FuturesBanner from "./FuturesBanner";
import MarketTabs from "./MarketTabs";
import TopMoversList from "./TopMoversList";
import SearchBar from "./SearchBar";
import FavoritesSection from "./FavoritesSection";

/** Selection lives in the URL (?y=&m=&tab=) so "back" from a stock page restores it. */
function useSelection() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const now = nowYM();

  let year = Number(params.get("y")) || now.year;
  let month = Number(params.get("m")) || now.month;
  if (year < FIRST_YEAR || month < 1 || month > 12 || isFutureYM(year, month)) ({ year, month } = now);
  const tabParam = params.get("tab")?.toUpperCase() as Market | undefined;
  const market: Market = tabParam && MARKETS.includes(tabParam) ? tabParam : "KOSPI";

  const update = useCallback(
    (patch: Record<string, string | number>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) next.set(k, String(v));
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return { year, month, market, update };
}

export default function Home() {
  const { year, month, market, update } = useSelection();

  return (
    <div className="space-y-4 px-4 pb-10 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-accent/20 text-accent">
          <Activity size={18} />
        </span>
        <h1 className="text-lg font-bold tracking-tight">나 혼자만 상한가</h1>
        <span className="ml-auto text-xs text-dim">2002 – {nowYM().year}</span>
      </header>

      <SearchBar />
      <FavoritesSection />
      <YearMonthPicker year={year} month={month} onChange={(y, m) => update({ y, m })} />
      {market !== "CRYPTO" && <FuturesBanner year={year} month={month} />}
      <MarketTabs value={market} onChange={(tab) => update({ tab: tab.toLowerCase() })} />
      <TopMoversList market={market} year={year} month={month} />

      <footer className="pt-4 text-center text-[10px] leading-relaxed text-dim">
        데이터: Yahoo Finance · 차트: TradingView Lightweight Charts™
        <br />
        투자 참고용이며 투자 권유가 아닙니다.
      </footer>
    </div>
  );
}
