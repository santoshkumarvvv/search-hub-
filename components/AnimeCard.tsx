import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import type { Anime } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import WatchlistButton from './WatchlistButton';
import DubBadge from './DubBadge';

interface Props {
  anime: Anime;
  className?: string;
  priority?: boolean;
  index?: number;
}

export default function AnimeCard({ anime, className, priority, index }: Props) {
  const heading = anime.titleHindi ?? anime.title;

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
            alt={`${heading} पोस्टर`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 210px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />

          {/* top badges */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2.5">
            <DubBadge status={anime.dubStatus} />
            <span className="rounded-md bg-black/70 px-1.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              HD
            </span>
          </div>

          {/* hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/45 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="mb-2 line-clamp-3 text-[11px] leading-relaxed text-gray-300">
              {anime.synopsis}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-glow">
                <Play size={15} fill="currentColor" />
              </span>
              <span className="text-[11px] font-medium text-gray-300">
                {anime.episodes.length} एपिसोड · {formatCount(anime.views)} व्यूज़
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

      <div className="absolute right-2.5 top-9 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <WatchlistButton slug={anime.slug} compact />
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-accent">
          <Link href={`/anime/${anime.slug}`}>{heading}</Link>
        </h3>
        <p className="mt-1 truncate text-xs text-muted">
          {anime.year} · {anime.episodes.length} एपिसोड
        </p>
      </div>
    </article>
  );
}
