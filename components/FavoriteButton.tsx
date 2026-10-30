"use client";

import { Star } from "lucide-react";
import clsx from "clsx";
import { useFavorites } from "@/lib/favorites";

interface Props {
  symbol: string;
  name?: string;
  /** Larger hit target for the sticky detail header. */
  size?: "sm" | "md";
  className?: string;
}

export default function FavoriteButton({ symbol, name, size = "md", className }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(symbol);

  return (
    <button
      type="button"
      aria-label={on ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(symbol, name);
      }}
      className={clsx(
        "grid place-items-center rounded-full transition-colors",
        size === "md" ? "size-11 hover:bg-card" : "size-8 hover:bg-card-hi",
        on ? "text-amber-300" : "text-dim hover:text-fg",
        className,
      )}
    >
      <Star size={size === "md" ? 20 : 16} fill={on ? "currentColor" : "none"} strokeWidth={on ? 0 : 2} />
    </button>
  );
}
