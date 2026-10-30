"use client";

import { useEffect, useState } from "react";

type State<T> = { data: T | null; error: string | null; loading: boolean };

/** Minimal fetch hook: aborts stale requests when the URL changes. Pass null to skip. */
export function useFetch<T>(url: string | null): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: !!url });

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: ctrl.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? res.statusText);
        setState({ data: body as T, error: null, loading: false });
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setState({ data: null, error: String(err.message ?? err), loading: false });
      });
    return () => ctrl.abort();
  }, [url]);

  return state;
}
