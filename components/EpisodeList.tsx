import Image from 'next/image';
import Link from 'next/link';
import { Mic, Play } from 'lucide-react';
import type { Anime } from '@/lib/types';

export default function EpisodeList({
  anime,
  currentEpisode,
}: {
  anime: Anime;
  currentEpisode?: number;
}) {
  const dubbedCount = anime.episodes.filter((e) =>
    e.audio.some((t) => t.lang === 'hindi'),
  ).length;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">एपिसोड</h2>
        <span className="text-xs text-muted">
          {dubbedCount}/{anime.episodes.length} हिंदी में
        </span>
      </div>

      <ul className="space-y-3">
        {anime.episodes.map((ep) => {
          const active = ep.number === currentEpisode;
          const hasHindi = ep.audio.some((t) => t.lang === 'hindi');

          return (
            <li key={ep.number}>
              <Link
                href={`/watch/${anime.slug}/${ep.number}`}
                aria-current={active ? 'true' : undefined}
                className={`group flex gap-4 rounded-xl border p-3 transition-all ${
                  active
                    ? 'border-accent/70 bg-accent/10'
                    : 'border-line bg-panel/50 hover:border-white/25 hover:bg-panel'
                }`}
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg sm:w-40">
                  <Image
                    src={ep.thumbnail}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </span>
                  </span>
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium">
                    {ep.durationLabel}
                  </span>
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-accent">एपिसोड {ep.number}</span>
                    {hasHindi ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        <Mic size={9} /> हिंदी
                      </span>
                    ) : (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                        डब जल्द
                      </span>
                    )}
                    {active && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold">
                        चल रहा है
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 truncate text-sm font-semibold text-white">
                    {ep.titleHindi ?? ep.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {ep.synopsis}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
