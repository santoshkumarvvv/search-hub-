'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

export default function HomePage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    w.SearchEmbed?.init();

    const onLangEvent = (e: Event) => {
      const detail = (e as CustomEvent<'en' | 'hi'>).detail;
      if (detail === 'en' || detail === 'hi') {
        setLang(detail);
      }
    };
    window.addEventListener('se-lang-change', onLangEvent);
    return () => {
      window.removeEventListener('se-lang-change', onLangEvent);
    };
  }, []);

  const triggerPreset = (q: string) => {
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
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            data-en="SUB-MILLISECOND SEARCH ENGINE"
            data-hi="सब-मिलीसेकंड सर्च इंजन"
          >
            {lang === 'en' ? 'SUB-MILLISECOND SEARCH ENGINE' : 'सब-मिलीसेकंड सर्च इंजन'}
          </span>
        </div>
        <h1
          data-rich="true"
          data-en="Search that ships in seconds."
          data-hi="सर्च जो सेकंडों में काम करे।"
          className="text-4xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
        >
          {lang === 'en' ? (
            <>
              Search that ships in{' '}
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                seconds.
              </span>
            </>
          ) : (
            <>
              सर्च जो{' '}
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                सेकंडों में
              </span>{' '}
              काम करे।
            </>
          )}
        </h1>
        <p
          data-rich="true"
          data-en="Drop one 2 KB script tag to index, rank, and typo-correct your catalog under a millisecond."
          data-hi="एक मिलिसेकंड के भीतर अपने कैटलॉग को इंडेक्स, रैंक और सही करने के लिए एक 2 KB स्क्रिप्ट टैग डालें।"
          className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {lang === 'en' ? (
            <>
              Drop one{' '}
              <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-sm font-bold border border-slate-200">
                2 KB
              </code>{' '}
              script tag to index, rank, and typo-correct your catalog under a millisecond.
            </>
          ) : (
            <>
              एक मिलिसेकंड के भीतर अपने कैटलॉग को इंडेक्स, रैंक और सही करने के लिए एक{' '}
              <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-sm font-bold border border-slate-200">
                2 KB
              </code>{' '}
              स्क्रिप्ट टैग डालें।
            </>
          )}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#sandbox"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition"
            data-en="Try Live Sandbox ↓"
            data-hi="लाइव सैंडबॉक्स आज़माएं ↓"
          >
            {lang === 'en' ? 'Try Live Sandbox ↓' : 'लाइव सैंडबॉक्स आज़माएं ↓'}
          </a>
        </div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="text-xs font-semibold text-slate-400 ml-2">
                Live Sandbox · Okapi BM25
              </span>
            </div>
            <div
              data-search-status
              aria-live="polite"
              className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100"
            >
              ⚡ Ready · 0.85 ms
            </div>
          </div>

          {/* Google Style Pill Search Bar */}
          <div className="relative mb-6">
            <input
              ref={inputRef}
              data-search-input
              type="text"
              defaultValue=""
              placeholder={
                lang === 'en'
                  ? 'Search catalog (e.g. bm25 algorithm)...'
                  : 'कैटलॉग खोजें (जैसे bm25 algorithm)...'
              }
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
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-500">
            <span className="font-semibold" data-en="Try:" data-hi="खोजें:">
              {lang === 'en' ? 'Try:' : 'खोजें:'}
            </span>
            <span
              data-search-preset="bm25 algorithm"
              onClick={() => triggerPreset('bm25 algorithm')}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer transition"
            >
              bm25 algorithm
            </span>
            <span
              data-search-preset="minecraft"
              onClick={() => triggerPreset('minecraft')}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer transition"
            >
              minecraft
            </span>
            <span
              data-search-preset="scrypt"
              onClick={() => triggerPreset('scrypt')}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer transition"
            >
              scrypt
            </span>
          </div>

          {/* Result Box Placeholder */}
          <div
            id="homepage-embed-results"
            data-search-results
            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-400 text-sm"
            data-en="Type a query above to run Okapi BM25 ranking..."
            data-hi="ओकापी BM25 रैंकिंग चलाने के लिए ऊपर कुछ टाइप करें..."
          >
            {lang === 'en'
              ? 'Type a query above to run Okapi BM25 ranking...'
              : 'ओकापी BM25 रैंकिंग चलाने के लिए ऊपर कुछ टाइप करें...'}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="text-xs font-bold text-slate-700 uppercase tracking-widest bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs"
            data-en="Transparent Billing"
            data-hi="पारदर्शी बिलिंग"
          >
            {lang === 'en' ? 'Transparent Billing' : 'पारदर्शी बिलिंग'}
          </span>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4 mb-4"
            data-en="Predictable Rupee pricing."
            data-hi="किफायती और स्पष्ट मूल्य निर्धारण।"
          >
            {lang === 'en' ? 'Predictable Rupee pricing.' : 'किफायती और स्पष्ट मूल्य निर्धारण।'}
          </h2>
          <p
            className="text-slate-600 text-base"
            data-en="Pro is the sweet spot for most indie hackers and growing teams."
            data-hi="अधिकांश डेवलपर्स और टीमों के लिए यह सबसे बेहतरीन है।"
          >
            {lang === 'en'
              ? 'Pro is the sweet spot for most indie hackers and growing teams.'
              : 'अधिकांश डेवलपर्स और टीमों के लिए यह सबसे बेहतरीन है।'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition">
            <div>
              <h3
                className="font-bold text-xl text-slate-900 mb-1"
                data-en="Starter"
                data-hi="स्टार्टर"
              >
                {lang === 'en' ? 'Starter' : 'स्टार्टर'}
              </h3>
              <p
                className="text-sm text-slate-500 mb-6"
                data-en="Personal sites and blogs."
                data-hi="व्यक्तिगत साइटें और ब्लॉग।"
              >
                {lang === 'en' ? 'Personal sites and blogs.' : 'व्यक्तिगत साइटें और ब्लॉग।'}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹19</span>
                <span className="text-slate-500 text-sm" data-en="/month" data-hi="/माह">
                  {lang === 'en' ? '/month' : '/माह'}
                </span>
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
              data-en="Choose Starter"
              data-hi="स्टार्टर चुनें"
            >
              {lang === 'en' ? 'Choose Starter' : 'स्टार्टर चुनें'}
            </a>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-slate-900/10 relative">
            <span
              className="absolute -top-3.5 right-8 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
              data-en="Most Popular"
              data-hi="सबसे लोकप्रिय"
            >
              {lang === 'en' ? 'Most Popular' : 'सबसे लोकप्रिय'}
            </span>
            <div>
              <h3
                className="font-bold text-xl text-slate-900 mb-1"
                data-en="Pro"
                data-hi="प्रो"
              >
                {lang === 'en' ? 'Pro' : 'प्रो'}
              </h3>
              <p
                className="text-sm text-slate-500 mb-6"
                data-en="Indie SaaS and production docs."
                data-hi="स्वतंत्र डेवलपर्स और डॉक्यूमेंट्स के लिए।"
              >
                {lang === 'en'
                  ? 'Indie SaaS and production docs.'
                  : 'स्वतंत्र डेवलपर्स और डॉक्यूमेंट्स के लिए।'}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹99</span>
                <span className="text-slate-500 text-sm" data-en="/month" data-hi="/माह">
                  {lang === 'en' ? '/month' : '/माह'}
                </span>
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
              data-en="Choose Pro"
              data-hi="प्रो चुनें"
            >
              {lang === 'en' ? 'Choose Pro' : 'प्रो चुनें'}
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition">
            <div>
              <h3
                className="font-bold text-xl text-slate-900 mb-1"
                data-en="Ultra"
                data-hi="अल्ट्रा"
              >
                {lang === 'en' ? 'Ultra' : 'अल्ट्रा'}
              </h3>
              <p
                className="text-sm text-slate-500 mb-6"
                data-en="High volume with AI agents."
                data-hi="एआई एजेंट्स के साथ हाई वॉल्यूम।"
              >
                {lang === 'en' ? 'High volume with AI agents.' : 'एआई एजेंट्स के साथ हाई वॉल्यूम।'}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹199</span>
                <span className="text-slate-500 text-sm" data-en="/month" data-hi="/माह">
                  {lang === 'en' ? '/month' : '/माह'}
                </span>
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
              data-en="Choose Ultra"
              data-hi="अल्ट्रा चुनें"
            >
              {lang === 'en' ? 'Choose Ultra' : 'अल्ट्रा चुनें'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
