'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AppItem } from '@/lib/types';

const TAG_COLORS: Record<string, string> = {
  APK:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MOD:  'bg-green-500/20 text-green-400 border-green-500/30',
  OBB:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PRO:  'bg-amber-500/20 text-amber-400 border-amber-500/30'
};

const CAT_EMOJI: Record<string, string> = {
  game: '🎮',
  app:  '📱',
  tool: '🔧'
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Card({ item }: { item: AppItem }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/title/${encodeURIComponent(item.uid)}`}
      className="group block overflow-hidden rounded-xl border border-line bg-panel transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={`Download ${item.name}`}
    >
      {/* Icon area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-panel2 to-line p-4">
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-black tracking-wide text-muted/40">
          {initials(item.name)}
        </div>

        {item.icon && !failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.icon}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-2xl object-cover transition duration-300 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Trending badge */}
        {item.trending && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-highlight text-[9px]">
            🔥
          </span>
        )}

        {/* Editor's choice ribbon */}
        {item.editorChoice && (
          <span className="absolute left-0 top-2 bg-accent2 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-ink rounded-r">
            Editor&apos;s Pick
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-[13px] font-bold text-white group-hover:text-accent transition-colors">
          {item.name}
        </h3>

        {/* Mod feature */}
        {item.modFeature && (
          <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-accent2">
            ✓ {item.modFeature}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted">
          <span className="flex items-center gap-1">
            <span className="text-amber-400">★</span> {item.rating.toFixed(1)}
          </span>
          <span>{item.size}</span>
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span
              key={t}
              className={`rounded border px-1.5 py-px text-[9px] font-bold tracking-wide ${
                TAG_COLORS[t] ?? 'border-line bg-white/5 text-muted'
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Version + category */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted/70">
          <span>v{item.version}</span>
          <span>
            {CAT_EMOJI[item.category] ?? ''} {item.genre}
          </span>
        </div>
      </div>
    </Link>
  );
}
