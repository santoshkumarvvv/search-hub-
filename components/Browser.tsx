'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from './Card';
import Toolbar from './Toolbar';
import { APPS } from '@/lib/apps';
import type { AppItem, AppCategory, SortKey } from '@/lib/types';

/**
 * Fully client-side APK catalog browser.
 * Reads filters from URL search params on mount, writes them back on change.
 */

function readParams(): {
  q: string;
  category: AppCategory | 'all';
  genre: string;
  sort: SortKey;
} {
  if (typeof window === 'undefined')
    return { q: '', category: 'all', genre: 'all', sort: 'popular' };
  const sp = new URLSearchParams(window.location.search);
  const cat = sp.get('category') || 'all';
  const validCat = ['all', 'game', 'app', 'tool'].includes(cat)
    ? (cat as AppCategory | 'all')
    : 'all';
  const s = sp.get('sort') || 'popular';
  const validSort = ['popular', 'rating', 'newest', 'name'].includes(s)
    ? (s as SortKey)
    : 'popular';
  return {
    q: sp.get('q') || '',
    category: validCat,
    genre: sp.get('genre') || 'all',
    sort: validSort
  };
}

function collectGenres(items: AppItem[]): string[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const g of it.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([g]) => g)
    .sort();
}

export default function Browser() {
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<AppCategory | 'all'>('all');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState<SortKey>('popular');

  // Read URL params on mount
  useEffect(() => {
    const p = readParams();
    setQ(p.q);
    setCategory(p.category);
    setGenre(p.genre);
    setSort(p.sort);
    setMounted(true);
  }, []);

  // Sync filters to URL
  useEffect(() => {
    if (!mounted) return;
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (category !== 'all') sp.set('category', category);
    if (genre !== 'all') sp.set('genre', genre);
    if (sort !== 'popular') sp.set('sort', sort);
    const qs = sp.toString();
    const url = qs ? `/?${qs}` : '/';
    window.history.replaceState(null, '', url);
  }, [q, category, genre, sort, mounted]);

  // Filter & sort
  const items = useMemo(() => {
    let list = [...APPS];

    if (q.trim()) {
      const lq = q.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(lq) ||
          a.description.toLowerCase().includes(lq) ||
          a.developer.toLowerCase().includes(lq) ||
          a.genres.some((g) => g.toLowerCase().includes(lq))
      );
    }

    if (category !== 'all') {
      list = list.filter((a) => a.category === category);
    }

    if (genre !== 'all') {
      const g = genre.toLowerCase();
      list = list.filter((a) => a.genres.some((x) => x.toLowerCase() === g));
    }

    switch (sort) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) =>
          a.editorChoice === b.editorChoice ? 0 : a.editorChoice ? -1 : 1
        );
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => {
          if (a.trending !== b.trending) return a.trending ? -1 : 1;
          if (a.editorChoice !== b.editorChoice) return a.editorChoice ? -1 : 1;
          return 0;
        });
    }

    return list;
  }, [q, category, genre, sort]);

  const genres = useMemo(() => collectGenres(APPS), []);

  return (
    <>
      <Toolbar
        q={q}
        category={category}
        genre={genre}
        sort={sort}
        genres={genres}
        count={items.length}
        loading={false}
        onQ={setQ}
        onCategory={setCategory}
        onGenre={setGenre}
        onSort={setSort}
      />

      <main id="grid" className="mx-auto max-w-[1400px] px-4 py-5">
        {q ? (
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-white">
              Search results for &quot;{q}&quot;
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {items.length} apps found
            </p>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">
              {category === 'all' && (
                <span className="flex items-center gap-2">
                  <span className="animate-cyber-pulse">🔥</span>
                  Trending & Popular
                </span>
              )}
              {category === 'game' && (
                <span className="flex items-center gap-2">
                  <span>🎮</span>
                  Games
                </span>
              )}
              {category === 'app' && (
                <span className="flex items-center gap-2">
                  <span>📱</span>
                  Apps
                </span>
              )}
              {category === 'tool' && (
                <span className="flex items-center gap-2">
                  <span>🔧</span>
                  Tools
                </span>
              )}
            </h2>
          </div>
        )}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-sm font-semibold text-white">No apps found</p>
            <p className="text-xs text-muted mt-1">
              Try a different search term or change the category filter.
            </p>
            <div className="mt-4 rounded-lg border border-line bg-panel px-4 py-2 text-xs text-muted/60">
              Powered by Multi-AI Search
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((it) => (
            <Card key={it.uid} item={it} />
          ))}
        </div>
      </main>
    </>
  );
}
