"use client";

import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { displayTicker } from "@/lib/format";
import { marketOf } from "@/lib/universe";
import { MARKET_LABEL } from "./MarketTabs";
import FavoriteButton from "./FavoriteButton";

export default function FavoritesSection() {
  const { favorites } = useFavorites();

  return (
    <section>
      <header className="mb-2 flex items-center gap-2 px-1">
        <Star size={14} className="text-amber-300" fill="currentColor" strokeWidth={0} />
        <h2 className="text-base font-bold">관심 종목</h2>
        {favorites.length > 0 && (
          <span className="ml-auto text-xs text-dim">{favorites.length}개</span>
        )}
      </header>

      {favorites.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-6 text-center text-sm leading-relaxed text-muted">
          종목 상세에서 <Star size={12} className="inline text-amber-300" fill="currentColor" strokeWidth={0} /> 를
          눌러 관심 종목을 추가하세요
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((f) => (
            <li key={f.symbol} className="flex items-center gap-1 rounded-2xl bg-card pr-2">
              <Link
                href={`/stock/${encodeURIComponent(f.symbol)}`}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-card-hi active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{f.name}</p>
                  <p className="font-mono text-xs text-dim">
                    {displayTicker(f.symbol)} · {MARKET_LABEL[marketOf(f.symbol)]}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-dim" />
              </Link>
              <FavoriteButton symbol={f.symbol} name={f.name} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
