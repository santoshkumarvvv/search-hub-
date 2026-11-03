import Link from 'next/link';

const SUGGESTIONS = [
  'data engineering jobs',
  'react hooks tutorial',
  'python async await',
  'system design interview',
  'docker compose guide',
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl mx-auto text-center">
        <span className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-purple/20 text-purple border border-purple/30">
          SearchEmbed
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          <span className="bg-gradient-to-r from-purple via-purple to-gold bg-clip-text text-transparent">
            Search that runs in your browser.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-10">
          Client-side BM25 ranking. Zero server cost. No Algolia bill. One script tag and it works.
        </p>

        <div className="relative w-full max-w-2xl mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-purple/20 blur-xl" />
          <div className="relative flex items-center gap-3 rounded-2xl border border-line bg-panel/80 backdrop-blur-md px-5 py-4 shadow-2xl">
            <svg className="w-5 h-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth={2} strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              type="search"
              placeholder="Try: data engineering jobs, react hooks..."
              className="flex-1 bg-transparent text-white placeholder:text-muted/60 outline-none text-base"
              disabled
            />
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-line text-[10px] text-muted font-mono">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="px-3 py-1.5 rounded-full text-xs border border-line text-muted hover:border-purple hover:text-purple transition cursor-default"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/pricing.html"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple to-gold text-ink font-bold text-sm hover:opacity-90 transition"
          >
            View Plans — ₹19/mo
          </a>
          <a
            href="https://github.com/santoshkumarvvv/search-hub-"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl border border-line text-sm font-semibold text-white/80 hover:border-purple hover:text-purple transition"
          >
            View on GitHub
          </a>
          <Link
            href="/catalog"
            className="px-6 py-3 rounded-xl border border-line text-sm font-semibold text-white/80 hover:border-purple hover:text-purple transition"
          >
            App Catalog →
          </Link>
        </div>

        <p className="mt-16 text-xs text-muted/50">
          BM25 · Web Worker · Zero Dependencies · UPI Pricing for India
        </p>
      </div>
    </main>
  );
}
