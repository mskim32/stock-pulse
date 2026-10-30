export function formatPrice(value: number | null | undefined, currency = "USD") {
  if (value == null) return "–";
  const krw = currency === "KRW";
  return (
    value.toLocaleString(krw ? "ko-KR" : "en-US", {
      minimumFractionDigits: krw ? 0 : 2,
      maximumFractionDigits: krw ? 0 : 2,
    }) + (krw ? "원" : "")
  );
}

export function formatPct(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "–";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function toneClass(value: number | null | undefined) {
  if (value == null || value === 0) return "text-muted";
  return value > 0 ? "text-up" : "text-down";
}

/** Strip the exchange suffix for display: 005930.KS → 005930 */
export const displayTicker = (symbol: string) => symbol.replace(/\.(KS|KQ)$/, "");

/** Heatmap cell background: red/blue with opacity scaled by magnitude (saturates at ±20%). */
export function heatColor(pct: number | null) {
  if (pct == null) return "transparent";
  const a = 0.12 + Math.min(Math.abs(pct) / 20, 1) * 0.78;
  return pct >= 0 ? `rgba(240, 68, 82, ${a})` : `rgba(49, 130, 246, ${a})`;
}
