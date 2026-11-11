'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_');

type Room = {
  code: string;
  host: string;
  query: string;
  updatedAt: number;
  members: string[];
};

export default function HomePage() {
  const [liveQuery, setLiveQuery] = useState('');
  const [togetherOpen, setTogetherOpen] = useState(false);
  const [name, setName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastRemoteQuery = useRef('');

  useEffect(() => {
    const w = window as unknown as { SearchEmbed?: { init: () => void } };
    w.SearchEmbed?.init();

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const applyRoom = useCallback((next: Room) => {
    setRoom(next);
    if (typeof next.query === 'string' && next.query !== lastRemoteQuery.current) {
      lastRemoteQuery.current = next.query;
      setLiveQuery(next.query);
      const inp = inputRef.current;
      if (inp) {
        inp.value = next.query;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, []);

  useEffect(() => {
    if (!room?.code) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/together?code=${encodeURIComponent(room.code)}`, {
          cache: 'no-store',
        });
        if (res.ok) applyRoom((await res.json()) as Room);
      } catch {
        /* ignore */
      }
    }, 1500);
    return () => clearInterval(id);
  }, [room?.code, applyRoom]);

  useEffect(() => {
    if (!room?.code) return;
    if (liveQuery === lastRemoteQuery.current) return;
    const t = setTimeout(async () => {
      try {
        lastRemoteQuery.current = liveQuery;
        const res = await fetch('/api/together', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            code: room.code,
            name: name || 'Guest',
            query: liveQuery,
          }),
        });
        if (res.ok) applyRoom((await res.json()) as Room);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [liveQuery, room?.code, name, applyRoom]);

  async function createRoom() {
    const n = name.trim() || 'Host';
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create room');
      applyRoom(data as Room);
      setNotice(`Room ${(data as Room).code} live — share code with your team.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not create room');
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    const n = name.trim() || 'Guest';
    const c = codeInput.trim().toUpperCase();
    if (!c) {
      setNotice('Enter a room code to join.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', code: c, name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Room not found');
      applyRoom(data as Room);
      setNotice(`Joined room ${c}. Queries sync live.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not join room');
    } finally {
      setBusy(false);
    }
  }

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

      {/* Live Sandbox Preview Section */}
      <section id="sandbox" className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="text-xs font-semibold text-slate-400 ml-1">
                Live Sandbox · Okapi BM25
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTogetherOpen((prev) => !prev)}
                aria-expanded={togetherOpen}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition cursor-pointer ${
                  togetherOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>👥 Together Mode</span>
                {room?.code && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700">
                    {room.code}
                  </span>
                )}
              </button>
              <div
                data-search-status
                aria-live="polite"
                className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100"
              >
                ⚡ Ready · 0.85 ms
              </div>
            </div>
          </div>

          {/* Rebuilt Unified 48px Inline Flex Search Input */}
          <div
            className="w-full flex items-center gap-2.5 px-3.5 rounded-xl transition focus-within:ring-2 focus-within:ring-slate-900 mb-3"
            style={{
              height: '48px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              data-search-input
              type="text"
              defaultValue=""
              onInput={(e) => setLiveQuery((e.target as HTMLInputElement).value)}
              placeholder="Search documentation, keys, algorithms..."
              className="w-full min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shrink-0">
              ⌘K
            </kbd>
          </div>

          {/* Inline Collapsible Together Mode Drawer */}
          {togetherOpen && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Together Mode · Live Query Sync
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Host or join a shared room to sync search queries in real time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTogetherOpen(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (e.g. Riya)"
                  className="sm:col-span-4 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="Room code (ABC123)"
                  maxLength={6}
                  className="sm:col-span-3 h-9 rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={createRoom}
                  className="sm:col-span-3 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 transition cursor-pointer"
                >
                  Host room
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={joinRoom}
                  className="sm:col-span-2 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 transition cursor-pointer"
                >
                  Join
                </button>
              </div>
              {notice && <p className="mt-2 text-[11px] font-medium text-slate-600">{notice}</p>}
            </div>
          )}

          {/* Try Chips (Horizontally Scrollable, Zero Truncation) */}
          <div
            className="no-scrollbar mb-6 items-center"
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              gap: '8px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            <span className="text-xs font-semibold text-slate-400 shrink-0">Try:</span>
            {['bm25 algorithm', 'minecraft', 'scrypt', 'wireguard vpn'].map((preset) => (
              <button
                key={preset}
                type="button"
                data-search-preset={preset}
                onClick={() => triggerPreset(preset)}
                className="rounded-full font-medium text-slate-700 bg-white hover:bg-[#F1F5F9] transition cursor-pointer shrink-0 whitespace-nowrap"
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                {preset}
              </button>
            ))}
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
