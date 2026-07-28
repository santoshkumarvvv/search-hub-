import Link from 'next/link';
import { GENRES } from '@/lib/genres';

export default function GenreChips() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold tracking-tight sm:text-xl">श्रेणियाँ ब्राउज़ करें</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genres/${g.slug}`}
            className="group relative overflow-hidden rounded-xl border border-line bg-panel/60 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-panel"
          >
            <span className="text-xl">{g.emoji}</span>
            <p className="mt-2 text-sm font-semibold text-white">{g.name}</p>
            <span className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/15 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
