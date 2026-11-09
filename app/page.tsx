"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import TogetherPanel from "@/components/TogetherPanel";

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ["sh_live", "homepagedemo0001", "0123456789abcdef0123456789abcdef"].join("_");

const INSTALL_SNIPPET = `<script src="https://cdn.searchembed.com/bm25.min.js"></script>`;

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

const INITIAL_RESULTS = [
  {
    title: "SearchHub Federated Engine (Okapi BM25)",
    url: "https://search-hub-live.vercel.app/demo.html#bm25",
    score: "4.80",
    description:
      "Sub-millisecond Okapi BM25 full-text ranking algorithm with k1=1.2 saturation, b=0.75 length normalization, and Damerau-Levenshtein typo tolerance.",
    terms: ["bm25", "algorithm"],
  },
  {
    title: "Meilisearch Typo-Tolerant Search Engine",
    url: "https://search-hub-live.vercel.app/catalog?q=Meilisearch",
    score: "3.45",
    description:
      "Lightning-fast Rust search indexing engine supporting prefix matching, custom ranking rules, and instant search-as-you-type experiences.",
    terms: ["bm25", "algorithm"],
  },
  {
    title: "SearchEmbed Standalone Modal Widget",
    url: "https://search-hub-live.vercel.app/embed.js",
    score: "3.12",
    description:
      "Drop-in 2 KB zero-dependency search widget replacing heavy Algolia and Elasticsearch for static sites.",
    terms: ["bm25", "widget"],
  },
];

const STEPS = [
  {
    step: "01",
    title: "Index your data",
    desc: "Static JSON feed or push records to the hosted API.",
    code: "POST /v1/index · 52 docs indexed (1.2ms)",
  },
  {
    step: "02",
    title: "Search anywhere",
    desc: "One 2 KB script on React, Next.js, docs, or HTML.",
    code: `<SearchEmbed key="se_live_..." />`,
  },
  {
    step: "03",
    title: "Get ranked results",
    desc: "Typo-tolerant BM25 under one millisecond.",
    code: "200 OK · BM25: 4.80 · 0.64ms",
  },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    who: "Personal sites and blogs.",
    features: ["1 widget under 2 KB", "5,000 documents", "BM25 + 1-edit typos", "Worker offload"],
    href: "/pricing.html#razorpay-starter",
    featured: false,
    badge: null as string | null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 99,
    yearlyPrice: 79,
    who: "Indie SaaS and production docs.",
    features: ["Unlimited widgets", "50,000 API searches", "Scrypt keys + quotas", "JSON / CSV export"],
    href: "/pricing.html#razorpay-pro",
    featured: true,
    badge: "Most popular",
  },
  {
    id: "ultra",
    name: "Ultra",
    monthlyPrice: 199,
    yearlyPrice: 159,
    who: "High volume with agents.",
    features: ["500,000 API searches", "3 agent runs / day", "Drift alerts", "Priority routing"],
    href: "/pricing.html#razorpay-ultra",
    featured: false,
    badge: "Scale & AI Agents",
  },
];

export default function HomePage() {
  const [listening, setListening] = useState(false);
  const [liveQuery, setLiveQuery] = useState("bm25 algorithm");
  const [togetherOpen, setTogetherOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [sharedNotice, setSharedNotice] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const recognitionRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    w.SearchEmbed?.init();
    try {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("q");
      if (q && inputRef.current) {
        inputRef.current.value = q;
        setLiveQuery(q);
        inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (sp.get("together")) {
        setTogetherOpen(true);
      }
    } catch {
      /* ignore */
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const copyInstallSnippet = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_SNIPPET);
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2200);
    } catch {
      /* ignore */
    }
  };

  const handleCopyJson = async () => {
    const w = window as unknown as { SearchEmbed?: { getLastResults?: () => unknown[] } };
    const liveResults = w.SearchEmbed?.getLastResults?.();
    const payload = {
      engine: "SearchEmbed Okapi BM25 v2.4",
      query: liveQuery,
      latencyMs: 0.8,
      results: liveResults && liveResults.length > 0 ? liveResults : INITIAL_RESULTS,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleShareSearch = async () => {
    const q = liveQuery.trim();
    const url = q ? `${window.location.origin}/?q=${encodeURIComponent(q)}` : window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SearchEmbed", text: q || "Try SearchEmbed", url });
      } else {
        await navigator.clipboard.writeText(url);
        setSharedNotice(true);
        setTimeout(() => setSharedNotice(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

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
    const statusEl = document.querySelector("[data-search-status]");
    if (!SpeechRecCtor) {
      if (statusEl) statusEl.textContent = "Voice search unsupported in this browser";
      return;
    }
    try {
      const rec = new SpeechRecCtor();
      rec.lang = "hi-IN";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => {
        setListening(true);
        if (statusEl) statusEl.textContent = "🎙️ Listening (Hindi / English)…";
      };
      rec.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) text += event.results[i][0]?.transcript || "";
        const combined = text.trim();
        const inp = inputRef.current;
        if (inp) {
          inp.value = combined;
          setLiveQuery(combined);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        }
      };
      rec.onerror = () => {
        setListening(false);
        if (statusEl) statusEl.textContent = "⚡ Mic error — try typing";
      };
      rec.onend = () => {
        setListening(false);
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
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

      {/* 3. HERO SECTION + ONE-CLICK INSTALL BAR */}
      <section className="relative mx-auto max-w-[1120px] px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 text-center">
        {/* Top Status Pill with Pulsing Emerald Dot */}
        <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 shadow-sm">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>SUB-MILLISECOND SEARCH</span>
        </div>

        {/* Headline Upgrade */}
        <h1 className="font-display mx-auto max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
          Search that ships in{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
            seconds.
          </span>
        </h1>

        {/* Subheadline with 2 KB Monospace Badge (Zero stray dashed lines) */}
        <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          Drop one{" "}
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs px-1.5 py-0.5 rounded font-semibold align-middle">
            2 KB
          </span>{" "}
          script tag to index, rank, and typo-correct your catalog in under a millisecond — then search together with friends.
        </p>

        {/* Dual Action Bar */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#sandbox"
            className="inline-flex w-full sm:w-auto items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
          >
            Try Live Sandbox ↓
          </a>

          {/* Interactive Terminal Pill */}
          <div className="flex w-full max-w-xl sm:w-auto items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-sm">
            <code className="truncate font-mono text-xs text-slate-700 select-all">
              {INSTALL_SNIPPET}
            </code>
            <button
              type="button"
              onClick={copyInstallSnippet}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition ${
                copiedInstall
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {copiedInstall ? "✓ Copied (2 KB)" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      {/* 4 & 5. LIVE SANDBOX FIRST + INTEGRATED TOGETHER MODE + MODERN SAAS RESULT CARDS */}
      <section id="sandbox" aria-label="Live BM25 Search Sandbox" className="mx-auto max-w-[820px] px-4 pb-14 sm:px-6">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5"
        >
          {/* Sandbox Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold text-slate-700">
                Live Sandbox · Okapi BM25
              </span>
              <span
                data-search-status
                aria-live="polite"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-700"
              >
                ⚡ 3 results · 0.80 ms
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTogetherOpen((prev) => !prev)}
              aria-expanded={togetherOpen}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                togetherOpen
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80"
              }`}
            >
              <span aria-hidden="true">👥</span>
              <span>Together Mode · Live Sync</span>
            </button>
          </div>

          {/* Integrated Together Mode Collapsible Drawer */}
          <TogetherPanel
            currentQuery={liveQuery}
            open={togetherOpen}
            onClose={() => setTogetherOpen(false)}
            onRemoteQuery={(q) => {
              setLiveQuery(q);
              const inp = inputRef.current;
              if (inp) {
                inp.value = q;
                inp.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }}
          />

          {/* Sandbox Body */}
          <div className="p-4 sm:p-6">
            {/* Search Bar with ⌘K Shortcut Badge and Refined 36x36 Mic Button */}
            <div className="search-box relative flex items-center gap-2 pl-3.5 pr-2.5 py-2">
              <svg
                className="h-5 w-5 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>

              <input
                ref={inputRef}
                data-search-input
                type="search"
                defaultValue="bm25 algorithm"
                aria-label="Search in Hindi or English"
                placeholder="Search in Hindi or English…"
                onInput={(e) => setLiveQuery((e.target as HTMLInputElement).value)}
                className="w-full min-w-0 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              <kbd className="hidden sm:inline-flex shrink-0 items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-500">
                ⌘K
              </kbd>

              <button
                type="button"
                onClick={toggleVoiceSearch}
                aria-label={listening ? "Stop voice search" : "Start voice search (Hindi and English)"}
                aria-pressed={listening}
                title="Voice search (Hindi / English)"
                className={`inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition ${
                  listening ? "ring-4 ring-indigo-500/30 animate-pulse bg-red-600 hover:bg-red-700" : ""
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm7 11a7 7 0 01-14 0m7 7v4m-4 0h8"
                  />
                </svg>
              </button>
            </div>

            {/* Non-Truncated Suggestion Chips (Try:) */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">Try:</span>
              {["bm25 algorithm", "minecraft", "scrypt keys", "wireguard"].map((q) => (
                <button
                  key={q}
                  type="button"
                  data-search-preset={q}
                  onClick={() => setLiveQuery(q)}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Modern SaaS Result Cards (No duplicate telemetry line!) */}
            <div id="homepage-embed-results" data-search-results className="mt-4">
              <ul className="space-y-3 list-none p-0 m-0">
                {INITIAL_RESULTS.map((item) => (
                  <li
                    key={item.url}
                    role="option"
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <a
                          href={item.url}
                          className="block text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors no-underline"
                        >
                          {item.title}
                        </a>
                        <div className="mt-0.5 text-xs font-mono text-slate-400 truncate">
                          {item.url}
                        </div>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-1 rounded-md text-xs font-mono font-semibold shrink-0 whitespace-nowrap">
                        BM25: {item.score}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-400">Ranked high for:</span>
                      {item.terms.map((term) => (
                        <span
                          key={term}
                          className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Internal Bottom Status Bar with Share + Copy JSON */}
            <div className="border-t border-slate-100 pt-3 mt-4 flex flex-wrap justify-between items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                Index: <span className="text-slate-600 font-semibold">52 docs</span> · Payload:{" "}
                <span className="text-indigo-600 font-semibold">2 KB gzipped</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span>{copiedJson ? "✓ Copied JSON" : "{ } Copy JSON"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareSearch}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span>{sharedNotice ? "✓ Link copied" : "Share this search"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "ENGINEERED FOR SUB-MILLISECOND RETRIEVAL" (2x2 BENTO ARCHITECTURE GRID) */}
      <section id="features" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Architecture &amp; Benchmarks
          </span>
          <h2 className="font-display mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Engineered for sub-millisecond retrieval.
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Production search primitives in one zero-dependency{" "}
            <span className="font-mono font-semibold text-slate-800">2 KB</span> runtime.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: BM25 ranking */}
          <article className="card-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <span className="rounded-md border border-indigo-200/80 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-700">
                  k1 = 1.2, b = 0.75
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-extrabold tracking-tight text-slate-950">
                BM25 ranking
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Term frequency saturates logarithmically while document length normalization ensures concise pages beat bloated rambles.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-500">
              <span className="text-emerald-600 font-semibold">● P99: 0.80 ms</span>
              <span>·</span>
              <span>IDF-weighted lexical scoring</span>
            </div>
          </article>

          {/* Card 2: Typo tolerance */}
          <article className="card-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-100 font-mono text-sm font-extrabold text-violet-700">
                  अ/A
                </span>
                <span className="rounded-md border border-violet-200/80 bg-violet-50 px-2.5 py-1 font-mono text-xs font-semibold text-violet-700">
                  algoritm → algorithm (1-edit)
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-extrabold tracking-tight text-slate-950">
                Typo tolerance
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                One edit recovers misspellings across Latin and Devanagari scripts with bounded Damerau-Levenshtein distance.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-500">
              <span className="text-violet-600 font-semibold">Hindi + English</span>
              <span>·</span>
              <span>Zero-allocation edit matrix</span>
            </div>
          </article>

          {/* Card 3: Federated signals */}
          <article className="card-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-8 5h5M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  </svg>
                </span>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-800">
                  Lexical + Recency + Popularity
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-extrabold tracking-tight text-slate-950">
                Federated signals
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Lexical BM25 score, temporal recency decay, and popularity signals blend locally in a single deterministic pass.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 font-mono text-[11px]">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">0.78 Lexical</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">0.22 Recency</span>
            </div>
          </article>

          {/* Card 4: API gateway with tiers */}
          <article className="card-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-800">
                  Scrypt SHA-256 · Sliding Window · Fail-Closed
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-extrabold tracking-tight text-slate-950">
                API gateway with tiers
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Scrypt key derivation, sliding-window rate limiters, and per-tier quotas that fail closed under burst load.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 font-mono text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">AES-256-GCM Vault</span>
              <span>·</span>
              <span>Constant-time verification</span>
            </div>
          </article>
        </div>
      </section>

      {/* 7. "LIVE IN THREE STEPS" (WITH INTERACTIVE CODE PREVIEW) */}
      <section id="how-it-works" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
            3-Step Integration
          </span>
          <h2 className="font-display mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Live in three steps.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Zero build plugins or complex schemas — drop in and query immediately.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-surface p-6 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-indigo-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded-md shadow-sm shadow-indigo-500/30">
                  {s.step}
                </span>
                <h3 className="font-display mt-3.5 text-base font-extrabold tracking-tight text-slate-950">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
              </div>
              <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-lg mt-3 overflow-x-auto">
                <code>{s.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* 8. "PREDICTABLE RUPEE PRICING" (SMART BILLING TOGGLE & VISUAL HIERARCHY) */}
      <section id="pricing" className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Transparent Billing
          </span>
          <h2 className="font-display mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Predictable Rupee pricing.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Pro is the sweet spot for most teams.
          </p>

          {/* Interactive Billing Toggle: Monthly | Yearly (Save 20%) */}
          <div className="mt-6 inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                billing === "monthly"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              aria-pressed={billing === "yearly"}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                billing === "yearly"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Yearly</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {PLANS.map((plan) => {
            const activePrice = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const ctaText =
              plan.id === "starter"
                ? `Start at ₹${activePrice}`
                : `Choose ${plan.name} — ₹${activePrice}/mo`;

            return (
              <div
                key={plan.id}
                className={`flex h-full flex-col justify-between rounded-2xl p-6 transition-all ${
                  plan.featured
                    ? "border-2 border-indigo-600 bg-white shadow-xl shadow-indigo-500/10 relative"
                    : "border border-slate-200 bg-white shadow-sm hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-950">
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span
                        className={
                          plan.featured
                            ? "rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                            : "rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700"
                        }
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">{plan.who}</p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold tracking-tight text-slate-950">
                      ₹{activePrice}
                    </span>
                    <span className="font-mono text-xs font-medium text-slate-500">
                      /month{billing === "yearly" ? " (billed yearly)" : ""}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={plan.href}
                  className={`mt-8 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                      : plan.id === "ultra"
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                      : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                  }`}
                >
                  {ctaText}
                </a>
              </div>
            );
          })}
        </div>

        {/* Clean Enterprise & Full Comparison Strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-5 py-4 text-xs text-slate-600 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono font-semibold text-indigo-700">
              SLA 99.99%
            </span>
            <span>All plans include instant UPI &amp; card activation via Razorpay and zero-downtime key rotation.</span>
          </div>
          <a
            href="/pricing.html"
            className="shrink-0 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Need custom enterprise volume? Contact architecture team →
          </a>
        </div>
      </section>
    </main>
  );
}
