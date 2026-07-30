import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Player from '@/components/Player';
import { detail } from '@/lib/catalog';

export const revalidate = 3600;

interface Props {
  params: Promise<{ uid: string }>;
}

function parseUid(raw: string): string | null {
  const uid = decodeURIComponent(raw ?? '');
  return /^(anime|movie|tv):\d+$/.test(uid) ? uid : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid: rawUid } = await params;
  const uid = parseUid(rawUid);
  if (!uid) return { title: 'Not found' };

  const item = await detail(uid);
  if (!item) return { title: 'Not found' };

  return {
    title: item.title,
    description: item.synopsis.slice(0, 160) || `${item.title} on MediaHub.`,
    openGraph: {
      title: item.title,
      description: item.synopsis.slice(0, 160),
      images: item.backdrop ? [item.backdrop] : undefined
    }
  };
}

const KIND_LABEL: Record<string, string> = {
  anime: 'Anime',
  movie: 'Movie',
  tv: 'Series'
};

export default async function TitlePage({ params }: Props) {
  const { uid: rawUid } = await params;
  const uid = parseUid(rawUid);
  if (!uid) notFound();

  const item = await detail(uid);
  if (!item) notFound();

  const facts: [string, string][] = [];
  if (item.year) facts.push(['Year', String(item.year)]);
  if (item.studio) facts.push(['Studio', item.studio]);
  if (item.episodes) facts.push(['Episodes', String(item.episodes)]);
  if (item.rating) facts.push(['Rating', item.rating]);
  if (item.score != null) facts.push(['Score', `${item.score.toFixed(1)} / 10`]);
  if (item.languages.length) facts.push(['Audio', item.languages.join(', ')]);

  return (
    <div className="animate-fade-in">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-white transition hover:border-accent hover:bg-accent hover:text-ink"
            aria-label="Back to catalog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="truncate text-sm font-bold text-white">{item.title}</span>
          <span className="ml-auto shrink-0 rounded-full border border-line px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
            {KIND_LABEL[item.kind] ?? item.kind}
          </span>
        </div>
      </header>

      <main id="grid" className="mx-auto max-w-[1200px] px-4 pb-20 pt-5">
        <Player trailerKey={item.trailerKey ?? null} title={item.title} backdrop={item.backdrop} />

        <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="hidden md:block">
            {item.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.poster}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full rounded-xl border border-line object-cover shadow-2xl"
              />
            ) : (
              <div className="aspect-[2/3] rounded-xl border border-line bg-panel" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl">
              {item.title}
            </h1>
            {item.originalTitle && item.originalTitle !== item.title && (
              <p className="mt-1 text-sm text-muted">{item.originalTitle}</p>
            )}

            {item.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/?genre=${encodeURIComponent(g)}`}
                    className="rounded-full border border-line bg-accent2/10 px-3 py-1 text-[11px] font-semibold text-accent2 transition hover:border-accent2/50"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {item.synopsis && (
              <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-slate-300">
                {item.synopsis}
              </p>
            )}

            {facts.length > 0 && (
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{k}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
