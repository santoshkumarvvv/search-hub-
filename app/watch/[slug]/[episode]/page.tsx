import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Share2, Star } from 'lucide-react';
import { getAll, getBySlug, getRelated } from '@/lib/data';
import { genreBySlug } from '@/lib/genres';
import { formatCount } from '@/lib/utils';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeList from '@/components/EpisodeList';
import WatchlistButton from '@/components/WatchlistButton';
import Row from '@/components/Row';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAll().flatMap((a) =>
    a.episodes.map((e) => ({ slug: a.slug, episode: String(e.number) })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}): Promise<Metadata> {
  const { slug, episode } = await params;
  const anime = getBySlug(slug);
  const ep = anime?.episodes.find((e) => e.number === Number(episode));
  if (!anime || !ep) return { title: 'नहीं मिला' };

  return {
    title: `${anime.title} — EP ${ep.number}: ${ep.title}`,
    description: ep.synopsis,
    openGraph: { images: [{ url: ep.thumbnail }] },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}) {
  const { slug, episode } = await params;
  const anime = getBySlug(slug);
  const current = Number(episode);
  const ep = anime?.episodes.find((e) => e.number === current);
  if (!anime || !ep) notFound();

  const prev = anime.episodes.find((e) => e.number === current - 1);
  const next = anime.episodes.find((e) => e.number === current + 1);

  return (
    <div className="container-page pb-10 pt-24 sm:pt-28">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-white">होम</Link>
        <span>/</span>
        <Link href={`/anime/${anime.slug}`} className="max-w-[45vw] truncate transition-colors hover:text-white">
          {anime.title}
        </Link>
        <span>/</span>
        <span className="text-gray-300">EP {ep.number}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <VideoPlayer
            source={ep.source}
            title={`${anime.title} — Episode ${ep.number}`}
            poster={ep.thumbnail}
            resumeKey={`${anime.slug}-${ep.number}`}
          />

          {/* title block */}
          <div className="mt-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  Episode {ep.number} · {ep.durationLabel}
                </p>
                <h1 className="mt-1.5 text-balance text-xl font-bold leading-snug sm:text-2xl">
                  {ep.title}
                </h1>
                <Link
                  href={`/anime/${anime.slug}`}
                  className="mt-1 inline-block text-sm text-muted transition-colors hover:text-white"
                >
                  {anime.title}
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <WatchlistButton slug={anime.slug} className="px-4 py-2.5 text-xs" />
                <button type="button" className="btn-ghost px-4 py-2.5 text-xs" aria-label="Share">
                  <Share2 size={15} /> शेयर
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Star size={14} className="fill-amber-400" /> {anime.rating.toFixed(1)}
              </span>
              <span className="text-muted">{formatCount(anime.views)} views</span>
              <span className="text-muted">{anime.languages.join(' · ')}</span>
              <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs text-gray-300">
                {anime.ageRating}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link key={g} href={`/genres/${g}`} className="chip">
                  {genreBySlug(g)?.name ?? g}
                </Link>
              ))}
            </div>

            <p className="mt-5 rounded-xl border border-line bg-panel/50 p-4 text-sm leading-relaxed text-gray-300">
              {ep.synopsis}
            </p>

            {/* prev / next */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {prev ? (
                <Link href={`/watch/${anime.slug}/${prev.number}`} className="btn-ghost min-w-0 px-4 py-2.5 text-xs">
                  <ChevronLeft size={15} />
                  <span className="truncate">पिछला · EP {prev.number}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/watch/${anime.slug}/${next.number}`} className="btn-primary min-w-0 px-4 py-2.5 text-xs">
                  <span className="truncate">अगला · EP {next.number}</span>
                  <ChevronRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* episode sidebar */}
        <aside className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
          <EpisodeList anime={anime} currentEpisode={current} />
        </aside>
      </div>

      <div className="mt-16">
        <Row title="आगे देखें" items={getRelated(anime.slug)} />
      </div>
    </div>
  );
}
