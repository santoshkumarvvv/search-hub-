import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { GENRES } from '@/lib/genres';
import { getByGenre } from '@/lib/data';

export const metadata: Metadata = {
  title: 'श्रेणियाँ',
  description: 'सभी anime श्रेणियाँ ब्राउज़ करें — action, romance, mecha, horror और बहुत कुछ।',
};

export default function GenresPage() {
  return (
    <div className="container-page pb-10 pt-28">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">श्रेणियाँ</h1>
      <p className="mt-2 text-sm text-muted">अपनी पसंद की शैली चुनें और नई सीरीज़ खोजें।</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENRES.map((g) => {
          const items = getByGenre(g.slug);
          const cover = items[0]?.banner;
          return (
            <Link
              key={g.slug}
              href={`/genres/${g.slug}`}
              className="group relative h-36 overflow-hidden rounded-2xl border border-line"
            >
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(max-width:640px) 100vw, 33vw"
                  className="object-cover opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="text-2xl">{g.emoji}</span>
                <h2 className="mt-1 text-lg font-bold text-white">{g.name}</h2>
                <p className="text-xs text-muted">{items.length} सीरीज़</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
