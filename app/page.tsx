'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const DEMO_KEY = 'sh_live_homepagedemo0001_0123456789abcdef0123456789abcdef';

const FEATURES = [
  {
    title: 'BM25 ranking',
    sentence: 'Scores every document by term saturation and length normalization so the best answer always ranks first.',
    icon: (
      <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
      </svg>
    ),
  },
  {
    title: 'Typo tolerance',
    sentence: 'Recovers misspelled queries automatically with single-edit Levenshtein matching across Latin and Devanagari text.',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'API gateway with tiers',
    sentence: 'Verifies scrypt-hashed API keys in O(1) time with built-in per-minute rate limits for Starter, Pro, and Ultra plans.',
    icon: (
      <svg className="h-5 w-5 text-accent2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Search',
    desc: 'Your visitor types a query—even with typos—into the accessible combobox input.',
  },
  {
    step: '02',
    title: 'Get results',
    desc: 'Okapi BM25 scores and ranks matching records in under a millisecond.',
  },
  {
    step: '03',
    title: 'Embed anywhere',
    desc: 'Drop one script tag into any static site, docs portal, or Next.js app.',
  },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹19',
    subtitle: 'For personal sites & blogs',
    features: [
      '1 search widget (<2 KB gzip)',
      'Up to 5,000 indexed documents',
      'BM25 + 1-edit typo tolerance',
      'Web Worker offloading',
    ],
    cta: 'Start at ₹19/mo',
    href: '/pricing.html#razorpay-starter',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹99',
    subtitle: 'For dev tools & SaaS teams',
    features: [
      'Unlimited widgets & documents',
      '50,000 API searches / month',
      'Scrypt API key gateway + quotas',
      'Custom ranking boosts & exports',
    ],
    cta: 'Choose Pro — ₹99/mo',
    href: '/pricing.html#razorpay-pro',
    featured: true,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '₹199',
    subtitle: 'For teams on autopilot',
    features: [
      '500,000 API searches / month',
      'Scheduled agent runs (3/day, 15/week)',
      'Drift & contradiction alerts',
      'CSV/JSON history export & SLA',
    ],
    cta: 'Choose Ultra — ₹199/mo',
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

      {/* 1. HERO (Max 8 words headline, 1 line subheadline, 1 primary + 1 ghost CTA) */}
      <section className="mx-auto max-w-[1120px] px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16 text-center">
        <h1 className="font-display mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl">
          Search that just works.{' '}
          <span className="bg-gradient-to-r from-purple via-purple to-gold bg-clip-text text-transparent">
            Zero cloud bill.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
          Add instant, typo-tolerant search to any website or app in sixty seconds with one script tag.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
          <a href="/demo.html" className="btn-primary w-full sm:w-auto">
            Try the demo
          </a>
          <a href="/pricing.html" className="btn-secondary w-full sm:w-auto">
            See pricing
          </a>
        </div>
      </section>

      {/* 2. WOW MOMENT: LIVE MINI SEARCH BOX POWERED BY public/embed.js + /api/search */}
      <section aria-label="Live BM25 Search Sandbox" className="mx-auto max-w-[920px] px-4 pb-16 sm:px-6">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={DEMO_KEY}
          data-index-url="/data/index.json"
          className="rounded-2xl border border-line bg-panel/95 p-5 sm:p-7 shadow-2xl"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">
              Live Widget · Powered by /embed.js &amp; /api/search
            </span>
            <span
              data-search-status
              aria-live="polite"
              className="font-mono text-xs text-accent2"
            >
              Ready · 52 records indexed
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3.5 focus-within:border-purple">
            <svg className="h-5 w-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              data-search-input
              type="search"
              defaultValue="bm25 algorithm"
              aria-label="Live BM25 search input"
              placeholder="Type to search 52 docs & apps (try: bm25 algorithm, minecrft, scrypt, wireguard)..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-muted/60 focus:outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Try instant query:</span>
            {['bm25 algorithm', 'minecrft', 'scrypt kdf', 'wireguard vpn'].map((q) => (
              <button
                key={q}
                type="button"
                data-search-preset={q}
                className="rounded-lg border border-line bg-panel2/80 px-2.5 py-1 font-mono text-xs text-muted transition hover:-translate-y-0.5 hover:border-purple/60 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>

          <div
            id="homepage-embed-results"
            data-search-results
            className="mt-4"
          />
        </div>
      </section>

      {/* 3. THREE FEATURE CARDS (Icon + 1 sentence each, equal height, hover lift) */}
      <section id="features" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="card-surface flex h-full flex-col justify-between p-6 sm:p-7">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel2">
                  {f.icon}
                </div>
                <h2 className="font-display text-xl font-bold text-white">{f.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{f.sentence}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. SIMPLE THREE-STEP FLOW: Search -> Get results -> Embed anywhere */}
      <section className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            How it works in three steps
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface flex h-full flex-col justify-between p-6 sm:p-7">
              <div>
                <span className="font-mono text-xs font-bold text-gold">{s.step}</span>
                <h3 className="font-display mt-2 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRICING TEASER (Three plans in Rupees) */}
      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
            Transparent Rupee pricing via UPI
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Start at ₹19/month for personal projects, or scale with hosted API keys and scheduled search agents.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card-surface flex h-full flex-col justify-between p-6 sm:p-8 ${
                plan.featured ? 'border-purple/80 bg-gradient-to-b from-panel2/95 to-panel' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  {plan.featured && (
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">{plan.subtitle}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-muted">/month</span>
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
