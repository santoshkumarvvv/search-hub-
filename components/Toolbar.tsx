'use client';

import { useEffect, useRef } from 'react';
import type { AppCategory, SortKey } from '@/lib/types';

interface Props {
  q: string;
  category: AppCategory | 'all';
  genre: string;
  sort: SortKey;
  genres: string[];
  count: number;
  loading: boolean;
  onQ: (v: string) => void;
  onCategory: (v: AppCategory | 'all') => void;
  onGenre: (v: string) => void;
  onSort: (v: SortKey) => void;
}

const CATEGORIES: { k: AppCategory | 'all'; label: string; icon: string }[] = [
  { k: 'all', label: 'All', icon: '🔥' },
  { k: 'game', label: 'Games', icon: '🎮' },
  { k: 'app', label: 'Apps', icon: '📱' },
  { k: 'tool', label: 'Tools', icon: '🔧' }
];

const SORTS: { k: SortKey; label: string }[] = [
  { k: 'popular', label: 'Popular' },
  { k: 'rating', label: 'Top Rated' },
  { k: 'newest', label: 'Newest' },
  { k: 'name', label: 'A–Z' }
];

export default function Toolbar(p: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (
        e.key === '/' &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA' &&
        tag !== 'SELECT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
      {/* Top bar: logo + search */}
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        {/* Logo */}
        <a
          href="/"
          className="hidden shrink-0 items-center gap-2 font-extrabold tracking-tight sm:flex"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent via-purple-500 to-accent2 shadow-cyber">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d1117"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-accent via-purple-400 to-accent2 bg-clip-text text-transparent text-lg animate-cyber-pulse">
            SearchHub
          </span>
          <span className="ml-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-400 border border-purple-500/30">
            AI
          </span>
        </a>

        {/* Search */}
        <div className="ml-0 sm:ml-auto flex min-w-[180px] max-w-xl flex-1 items-center gap-2 rounded-full border border-line bg-panel px-4 py-2.5 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all duration-300">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            className="shrink-0 text-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <label className="sr-only" htmlFor="q">
            Search apps & games
          </label>
          <input
            id="q"
            ref={inputRef}
            type="search"
            value={p.q}
            onChange={(e) => p.onQ(e.target.value)}
            placeholder="Search apps, games, tools…  ( / )"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-muted"
          />
          <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-muted">
            {p.loading ? '…' : `${p.count}`}
          </span>
        </div>
      </div>

      {/* Category tabs + sort/genre */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 pb-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button
              key={c.k}
              type="button"
              onClick={() => p.onCategory(c.k)}
              aria-pressed={p.category === c.k}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                p.category === c.k
                  ? 'border-accent/50 bg-accent/15 text-accent shadow-cyber'
                  : 'border-line bg-white/[0.03] text-muted hover:bg-white/10 hover:text-white hover:border-accent/30'
              }`}
            >
              <span className="text-[13px]">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {p.genres.length > 0 && (
            <>
              <label className="sr-only" htmlFor="genre">
                Genre
              </label>
              <select
                id="genre"
                value={p.genre}
                onChange={(e) => p.onGenre(e.target.value)}
                className="cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted outline-none focus:border-accent transition-colors hover:bg-panel2"
              >
                <option value="all">All genres</option>
                {p.genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={p.sort}
            onChange={(e) => p.onSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted outline-none focus:border-accent transition-colors hover:bg-panel2"
          >
            {SORTS.map((s) => (
              <option key={s.k} value={s.k}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cyberpunk status bar */}
      <div className="mx-auto max-w-[1400px] px-4 pb-2">
        <div className="flex items-center gap-2 text-[10px] text-muted/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent2"></span>
            <span>SYSTEM ONLINE</span>
          </span>
          <span className="text-muted/20">•</span>
          <span>POWERED BY</span>
          <a 
            href="https://github.com/santoshkumarvvv" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent/70 hover:text-accent transition-colors"
          >
            SANTOSH KUMAR
          </a>
          <span className="text-muted/20">•</span>
          <span className="font-mono">v2.0</span>
          <span className="ml-auto font-mono text-accent/50">CYBERPUNK EDITION</span>
        </div>
      </div>
    </div>
  );
}
