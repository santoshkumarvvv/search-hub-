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
  timestamp?: number;
  updatedAt: number;
  ttl?: number;
  members: string[];
};

export default function HomePage() {
  const [liveQuery, setLiveQuery] = useState('');
  const [name, setName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastRemoteQuery = useRef('');

  useEffect(() => {
    const w = window as unknown as {
      SearchEmbed?: { init: () => void };
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    w.SearchEmbed?.init();

    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
      setMicSupported(false);
    }

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
        body: JSON.stringify({ action: 'create', name: n, query: liveQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create room');
      applyRoom(data as Room);
      setNotice(`Room ${(data as Room).code} live (24h KV TTL) — share code with your team.`);
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
      setNotice(`Joined room ${c} from KV. Queries sync live.`);
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

  const startVoiceSearch = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
      };
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setMicSupported(false);
      return;
    }
    try {
      const recognition = new SR();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
        if (transcript) {
          setLiveQuery(transcript);
          const inp = inputRef.current;
          if (inp) {
            inp.value = transcript;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
        setListening(false);
      };
      recognition.onerror = () => {
        setListening(false);
        setMicSupported(false);
      };
      recognition.onend = () => {
        setListening(false);
      };
      recognition.start();
    } catch {
      setListening(false);
      setMicSupported(false);
    }
  };

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16 }}>
      <Script
        src="/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as unknown as { SearchEmbed?: { init: () => void } }).SearchEmbed?.init();
        }}
      />

      <section className="mx-auto text-center" style={{ maxWidth: 1100, paddingTop: 56, paddingBottom: 28 }}>
        <h1 className="hero-title" style={{ fontSize: 48, fontWeight: 700, color: '#111111', margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          Search that ships in seconds.
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.55)', margin: '14px auto 0', maxWidth: 760, lineHeight: 1.45 }}>
          Drop one 2 KB script tag to index, rank, and typo-correct your catalog under a millisecond.
        </p>
        <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
          <a href="#pricing" style={{ background: '#0a2540', color: '#ffffff', borderRadius: 28, padding: '16px 32px', fontWeight: 600, textDecoration: 'none', border: '2px solid #0a2540' }}>
            Get API Key
          </a>
          <a href="#sandbox" style={{ background: '#ffffff', color: '#0a2540', border: '2px solid #0a2540', borderRadius: 28, padding: '16px 32px', fontWeight: 600, textDecoration: 'none' }}>
            Try Free Demo
          </a>
        </div>
      </section>

      <section id="sandbox" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 28 }}>
        <style>{`
          #sandbox [data-search-input]::placeholder { color: rgba(0, 0, 0, 0.4); opacity: 1; }
          #sandbox [data-search-input]:focus { outline: none !important; border-color: #0a2540 !important; box-shadow: 0 0 0 4px rgba(10, 37, 64, 0.12) !important; }
        `}</style>
        <div
          data-search-embed
          data-api-url="/api/search"
          data-api-key={SANDBOX_DEMO_KEY}
          data-index-url="/data/index.json"
          className="widget-card"
          style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', padding: 40 }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              ref={inputRef}
              data-search-input
              type="text"
              defaultValue=""
              onInput={(e) => setLiveQuery((e.target as HTMLInputElement).value)}
              placeholder="Search catalog (e.g. bm25)..."
              className="search-input"
              style={{ height: 56, width: '100%', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#ffffff', color: '#111111', borderRadius: 28, padding: '0 84px 0 22px', fontSize: 18 }}
            />
            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
              {micSupported && (
                <button type="button" data-voice-mic onClick={startVoiceSearch} aria-label="Voice search" title="Voice search (hi-IN)" className="inline-flex items-center justify-center cursor-pointer" style={{ width: 28, height: 28, color: '#0a2540', backgroundColor: listening ? 'rgba(10, 37, 64, 0.08)' : 'transparent', border: 'none', borderRadius: 999 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a2540" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </button>
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <div id="homepage-embed-results" data-search-results style={{ marginTop: 16, backgroundColor: '#ffffff', border: '1px dashed rgba(0, 0, 0, 0.12)', borderRadius: 12, padding: 18, textAlign: 'center', fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>
            Type a query above to run Okapi BM25 ranking...
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.45)', fontWeight: 600 }}>TRY</span>
          {['bm25 algorithm', 'minecraft', 'scrypt', 'wireguard vpn'].map((preset) => (
            <button key={preset} type="button" data-search-preset={preset} onClick={() => triggerPreset(preset)} style={{ border: '1px solid rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.04)', color: 'rgba(0, 0, 0, 0.55)', fontSize: 13, padding: '4px 10px', borderRadius: 999, cursor: 'pointer' }}>
              {preset}
            </button>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111111', margin: 0 }}>Predictable Rupee pricing.</h2>
          <p style={{ color: 'rgba(0, 0, 0, 0.55)', fontSize: 16, marginTop: 8 }}>Pro is the sweet spot for most indie hackers and growing teams.</p>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24, alignItems: 'stretch' }}>
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 20, color: '#111', margin: '0 0 4px' }}>Starter</h3>
              <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', margin: '0 0 20px' }}>Personal sites and blogs.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>₹19</span>
                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 1.9 }}>
                <li>✓ 2,000 searches / month</li>
                <li>✓ 1 widget under 2 KB</li>
                <li>✓ BM25 + 1-edit typos</li>
              </ul>
            </div>
            <a href="/pricing.html#razorpay-starter" style={{ width: '100%', display: 'block', textAlign: 'center', background: '#0a2540', color: '#fff', fontWeight: 600, padding: '12px 16px', borderRadius: 8, textDecoration: 'none', boxSizing: 'border-box' }}>Choose Starter</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ background: '#0a2540', color: '#ffffff', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', padding: '4px 10px', borderRadius: 999, marginBottom: 8 }}>MOST POPULAR</span>
            <div style={{ width: '100%', flex: 1, background: 'rgba(25, 90, 99, 0.05)', border: '2px solid #0a2540', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: '#111', margin: '0 0 4px' }}>Pro</h3>
                <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', margin: '0 0 20px' }}>Indie SaaS and production docs.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>₹99</span>
                  <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 14, color: 'rgba(0,0,0,0.7)', lineHeight: 1.9 }}>
                  <li>✓ Unlimited widgets</li>
                  <li>✓ 50,000 API searches</li>
                  <li>✓ Scrypt keys + quotas</li>
                  <li>✓ JSON / CSV export</li>
                </ul>
              </div>
              <a href="/pricing.html#razorpay-pro" style={{ width: '100%', display: 'block', textAlign: 'center', background: '#0a2540', color: '#fff', fontWeight: 600, padding: '12px 16px', borderRadius: 8, textDecoration: 'none', boxSizing: 'border-box' }}>Choose Pro</a>
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 20, color: '#111', margin: '0 0 4px' }}>Ultra</h3>
              <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', margin: '0 0 20px' }}>High volume with AI agents.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>₹199</span>
                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 14, color: 'rgba(0,0,0,0.65)', lineHeight: 1.9 }}>
                <li>✓ 500,000 API searches</li>
                <li>✓ 3 agent runs / day</li>
                <li>✓ Priority routing</li>
              </ul>
            </div>
            <a href="/pricing.html#razorpay-ultra" style={{ width: '100%', display: 'block', textAlign: 'center', background: '#0a2540', color: '#fff', fontWeight: 600, padding: '12px 16px', borderRadius: 8, textDecoration: 'none', boxSizing: 'border-box' }}>Choose Ultra</a>
          </div>
        </div>
      </section>

      <section id="rooms" style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 72px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111111', margin: '0 0 16px', textAlign: 'center' }}>Rooms</h2>
        <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', padding: 32 }}>
          <div className="rooms-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ height: 44, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', padding: '0 12px', fontSize: 14 }} />
            <input value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="Room code (ABC123)" maxLength={6} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', padding: '0 12px', fontSize: 14, fontFamily: 'ui-monospace, monospace' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <button type="button" disabled={busy} onClick={createRoom} style={{ width: '100%', height: 48, borderRadius: 8, border: 'none', background: '#0a2540', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Host room</button>
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }} style={{ width: '100%', height: 48, borderRadius: 8, border: 'none', background: '#0a2540', color: '#fff', fontWeight: 600, cursor: 'pointer', padding: '12px 24px' }}>Share</button>
              {copied && <span style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', fontSize: 12, padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>Copied!</span>}
            </div>
            <button type="button" disabled={busy} onClick={joinRoom} style={{ width: '100%', height: 48, borderRadius: 8, border: '2px solid #0a2540', background: '#fff', color: '#0a2540', fontWeight: 600, cursor: 'pointer' }}>Join</button>
          </div>
          {notice && <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>{notice}</p>}
          {room?.code && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>
              Live room {room.code}
              {room.members?.length ? ` · ${room.members.length} member${room.members.length === 1 ? '' : 's'}` : ''}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
