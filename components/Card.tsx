'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AppItem } from '@/lib/types';

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
      className="card-surface group flex h-full flex-col justify-between p-5"
      aria-label={`View ${item.name}`}
    >
      <div>
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-panel2 text-xs font-bold text-muted">
            <span>{initials(item.name)}</span>
            {item.icon && !failed && (
              <img
                src={item.icon}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-ink group-hover:text-purple">
              {item.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              {item.developer} · {item.genre}
            </p>
          </div>
        </div>

        <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {item.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-muted tabular-nums">
        <span>★ {item.rating.toFixed(1)} · {item.size}</span>
        <span>v{item.version}</span>
      </div>
    </Link>
  );
}
