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
  {
    title: 'BM25 ranking',
    titleHi: 'BM25 रैंकिंग',
    body: 'Term frequency saturates. Short pages beat long rambles.',
    bodyHi: 'टर्म फ़्रीक्वेंसी संतृप्त होती है। छोटे और सटीक पेज ऊपर आते हैं।',
    span: 'md:col-span-7',
  },
  {
    title: 'Typo tolerance',
    titleHi: 'टाइपो सहनशीलता',
    body: 'One edit recovers misspellings in Latin and Devanagari.',
    bodyHi: 'लैटिन और देवनागरी में एक अक्षर की गलती अपने आप सुधरती है।',
    span: 'md:col-span-5',
  },
  {
    title: 'Federated signals',
    titleHi: 'फ़ेडरेटेड सिग्नल्स',
    body: 'Lexical score, recency, and popularity blend locally.',
    bodyHi: 'लेक्सिकल स्कोर, ताज़गी और लोकप्रियता का स्थानीय मिश्रण।',
    span: 'md:col-span-5',
  },
  {
    title: 'API gateway with tiers',
    titleHi: 'टियर वाला API गेटवे',
    body: 'Scrypt keys, sliding windows, quotas that fail closed.',
    bodyHi: 'Scrypt कुंजियाँ, स्लाइडिंग विंडो और सुरक्षित कोटा।',
    span: 'md:col-span-7',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Index your data',
    titleHi: 'अपना डेटा इंडेक्स करें',
    desc: 'Static JSON feed or push records to the hosted API.',
    descHi: 'स्टैटिक JSON फ़ीड या होस्टेड API पर रिकॉर्ड भेजें।',
  },
  {
    step: '02',
    title: 'Search anywhere',
    titleHi: 'कहीं भी सर्च करें',
    desc: 'One 2 KB script on React, Next.js, docs, or HTML.',
    descHi: 'React, Next.js, डॉक्स या HTML पर सिर्फ़ एक 2 KB स्क्रिप्ट।',
  },
  {
    step: '03',
    title: 'Get ranked results',
    titleHi: 'रैंक किए गए परिणाम पाएं',
    desc: 'Typo-tolerant BM25 under one millisecond.',
    descHi: 'एक मिलीसेकंड से कम में टाइपो-सहिष्णु BM25।',
  },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    nameHi: 'स्टार्टर',
    price: '₹19',
    who: 'Personal sites and blogs.',
    whoHi: 'व्यक्तिगत साइटों और ब्लॉगों के लिए।',
    features: ['1 widget under 2 KB', '5,000 documents', 'BM25 + 1-edit typos', 'Worker offload'],
    cta: 'Start at ₹19',
    ctaHi: '₹19 में शुरू करें',
    href: '/pricing.html#razorpay-starter',
    featured: false,
    discount: 'Save 20%',
  },
  {
    id: 'pro',
    name: 'Pro',
    nameHi: 'प्रो',
    price: '₹99',
    who: 'Indie SaaS and production docs.',
    whoHi: 'इंडी SaaS और प्रोडक्शन डॉक्स के लिए।',
    features: ['Unlimited widgets', '50,000 API searches', 'Scrypt keys + quotas', 'JSON / CSV export'],
    cta: 'Choose Pro — ₹99/mo',
    ctaHi: 'प्रो चुनें — ₹99/माह',
    href: '/pricing.html#razorpay-pro',
    featured: true,
    badge: 'Most popular',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    nameHi: 'अल्ट्रा',
    price: '₹199',
    who: 'High volume with agents.',
    whoHi: 'उच्च ट्रैफ़िक और एजेंट्स के लिए।',
    features: ['500,000 API searches', '3 agent runs / day', 'Drift alerts', 'Priority routing'],
    cta: 'Choose Ultra — ₹199/mo',
    ctaHi: 'अल्ट्रा चुनें — ₹199/माह',
    href: '/pricing.html#razorpay-ultra',
    featured: false,
    discount: 'Save 15%',
  },
];

export default function HomePage() {
  const [listening, setListening] = useState(false);
  const [liveQuery, setLiveQuery] = useState('bm25 algorithm');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const recognitionRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SearchEmbed?: { init: () => void };
      __seToggleLang?: () => void;
    };
    w.SearchEmbed?.init();

    const applyLangDom = (nextLang: 'en' | 'hi') => {
      document.documentElement.lang = nextLang;
      const langText = document.getElementById('langText');
      if (langText) {
        langText.textContent = nextLang === 'hi' ? 'हिंदी' : 'English';
      }
      document.querySelectorAll('[data-en][data-hi]').forEach((el) => {
        if (el.getAttribute('data-rich') === 'true') return;
        const val = el.getAttribute(`data-${nextLang}`);
        if (val) (el as HTMLElement).textContent = val;
      });
      document.querySelectorAll('[data-placeholder-en][data-placeholder-hi]').forEach((inp) => {
        const p = inp.getAttribute(`data-placeholder-${nextLang}`);
        if (p) inp.setAttribute('placeholder', p);
      });
    };

    const onLangEvent = (e: Event) => {
      const detail = (e as CustomEvent<'en' | 'hi'>).detail;
      if (detail === 'en' || detail === 'hi') {
        setLang(detail);
      }
    };
    window.addEventListener('se-lang-change', onLangEvent);

    const btn = document.getElementById('langBtn');
    if (btn) {
      btn.onclick = () => {
        const current = document.documentElement.lang === 'hi' ? 'hi' : 'en';
        const next: 'en' | 'hi' = current === 'en' ? 'hi' : 'en';
        setLang(next);
        applyLangDom(next);
      };
    }

    try {
      const q = new URLSearchParams(window.location.search).get('q');
      if (q && inputRef.current) {
        inputRef.current.value = q;
        setLiveQuery(q);
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener('se-lang-change', onLangEvent);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
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
        if (
          statusEl &&
          !statusEl.textContent?.startsWith('Mic failed') &&
          !statusEl.textContent?.startsWith('Mic busy')
        ) {
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
      <Script
        src="/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as unknown as { SearchEmbed?: { init: () => void } }).SearchEmbed?.init();
        }}
      />

      <section
        className="relative mx-auto max-w-[1120px] overflow-hidden bg-cover bg-center bg-no-repeat px-4 pt-12 pb-6 sm:px-6 sm:pt-16 sm:pb-8 text-center"
        style={{ backgroundImage: "url('/hero-banner.svg')" }}
      >
        <img
          src="/hero-banner.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full max-w-full object-cover"
        />
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4dcff] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c5cff] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7c5cff]" aria-hidden="true" />
          <span data-en="Sub-millisecond search" data-hi="सब-मिलीसेकंड सर्च">
            {lang === 'en' ? 'Sub-millisecond search' : 'सब-मिलीसेकंड सर्च'}
          </span>
        </p>
        <h1
          data-rich="true"
          data-en="Search that ships in seconds."
          data-hi="सर्च जो सेकंडों में काम करे।"
          className="font-display mx-auto max-w-3xl text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl"
        >
          {lang === 'en' ? (
            <>
              Search that <span className="hero-underline">ships in seconds.</span>
            </>
          ) : (
            <>
              सर्च जो <span className="hero-underline">सेकंडों में काम करे।</span>
            </>
          )}
        </h1>
        <p
          data-en="Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond — then search together with friends."
          data-hi="एक मिलीसेकंड से भी कम समय में अपने कैटलॉग को इंडेक्स, रैंक और टाइपो-करेक्ट करने के लिए एक स्क्रिप्ट टैग लगाएं — फिर दोस्तों के साथ मिलकर खोजें।"
          className="mx-auto mt-6 max-w-xl text-[15px] font-medium leading-relaxed text-[#4c35b5] sm:text-base"
        >
          {lang === 'en'
            ? 'Drop one script tag to index, rank, and typo-correct your catalog in under a millisecond — then search together with friends.'
            : 'एक मिलीसेकंड से भी कम समय में अपने कैटलॉग को इंडेक्स, रैंक और टाइपो-करेक्ट करने के लिए एक स्क्रिप्ट टैग लगाएं — फिर दोस्तों के साथ मिलकर खोजें।'}
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="#sandbox"
            data-en="Try it live"
            data-hi="लाइव आज़माएं"
            className="btn-primary min-h-12 px-8"
          >
            {lang === 'en' ? 'Try it live' : 'लाइव आज़माएं'}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[720px] px-4 pb-6 sm:px-6" aria-label="Together mode">
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
            <span
              data-search-status
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-purple"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple animate-pulse" aria-hidden="true" />
              BM25 Local Index · 3 results (0.40 ms)
            </span>
          </div>

          <div className="search-box flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1.5 sm:gap-2 sm:pl-4 sm:pr-2 sm:py-2">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted"
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
              aria-label="Search your catalog..."
              placeholder={lang === 'en' ? 'Search your catalog...' : 'अपना कैटलॉग खोजें...'}
              data-placeholder-en="Search your catalog..."
              data-placeholder-hi="अपना कैटलॉग खोजें..."
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm7 11a7 7 0 01-14 0m7 7v4m-4 0h8"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3.5 flex flex-nowrap items-center gap-1 overflow-hidden">
            <span
              className="shrink-0 text-[10px] font-semibold text-[#7c5cff]"
              data-en="Try:"
              data-hi="खोजें:"
            >
              {lang === 'en' ? 'Try:' : 'खोजें:'}
            </span>
            {['bm25 algorithm', 'minecraft', 'scrypt kdf', 'wireguard vpn'].map((q) => (
              <button
                key={q}
                type="button"
                data-search-preset={q}
                className="inline-flex h-9 min-w-0 flex-1 basis-0 items-center justify-center rounded-full border border-[#7c5cff] bg-white px-1 text-center font-mono text-[11px] font-semibold leading-none text-[#7c5cff] sm:h-11 sm:text-[10px]"
              >
                <span className="truncate">{q}</span>
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
                    <a
                      href="https://search-hub-live.vercel.app/demo.html#bm25"
                      className="text-[#1a0dab] text-lg no-underline hover:underline"
                    >
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
                    <a
                      href="https://search-hub-live.vercel.app/catalog?q=Meilisearch"
                      className="text-[#1a0dab] text-lg no-underline hover:underline"
                    >
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
                    <a
                      href="https://search-hub-live.vercel.app/catalog?q=Typesense"
                      className="text-[#1a0dab] text-lg no-underline hover:underline"
                    >
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
        <div className="mt-3">
          <button
            type="button"
            className="btn-secondary min-h-11 px-4 text-sm"
            data-en="Share this search"
            data-hi="यह खोज साझा करें"
            onClick={async () => {
              const q = liveQuery.trim();
              const shareUrl = q
                ? `https://search-hub-live.vercel.app/?q=${encodeURIComponent(q)}`
                : 'https://search-hub-live.vercel.app';
              const shareText = q
                ? `Search "${q}" on SearchEmbed — https://search-hub-live.vercel.app`
                : 'Try SearchEmbed — https://search-hub-live.vercel.app';
              try {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  await navigator.share({ title: 'SearchEmbed', text: shareText, url: shareUrl });
                } else {
                  await navigator.clipboard.writeText(shareUrl);
                  const s = document.querySelector('[data-search-status]');
                  if (s) s.textContent = 'Link copied — share with a friend';
                }
              } catch {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  const s = document.querySelector('[data-search-status]');
                  if (s) s.textContent = 'Link copied — share with a friend';
                } catch {
                  /* cancelled */
                }
              }
            }}
          >
            {lang === 'en' ? 'Share this search' : 'यह खोज साझा करें'}
          </button>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2
          data-en="Engineered for sub-millisecond retrieval."
          data-hi="सब-मिलीसेकंड परिणामों के लिए निर्मित।"
          className="font-display text-2xl font-bold text-ink sm:text-3xl"
        >
          {lang === 'en' ? 'Engineered for sub-millisecond retrieval.' : 'सब-मिलीसेकंड परिणामों के लिए निर्मित।'}
        </h2>
        <p
          data-en="Production search primitives in one zero-dependency runtime."
          data-hi="शून्य-निर्भरता रनटाइम में प्रोडक्शन सर्च क्षमताएं।"
          className="mt-2.5 max-w-xl text-sm text-muted"
        >
          {lang === 'en'
            ? 'Production search primitives in one zero-dependency runtime.'
            : 'शून्य-निर्भरता रनटाइम में प्रोडक्शन सर्च क्षमताएं।'}
        </p>
        <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-12">
          {FEATURES.map((f) => (
            <article key={f.title} className={`card-surface ${f.span} p-5 sm:p-6`}>
              <h3
                data-en={f.title}
                data-hi={f.titleHi}
                className="font-display text-lg font-bold text-ink"
              >
                {lang === 'en' ? f.title : f.titleHi}
              </h3>
              <p
                data-en={f.body}
                data-hi={f.bodyHi}
                className="mt-2 text-sm leading-relaxed text-muted"
              >
                {lang === 'en' ? f.body : f.bodyHi}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2
          data-en="Live in three steps."
          data-hi="तीन आसान चरणों में लाइव।"
          className="font-display text-2xl font-bold text-ink sm:text-3xl"
        >
          {lang === 'en' ? 'Live in three steps.' : 'तीन आसान चरणों में लाइव।'}
        </h2>
        <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface p-5 sm:p-6">
              <span className="font-mono text-xs font-semibold text-purple">{s.step}</span>
              <h3
                data-en={s.title}
                data-hi={s.titleHi}
                className="font-display mt-2.5 text-base font-bold text-ink"
              >
                {lang === 'en' ? s.title : s.titleHi}
              </h3>
              <p data-en={s.desc} data-hi={s.descHi} className="mt-1.5 text-sm text-muted">
                {lang === 'en' ? s.desc : s.descHi}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2
            data-en="Predictable Rupee pricing."
            data-hi="पारदर्शी रुपया मूल्य निर्धारण।"
            className="font-display text-2xl font-bold text-ink sm:text-3xl"
          >
            {lang === 'en' ? 'Predictable Rupee pricing.' : 'पारदर्शी रुपया मूल्य निर्धारण।'}
          </h2>
          <p
            data-en="Pro is the sweet spot for most teams."
            data-hi="अधिकांश टीमों के लिए प्रो सबसे उपयुक्त है।"
            className="mx-auto mt-2.5 max-w-md text-sm text-muted"
          >
            {lang === 'en' ? 'Pro is the sweet spot for most teams.' : 'अधिकांश टीमों के लिए प्रो सबसे उपयुक्त है।'}
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
                  <h3
                    data-en={plan.name}
                    data-hi={plan.nameHi}
                    className="font-display text-xl font-bold text-ink"
                  >
                    {lang === 'en' ? plan.name : plan.nameHi}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {plan.discount && <span className="badge-discount">{plan.discount}</span>}
                    {plan.badge && <span className="badge-recommended">{plan.badge}</span>}
                  </div>
                </div>
                <p data-en={plan.who} data-hi={plan.whoHi} className="mt-2 text-xs text-muted">
                  {lang === 'en' ? plan.who : plan.whoHi}
                </p>
                <p className="mt-5 font-display text-3xl font-extrabold text-ink">
                  {plan.price}
                  <span className="text-xs font-medium text-muted"> /month</span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-muted">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex gap-2">
                      <span className="text-purple font-semibold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={plan.href}
                data-en={plan.cta}
                data-hi={plan.ctaHi}
                className={`mt-7 min-h-12 w-full text-center ${
                  plan.featured ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {lang === 'en' ? plan.cta : plan.ctaHi}
              </a>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a
            href="/pricing.html"
            data-en="View full pricing and subscribe"
            data-hi="पूरा मूल्य निर्धारण देखें और सब्सक्राइब करें"
            className="btn-cta-gradient inline-flex min-h-[56px] w-full items-center justify-center text-center py-4 text-base"
          >
            {lang === 'en' ? 'View full pricing and subscribe' : 'पूरा मूल्य निर्धारण देखें और सब्सक्राइब करें'}
          </a>
        </div>
      </section>
    </main>
  );
}
