"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { FIRST_YEAR, isFutureYM, nextYM, nowYM, prevYM } from "@/lib/dates";

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function YearMonthPicker({ year, month, onChange }: Props) {
  const now = nowYM();
  const years = Array.from({ length: now.year - FIRST_YEAR + 1 }, (_, i) => now.year - i);
  const prev = prevYM(year, month);
  const next = nextYM(year, month);
  const canPrev = prev.year >= FIRST_YEAR;
  const canNext = !isFutureYM(next.year, next.month);

  const changeYear = (y: number) => {
    // Jumping to the current year from a later month in a past year would land in the future.
    const m = y === now.year && month > now.month ? now.month : month;
    onChange(y, m);
  };

  return (
    <section className="rounded-2xl bg-card p-3">
      <div className="flex items-center justify-between">
        <StepButton label="이전 달" disabled={!canPrev} onClick={() => onChange(prev.year, prev.month)}>
          <ChevronLeft size={18} />
        </StepButton>

        <label className="relative flex items-center gap-1 rounded-lg px-3 py-1.5 text-lg font-semibold hover:bg-card-hi">
          {year}년 {month}월
          <ChevronDown size={16} className="text-muted" />
          {/* Native select keeps the OS wheel picker on iOS/Android. */}
          <select
            aria-label="연도 선택"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={year}
            onChange={(e) => changeYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </label>

        <StepButton label="다음 달" disabled={!canNext} onClick={() => onChange(next.year, next.month)}>
          <ChevronRight size={18} />
        </StepButton>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="월 선택">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const disabled = isFutureYM(year, m);
          const active = m === month;
          return (
            <button
              key={m}
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(year, m)}
              className={clsx(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-accent text-white" : "bg-bg/60 text-muted hover:text-fg",
                disabled && "cursor-not-allowed opacity-30 hover:text-muted",
              )}
            >
              {m}월
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StepButton(props: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="grid size-9 place-items-center rounded-full text-muted hover:bg-card-hi hover:text-fg disabled:opacity-30"
    >
      {props.children}
    </button>
  );
}
