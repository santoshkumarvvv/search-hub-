'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CATALOG_CORPUS, CatalogDoc } from '@/lib/apps';
import { BM25Engine } from '@/lib/search/bm25';

const DEMO_QUERIES = [
  { label: 'bm25 algorithm', query: 'bm25 algorithm' },
  { label: 'minecrft (typo)', query: 'minecrft' },
  { label: 'scrypt kdf', query: 'scrypt kdf' },
  { label: 'wireguard vpn', query: 'wireguard vpn' },
  { label: 'flutter mobile', query: 'flutter mobile' },
];

const FEATURES = [
  {
    title: 'Okapi BM25 Search',
    line: 'Probabilistic term saturation (k1=1.2, b=0.75) and document-length normalization that outranks naive substring matching.',
    meta: 'k1 = 1.2 · b = 0.75 · Zero dependencies',
    icon: (
      <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
      </svg>
    ),
  },
  {
    title: 'Typo Tolerance',
    line: 'Single-edit Levenshtein fuzzy recovery runs inside an isolated Web Worker thread so mistyped queries still resolve at 120fps.',
    meta: 'Edit distance ≤ 1 · Unicode & Devanagari',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Scrypt API Gateway',
    line: 'O(1) key lookup paired with scrypt:v1 salted hashing, timing-safe secret verification, and sliding-window tier quotas.',
    meta: 'scrypt:v1 · N=16384 · Tiered RPM quotas',
    icon: (
      <svg className="h-5 w-5 text-accent2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹19',
    subtitle: 'For personal sites, docs & indie blogs',
    features: [
      '1 drop-in search widget (<2 KB gzip)',
      'Up to 5,000 indexed documents',
      'Client-side BM25 + 1-edit fuzzy match',
      'Web Worker background execution',
    ],
    cta: 'Start with Starter',
    href: '/pricing.html#razorpay-starter',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹99',
    subtitle: 'For production SaaS & developer docs',
    features: [
      'Unlimited widgets & indexed documents',
      '50,000 hosted API searches / month',
      'Scrypt-vaulted API keys & 60 RPM quota',
      'Federated ranking + custom score boosts',
    ],
    cta: 'Upgrade to Pro',
    href: '/pricing.html#razorpay-pro',
    featured: true,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '₹199',
    subtitle: 'For teams running search on autopilot',
    features: [
      '500,000 hosted API searches / month',
      'Autonomous scheduled agent runs (3/day)',
      'Corpus drift (JSD) & contradiction alerts',
      'CSV/JSON telemetry export & 300 RPM',
    ],
    cta: 'Launch Ultra',
    href: '/pricing.html#razorpay-ultra',
    featured: false,
  },
];

const localEngine = new BM25Engine<CatalogDoc>(1.2, 0.75);
localEngine.addDocuments(CATALOG_CORPUS);

export default function HomePage() {
  const [query, setQuery] = useState('bm25 algorithm');
  const [latencyMs, setLatencyMs] = useState<number>(0.12);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    if (!trimmed) {
      const defaults = CATALOG_CORPUS.slice(0, 6).map((doc) => ({
        document: doc,
        score: 1.0,
        matchedTerms: [] as string[],
      }));
      setLatencyMs(0.05);
      return defaults;
    }
    const hits = localEngine.search(trimmed, 6);
    const elapsed = typeof performance !== 'undefined' ? Number((performance.now() - t0).toFixed(2)) : 0.1;
    setLatencyMs(Math.max(elapsed, 0.04));
    return hits;
  }, [query]);

  return (
    <main id="main" className="animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-[1160px] px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-gold/90 mb-4">
          Client-Side BM25 · Web Worker · Scrypt API Gateway
        </p>

        <h1 className="font-display mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          Instant search that runs in your browser.{' '}
          <span className="bg-gradient-to-r from-purple via-purple to-gold bg-clip-text text-transparent">
            Zero cloud bill.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Replace heavy search clusters with a 1.7 KB drop-in Okapi BM25 engine and scrypt-secured API gateway. Sub-millisecond lexical ranking, typo recovery, and India-first UPI plans from ₹19/month.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <a href="#live-demo" className="btn-primary w-full sm:w-auto">
            Try Live Demo
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="/pricing.html" className="btn-secondary w-full sm:w-auto">
            View Pricing — ₹19/mo
          </a>
          <Link href="/catalog" className="btn-secondary w-full sm:w-auto">
            Explore 45-App Catalog →
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted">
          <span>52 Indexed Records Ready</span>
          <span aria-hidden="true">·</span>
          <span>1.7 KB Gzipped Widget</span>
          <span aria-hidden="true">·</span>
          <span>Unicode &amp; Hindi Ready</span>
          <span aria-hidden="true">·</span>
          <span>UPI AutoPay Support</span>
        </div>
      </section>

      {/* 2. THREE FEATURE CARDS */}
      <section id="features" className="mx-auto max-w-[1160px] px-4 py-14 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Engineered for speed, accuracy, and zero lock-in
          </h2>
          <p className="mt-2 text-sm text-muted">
            Three core primitives working together across static sites, Web Workers, and edge API routes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="card-surface p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel2">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.line}</p>
              </div>
              <p className="mt-5 border-t border-line/70 pt-3 font-mono text-[11px] text-muted/80">
                {f.meta}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. LIVE MINI DEMO SEARCH BOX */}
      <section id="live-demo" className="mx-auto max-w-[1160px] px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-line bg-panel/95 p-5 sm:p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-gold">
                Interactive BM25 Sandbox
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
                Test live ranking &amp; typo recovery right now
              </h2>
            </div>
            <p className="font-mono text-xs text-accent2" aria-live="polite">
              {searchResults.length} results in {latencyMs.toFixed(2)} ms · 52 docs indexed
            </p>
          </div>

          <div className="mt-6 relative flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3.5 focus-within:border-purple">
            <svg className="h-5 w-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              ref={inputRef}
              id="home-live-search"
              type="search"
              role="combobox"
              aria-expanded={searchResults.length > 0}
              aria-controls="home-search-results"
              aria-autocomplete="list"
              aria-label="Search 52 indexed documents and apps with BM25"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 52 docs & apps (try: minecrft, bm25 algorithm, scrypt, wireguard)..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-muted/60 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search query"
                className="rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-panel2 hover:text-white active:scale-[0.98]"
              >
                Clear
              </button>
            )}
            <kbd className="hidden sm:inline-block rounded border border-line bg-panel2 px-2 py-0.5 font-mono text-[11px] text-muted">
              ⌘K
            </kbd>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted mr-1">Try query:</span>
            {DEMO_QUERIES.map((preset) => (
              <button
                key={preset.query}
                type="button"
                onClick={() => setQuery(preset.query)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
                  query === preset.query
                    ? 'border-purple bg-purple/20 text-white'
                    : 'border-line bg-panel2/70 text-muted hover:border-purple/60 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <ul
            id="home-search-results"
            role="listbox"
            aria-label="BM25 ranked search results"
            className="mt-6 grid grid-cols-1 gap-3.5 md:grid-cols-2"
          >
            {searchResults.length === 0 ? (
              <li className="col-span-full rounded-xl border border-line/60 bg-ink/60 p-8 text-center text-sm text-muted">
                No lexical or 1-edit fuzzy matches for &ldquo;{query}&rdquo;. Try one of the preset queries above.
              </li>
            ) : (
              searchResults.map((hit) => (
                <li
                  key={hit.document.id}
                  role="option"
                  aria-selected={false}
                  className="card-surface bg-ink/80 p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={hit.document.url}
                        className="font-display text-base font-bold text-white hover:text-gold transition line-clamp-1"
                      >
                        {hit.document.title}
                      </a>
                      <span className="shrink-0 font-mono text-xs font-semibold text-accent2">
                        {hit.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">
                      {hit.document.snippet}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted/80 font-mono">
                    <span>{hit.document.category}</span>
                    <span>
                      {hit.matchedTerms.length > 0
                        ? `Matched: ${hit.matchedTerms.slice(0, 3).join(', ')}`
                        : 'Default top rank'}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-line/70 pt-5 text-xs text-muted sm:flex-row">
            <span>
              Want to embed this widget on your site? Drop in{' '}
              <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-white">
                &lt;script src=&quot;/embed.js&quot;&gt;&lt;/script&gt;
              </code>
            </span>
            <div className="flex w-full sm:w-auto gap-3">
              <a href="/demo.html" className="btn-secondary w-full sm:w-auto !py-2 !px-4 !text-xs">
                Open Full Worker Demo →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING TEASER */}
      <section id="pricing" className="mx-auto max-w-[1160px] px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-gold">
            India-First UPI Pricing
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-4xl">
            Simple plans. Zero USD cloud surprises.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Start at ₹19/month for personal sites, or unlock hosted scrypt API keys and scheduled search agents.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card-surface flex flex-col justify-between p-6 sm:p-8 ${
                plan.featured
                  ? 'border-purple/80 bg-gradient-to-b from-panel2/95 to-panel'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  {plan.featured && (
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">{plan.subtitle}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted">/month via UPI</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-muted">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <span className="text-accent2 font-bold" aria-hidden="true">
                        ✓
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={plan.href}
                className={`mt-8 w-full ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
