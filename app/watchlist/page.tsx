'use client';

import { Bookmark, Trash2 } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getBySlug } from '@/lib/data';
import AnimeCard from '@/components/AnimeCard';
import EmptyState from '@/components/EmptyState';

export default function WatchlistPage() {
  const { list, clear, hydrated } = useWatchlist();
  const items = list.map(getBySlug).filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="container-page min-h-[70vh] pb-10 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-black tracking-tight sm:text-4xl">
            <Bookmark size={26} className="text-accent" />
            मेरी लिस्ट
          </h1>
          <p className="mt-2 text-sm text-muted">
            {hydrated ? `${items.length} सीरीज़ सहेजी गई` : 'लोड हो रहा है...'}
          </p>
        </div>

        {hydrated && items.length > 0 && (
          <button type="button" onClick={clear} className="btn-ghost px-4 py-2.5 text-xs">
            <Trash2 size={15} /> सब हटाएँ
          </button>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      ) : items.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((anime, i) => (
            <AnimeCard key={anime.slug} anime={anime} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="लिस्ट खाली है"
            description="किसी भी सीरीज़ पर + बटन दबाकर उसे यहाँ सहेजें और बाद में देखें।"
            ctaLabel="हिंदी डब सीरीज़ देखें"
            ctaHref="/browse?dub=dubbed"
          />
        </div>
      )}
    </div>
  );
}
