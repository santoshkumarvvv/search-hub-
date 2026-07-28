'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { History, Play, X } from 'lucide-react';
import { getBySlug } from '@/lib/data';
import type { Anime, Episode } from '@/lib/types';

interface Entry {
  anime: Anime;
  episode: Episode;
  percent: number;
  key: string;
}

/** Reads resume positions written by the video player (kitsune:pos:<slug>-<ep>). */
export default function ContinueWatching() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = () => {
    const found: Entry[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith('kitsune:pos:')) continue;

      const id = key.replace('kitsune:pos:', '');
      const match = id.match(/^(.*)-(\d+)$/);
      if (!match) continue;

      const anime = getBySlug(match[1]);
      const episode = anime?.episodes.find((e) => e.number === Number(match[2]));
      if (!anime || !episode) continue;

      const seconds = Number(window.localStorage.getItem(key) ?? 0);
      if (seconds < 10) continue;

      // Sample sources average ~10 min; clamp so the bar always reads sensibly.
      const percent = Math.min(Math.round((seconds / 600) * 100), 96);
      found.push({ anime, episode, percent, key });
    }
    setEntries(found.slice(0, 6));
  };

  useEffect(() => {
    load();
    setHydrated(true);
  }, []);

  const remove = (key: string) => {
    window.localStorage.removeItem(key);
    load();
  };

  if (!hydrated || !entries.length) return null;

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
        <History size={19} className="text-cyan" />
        देखना जारी रखें
      </h2>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {entries.map(({ anime, episode, percent, key }) => (
          <div
            key={key}
            className="group relative w-[240px] shrink-0 overflow-hidden rounded-xl border border-line bg-panel/70 sm:w-[280px]"
          >
            <Link href={`/watch/${anime.slug}/${episode.number}`} className="block">
              <div className="relative aspect-video">
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-glow">
                    <Play size={17} fill="currentColor" className="ml-0.5" />
                  </span>
                </span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
                  <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{anime.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  EP {episode.number} · {episode.title}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => remove(key)}
              aria-label="Remove from continue watching"
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 opacity-0 backdrop-blur-sm transition-opacity hover:bg-accent group-hover:opacity-100"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
