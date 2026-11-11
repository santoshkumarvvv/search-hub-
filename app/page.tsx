'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import TogetherPanel from '@/components/TogetherPanel';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

export default function HomePage() {
  const [liveQuery, setLiveQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    w.SearchEmbed?.init();
  }, []);

  const triggerPreset = (q: string) => {
    setLiveQuery(q);
    const inp = inputRef.current;
    if (inp) {
      inp.value = q;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.focus();
    }
  };

  return (
    <div>
      <Script
        src="/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as unknown as { SearchEmbed?: { init: () => void } }).SearchEmbed?.init();
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <img
          src="/hero-banner.svg"
          alt=""
          aria-hidden="true"
          className="object-cover w-full max-w-full pointer-events-none absolute inset-0 -z-10 h-full opacity-5"
        />
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SUB-MILLISECOND SEARCH ENGINE</span>
        </div>
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Search that ships in{' '}
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            seconds.
          </span>
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop one{' '}
          <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-sm font-bold border border-slate-200">
            2 KB
          </code>{' '}
          script tag to index, rank, and typo-correct your catalog under a millisecond.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#sandbox"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition"
          >
            Try Live Sandbox ↓
          </a>
        </div>
      </section>

      {/* Together Mode Section */}
      <section className="max-w-4xl mx-auto px-6 pb-8" aria-label="Together mode">
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
      </section>

      {/* Live Sandbox Preview Section (Google-style Pill Search Bar) */}
      <section id="sandbox" className="max-w-4xl mx-auto px-6 pb-20">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="text-xs font-semibold text-slate-400 ml-2">
                Live Sandbox · Okapi BM25
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                data-search-status
                aria-live="polite"
                className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100"
              >
                ⚡ Ready · 0.85 ms
              </div>
              <button
                type="button"
                onClick={async () => {
                  const q = (inputRef.current?.value || liveQuery || '').trim();
                  const shareUrl = q
                    ? `https://search-hub-live.vercel.app/?q=${encodeURIComponent(q)}`
                    : 'https://search-hub-live.vercel.app';
                  const shareText = q
                    ? `${q} — https://search-hub-live.vercel.app`
                    : 'https://search-hub-live.vercel.app';
                  try {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      await navigator.share({ title: 'SearchEmbed', text: shareText, url: shareUrl });
                    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      await navigator.clipboard.writeText(shareUrl);
                    }
                  } catch {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                    } catch {
                      /* ignore */
                    }
                  }
                }}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition cursor-pointer"
              >
                Share this search
              </button>
            </div>
          </div>

          {/* Google Style Pill Search Bar */}
          <div className="relative mb-6">
            <input
              ref={inputRef}
              data-search-input
              type="text"
              defaultValue=""
              onInput={(e) => setLiveQuery((e.target as HTMLInputElement).value)}
              placeholder="Search catalog (e.g. bm25 algorithm)..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded-full px-6 py-4 text-slate-800 font-medium text-base shadow-inner focus:outline-hidden focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="absolute right-3 top-2.5 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-full transition shadow-md cursor-pointer"
            >
              🔍
            </button>
          </div>

          {/* Query Pills */}
          <div className="flex flex-row flex-nowrap items-center gap-2 mb-6 text-xs text-slate-500 overflow-hidden">
            <span className="font-semibold shrink-0">Try:</span>
            <span
              data-search-preset="bm25 algorithm"
              onClick={() => triggerPreset('bm25 algorithm')}
              className="flex-1 basis-0 min-w-0 bg-white border border-[#7c5cff] text-[#7c5cff] text-[11px] sm:text-[10px] font-semibold px-2 py-1.5 rounded-full text-center whitespace-nowrap truncate cursor-pointer transition"
            >
              bm25 algorithm
            </span>
            <span
              data-search-preset="minecraft"
              onClick={() => triggerPreset('minecraft')}
              className="flex-1 basis-0 min-w-0 bg-white border border-[#7c5cff] text-[#7c5cff] text-[11px] sm:text-[10px] font-semibold px-2 py-1.5 rounded-full text-center whitespace-nowrap truncate cursor-pointer transition"
            >
              minecraft
            </span>
            <span
              data-search-preset="scrypt"
              onClick={() => triggerPreset('scrypt')}
              className="flex-1 basis-0 min-w-0 bg-white border border-[#7c5cff] text-[#7c5cff] text-[11px] sm:text-[10px] font-semibold px-2 py-1.5 rounded-full text-center whitespace-nowrap truncate cursor-pointer transition"
            >
              scrypt
            </span>
            <span
              data-search-preset="wireguard vpn"
              onClick={() => triggerPreset('wireguard vpn')}
              className="flex-1 basis-0 min-w-0 bg-white border border-[#7c5cff] text-[#7c5cff] text-[11px] sm:text-[10px] font-semibold px-2 py-1.5 rounded-full text-center whitespace-nowrap truncate cursor-pointer transition"
            >
              wireguard vpn
            </span>
          </div>

          {/* Result Box Placeholder */}
          <div
            id="homepage-embed-results"
            data-search-results
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400 text-sm"
          >
            Type a query above to run Okapi BM25 ranking...
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            Transparent Billing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4 mb-4">
            Predictable Rupee pricing.
          </h2>
          <p className="text-slate-600 text-base">
            Pro is the sweet spot for most indie hackers and growing teams.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition">
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Starter</h3>
              <p className="text-sm text-slate-500 mb-6">Personal sites and blogs.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹19</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-3">✓ 1 widget under 2 KB</li>
                <li className="flex items-center gap-3">✓ 5,000 documents</li>
                <li className="flex items-center gap-3">✓ BM25 + 1-edit typos</li>
              </ul>
            </div>
            <a
              href="/pricing.html#razorpay-starter"
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
            >
              Choose Starter
            </a>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-slate-900/10 relative">
            <span className="absolute -top-3.5 right-8 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </span>
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Pro</h3>
              <p className="text-sm text-slate-500 mb-6">Indie SaaS and production docs.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹99</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-700 mb-8">
                <li className="flex items-center gap-3">✓ Unlimited widgets</li>
                <li className="flex items-center gap-3">✓ 50,000 API searches</li>
                <li className="flex items-center gap-3">✓ Scrypt keys + quotas</li>
                <li className="flex items-center gap-3">✓ JSON / CSV export</li>
              </ul>
            </div>
            <a
              href="/pricing.html#razorpay-pro"
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md"
            >
              Choose Pro
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition">
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Ultra</h3>
              <p className="text-sm text-slate-500 mb-6">High volume with AI agents.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹199</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-3">✓ 500,000 API searches</li>
                <li className="flex items-center gap-3">✓ 3 agent runs / day</li>
                <li className="flex items-center gap-3">✓ Priority routing</li>
              </ul>
            </div>
            <a
              href="/pricing.html#razorpay-ultra"
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
            >
              Choose Ultra
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
