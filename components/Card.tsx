'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { MediaItem } from '@/lib/types';

const KIND_LABEL: Record<string, string> = {
  anime: 'ANIME',
  movie: 'MOVIE',
  tv: 'SERIES'
};

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Card({ item }: { item: MediaItem }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/title/${encodeURIComponent(item.uid)}`}
      className="group block overflow-hidden rounded-xl border border-line bg-gradient-to-b from-panel2 to-panel transition hover:-translate-y-1 hover:border-accent2/40 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent2"
      aria-label={item.title}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-panel2 to-line">
        <div className="absolute inset-0 flex items-center justify-center text-xl font-black tracking-wide text-muted">
          {initials(item.title)}
        </div>

        {item.poster && !failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        <span className="absolute left-2 top-2 rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-ink">
          {KIND_LABEL[item.kind] ?? item.kind.toUpperCase()}
        </span>

        {item.score != null && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur">
            ★ {item.score.toFixed(1)}
          </span>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="line-clamp-2 text-[12.5px] font-bold leading-tight text-white">
          {item.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted">
          <span>{item.year ?? '—'}</span>
          {item.episodes ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.episodes} eps</span>
            </>
          ) : null}
          {item.genres[0] && (
            <span className="rounded bg-accent2/10 px-1.5 py-px font-semibold text-accent2">
              {item.genres[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
