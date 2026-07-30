'use client';

import { useEffect, useRef } from 'react';
import type { MediaKind, SortKey } from '@/lib/types';

interface Props {
  q: string;
  kind: MediaKind | 'all';
  genre: string;
  sort: SortKey;
  genres: string[];
  count: number;
  loading: boolean;
  onQ: (v: string) => void;
  onKind: (v: MediaKind | 'all') => void;
  onGenre: (v: string) => void;
  onSort: (v: SortKey) => void;
}

const KINDS: { k: MediaKind | 'all'; label: string }[] = [
  { k: 'all', label: 'All' },
  { k: 'anime', label: 'Anime' },
  { k: 'movie', label: 'Movies' },
  { k: 'tv', label: 'Series' }
];

const SORTS: { k: SortKey; label: string }[] = [
  { k: 'popularity', label: 'Popular' },
  { k: 'score', label: 'Top rated' },
  { k: 'year', label: 'Newest' },
  { k: 'title', label: 'A–Z' }
];

export default function Toolbar(p: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <svg viewBox="0 0 512 512" className="h-7 w-7" aria-hidden="true">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <rect x="56" y="96" width="400" height="300" rx="34" fill="none" stroke="url(#lg)" strokeWidth="34" />
            <path d="M214 186 L214 306 L318 246 Z" fill="#f8fafc" />
          </svg>
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            MediaHub
          </span>
        </a>

        <div className="ml-auto flex min-w-[200px] max-w-lg flex-1 items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-2 focus-within:border-accent2/50">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="shrink-0 text-muted" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <label className="sr-only" htmlFor="q">Search titles</label>
          <input
            id="q"
            ref={inputRef}
            type="search"
            value={p.q}
            onChange={(e) => p.onQ(e.target.value)}
            placeholder="Search anime, movies, series…  ( / )"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-muted"
          />
          <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-muted">
            {p.loading ? '…' : `${p.count}`}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-2 px-4 pb-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Type">
          {KINDS.map((k) => (
            <button
              key={k.k}
              type="button"
              onClick={() => p.onKind(k.k)}
              aria-pressed={p.kind === k.k}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                p.kind === k.k
                  ? 'border-accent/50 bg-accent/15 text-accent'
                  : 'border-line bg-white/[0.03] text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {p.genres.length > 0 && (
            <>
              <label className="sr-only" htmlFor="genre">Genre</label>
              <select
                id="genre"
                value={p.genre}
                onChange={(e) => p.onGenre(e.target.value)}
                className="cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted outline-none focus:border-accent2"
              >
                <option value="all">All genres</option>
                {p.genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </>
          )}

          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={p.sort}
            onChange={(e) => p.onSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted outline-none focus:border-accent2"
          >
            {SORTS.map((s) => (
              <option key={s.k} value={s.k}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
