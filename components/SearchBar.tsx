"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import type { SearchItem } from "@/lib/types";
import { displayTicker } from "@/lib/format";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setItems((await res.json()).items ?? []);
      } catch {
        /* aborted or offline */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const go = (symbol: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex h-11 items-center gap-2 rounded-xl bg-card px-3 focus-within:ring-1 focus-within:ring-accent">
        <Search size={18} className="shrink-0 text-dim" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="종목명 또는 티커 (삼성전자, AAPL, 005930)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && items[0]) go(items[0].symbol);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dim [&::-webkit-search-cancel-button]:hidden"
        />
        {loading ? (
          <Loader2 size={16} className="animate-spin text-dim" />
        ) : (
          query && (
            <button aria-label="지우기" onClick={() => setQuery("")} className="text-dim hover:text-fg">
              <X size={16} />
            </button>
          )
        )}
      </div>

      {open && query.trim() && (
        <ul className="absolute inset-x-0 top-12 z-30 max-h-80 overflow-y-auto rounded-xl border border-line bg-card-hi py-1 shadow-2xl">
          {items.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-muted">검색 결과가 없어요</li>
          ) : (
            items.map((item) => (
              <li key={item.symbol}>
                <button
                  onClick={() => go(item.symbol)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-card"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                  <span className="font-mono text-xs text-dim">{displayTicker(item.symbol)}</span>
                  <span className="w-14 text-right text-[10px] text-muted">{item.exchange}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
