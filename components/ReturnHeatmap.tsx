"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { HeatmapRow } from "@/lib/types";
import { formatPct, heatColor, toneClass } from "@/lib/format";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Year (rows) x month (columns) return matrix with a seasonality summary row. */
export default function ReturnHeatmap({ rows, listedYm }: { rows: HeatmapRow[]; listedYm: string | null }) {
  const isListing = (year: number, m: number) => listedYm === `${year}-${String(m + 1).padStart(2, "0")}`;
  const [selected, setSelected] = useState<{ label: string; value: number | null } | null>(null);

  const summary = useMemo(
    () =>
      MONTHS.map((_, m) => {
        const vals = rows.map((r) => r.months[m]).filter((v): v is number => v != null);
        if (!vals.length) return { avg: null, winRate: null };
        return {
          avg: vals.reduce((a, b) => a + b, 0) / vals.length,
          winRate: (vals.filter((v) => v > 0).length / vals.length) * 100,
        };
      }),
    [rows],
  );

  const cell = "h-8 min-w-[44px] px-0.5 text-center text-[11px] tabular-nums";
  const sticky = "sticky left-0 z-10 bg-card";

  return (
    <div>
      <p className="mb-2 h-5 truncate px-1 text-xs">
        {selected ? (
          <span className="font-semibold">
            {selected.label} <span className={toneClass(selected.value)}>{formatPct(selected.value)}</span>
          </span>
        ) : (
          <span className="text-muted">셀을 누르면 상세 수익률이 보여요</span>
        )}
      </p>

      <div className="no-scrollbar overflow-x-auto rounded-xl border border-line">
        <table className="w-full border-separate border-spacing-0.5">
          <thead>
            <tr className="text-[11px] text-dim">
              <th className={clsx(cell, sticky, "min-w-[48px]")}>연도</th>
              {MONTHS.map((m) => (
                <th key={m} className={cell}>
                  {m}월
                </th>
              ))}
              <th className={clsx(cell, "min-w-[52px] text-muted")}>연간</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <th className={clsx(cell, sticky, "font-medium text-muted")}>{row.year}</th>
                {row.months.map((v, m) => (
                  <td key={m} className="p-0">
                    <button
                      onClick={() =>
                        setSelected({
                          label: `${row.year}년 ${m + 1}월${isListing(row.year, m) ? " (신규상장 · 시가 대비)" : ""}`,
                          value: v,
                        })
                      }
                      disabled={v == null}
                      className={clsx(
                        cell,
                        "w-full rounded",
                        v == null ? "text-dim/40" : "text-white/95",
                        isListing(row.year, m) && "ring-2 ring-inset ring-emerald-400",
                      )}
                      style={{ background: heatColor(v) }}
                    >
                      {v == null ? "·" : v.toFixed(1)}
                    </button>
                  </td>
                ))}
                <td className="p-0">
                  <button
                    onClick={() => setSelected({ label: `${row.year}년 연간`, value: row.yearReturn })}
                    className={clsx(cell, "w-full rounded font-semibold", toneClass(row.yearReturn))}
                  >
                    {row.yearReturn == null ? "–" : row.yearReturn.toFixed(1)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-[11px]">
            <tr>
              <th className={clsx(cell, sticky, "text-muted")}>평균</th>
              {summary.map((s, m) => (
                <td key={m} className={clsx(cell, "font-semibold", toneClass(s.avg))}>
                  {s.avg == null ? "–" : s.avg.toFixed(1)}
                </td>
              ))}
              <td />
            </tr>
            <tr>
              <th className={clsx(cell, sticky, "text-muted")}>승률</th>
              {summary.map((s, m) => (
                <td key={m} className={clsx(cell, "text-muted")}>
                  {s.winRate == null ? "–" : `${Math.round(s.winRate)}%`}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-dim">
        {listedYm && (
          <span className="mr-auto flex items-center gap-1">
            <span className="size-2.5 rounded-sm ring-2 ring-inset ring-emerald-400" />
            신규상장 월
          </span>
        )}
        <span className={clsx(!listedYm && "ml-auto")}>-20%</span>
        {[-20, -10, -3, 3, 10, 20].map((v) => (
          <span key={v} className="h-2.5 w-5 rounded-sm" style={{ background: heatColor(v) }} />
        ))}
        <span>+20%</span>
      </div>
    </div>
  );
}
