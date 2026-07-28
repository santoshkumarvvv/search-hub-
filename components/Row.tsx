'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Anime } from '@/lib/types';
import AnimeCard from './AnimeCard';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  icon?: ReactNode;
  items: Anime[];
  href?: string;
  priority?: boolean;
}

export default function Row({ title, icon, items, href, priority }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="relative">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
          {icon}
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="hidden text-xs font-medium text-muted transition-colors hover:text-white sm:inline-flex sm:items-center sm:gap-1"
            >
              सभी देखें <ChevronRight size={14} />
            </Link>
          )}
          <div className="hidden items-center gap-1.5 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={edge.start}
              aria-label={`Scroll ${title} left`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel/80 transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={edge.end}
              aria-label={`Scroll ${title} right`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel/80 transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={update}
        className={cn(
          'no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2',
          !edge.end && 'md:mask-fade-r',
        )}
      >
        {items.map((anime, i) => (
          <div
            key={anime.slug}
            className="w-[145px] shrink-0 snap-start sm:w-[168px] lg:w-[190px]"
          >
            <AnimeCard anime={anime} index={i} priority={priority && i < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
