'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import Toolbar from './Toolbar';
import type { AppItem, AppCategory, SortKey } from '@/lib/types';

/**
 * APK catalog browser.
 *
 * URL is the single source of truth: ?q=&category=&genre=&sort= are written
 * back to the address bar on every change so any view can be linked.
 */

interface Props {
  items: AppItem[];
  genres: string[];
  initialQuery: {
    q: string;
    category: AppCategory | 'all';
    genre: string;
    sort: SortKey;
  };
}

const DEBOUNCE_MS = 350;

export default function Browser({ items: initialItems, genres, initialQuery }: Props) {
  const router = useRouter();

  const [q, setQ] = useState(initialQuery.q);
  const [category, setCategory] = useState<AppCategory | 'all'>(initialQuery.category);
  const [genre, setGenre] = useState(initialQuery.genre);
  const [sort, setSort] = useState<SortKey>(initialQuery.sort);
  const [loading, setLoading] = useState(false);

  // Sync filters to the URL, debounced for typing.
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      if (category !== 'all') sp.set('category', category);
      if (genre !== 'all') sp.set('genre', genre);
      if (sort !== 'popular') sp.set('sort', sort);

      const qs = sp.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
      setLoading(false);
    }, DEBOUNCE_MS);

    setLoading(true);
    return () => clearTimeout(t);
  }, [q, category, genre, sort, router]);

  return (
    <>
      <Toolbar
        q={q}
        category={category}
        genre={genre}
        sort={sort}
        genres={genres}
        count={initialItems.length}
        loading={loading}
        onQ={setQ}
        onCategory={setCategory}
        onGenre={setGenre}
        onSort={setSort}
      />

      <main id="grid" className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Section header */}
        {q ? (
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-white">
              Search results for &quot;{q}&quot;
            </h2>
            <p className="text-xs text-muted mt-0.5">{initialItems.length} apps found</p>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">
              {category === 'all' && '🔥 Trending & Popular'}
              {category === 'game' && '🎮 Games'}
              {category === 'app' && '📱 Apps'}
              {category === 'tool' && '🔧 Tools'}
            </h2>
          </div>
        )}

        {initialItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-sm font-semibold text-white">No apps found</p>
            <p className="text-xs text-muted mt-1">
              Try a different search term or change the category filter.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {initialItems.map((it) => (
            <Card key={it.uid} item={it} />
          ))}
        </div>
      </main>
    </>
  );
}
