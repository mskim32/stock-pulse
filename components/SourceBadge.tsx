import type { DataSource } from "@/lib/types";

/** Flags responses built from mock data so they are never mistaken for real prices. */
export default function SourceBadge({ source }: { source?: DataSource }) {
  if (source !== "mock") return null;
  return (
    <span
      title="Yahoo Finance에 연결할 수 없어 샘플 데이터를 표시합니다"
      className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400"
    >
      샘플 데이터
    </span>
  );
}
