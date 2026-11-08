'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import TogetherPanel from '@/components/TogetherPanel';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: ArrayLike<{ isFinal?: boolean; 0?: { transcript?: string } }> }) => void) | null;
  start: () => void;
  stop: () => void;
};

const FEATURES = [
  { title: 'BM25 ranking', body: 'Term frequency saturates. Short pages beat long rambles.', span: 'md:col-span-7' },
  { title: 'Typo tolerance', body: 'One edit recovers misspellings in Latin and Devanagari.', span: 'md:col-span-5' },
  { title: 'Federated signals', body: 'Lexical score, recency, and popularity blend locally.', span: 'md:col-span-5' },
  { title: 'API gateway with tiers', body: 'Scrypt keys, sliding windows, quotas that fail closed.', span: 'md:col-span-7' },
];

const STEPS = [
  { step: '01', title: 'Index your data', desc: 'Static JSON feed or push records to the hosted API.' },
  { step: '02', title: 'Search anywhere', desc: 'One 2 KB script on React, Next.js, docs, or HTML.' },
  { step: '03', title: 'Get ranked results', desc: 'Typo-tolerant BM25 under one millisecond.' },
];

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '₹19', who: 'Personal sites and blogs.',
    features: ['1 widget under 2 KB', '5,000 documents', 'BM25 + 1-edit typos', 'Worker offload'],
    cta: 'Start at ₹19/mo', href: '/pricing.html#razorpay-starter', featured: false, discount: 'Save 20%',
  },
  {
    id: 'pro', name: 'Pro', price: '₹99', who: 'Indie SaaS and production docs.',
    features: ['Unlimited widgets', '50,000 API searches', 'Scrypt keys + quotas', 'JSON / CSV export'],
    cta: 'Choose Pro — ₹99/mo', href: '/pricing.html#razorpay-pro', featured: true, badge: 'Most popular',
  },
  {
    id: 'ultra', name: 'Ultra', price: '₹199', who: 'High volume with agents.',
    features: ['500,000 API searches', '3 agent runs / day', 'Drift alerts', 'Priority routing'],
    cta: 'Choose Ultra — ₹199/mo', href: '/pricing.html#razorpay-ultra', featured: false, discount: 'Save 15%',
  },
];

export default function HomePage() {
  const [listening, setListening] = useState(false);
  const [liveQuery, setLiveQuery] = useState('bm25 algorithm');
  const recognitionRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    w.SearchEmbed?.init();
    try {
      const q = new URLSearchParams(window.location.search).get('q');
      if (q && inputRef.current) {
        inputRef.current.value = q;
        setLiveQuery(q);
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch { /* ignore */ }
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (listening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setListening(false);
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const SpeechRecCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    const statusEl = document.querySelector('[data-search-status]');
    if (!SpeechRecCtor) {
      if (statusEl) statusEl.textContent = 'Voice search is not supported in this browser';
      return;
    }
    try {
      const rec = new SpeechRecCtor();
      rec.lang = 'hi-IN';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => {
        setListening(true);
        if (statusEl) statusEl.textContent = 'Listening (Hindi / English)… speak now';
      };
      rec.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) text += event.results[i][0]?.transcript || '';
        const combined = text.trim();
        const inp = inputRef.current;
        if (inp) {
          inp.value = combined;
          setLiveQuery(combined);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      rec.onerror = () => {
        setListening(false);
        if (statusEl) statusEl.textContent = 'Mic failed — try again or type your query';
      };
      rec.onend = () => {
        setListening(false);
        if (statusEl && !statusEl.textContent?.startsWith('Mic failed') && !statusEl.textContent?.startsWith('Mic busy')) {
          statusEl.textContent = 'BM25 Local Index · 52 records';
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
      <Script src="/embed.js" strategy="afterInteractive" onLoad={() => {
        (window as unknown as { SearchEmbed?: { init: () => void } }).SearchEmbed?.init();
      }} />

      <section className="mx-auto max-w-[1120px] px-4 pt-14 pb-8 sm:px-6 sm:pt-20 sm:pb-10 text-center">
        <h1 className="font-display mx-auto max-w-3xl text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Search that <span className="hero-underline">ships in seconds.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] font-medium leading-relaxed text-[#4c35b5] sm:text-base">
          Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond — then search together with friends.
        </p>
        <div className="mt-8 flex justify-center">
          <a href="#sandbox" className="btn-primary min-h-12 px-8">Try it live</a>
        </div>
      </section>

      <section id="sandbox" aria-label="Live BM25 Search Sandbox" className="mx-auto max-w-[720px] px-4 pb-8 sm:px-6">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="rounded-2xl border border-line bg-white p-3.5 sm:p-7 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted tracking-wide">Live sandbox · Okapi BM25</span>
            <span data-search-status aria-live="polite" className="inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-purple">
              <span className="h-1.5 w-1.5 rounded-full bg-purple animate-pulse" aria-hidden="true" />
              BM25 Local Index · 3 results (0.40 ms)
            </span>
          </div>
          <div className="search-box flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 sm:gap-2 sm:pl-4 sm:pr-2 sm:py-2">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeWidth={1.75} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              ref={inputRef}
              data-search-input
              type="search"
              defaultValue="bm25 algorithm"
              aria-label="Search in Hindi or English"
              placeholder="Search in Hindi or English"
              onInput={(e) => setLiveQuery((e.target as HTMLInputElement).value)}
              className="w-full min-w-0 bg-transparent text-[13px] sm:text-[15px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={toggleVoiceSearch}
              aria-label={listening ? 'Stop voice search' : 'Start voice search (Hindi and English)'}
              aria-pressed={listening}
              className={`inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-purple bg-purple text-white shadow-[0_2px_10px_rgba(124,92,255,0.4)] transition hover:bg-[#6b4ce6] ${
                listening ? 'ring-4 ring-purple/30 scale-105' : ''
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm7 11a7 7 0 01-14 0m7 7v4m-4 0h8" />
              </svg>
            </button>
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-purple">Try:</span>
            {['bm25 algorithm', 'minecraft', 'scrypt kdf', 'wireguard vpn'].map((q) => (
              <button
                key={q}
                type="button"
                data-search-preset={q}
                className="inline-flex min-h-[44px] items-center rounded-full border-2 border-purple bg-white px-4 py-2 font-mono text-xs font-semibold text-purple transition-colors hover:bg-purple hover:text-white focus-visible:bg-purple focus-visible:text-white"
              >
                {q}
              </button>
            ))}
          </div>
          <div id="homepage-embed-results" data-search-results className="mt-5">
            <div className="search-embed-meta font-mono text-xs text-[#71717a] mb-1.5">
              BM25 Local Index · 3 results · 0.40 ms
            </div>
            <ul className="list-none p-0 m-0">
              <li role="option" className="py-[18px] px-1 border-b border-[#e5e5e5]">
                <div className="text-[#3c6e47] text-[13px] mb-0.5">https://search-hub-live.vercel.app/demo.html#bm25</div>
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <a href="https://search-hub-live.vercel.app/demo.html#bm25" className="text-[#1a0dab] text-lg no-underline hover:underline">
                      SearchHub Federated Engine (Okapi BM25)
                    </a>
                  </div>
                  <span className="font-mono text-xs text-[#525252]">BM25 4.82</span>
                </div>
                <div className="text-[#525252] text-sm mt-1 leading-relaxed">
                  Sub-millisecond Okapi BM25 full-text ranking algorithm with k1=1.2 saturation, b=0.75 length normalization, and Damerau-Levenshtein typo tolerance.
                </div>
                <div className="text-xs text-[#71717a] mt-1">Ranked high for: bm25, algorithm</div>
              </li>
              <li role="option" className="py-[18px] px-1 border-b border-[#e5e5e5]">
                <div className="text-[#3c6e47] text-[13px] mb-0.5">https://search-hub-live.vercel.app/catalog?q=Meilisearch</div>
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <a href="https://search-hub-live.vercel.app/catalog?q=Meilisearch" className="text-[#1a0dab] text-lg no-underline hover:underline">
                      Meilisearch Typo-Tolerant Search Engine
                    </a>
                  </div>
                  <span className="font-mono text-xs text-[#525252]">BM25 3.45</span>
                </div>
                <div className="text-[#525252] text-sm mt-1 leading-relaxed">
                  Lightning-fast Rust search indexing engine supporting prefix matching, custom ranking rules, and instant search-as-you-type experiences.
                </div>
                <div className="text-xs text-[#71717a] mt-1">Ranked high for: bm25, algorithm</div>
              </li>
              <li role="option" className="py-[18px] px-1 border-b border-[#e5e5e5]">
                <div className="text-[#3c6e47] text-[13px] mb-0.5">https://search-hub-live.vercel.app/catalog?q=Typesense</div>
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <a href="https://search-hub-live.vercel.app/catalog?q=Typesense" className="text-[#1a0dab] text-lg no-underline hover:underline">
                      Typesense In-Memory Inverted Index
                    </a>
                  </div>
                  <span className="font-mono text-xs text-[#525252]">BM25 3.12</span>
                </div>
                <div className="text-[#525252] text-sm mt-1 leading-relaxed">
                  Open-source in-memory search algorithm engineered for instant lexical ranking, federated blending, and low-latency retrieval.
                </div>
                <div className="text-xs text-[#71717a] mt-1">Ranked high for: algorithm</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[720px] px-4 pb-10 sm:px-6">
        <TogetherPanel
          currentQuery={liveQuery}
          onRemoteQuery={(q) => {
            setLiveQuery(q);
            const inp = inputRef.current;
            if (inp) {
              inp.value = q;
              inp.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }}
        />
        <div className="mt-3">
          <button
            type="button"
            className="btn-secondary min-h-11 px-4 text-sm"
            onClick={async () => {
              const q = liveQuery.trim();
              const url = q ? `${window.location.origin}/?q=${encodeURIComponent(q)}` : window.location.origin;
              try {
                if (navigator.share) await navigator.share({ title: 'SearchEmbed', text: q || 'Try SearchEmbed', url });
                else {
                  await navigator.clipboard.writeText(url);
                  const s = document.querySelector('[data-search-status]');
                  if (s) s.textContent = 'Link copied — share with a friend';
                }
              } catch { /* cancelled */ }
            }}
          >
            Share this search
          </button>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Engineered for sub-millisecond retrieval.</h2>
        <p className="mt-2.5 max-w-xl text-sm text-muted">Production search primitives in one zero-dependency runtime.</p>
        <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-12">
          {FEATURES.map((f) => (
            <article key={f.title} className={`card-surface ${f.span} p-5 sm:p-6`}>
              <h3 className="font-display text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Live in three steps.</h2>
        <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface p-5 sm:p-6">
              <span className="font-mono text-xs font-semibold text-purple">{s.step}</span>
              <h3 className="font-display mt-2.5 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Predictable Rupee pricing.</h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-muted">Pro is the sweet spot for most teams.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex h-full flex-col justify-between p-6 rounded-2xl ${
                plan.featured ? 'card-pro scale-[1.03] z-10 relative' : plan.id === 'ultra' ? 'card-ultra card-surface' : 'card-surface'
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
                <p className="mt-2 text-xs text-muted">{plan.who}</p>
                <p className="mt-5 font-display text-3xl font-extrabold text-ink">{plan.price}<span className="text-xs font-medium text-muted"> /month</span></p>
                <ul className="mt-5 space-y-2.5 text-sm text-muted">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex gap-2"><span className="text-purple font-semibold">✓</span>{feat}</li>
                  ))}
                </ul>
              </div>
              <a href={plan.href} className={`mt-7 min-h-12 w-full text-center ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}>{plan.cta}</a>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a href="/pricing.html" className="btn-cta-gradient inline-flex min-h-[56px] w-full items-center justify-center text-center py-4 text-base">View full pricing & subscribe</a>
        </div>
      </section>
    </main>
  );
}
