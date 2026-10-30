"use client";

import { useEffect, useRef } from "react";
import { AreaSeries, ColorType, createChart, type UTCTimestamp } from "lightweight-charts";
import type { SeriesPoint } from "@/lib/types";

const toTime = (day: string) => (Date.parse(`${day}T00:00:00Z`) / 1000) as UTCTimestamp;

/** Axis-less sparkline for the futures banner. */
export default function MiniChart({ data, up }: { data: SeriesPoint[]; up: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    const color = up ? "#F04452" : "#3182F6";
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      lineWidth: 2,
      topColor: up ? "rgba(240,68,82,0.35)" : "rgba(49,130,246,0.35)",
      bottomColor: "rgba(0,0,0,0)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    series.setData(data.map((p) => ({ time: toTime(p.time), value: p.value })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [data, up]);

  return <div ref={ref} className="h-full w-full" />;
}
