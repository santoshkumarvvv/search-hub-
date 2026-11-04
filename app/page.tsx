'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Public sandbox free-tier key registered in lib/saas/apiKeyGateway.ts (key_homepagedemo0001)
const SANDBOX_DEMO_KEY = ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

const BENTO_FEATURES = [
  {
    title: 'BM25 ranking',
    sentence:
      'Scores every document by term frequency saturation and field-length normalization so the sharpest match always ranks first.',
    span: 'md:col-span-7',
    icon: (
      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
      </svg>
    ),
  },
  {
    title: 'Typo tolerance',
    sentence:
      'Recovers misspelled queries automatically using single-edit Damerau-Levenshtein matching across Latin and Devanagari text.',
    span: 'md:col-span-5',
    icon: (
      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Federated signals',
    sentence:
      'Blends lexical relevance with recency and popularity weights across multiple indices without round-trip network latency.',
    span: 'md:col-span-5',
    icon: (
      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    title: 'API gateway with tiers',
    sentence:
      'Authenticates scrypt-hashed API keys in O(1) time with sliding-window rate limits and enforced monthly quotas.',
    span: 'md:col-span-7',
    icon: (
      <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Index your data',
    desc: 'Point SearchEmbed at a static JSON feed or push records directly to the hosted API.',
  },
  {
    step: '02',
    title: 'Search anywhere',
    desc: 'Drop a single 2 KB script tag into any React, Next.js, docs portal, or static HTML page.',
  },
  {
    step: '03',
    title: 'Get ranked results',
    desc: 'Visitors receive typo-tolerant Okapi BM25 results in under one millisecond.',
  },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Solo Dev',
    price: '₹19',
    whoItFits: 'Fits personal sites, portfolios, and technical blogs.',
    features: [
      '1 search widget (<2 KB gzip)',
      'Up to 5,000 indexed documents',
      'Okapi BM25 + 1-edit typo tolerance',
      'Web Worker background offloading',
    ],
    cta: 'Start at ₹19/mo',
    href: '/pricing.html#razorpay-starter',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Team',
    badge: 'Most popular for indie devs',
    price: '₹99',
    whoItFits: 'Fits indie SaaS products, documentation hubs, and production web apps.',
    features: [
      'Unlimited widgets & indexed documents',
      '50,000 hosted API searches / month',
      'Scrypt API key gateway + rate quotas',
      'Custom ranking boosts & JSON/CSV export',
    ],
    cta: 'Choose Team — ₹99/mo',
    href: '/pricing.html#razorpay-pro',
    featured: true,
  },
  {
    id: 'ultra',
    name: 'Platform',
    price: '₹199',
    whoItFits: 'Fits high-volume platforms running autonomous scheduled search agents.',
    features: [
      '500,000 hosted API searches / month',
      'Scheduled autonomous agent runs (3/day)',
      'Semantic drift & contradiction alerts',
      'Dedicated priority routing & SLA',
    ],
    cta: 'Choose Platform — ₹199/mo',
    href: '/pricing.html#razorpay-ultra',
    featured: false,
  },
];

export default function HomePage() {
  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    if (w.SearchEmbed && typeof w.SearchEmbed.init === 'function') {
      w.SearchEmbed.init();
    }
  }, []);

  return (
    <main id="main" className="animate-fade-in">
      <Script
        src="/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as unknown as { SearchEmbed?: { init: () => void } };
          w.SearchEmbed?.init();
        }}
      />

      {/* 1. HERO — Max 8 words, outcome-first, 1 supporting sentence, 1 primary + 1 ghost CTA, zero clutter */}
      <section className="mx-auto max-w-[1120px] px-4 pt-20 pb-14 sm:px-6 sm:pt-28 sm:pb-16 text-center">
        <h1 className="font-display mx-auto max-w-4xl text-4xl font-extrabold leading-[1.06] tracking-tight text-white/90 sm:text-6xl md:text-7xl">
          Search that{' '}
          <span className="hero-underline">ships in seconds.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg">
          Drop one script tag to index, rank, and typo-correct your entire catalog in under a millisecond—with zero server bill.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <a href="#sandbox" className="btn-primary w-full sm:w-auto">
            Try it live
          </a>
          <a href="/pricing.html" className="btn-secondary w-full sm:w-auto">
            See pricing
          </a>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE SANDBOX — Full width, continuous dark surface, /embed.js -> /api/search */}
      <section
        id="sandbox"
        aria-label="Live BM25 Search Sandbox"
        className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-6"
      >
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="rounded-2xl border border-white/5 bg-panel p-5 sm:p-8"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
            <span className="font-mono">
              Interactive Sandbox · /api/search · Okapi BM25 (k1=1.2, b=0.75)
            </span>
            <span
              data-search-status
              aria-live="polite"
              className="font-mono text-xs text-white/50"
            >
              Ready · 52 records indexed
            </span>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-ink px-4 py-4 focus-within:border-white/20">
            <svg
              className="h-5 w-5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>
            <input
              data-search-input
              type="search"
              defaultValue="bm25 algorithm"
              aria-label="Live BM25 search input"
              placeholder="Type a query or test a typo (e.g. bm25 algorithm, minecrft, scrypt kdf, wireguard)..."
              className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/50 focus:outline-none sm:text-base"
            />
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/50">Try query:</span>
            {['bm25 algorithm', 'minecrft', 'scrypt kdf', 'wireguard vpn'].map((q) => (
              <button
                key={q}
                type="button"
                data-search-preset={q}
                className="rounded-lg border border-white/5 bg-ink px-3 py-1 font-mono text-xs text-white/50 transition hover:border-white/15 hover:text-white/90"
              >
                {q}
              </button>
            ))}
          </div>

          <div
            id="homepage-embed-results"
            data-search-results
            className="mt-5"
          />
        </div>
      </section>

      {/* 3. BENTO GRID OF FOUR CARDS — Equal height in row, icon + 1 sentence, hover lift scale(1.02) */}
      <section id="features" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-white/90 sm:text-4xl">
            Engineered for sub-millisecond retrieval.
          </h2>
          <p className="mt-2.5 text-sm text-white/50 sm:text-base">
            Every primitive needed for production search, shipped in a single zero-dependency runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {BENTO_FEATURES.map((f) => (
            <article
              key={f.title}
              className={`card-surface ${f.span} flex h-full flex-col justify-between p-6 sm:p-8`}
            >
              <div>
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-ink">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-white/90">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/50">{f.sentence}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. THREE-STEP FLOW — Index your data -> Search anywhere -> Get ranked results */}
      <section id="how-it-works" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-white/90 sm:text-4xl">
            Live in three steps.
          </h2>
          <p className="mt-2.5 text-sm text-white/50 sm:text-base">
            No cluster provisioning, no Docker containers, and no recurring cloud egress charges.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <span className="font-mono text-xs font-semibold text-white/50">{s.step}</span>
                <h3 className="font-display mt-3 text-lg font-bold text-white/90">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRICING TEASER — ₹19 left, ₹99 center with Most popular for indie devs badge + who-it-fits line, ₹199 right anchor */}
      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white/90 sm:text-4xl">
            Predictable Rupee pricing.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:text-base">
            Compared to ₹199/month for autonomous platform agents, indie teams get full hosted API gateways and unlimited widgets for ₹99/month.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card-surface flex h-full flex-col justify-between p-6 sm:p-8 ${
                plan.featured ? 'border-white/15' : ''
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-white/90">{plan.name}</h3>
                  {plan.badge && (
                    <span className="badge-recommended">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-white/50">{plan.whoItFits}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold text-white/90 tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-white/50">/month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-white/50">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <span className="text-white/90 font-semibold" aria-hidden="true">✓</span>
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
