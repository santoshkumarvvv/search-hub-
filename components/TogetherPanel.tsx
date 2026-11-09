'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Msg = { id: string; name: string; text: string; at: number };
type Room = {
  code: string;
  query: string;
  host: string;
  members: string[];
  messages: Msg[];
  pins: string[];
  updatedAt: number;
};

type Props = {
  onRemoteQuery?: (q: string) => void;
  currentQuery?: string;
};

export default function TogetherPanel({ onRemoteQuery, currentQuery = '' }: Props) {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [chat, setChat] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const lastQuery = useRef('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_together_name');
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const applyRoom = useCallback(
    (r: Room) => {
      setRoom(r);
      if (r.query && r.query !== lastQuery.current) {
        lastQuery.current = r.query;
        onRemoteQuery?.(r.query);
      }
    },
    [onRemoteQuery]
  );

  useEffect(() => {
    if (!room?.code) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    const tick = async () => {
      try {
        const res = await fetch(`/api/together?code=${encodeURIComponent(room.code)}`);
        if (!res.ok) return;
        const data = (await res.json()) as Room;
        applyRoom(data);
      } catch {
        /* ignore */
      }
    };
    pollRef.current = setInterval(tick, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [room?.code, applyRoom]);

  useEffect(() => {
    if (!room?.code || !currentQuery.trim()) return;
    if (currentQuery === lastQuery.current) return;
    const t = setTimeout(async () => {
      try {
        lastQuery.current = currentQuery;
        const res = await fetch('/api/together', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'query', code: room.code, query: currentQuery, name }),
        });
        if (res.ok) applyRoom((await res.json()) as Room);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [currentQuery, room?.code, name, applyRoom]);

  async function createRoom() {
    const n = name.trim() || 'Host';
    setBusy(true);
    setNotice('');
    try {
      localStorage.setItem('se_together_name', n);
      const res = await fetch('/api/together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create room');
      applyRoom(data as Room);
      setNotice('Room live. Share the code with friends.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    const n = name.trim() || 'Guest';
    const c = codeInput.trim().toUpperCase();
    if (!c) {
      setNotice('Enter a room code.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      localStorage.setItem('se_together_name', n);
      const res = await fetch('/api/together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', code: c, name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Room not found');
      applyRoom(data as Room);
      setNotice('Joined. Searches and chat stay in sync.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function sendChat() {
    if (!room || !chat.trim()) return;
    const text = chat.trim();
    setChat('');
    try {
      const res = await fetch('/api/together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', code: room.code, name: name || 'Guest', text }),
      });
      if (res.ok) applyRoom((await res.json()) as Room);
    } catch {
      /* ignore */
    }
  }

  async function copyInvite() {
    if (!room) return;
    const url = `${window.location.origin}/?together=${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Invite link copied.');
    } catch {
      setNotice(url);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get('together');
    if (c) {
      setCodeInput(c.toUpperCase());
      setOpen(true);
    }
  }, []);

  function toggleOpen() {
    const y = typeof window !== 'undefined' ? window.scrollY : 0;
    setOpen((v) => !v);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex min-h-11 items-center rounded-full border border-[#7c5cff] bg-white px-4 text-sm font-semibold text-[#7c5cff]"
      >
        Show Together mode
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Together mode</h3>
          <p className="mt-1 text-sm text-muted">
            One room. Live query sync. Side chat. Pin results you both like.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {room && (
            <div className="rounded-full bg-purple/10 px-3 py-1.5 font-mono text-sm font-bold text-purple">
              {room.code}
            </div>
          )}
          <button
            type="button"
            onClick={toggleOpen}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Hide Together
          </button>
        </div>
      </div>

          {!room ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-ink outline-none focus:border-purple"
                  placeholder="e.g. Riya"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted">Join with code</span>
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-mono text-ink outline-none focus:border-purple"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </label>
              <button type="button" disabled={busy} onClick={createRoom} className="btn-primary min-h-12">
                Start a room
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={joinRoom}
                className="btn-secondary min-h-12 bg-white text-[#7c5cff]"
                style={{ border: '1px solid #7c5cff', background: '#ffffff', color: '#7c5cff' }}
              >
                Join room
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button type="button" onClick={copyInvite} className="btn-primary min-h-11 px-4 text-sm">
                    Copy invite link
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoom(null)}
                    className="btn-secondary min-h-11 px-4 text-sm"
                  >
                    Leave
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Online: {room.members.join(', ')}
                  {room.query ? ` · live query: “${room.query}”` : ''}
                </p>
                {room.pins.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pinned merge</p>
                    <ul className="mt-1 space-y-1">
                      {room.pins.map((pin) => (
                        <li key={pin} className="rounded-lg bg-panel2 px-3 py-2 text-sm text-ink">
                          {pin}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex h-64 flex-col rounded-xl border border-line bg-panel2">
                <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
                  {room.messages.map((m) => (
                    <div key={m.id} className={m.name === 'System' ? 'text-muted text-xs' : ''}>
                      {m.name !== 'System' && (
                        <span className="font-semibold text-purple">{m.name}: </span>
                      )}
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-line p-2">
                  <input
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Chat with the room…"
                    className="min-h-11 flex-1 rounded-lg border border-line px-3 text-sm outline-none focus:border-purple"
                  />
                  <button type="button" onClick={sendChat} className="btn-primary min-h-11 px-4 text-sm">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
          {notice && <p className="mt-3 text-sm text-muted">{notice}</p>}
    </div>
  );
}
