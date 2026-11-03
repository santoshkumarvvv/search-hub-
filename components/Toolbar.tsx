'use client';

import type { AppCategory, SortKey } from '@/lib/types';

interface ToolbarProps {
  q: string;
  category: AppCategory | 'all';
  genre: string;
  sort: SortKey;
  genres: string[];
  count: number;
  loading: boolean;
  onQ: (q: string) => void;
  onCategory: (c: AppCategory | 'all') => void;
  onGenre: (g: string) => void;
  onSort: (s: SortKey) => void;
}

export default function Toolbar({ q, category, genre, sort, genres, count, loading, onQ, onCategory, onGenre, onSort }: ToolbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-extrabold text-white">Search Hub</h1>
          <span className="text-xs text-muted">{count} apps{loading ? ' …' : ''}</span>
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <input
            type="search"
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Search apps, games, tools…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-white/30 focus:outline-none sm:max-w-xs"
          />

          <div className="flex flex-wrap gap-2">
            {(['all', 'game', 'app', 'tool'] as const).map((c) => (
              <button
                key={c}
                onClick={() => onCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${category === c ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {c === 'all' ? 'All' : c === 'game' ? '🎮 Games' : c === 'app' ? '📱 Apps' : '🔧 Tools'}
              </button>
            ))}
          </div>

          <select
            value={genre}
            onChange={(e) => onGenre(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </header>
  );
}
