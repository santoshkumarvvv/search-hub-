'use client';

import { Check, Plus } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';

interface Props {
  slug: string;
  compact?: boolean;
  className?: string;
}

export default function WatchlistButton({ slug, compact = false, className }: Props) {
  const { has, toggle, hydrated } = useWatchlist();
  const saved = hydrated && has(slug);

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(slug);
        }}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        aria-pressed={saved}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90',
          saved
            ? 'border-accent bg-accent text-white'
            : 'border-white/30 bg-black/60 text-white hover:border-accent hover:bg-accent',
          className,
        )}
      >
        {saved ? <Check size={14} /> : <Plus size={14} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className={cn('btn-ghost', saved && 'border-accent/70 bg-accent/15', className)}
    >
      {saved ? <Check size={18} /> : <Plus size={18} />}
      {saved ? 'Watchlist में है' : 'Watchlist में जोड़ें'}
    </button>
  );
}
