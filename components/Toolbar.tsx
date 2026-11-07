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

export default function Toolbar({
  q,
  category,
  genre,
  sort,
  genres,
  count,
  loading,
  onQ,
  onCategory,
  onGenre,
  onSort,
}: ToolbarProps) {
  return (
    <section aria-label="Catalog search and filters" className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1120px] px-4 pt-10 pb-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-4xl">
              Indexed Catalog
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Client-side Web Worker BM25 index · {count} records matched{loading ? ' · indexing…' : ''}
            </p>
          </div>
        </div>

        <div className="search-box flex items-center gap-3.5 px-4 py-3.5">
          <svg
            className="h-5 w-5 shrink-0 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => onQ(e.target.value)}
            aria-label="Search catalog apps, games, and developer tools"
            placeholder="Search indexed records (try: termux, wireguard, fdroid)..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none sm:text-base"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-line bg-white p-1">
            {(['all', 'game', 'app', 'tool'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCategory(c)}
                className={`min-h-11 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  category === c
                    ? 'bg-purple text-white'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {c === 'all' ? 'All' : c === 'game' ? 'Games' : c === 'app' ? 'Apps' : 'Tools'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by genre"
              value={genre}
              onChange={(e) => onGenre(e.target.value)}
              className="min-h-11 rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink focus:outline-none"
            >
              <option value="all">All genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort catalog"
              value={sort}
              onChange={(e) => onSort(e.target.value as SortKey)}
              className="min-h-11 rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink focus:outline-none"
            >
              <option value="popular">Sort: Popular</option>
              <option value="rating">Sort: Rating</option>
              <option value="newest">Sort: Featured</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
