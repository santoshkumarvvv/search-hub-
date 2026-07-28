'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info, Play, Star } from 'lucide-react';
import type { Anime } from '@/lib/types';
import { AUDIO_LABELS } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import WatchlistButton from './WatchlistButton';
import DubBadge from './DubBadge';

export default function Hero({ items }: { items: Anime[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (!items.length) return null;

  const current = items[active];
  const name = current.titleHindi ?? current.title;
  const firstHindi = current.episodes.find((e) => e.audio.some((t) => t.lang === 'hindi'));
  const startEp = firstHindi ?? current.episodes[0];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-[86vh] min-h-[560px] w-full overflow-hidden sm:h-[88vh]"
      aria-roledescription="carousel"
      aria-label="फ़ीचर्ड एनिमे"
    >
      {items.map((anime, i) => (
        <div
          key={anime.slug}
          aria-hidden={i !== active}
          className={cn(
            'absolute inset-0 transition-opacity duration-[1200ms] ease-out',
            i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Image
            src={anime.banner}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              'object-cover object-center transition-transform duration-[9000ms] ease-out',
              i === active ? 'scale-110' : 'scale-100',
            )}
          />
          <div className="absolute inset-0 hero-scrim" />
        </div>
      ))}

      <div className="container-page relative flex h-full items-end pb-20 sm:pb-24">
        <div key={current.slug} className="max-w-2xl animate-fade-up">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <DubBadge status={current.dubStatus} size="md" />
            <span className="rounded-full border border-line bg-black/50 px-3 py-1 text-[11px] font-medium text-gray-200 backdrop-blur-sm">
              {current.ageRating}
            </span>
          </div>

          <h1 className="text-balance text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {name}
          </h1>
          <p className="mt-3 text-base font-light text-gray-400 sm:text-lg">{current.title}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Star size={15} className="fill-amber-400" />
              {current.rating.toFixed(1)}
            </span>
            <span className="text-muted">{current.year}</span>
            <span className="text-muted">{current.episodes.length} एपिसोड</span>
            <span className="text-muted">{formatCount(current.views)} व्यूज़</span>
            <span className="text-muted">
              {current.languages.map((l) => AUDIO_LABELS[l]).join(' · ')}
            </span>
          </div>

          <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
            {current.synopsis}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/watch/${current.slug}/${startEp.number}`}
              className="btn-primary px-7 py-3.5 text-base"
            >
              <Play size={19} fill="currentColor" />
              {firstHindi ? 'हिंदी में देखें' : 'अभी देखें'}
            </Link>
            <Link href={`/anime/${current.slug}`} className="btn-ghost px-5 py-3.5">
              <Info size={18} /> विवरण
            </Link>
            <WatchlistButton slug={current.slug} className="px-5 py-3.5" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-10 sm:translate-x-0">
        {items.map((item, i) => (
          <button
            key={item.slug}
            onClick={() => setActive(i)}
            aria-label={`${item.titleHindi ?? item.title} दिखाएँ`}
            aria-current={i === active}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              i === active ? 'w-8 bg-accent' : 'w-4 bg-white/30 hover:bg-white/60',
            )}
          />
        ))}
      </div>
    </section>
  );
}
