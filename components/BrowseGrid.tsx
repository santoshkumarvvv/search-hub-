'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { Anime, DubStatus } from '@/lib/types';
import { GENRES } from '@/lib/genres';
import AnimeCard from './AnimeCard';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

type Sort = 'trending' | 'new' | 'rating' | 'az';
type DubFilter = 'all' | DubStatus;

const SORTS: { id: Sort; label: string }[] = [
  { id: 'trending', label: 'ट्रेंडिंग' },
  { id: 'new', label: 'नई' },
  { id: 'rating', label: 'रेटिंग' },
  { id: 'az', label: 'A–Z' },
];

const DUBS: { id: DubFilter; label: string }[] = [
  { id: 'all', label: 'सभी' },
  { id: 'dubbed', label: 'हिंदी डब' },
  { id: 'in-progress', label: 'डब जारी' },
  { id: 'announced', label: 'डब जल्द' },
];

export default function BrowseGrid({
  items,
  initialSort = 'trending',
  initialDub = 'all',
}: {
  items: Anime[];
  initialSort?: Sort;
  initialDub?: DubFilter;
}) {
  const [sort, setSort] = useState<Sort>(initialSort);
  const [genre, setGenre] = useState<string>('all');
  const [dub, setDub] = useState<DubFilter>(initialDub);

  const visible = useMemo(() => {
    let filtered = items;
    if (genre !== 'all') filtered = filtered.filter((a) => a.genres.includes(genre));
    if (dub !== 'all') filtered = filtered.filter((a) => a.dubStatus === dub);

    const sorted = [...filtered];
    switch (sort) {
      case 'new':
        sorted.sort((a, b) => b.year - a.year || b.rating - a.rating);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'az':
        sorted.sort((a, b) =>
          (a.titleHindi ?? a.title).localeCompare(b.titleHindi ?? b.title, 'hi'),
        );
        break;
      default:
        sorted.sort((a, b) => Number(b.trending) - Number(a.trending) || b.views - a.views);
    }
    return sorted;
  }, [items, genre, sort, dub]);

  return (
    <>
      <div className="mt-7 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <SlidersHorizontal size={14} /> फ़िल्टर
        </div>

        {/* dub status — the primary filter for a Hindi dub site */}
        <div className="flex flex-wrap items-center gap-2">
          {DUBS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDub(d.id)}
              className={cn('chip', dub === d.id && 'chip-active')}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setGenre('all')}
            className={cn('chip shrink-0', genre === 'all' && 'chip-active')}
          >
            सभी श्रेणियाँ
          </button>
          {GENRES.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => setGenre(g.slug)}
              className={cn('chip shrink-0', genre === g.slug && 'chip-active')}
            >
              {g.emoji} {g.nameHindi}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={cn('chip', sort === s.id && 'chip-active')}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted">{visible.length} परिणाम</span>
        </div>
      </div>

      {visible.length ? (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((anime, i) => (
            <AnimeCard key={anime.slug} anime={anime} index={i} priority={i < 6} />
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <EmptyState
            title="कोई परिणाम नहीं"
            description="इस फ़िल्टर के लिए कुछ नहीं मिला। कोई दूसरी श्रेणी या डब स्टेटस आज़माएँ।"
            ctaLabel="फ़िल्टर हटाएँ"
            ctaHref="/browse"
          />
        </div>
      )}
    </>
  );
}
