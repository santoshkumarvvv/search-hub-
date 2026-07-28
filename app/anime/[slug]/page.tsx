import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clapperboard, Globe, Play, Shield, Star } from 'lucide-react';
import { getAll, getBySlug, getRelated } from '@/lib/data';
import { genreBySlug } from '@/lib/genres';
import { formatCount } from '@/lib/utils';
import WatchlistButton from '@/components/WatchlistButton';
import Row from '@/components/Row';
import EpisodeList from '@/components/EpisodeList';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAll().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const anime = getBySlug(slug);
  if (!anime) return { title: 'नहीं मिला' };

  return {
    title: anime.title,
    description: anime.synopsis.slice(0, 155),
    openGraph: {
      title: anime.title,
      description: anime.synopsis.slice(0, 155),
      images: [{ url: anime.banner }],
    },
  };
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const anime = getBySlug(slug);
  if (!anime) notFound();

  const related = getRelated(slug);

  const meta = [
    { icon: Calendar, label: 'वर्ष', value: String(anime.year) },
    { icon: Clapperboard, label: 'स्टूडियो', value: anime.studio },
    { icon: Shield, label: 'रेटिंग', value: anime.ageRating },
    { icon: Globe, label: 'भाषाएँ', value: anime.languages.join(', ') },
  ];

  return (
    <>
      {/* banner */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <Image src={anime.banner} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 hero-scrim" />
      </div>

      <div className="container-page relative z-10 -mt-40 pb-8 sm:-mt-48">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end">
          <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-2xl border border-line shadow-card sm:w-52">
            <Image
              src={anime.poster}
              alt={`${anime.title} poster`}
              fill
              sizes="208px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              {anime.genres.map((g) => {
                const genre = genreBySlug(g);
                return (
                  <Link key={g} href={`/genres/${g}`} className="chip">
                    {genre?.emoji} {genre?.name ?? g}
                  </Link>
                );
              })}
            </div>

            <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">
              {anime.title}
            </h1>
            {anime.altTitle && <p className="mt-2 text-gray-400">{anime.altTitle}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Star size={15} className="fill-amber-400" /> {anime.rating.toFixed(1)}
              </span>
              <span className="text-muted">{anime.episodes.length} Episodes</span>
              <span className="text-muted">{formatCount(anime.views)} views</span>
              <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs text-gray-300">
                {anime.status}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/watch/${anime.slug}/1`} className="btn-primary px-6 py-3">
                <Play size={18} fill="currentColor" /> एपिसोड 1 देखें
              </Link>
              <WatchlistButton slug={anime.slug} />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-bold">कहानी</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
                {anime.synopsis}
              </p>
            </section>

            <EpisodeList anime={anime} />
          </div>

          <aside className="space-y-4">
            <div className="card-surface p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">जानकारी</h3>
              <dl className="mt-4 space-y-4">
                {meta.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="text-sm font-medium text-white">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <Row title="मिलती-जुलती सीरीज़" items={related} />
          </div>
        )}
      </div>
    </>
  );
}
