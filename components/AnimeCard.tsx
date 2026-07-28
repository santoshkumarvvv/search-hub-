import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import type { Anime } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import WatchlistButton from './WatchlistButton';

interface Props {
  anime: Anime;
  className?: string;
  priority?: boolean;
  index?: number;
}

export default function AnimeCard({ anime, className, priority, index }: Props) {
  return (
    <article
      className={cn('group relative animate-fade-up', className)}
      style={index !== undefined ? { animationDelay: `${Math.min(index, 8) * 45}ms` } : undefined}
    >
      <Link
        href={`/anime/${anime.slug}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-line/70 bg-panel shadow-card">
          <Image
            src={anime.poster}
            alt={`${anime.title} poster`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 210px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />

          {/* top badges */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <span className="rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm">
              HD
            </span>
            {anime.status === 'Airing' && (
              <span className="flex items-center gap-1 rounded-md bg-accent/90 px-2 py-1 text-[10px] font-bold text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-white" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                NEW
              </span>
            )}
          </div>

          {/* hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/45 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0">
            <p className="mb-2 line-clamp-3 text-[11px] leading-relaxed text-gray-300">
              {anime.synopsis}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-glow">
                <Play size={15} fill="currentColor" />
              </span>
              <span className="text-[11px] font-medium text-gray-300">
                {anime.episodes.length} EP · {formatCount(anime.views)} views
              </span>
            </div>
          </div>

          {/* rating pill */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm transition-opacity group-hover:opacity-0">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {anime.rating.toFixed(1)}
          </div>
        </div>
      </Link>

      <div className="absolute right-2.5 top-9 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <WatchlistButton slug={anime.slug} compact />
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-accent">
          <Link href={`/anime/${anime.slug}`}>{anime.title}</Link>
        </h3>
        <p className="mt-1 truncate text-xs text-muted">
          {anime.year} · {anime.genres.slice(0, 2).join(' • ')}
        </p>
      </div>
    </article>
  );
}
