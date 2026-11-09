"use client";

import { useEffect, useRef, useState } from "react";
import TogetherPanel from "../components/TogetherPanel";

const SUGGESTED_CHIPS = ["bm25 algorithm", "minecraft", "scrypt"];

const CDN_SCRIPT_URL = "https://cdn.searchembed.com/v2.4.js";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("bm25 algorithm");
  const [togetherOpen, setTogetherOpen] = useState(false);

  useEffect(() => {
    const existing = document.querySelector('script[src="/embed.js"]');
    if (existing) return;
    const s = document.createElement("script");
    s.src = "/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const sync = () => setCurrentQuery(el.value);
    el.addEventListener("input", sync);
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("together")) {
        setTogetherOpen(true);
      }
    }
    return () => el.removeEventListener("input", sync);
  }, []);

  function runChipQuery(q: string) {
    setCurrentQuery(q);
    if (
      typeof window !== "undefined" &&
      (window as unknown as { SearchEmbed?: { search: (v: string) => void } }).SearchEmbed
    ) {
      (window as unknown as { SearchEmbed: { search: (v: string) => void } }).SearchEmbed.search(q);
      return;
    }
    if (inputRef.current) {
      inputRef.current.value = q;
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      inputRef.current.focus();
    }
  }

  function handleCopyCdn() {
    if (typeof window === "undefined") return;
    try {
      navigator.clipboard.writeText(CDN_SCRIPT_URL);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>SUB-MILLISECOND SEARCH ENGINE</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Search that ships in{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            seconds.
          </span>
        </h1>

        <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop one{" "}
          <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-sm font-bold border border-indigo-100">
            2 KB
          </code>{" "}
          script tag to index, rank, and typo-correct your catalog under a millisecond.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#sandbox"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition no-underline"
          >
            Try Live Sandbox &darr;
          </a>

          <div className="w-full sm:w-auto flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs font-mono text-xs text-slate-600">
            <span>&lt;script src=&quot;https://cdn...&quot;&gt;</span>
            <button
              type="button"
              onClick={handleCopyCdn}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-sans font-semibold transition cursor-pointer"
            >
              {copiedScript ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      {/* Live Sandbox Preview Section */}
      <section id="sandbox" className="max-w-4xl mx-auto px-6 pb-20 scroll-mt-20">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-indigo-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-400 ml-2">
                Live Sandbox · Okapi BM25
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                data-search-status
                aria-live="polite"
                className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100"
              >
                ⚡ 3 results · 0.85 ms
              </div>
              <button
                type="button"
                onClick={() => setTogetherOpen((v) => !v)}
                aria-expanded={togetherOpen}
                className={`text-xs px-3 py-1 rounded-full font-semibold border transition cursor-pointer ${
                  togetherOpen
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                }`}
              >
                👥 Together Mode
              </button>
            </div>
          </div>

          {togetherOpen && (
            <div className="mb-6 overflow-hidden rounded-xl border border-indigo-100">
              <TogetherPanel
                currentQuery={currentQuery}
                onRemoteQuery={(q) => runChipQuery(q)}
                open={togetherOpen}
                onClose={() => setTogetherOpen(false)}
              />
            </div>
          )}

          {/* Search Input Box */}
          <div className="relative mb-6">
            <label htmlFor="demo-search-input" className="sr-only">
              Search query
            </label>
            <input
              ref={inputRef}
              id="demo-search-input"
              type="text"
              data-search-input
              defaultValue="bm25 algorithm"
              placeholder="Search catalog (e.g. bm25 algorithm, minecraft, scrypt)…"
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              aria-label="Focus search input"
              className="absolute right-3 top-2.5 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs transition cursor-pointer"
            >
              🔍
            </button>
          </div>

          {/* Query Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-500">
            <span className="font-semibold">Try:</span>
            {SUGGESTED_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => runChipQuery(chip)}
                className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  currentQuery.toLowerCase() === chip.toLowerCase()
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Result Card Container */}
          <div data-search-results className="space-y-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="font-bold text-indigo-900 text-base">
                  Okapi BM25 Probabilistic Ranking Specification
                </h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded font-semibold shrink-0">
                  BM25: 4.80
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">https://search-hub-live.vercel.app</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Robertson-Sparck Jones probabilistic term frequency saturation and document length
                normalization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Features (Dark Contrast Break) */}
      <section id="features" className="bg-slate-900 text-white py-24 px-6 my-12 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Architecture &amp; Benchmarks
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for sub-millisecond retrieval.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl">
              <div className="text-indigo-400 text-2xl mb-4" aria-hidden="true">
                ⚡
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">BM25 Ranking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Term frequency saturates logarithmically while document length normalization ensures
                concise pages beat bloated rambles.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl">
              <div className="text-indigo-400 text-2xl mb-4" aria-hidden="true">
                🌐
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Typo Tolerance</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                One edit recovers misspellings across Latin and Devanagari scripts with bounded
                Damerau-Levenshtein distance.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl">
              <div className="text-indigo-400 text-2xl mb-4" aria-hidden="true">
                🛡️
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Secure API Gateway</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Scrypt key derivation, sliding-window rate limiters, and per-tier quotas that fail
                closed under burst load.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Starter</h3>
              <p className="text-sm text-slate-500 mb-6">Personal sites and blogs.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹19</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 mb-8 list-none p-0">
                <li className="flex items-center gap-3">✓ 1 widget under 2 KB</li>
                <li className="flex items-center gap-3">✓ 5,000 documents</li>
                <li className="flex items-center gap-3">✓ BM25 + 1-edit typos</li>
              </ul>
            </div>
            <a
              href="/pricing.html#pricing-plans"
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition no-underline"
            >
              Start at ₹19
            </a>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-indigo-900 text-white border-2 border-indigo-600 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative">
            <span className="absolute -top-3.5 right-8 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="font-bold text-xl mb-1 text-white">Pro</h3>
              <p className="text-sm text-indigo-200 mb-6">Indie SaaS and production docs.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-white">₹99</span>
                <span className="text-indigo-200 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-indigo-100 mb-8 list-none p-0">
                <li className="flex items-center gap-3">✓ Unlimited widgets</li>
                <li className="flex items-center gap-3">✓ 50,000 API searches</li>
                <li className="flex items-center gap-3">✓ Scrypt keys + quotas</li>
                <li className="flex items-center gap-3">✓ JSON / CSV export</li>
              </ul>
            </div>
            <a
              href="/pricing.html#pricing-plans"
              className="w-full block text-center bg-indigo-50 hover:bg-white text-indigo-950 font-semibold py-3 rounded-xl text-sm transition shadow-md no-underline"
            >
              Choose Pro — ₹99/mo
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Ultra</h3>
              <p className="text-sm text-slate-500 mb-6">High volume with AI agents.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">₹199</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-600 mb-8 list-none p-0">
                <li className="flex items-center gap-3">✓ 500,000 API searches</li>
                <li className="flex items-center gap-3">✓ 3 agent runs / day</li>
                <li className="flex items-center gap-3">✓ Priority routing</li>
              </ul>
            </div>
            <a
              href="/pricing.html#pricing-plans"
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition no-underline"
            >
              Choose Ultra — ₹199/mo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
