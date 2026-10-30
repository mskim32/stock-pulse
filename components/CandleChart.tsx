"use client";

import { useEffect, useRef } from "react";
import { CandlestickSeries, ColorType, CrosshairMode, createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import type { Candle } from "@/lib/types";

interface Props {
  candles: Candle[];
  currency: string;
  /** Number of most recent bars to show initially (the rest is reachable by dragging). */
  visibleBars?: number;
}

export default function CandleChart({ candles, currency, visibleBars }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const krw = currency === "KRW";

  // Create once.
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8B95A5",
        fontSize: 11,
        fontFamily: "inherit",
      },
      grid: { vertLines: { color: "#1A202B" }, horzLines: { color: "#1A202B" } },
      rightPriceScale: { borderColor: "#232A36" },
      timeScale: { borderColor: "#232A36", rightOffset: 2 },
      crosshair: { mode: CrosshairMode.Normal },
      // Let vertical swipes scroll the page on mobile.
      handleScroll: { vertTouchDrag: false },
      localization: { locale: "ko-KR" },
    });
    chartRef.current = chart;
    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#F04452",
      downColor: "#3182F6",
      borderUpColor: "#F04452",
      borderDownColor: "#3182F6",
      wickUpColor: "#F04452",
      wickDownColor: "#3182F6",
    });
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;
    chart.applyOptions({
      localization: {
        locale: "ko-KR",
        priceFormatter: (v: number) =>
          v.toLocaleString(krw ? "ko-KR" : "en-US", { maximumFractionDigits: krw ? 0 : 2, minimumFractionDigits: krw ? 0 : 2 }),
      },
    });
    series.applyOptions({
      priceFormat: krw ? { type: "price", precision: 0, minMove: 1 } : { type: "price", precision: 2, minMove: 0.01 },
    });
    series.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    if (visibleBars && candles.length > visibleBars) {
      chart.timeScale().setVisibleLogicalRange({ from: candles.length - visibleBars, to: candles.length + 1 });
    } else {
      chart.timeScale().fitContent();
    }
  }, [candles, krw, visibleBars]);

  return <div ref={ref} className="h-72 w-full" />;
}
