"use client";

import clsx from "clsx";
import { MARKETS, type Market } from "@/lib/types";

export const MARKET_LABEL: Record<Market, string> = { KOSPI: "코스피", KOSDAQ: "코스닥", NASDAQ: "나스닥" };

export default function MarketTabs({ value, onChange }: { value: Market; onChange: (m: Market) => void }) {
  return (
    <div role="tablist" className="grid grid-cols-3 rounded-xl bg-card p-1">
      {MARKETS.map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={m === value}
          onClick={() => onChange(m)}
          className={clsx(
            "h-9 rounded-lg text-sm font-semibold transition-colors",
            m === value ? "bg-card-hi text-fg shadow" : "text-muted hover:text-fg",
          )}
        >
          {MARKET_LABEL[m]}
        </button>
      ))}
    </div>
  );
}
