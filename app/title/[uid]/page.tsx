import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { APPS } from '@/lib/apps';
import DownloadSection from '@/components/DownloadSection';

export const dynamicParams = false;

interface Props {
  params: Promise<{ uid: string }>;
}

export function generateStaticParams() {
  return APPS.map((a) => ({ uid: a.uid }));
}

function findApp(uid: string) {
  return APPS.find((a) => a.uid === uid) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const app = findApp(decodeURIComponent(uid));
  if (!app) return { title: 'Not found' };

  return {
    title: `${app.name} v${app.version} — Download APK`,
    description: app.description.slice(0, 160)
  };
}

const CAT_LABEL: Record<string, string> = {
  game: 'Game',
  app: 'App',
  tool: 'Tool'
};

export default async function TitlePage({ params }: Props) {
  const { uid: rawUid } = await params;
  const uid = decodeURIComponent(rawUid);
  const app = findApp(uid);
  if (!app) notFound();

  const facts: [string, string][] = [
    ['Version', app.version],
    ['Size', app.size],
    ['Developer', app.developer],
    ['Updated', app.updated],
    ['Downloads', app.downloads],
    ['Rating', `${app.rating.toFixed(1)} / 5`],
    ['Android', app.androidReq],
    ['Category', CAT_LABEL[app.category] ?? app.category]
  ];

  return (
    <div className="animate-fade-in">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1000px] items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-white transition hover:border-accent hover:bg-accent hover:text-ink"
            aria-label="Back to catalog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="truncate text-sm font-bold text-white">{app.name}</span>
          <span className="ml-auto shrink-0 rounded-full border border-line px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
            {CAT_LABEL[app.category] ?? app.category}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-4 pb-20 pt-5">
        {/* App header card */}
        <div className="flex flex-col sm:flex-row items-start gap-5 rounded-xl border border-line bg-panel p-5">
          {/* Icon */}
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.icon}
              alt={app.name}
              referrerPolicy="no-referrer"
              className="h-24 w-24 rounded-2xl border border-line object-cover shadow-lg"
            />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white">
              {app.name}
            </h1>
            <p className="mt-1 text-sm text-accent font-semibold">
              v{app.version} · {app.size}
            </p>

            {app.modFeature && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent2/15 border border-accent2/30 px-3 py-1 text-xs font-bold text-accent2">
                ✓ MOD: {app.modFeature}
              </div>
            )}

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {app.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-line bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted"
                >
                  {t}
                </span>
              ))}
              {app.genres.map((g) => (
                <Link
                  key={g}
                  href={`/?genre=${encodeURIComponent(g)}`}
                  className="rounded border border-line bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent transition hover:border-accent/50"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="text-amber-400">★</span> {app.rating.toFixed(1)}
              </span>
              <span>{app.downloads} downloads</span>
              <span>{app.developer}</span>
            </div>
          </div>

          {/* Download button */}
          <DownloadSection app={app} />
        </div>

        {/* Description */}
        <section className="mt-6 rounded-xl border border-line bg-panel p-5">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wide mb-3">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">{app.description}</p>
        </section>

        {/* MOD Features */}
        {app.modFeature && (
          <section className="mt-4 rounded-xl border border-accent2/20 bg-accent2/5 p-5">
            <h2 className="text-sm font-extrabold text-accent2 uppercase tracking-wide mb-3">
              🎉 MOD Features
            </h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-accent2 mt-0.5">✓</span>
                <span>{app.modFeature}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent2 mt-0.5">✓</span>
                <span>All premium features unlocked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent2 mt-0.5">✓</span>
                <span>No root required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent2 mt-0.5">✓</span>
                <span>Anti-ban protection</span>
              </li>
            </ul>
          </section>
        )}

        {/* App Info table */}
        <section className="mt-4 rounded-xl border border-line bg-panel p-5">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wide mb-3">
            App Information
          </h2>
          <dl className="grid grid-cols-1 gap-0">
            {facts.map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-center justify-between py-2.5 ${
                  i < facts.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <dt className="text-xs font-semibold text-muted">{k}</dt>
                <dd className="text-xs font-bold text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Second download CTA */}
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent2 px-10 py-4 text-base font-extrabold text-ink transition hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download {app.name} v{app.version}
          </button>
          <p className="mt-2 text-[11px] text-muted">
            {app.size} · Requires Android {app.androidReq} · Updated {app.updated}
          </p>
        </div>
      </main>
    </div>
  );
}
