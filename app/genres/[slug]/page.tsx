import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GENRES, genreBySlug } from '@/lib/genres';
import { getByGenre } from '@/lib/data';
import AnimeCard from '@/components/AnimeCard';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = genreBySlug(slug);
  if (!genre) return { title: 'नहीं मिला' };
  return {
    title: `${genre.name} Anime`,
    description: `सर्वश्रेष्ठ ${genre.name} anime सीरीज़ देखें।`,
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = genreBySlug(slug);
  if (!genre) notFound();

  const items = getByGenre(slug).sort((a, b) => b.rating - a.rating);

  return (
    <div className="container-page pb-10 pt-28">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{genre.emoji}</span>
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{genre.name}</h1>
          <p className="mt-1 text-sm text-muted">{items.length} सीरीज़ उपलब्ध</p>
        </div>
      </div>

      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-2">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genres/${g.slug}`}
            className={cn('chip shrink-0', g.slug === slug && 'chip-active')}
          >
            {g.emoji} {g.name}
          </Link>
        ))}
      </div>

      {items.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((anime, i) => (
            <AnimeCard key={anime.slug} anime={anime} index={i} priority={i < 6} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="इस श्रेणी में कुछ नहीं मिला"
            description="जल्द ही और सीरीज़ जोड़ी जाएँगी। तब तक दूसरी श्रेणियाँ देखें।"
            ctaLabel="सभी श्रेणियाँ"
            ctaHref="/genres"
          />
        </div>
      )}
    </div>
  );
}
