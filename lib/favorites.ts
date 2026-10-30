"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface Favorite {
  symbol: string;
  name: string;
  addedAt: number;
}

const KEY = "stock-pulse:favorites";
const MAX = 40;
/** Stable empty snapshot — a fresh `[]` each call breaks useSyncExternalStore. */
const EMPTY: Favorite[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedList: Favorite[] = EMPTY;

function emit() {
  for (const l of listeners) l();
}

function read(): Favorite[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    if (!raw) {
      cachedList = EMPTY;
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Favorite[];
    if (!Array.isArray(parsed)) {
      cachedList = EMPTY;
      return EMPTY;
    }
    cachedList = parsed.filter((f) => f && typeof f.symbol === "string");
    return cachedList;
  } catch {
    cachedList = EMPTY;
    return EMPTY;
  }
}

function write(list: Favorite[]) {
  const next = list.slice(0, MAX);
  const raw = JSON.stringify(next);
  localStorage.setItem(KEY, raw);
  cachedRaw = raw;
  cachedList = next.length ? next : EMPTY;
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cachedRaw = null; // force re-read from storage
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);

  const isFavorite = useCallback(
    (symbol: string) => favorites.some((f) => f.symbol === symbol.toUpperCase()),
    [favorites],
  );

  const toggle = useCallback((symbol: string, name?: string) => {
    const sym = symbol.toUpperCase();
    const current = read();
    const idx = current.findIndex((f) => f.symbol === sym);
    if (idx >= 0) {
      write(current.filter((_, i) => i !== idx));
      return false;
    }
    write([{ symbol: sym, name: name || sym, addedAt: Date.now() }, ...current]);
    return true;
  }, []);

  const remove = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase();
    write(read().filter((f) => f.symbol !== sym));
  }, []);

  /** Refresh the stored display name once Yahoo/mock metadata arrives. */
  const rename = useCallback((symbol: string, name: string) => {
    const sym = symbol.toUpperCase();
    const current = read();
    const idx = current.findIndex((f) => f.symbol === sym);
    if (idx < 0 || !name || current[idx].name === name) return;
    const next = current.slice();
    next[idx] = { ...next[idx], name };
    write(next);
  }, []);

  return { favorites, isFavorite, toggle, remove, rename };
}
