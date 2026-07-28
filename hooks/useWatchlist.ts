'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'kitsune:watchlist';
const EVENT = 'kitsune:watchlist-change';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage may be unavailable (private mode / quota) */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Client-side watchlist persisted to localStorage.
 * `hydrated` prevents SSR/CSR markup mismatches — render neutral UI until true.
 */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setList(read());
    setHydrated(true);

    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = read().includes(slug)
      ? read().filter((s) => s !== slug)
      : [...read(), slug];
    write(next);
    setList(next);
  }, []);

  const has = useCallback((slug: string) => list.includes(slug), [list]);

  const clear = useCallback(() => {
    write([]);
    setList([]);
  }, []);

  return { list, has, toggle, clear, hydrated, count: list.length };
}
