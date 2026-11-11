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

      {/* Hero Section (Compact Mobile Cleanup — Flow directly into Sandbox) */}
      <section className="relative overflow-hidden max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-6 sm:pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SUB-MILLISECOND SEARCH ENGINE</span>
        </div>
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-4 leading-[1.1]">
          Search that ships in{' '}
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            seconds.
          </span>
        </h1>
        <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto mb-0 leading-relaxed">
          Drop one{' '}
          <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-sm font-bold border border-slate-200">
            2 KB
          </code>{' '}
          script tag to index, rank, and typo-correct your catalog under a millisecond.
        </p>
      </section>

      {/* Live Sandbox Terminal Card */}
      <section id="sandbox" className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="p-[16px] sm:p-6"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow:
              '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Sandbox Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span
                className="font-mono ml-1.5"
                style={{ color: '#64748B', fontSize: '12px' }}
              >
                Okapi BM25 v2.4
              </span>
            </div>
            <div
              data-search-status
              aria-live="polite"
              className="rounded-full font-semibold"
              style={{
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                fontSize: '11px',
                padding: '4px 8px',
              }}
            >
              ⚡ Ready · 0.85 ms
            </div>
          </div>

          {/* Search Input (Zero Overflow, Crisp Typography) */}
          <div style={{ position: 'relative', width: '100%' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
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
              placeholder="Search catalog (e.g. bm25)..."
              className="text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              style={{
                height: '46px',
                width: '100%',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '0 14px 0 40px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Try Chips & Together Toggle (One Sleek Utility Row) */}
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div className="flex items-center min-w-0 flex-1" style={{ gap: '6px' }}>
              <span
                className="shrink-0"
                style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}
              >
                TRY:
              </span>
              <div
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  gap: '6px',
                  scrollbarWidth: 'none',
                }}
              >
                {['bm25 algorithm', 'minecraft', 'scrypt', 'wireguard vpn'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    data-search-preset={preset}
                    onClick={() => triggerPreset(preset)}
                    className="rounded-full shrink-0 cursor-pointer hover:bg-slate-50 transition"
                    style={{
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      fontSize: '11px',
                      padding: '4px 10px',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTogetherOpen((prev) => !prev)}
              aria-expanded={togetherOpen}
              className="rounded-full shrink-0 border border-transparent hover:border-slate-200 px-2.5 py-1 transition cursor-pointer"
              style={{
                fontSize: '11px',
                color: '#64748B',
                backgroundColor: 'transparent',
              }}
            >
              👥 Together{room?.code ? ` (${room.code})` : ''}
            </button>
          </div>

          {/* Smooth Slide-Down Together Panel */}
          {togetherOpen && (
            <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="sm:col-span-4 h-8 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs text-slate-900 focus:outline-none"
                />
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="Room code (ABC123)"
                  maxLength={6}
                  className="sm:col-span-3 h-8 rounded-lg border border-[#E2E8F0] bg-white px-2.5 font-mono text-xs text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={createRoom}
                  className="sm:col-span-3 h-8 rounded-lg bg-slate-900 text-white text-xs font-semibold px-3 cursor-pointer"
                >
                  Host room
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={joinRoom}
                  className="sm:col-span-2 h-8 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 text-xs font-semibold px-3 cursor-pointer"
                >
                  Join
                </button>
              </div>
              {notice && <p className="mt-1.5 text-[11px] text-slate-500">{notice}</p>}
            </div>
          )}

          {/* Results Placeholder */}
          <div
            id="homepage-embed-results"
            data-search-results
            style={{
              marginTop: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px dashed #E2E8F0',
              borderRadius: '10px',
              padding: '18px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#94A3B8',
            }}
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
