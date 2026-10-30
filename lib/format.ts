export function formatPrice(value: number | null | undefined, currency = "USD") {
  if (value == null) return "–";
  const krw = currency === "KRW";
  if (krw) {
    return value.toLocaleString("ko-KR", { maximumFractionDigits: 0 }) + "원";
  }
  // Crypto / FX: more decimals for sub-dollar quotes, fewer for large notionals.
  const digits = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  });
}

export function formatPct(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "–";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function toneClass(value: number | null | undefined) {
  if (value == null || value === 0) return "text-muted";
  return value > 0 ? "text-up" : "text-down";
}

/** Strip exchange / quote suffixes for display: 005930.KS → 005930, BTC-USD → BTC */
export const displayTicker = (symbol: string) =>
  symbol.replace(/\.(KS|KQ)$/, "").replace(/-(USD|USDT|USDC|KRW|EUR)$/, "");

/** Heatmap cell background: red/blue with opacity scaled by magnitude (saturates at ±20%). */
export function heatColor(pct: number | null) {
  if (pct == null) return "transparent";
  const a = 0.12 + Math.min(Math.abs(pct) / 20, 1) * 0.78;
  return pct >= 0 ? `rgba(240, 68, 82, ${a})` : `rgba(49, 130, 246, ${a})`;
}
