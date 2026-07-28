'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { getAll, searchAnime } from '@/lib/data';
import { GENRES } from '@/lib/genres';
import AnimeCard from './AnimeCard';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialGenre = searchParams.get('genre') ?? 'all';

  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);

  /* debounce typing so filtering stays smooth */
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 220);
    return () => clearTimeout(id);
  }, [query]);

  /* keep the URL shareable without adding history entries */
  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced.trim()) params.set('q', debounced.trim());
    if (genre !== 'all') params.set('genre', genre);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
  }, [debounced, genre, router]);

  const results = useMemo(() => searchAnime(debounced, genre), [debounced, genre]);
  const isSearching = debounced.trim().length > 0 || genre !== 'all';
  const suggestions = useMemo(() => getAll().slice(0, 12), []);

  return (
    <>
      <div className="mt-7">
        <div className="group flex items-center gap-3 rounded-2xl border border-line bg-panel/70 px-4 py-3.5 transition-colors focus-within:border-accent/70">
          <Search size={19} className="shrink-0 text-muted transition-colors group-focus-within:text-accent" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="सीरीज़, स्टूडियो या शैली खोजें..."
            aria-label="Search anime"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="shrink-0 text-muted transition-colors hover:text-white"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setGenre('all')}
            className={cn('chip shrink-0', genre === 'all' && 'chip-active')}
          >
            सभी
          </button>
          {GENRES.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => setGenre(g.slug)}
              className={cn('chip shrink-0', genre === g.slug && 'chip-active')}
            >
              {g.emoji} {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-muted">
          {isSearching
            ? `${results.length} परिणाम${debounced.trim() ? ` — “${debounced.trim()}”` : ''}`
            : 'लोकप्रिय सुझाव'}
        </h2>

        {isSearching && !results.length ? (
          <EmptyState
            title="कुछ नहीं मिला"
            description="कोई और कीवर्ड आज़माएँ या श्रेणी फ़िल्टर हटाकर देखें।"
            ctaLabel="पूरा कैटलॉग देखें"
            ctaHref="/browse"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {(isSearching ? results : suggestions).map((anime, i) => (
              <AnimeCard key={anime.slug} anime={anime} index={i} priority={i < 6} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
