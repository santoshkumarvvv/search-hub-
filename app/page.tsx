'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionResultItem;
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

const BENTO_FEATURES = [
  {
    title: 'BM25 ranking',
    sentence:
      'Scores every document by term frequency saturation and field-length normalization so the sharpest match always ranks first.',
    span: 'md:col-span-7',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth={1.75} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
      </svg>
    ),
  },
  {
    title: 'Typo tolerance',
    sentence:
      'Recovers misspelled queries automatically using single-edit Damerau-Levenshtein matching across Latin and Devanagari text.',
    span: 'md:col-span-5',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Federated signals',
    sentence:
      'Blends lexical relevance with recency and popularity weights across multiple indices without round-trip network latency.',
    span: 'md:col-span-5',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    title: 'API gateway with tiers',
    sentence:
      'Authenticates scrypt-hashed API keys in O(1) time with sliding-window rate limits and enforced monthly quotas.',
    span: 'md:col-span-7',
    icon: (
      <svg className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
    name: 'Starter',
    price: '₹19',
    whoItFits: 'Personal sites, portfolios, and technical blogs.',
    features: [
      '1 search widget (<2 KB gzip)',
      'Up to 5,000 indexed documents',
      'Okapi BM25 + 1-edit typo tolerance',
      'Web Worker background offloading',
    ],
    cta: 'Start at ₹19/mo',
    href: '/pricing.html#razorpay-starter',
    featured: false,
    discount: 'Save 20%',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most popular',
    price: '₹99',
    whoItFits: 'Indie SaaS, documentation hubs, and production apps.',
    features: [
      'Unlimited widgets & indexed documents',
      '50,000 hosted API searches / month',
      'Scrypt API key gateway + rate quotas',
      'Custom ranking boosts & JSON/CSV export',
    ],
    cta: 'Choose Pro — ₹99/mo',
    href: '/pricing.html#razorpay-pro',
    featured: true,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '₹199',
    whoItFits: 'High-volume platforms with autonomous search agents.',
    features: [
      '500,000 hosted API searches / month',
      'Scheduled autonomous agent runs (3/day)',
      'Semantic drift & contradiction alerts',
      'Dedicated priority routing & SLA',
    ],
    cta: 'Choose Ultra — ₹199/mo',
    href: '/pricing.html#razorpay-ultra',
    featured: false,
    discount: 'Save 15%',
  },
];

export default function HomePage() {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    if (w.SearchEmbed && typeof w.SearchEmbed.init === 'function') {
      w.SearchEmbed.init();
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setListening(false);
      return;
    }

    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    const statusEl = document.querySelector('[data-search-status]');

    if (!SpeechRec) {
      if (statusEl) {
        statusEl.textContent = 'Voice search is not supported in this browser';
      }
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'hi-IN';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setListening(true);
        if (statusEl) statusEl.textContent = 'Listening (Hindi / English)… speak now';
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let finalText = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalText += text;
          } else {
            interim += text;
          }
        }
        const combined = (finalText || interim).trim();
        const inp =
          inputRef.current ||
          (document.querySelector('input[data-search-input]') as HTMLInputElement | null);
        if (inp) {
          inp.value = combined;
          if (finalText.trim()) {
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      rec.onerror = () => {
        setListening(false);
        if (statusEl) statusEl.textContent = 'Mic failed — try again or type your query';
      };

      rec.onend = () => {
        setListening(false);
        if (statusEl && !statusEl.textContent?.startsWith('Mic failed') && !statusEl.textContent?.startsWith('Mic busy')) {
          statusEl.textContent = '52 records indexed live';
        }
        const inp =
          inputRef.current ||
          (document.querySelector('input[data-search-input]') as HTMLInputElement | null);
        if (inp && inp.value.trim()) {
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
      if (statusEl) statusEl.textContent = 'Mic busy — try again in a moment';
    }
  };

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

      <section className="mx-auto max-w-[1120px] px-4 pt-14 pb-8 sm:px-6 sm:pt-20 sm:pb-10 text-center">
        <h1 className="font-display mx-auto max-w-3xl text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Search that{' '}
          <span className="hero-underline">ships in seconds.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
          Drop one script tag to index, rank, and typo-correct your entire catalog in under a millisecond — with zero server bill.
        </p>

        <div className="mt-8 flex justify-center">
          <a href="#sandbox" className="btn-primary min-h-12 px-8">
            Try it live
          </a>
        </div>
      </section>

      <section
        id="sandbox"
        aria-label="Live BM25 Search Sandbox"
        className="mx-auto max-w-[720px] px-4 pb-16 sm:px-6"
      >
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="rounded-2xl border border-line bg-white p-5 sm:p-7 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted tracking-wide">
              Live sandbox · Okapi BM25
            </span>
            <span
              data-search-status
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-purple"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple animate-pulse" aria-hidden="true" />
              52 records indexed live
            </span>
          </div>

          <div className="search-box flex items-center gap-2 pl-4 pr-2 py-2">
            <svg
              className="h-5 w-5 shrink-0 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeWidth={1.75} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              ref={inputRef}
              data-search-input
              type="search"
              defaultValue="bm25 algorithm"
              aria-label="Live BM25 search input"
              placeholder="Type or speak in Hindi / English…"
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={toggleVoiceSearch}
              aria-label={listening ? 'Stop voice search' : 'Start voice search (Hindi and English)'}
              aria-pressed={listening}
              title={listening ? 'Stop listening' : 'Voice search (Hindi / English)'}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple ${
                listening
                  ? 'border-purple bg-purple text-white shadow-[0_0_18px_rgba(124,92,255,0.55)]'
                  : 'border-line bg-white text-muted hover:border-purple/50 hover:text-purple'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm7 11a7 7 0 01-14 0m7 7v4m-4 0h8"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted">Try:</span>
            {['bm25 algorithm', 'minecrft', 'scrypt kdf', 'wireguard vpn'].map((q) => (
              <button
                key={q}
                type="button"
                data-search-preset={q}
                className="min-h-10 rounded-full border border-line bg-white px-3 py-2 font-mono text-[11px] text-muted transition hover:border-purple/40 hover:text-ink"
              >
                {q}
              </button>
            ))}
          </div>

          <div id="homepage-embed-results" data-search-results className="mt-5" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-9 max-w-xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Engineered for sub-millisecond retrieval.
          </h2>
          <p className="mt-2.5 text-sm text-muted sm:text-[15px]">
            Every primitive needed for production search, shipped in a single zero-dependency runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {BENTO_FEATURES.map((f) => (
            <article
              key={f.title}
              className={`card-surface ${f.span} flex h-full flex-col justify-between p-5 sm:p-6`}
            >
              <div>
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel2">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.sentence}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <div className="mb-9 max-w-xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Live in three steps.
          </h2>
          <p className="mt-2.5 text-sm text-muted sm:text-[15px]">
            No cluster, no Docker, no cloud egress bill.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface flex h-full flex-col p-5 sm:p-6">
              <span className="font-mono text-xs font-semibold text-purple">{s.step}</span>
              <h3 className="font-display mt-2.5 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Predictable Rupee pricing.
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-muted">
            Clean tiers. No surprises. Pro is the sweet spot for most teams.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex h-full flex-col justify-between p-6 rounded-2xl ${
                plan.featured
                  ? 'card-pro scale-[1.03] z-10 relative'
                  : plan.id === 'ultra'
                    ? 'card-ultra card-surface'
                    : 'card-surface'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {plan.discount && <span className="badge-discount">{plan.discount}</span>}
                    {plan.badge && <span className="badge-recommended">{plan.badge}</span>}
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-muted">{plan.whoItFits}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-ink tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted">/month</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-muted">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="text-purple font-semibold mt-0.5" aria-hidden="true">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={plan.href}
                className={`mt-7 min-h-12 w-full text-center ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a href="/pricing.html" className="btn-cta-yellow block min-h-14 w-full text-center py-4 text-base">
            View full pricing & subscribe
          </a>
        </div>
      </section>
    </main>
  );
}
