import type { NextRequest } from "next/server";
import type { SearchItem } from "@/lib/types";
import { allEntries } from "@/lib/universe";
import { search } from "@/lib/market-data";
import { json } from "@/lib/http";

// GET /api/search?q=삼성  — local Korean names first, then Yahoo's symbol search.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return json({ items: [] });

  const needle = q.toLowerCase();
  const local: SearchItem[] = allEntries()
    .filter((e) => e.name.toLowerCase().includes(needle) || e.symbol.toLowerCase().startsWith(needle))
    .slice(0, 8)
    .map((e) => ({ symbol: e.symbol, name: e.name, exchange: e.market }));

  // A bare 6-digit KRX code: offer both exchanges, since we can't tell which one it's on.
  if (/^\d{6}$/.test(q) && !local.length) {
    local.push(
      { symbol: `${q}.KS`, name: `${q} (코스피)`, exchange: "KOSPI" },
      { symbol: `${q}.KQ`, name: `${q} (코스닥)`, exchange: "KOSDAQ" },
    );
  }

  // Yahoo search only understands Latin text, so skip it for Hangul queries.
  const remote = /[가-힣]/.test(q) ? [] : await search(q);
  const seen = new Set(local.map((i) => i.symbol));
  const items = [...local, ...remote.filter((i) => !seen.has(i.symbol))].slice(0, 12);
  return json({ items });
}
