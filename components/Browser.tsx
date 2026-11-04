'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import Toolbar from './Toolbar';
import { APPS } from '@/lib/apps';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import type { AppItem, AppCategory, SortKey } from '@/lib/types';

/**
 * Client-side APK catalog browser powered by Web Worker BM25 (searchWorker.js)
 * with synchronous BM25Engine fallback before worker initialization completes.
 */

interface AppIndexDoc extends IndexDocument {
  app: AppItem;
}

const syncEngine = new BM25Engine<AppIndexDoc>(1.2, 0.75);
syncEngine.addDocuments(
  APPS.map((a) => ({
    id: a.uid,
    title: a.name,
    category: a.category,
    content: `${a.developer} ${a.description} ${a.genre || ''} ${(a.genres || []).join(' ')} ${(a.tags || []).join(' ')}`,
    app: a,
  }))
);

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
    sort: validSort,
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
  const [workerResults, setWorkerResults] = useState<AppItem[] | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const queryIdRef = useRef(0);

  // Read URL params and initialize Web Worker on mount
  useEffect(() => {
    const p = readParams();
    setQ(p.q);
    setCategory(p.category);
    setGenre(p.genre);
    setSort(p.sort);
    setMounted(true);

    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        const w = new Worker('/workers/searchWorker.js');
        workerRef.current = w;
        w.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (!data || typeof data !== 'object') return;
          if (data.type === 'INDEXED') {
            setWorkerReady(true);
          } else if (data.type === 'RESULTS' && data.queryId === queryIdRef.current) {
            const matchedApps = Array.isArray(data.results)
              ? data.results.map((r: { item: AppItem }) => r.item).filter(Boolean)
              : [];
            setWorkerResults(matchedApps);
            setSearching(false);
          }
        };
        w.postMessage({ type: 'INDEX_CATALOG', payload: APPS });
        return () => {
          w.terminate();
          workerRef.current = null;
        };
      } catch {
        setWorkerReady(false);
      }
    }
  }, []);

  // Dispatch BM25 search to Web Worker when query changes
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setWorkerResults(null);
      setSearching(false);
      return;
    }
    if (workerRef.current && workerReady) {
      const nextId = ++queryIdRef.current;
      setSearching(true);
      workerRef.current.postMessage({
        type: 'SEARCH',
        payload: { query: trimmed },
        queryId: nextId,
      });
    }
  }, [q, workerReady]);

  // Sync filters to URL
  useEffect(() => {
    if (!mounted) return;
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (category !== 'all') sp.set('category', category);
    if (genre !== 'all') sp.set('genre', genre);
    if (sort !== 'popular') sp.set('sort', sort);
    const qs = sp.toString();
    const basePath = window.location.pathname || '/catalog';
    const url = qs ? `${basePath}?${qs}` : basePath;
    window.history.replaceState(null, '', url);
  }, [q, category, genre, sort, mounted]);

  // Filter & sort using BM25 (Web Worker results when available, synchronous BM25Engine fallback otherwise)
  const items = useMemo(() => {
    const trimmed = q.trim();
    let list: AppItem[];

    if (trimmed) {
      if (workerResults !== null) {
        list = [...workerResults];
      } else {
        list = syncEngine.search(trimmed, APPS.length).map((r) => r.document.app);
      }
    } else {
      list = [...APPS];
    }

    if (category !== 'all') {
      list = list.filter((a) => a.category === category);
    }

    if (genre !== 'all') {
      const g = genre.toLowerCase();
      list = list.filter((a) => a.genres.some((x) => x.toLowerCase() === g));
    }

    if (!trimmed) {
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
    }

    return list;
  }, [q, workerResults, category, genre, sort]);

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
        loading={searching}
        onQ={setQ}
        onCategory={setCategory}
        onGenre={setGenre}
        onSort={setSort}
      />

      <main id="main" className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 animate-fade-in">
        {q ? (
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-white">
              Search results for &quot;{q}&quot;
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {items.length} apps found · Okapi BM25 + Typo Tolerance
            </p>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">
              {category === 'all' && 'All Indexed Records'}
              {category === 'game' && 'Games'}
              {category === 'app' && 'Applications'}
              {category === 'tool' && 'Developer & System Tools'}
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
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.uid} item={it} />
          ))}
        </div>
      </main>
    </>
  );
}
