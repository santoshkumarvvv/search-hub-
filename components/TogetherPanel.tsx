"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Message = { id: string; name: string; text: string; at: number };
type Room = {
  code: string;
  host: string;
  query: string;
  updatedAt: number;
  members: string[];
  pins: string[];
  messages: Message[];
};

export default function TogetherPanel({
  currentQuery,
  onRemoteQuery,
  open: controlledOpen,
  onClose,
}: {
  currentQuery: string;
  onRemoteQuery: (q: string) => void;
  open?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [chat, setChat] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lastRemoteQuery = useRef("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("se_together_name");
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const applyRoom = useCallback(
    (next: Room) => {
      setRoom(next);
      if (typeof next.query === "string" && next.query !== lastRemoteQuery.current) {
        lastRemoteQuery.current = next.query;
        onRemoteQuery(next.query);
      }
    },
    [onRemoteQuery]
  );

  useEffect(() => {
    if (!room?.code) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/together?code=${encodeURIComponent(room.code)}`, {
          cache: "no-store",
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
    if (currentQuery === lastRemoteQuery.current) return;
    const t = setTimeout(async () => {
      try {
        lastRemoteQuery.current = currentQuery;
        const res = await fetch("/api/together", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sync",
            code: room.code,
            name: name || "Guest",
            query: currentQuery,
          }),
        });
        if (res.ok) applyRoom((await res.json()) as Room);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [currentQuery, room?.code, name, applyRoom]);

  async function createRoom() {
    const n = name.trim() || "Host";
    setBusy(true);
    setNotice("");
    try {
      localStorage.setItem("se_together_name", n);
      const res = await fetch("/api/together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create room");
      applyRoom(data as Room);
      setNotice("Room live. Share the code with your team.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    const n = name.trim() || "Guest";
    const c = codeInput.trim().toUpperCase();
    if (!c) {
      setNotice("Enter a 6-character room code.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      localStorage.setItem("se_together_name", n);
      const res = await fetch("/api/together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", code: c, name: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Room not found");
      applyRoom(data as Room);
      setNotice("Joined. Queries and chat stay in real-time sync.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendChat() {
    if (!room || !chat.trim()) return;
    const text = chat.trim();
    setChat("");
    try {
      const res = await fetch("/api/together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          code: room.code,
          name: name || "Guest",
          text,
        }),
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
      setNotice("Invite link copied to clipboard.");
    } catch {
      setNotice(url);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const c = sp.get("together");
    if (c) {
      setCodeInput(c.toUpperCase());
      setTab("join");
      setInternalOpen(true);
    }
  }, []);

  function handleClose() {
    if (onClose) onClose();
    else setInternalOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="bg-indigo-50/60 border-b border-indigo-100 p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <span aria-hidden="true">👥</span>
            <span>Together Mode · Live Sync</span>
          </span>
          <span className="text-xs text-slate-500">
            Real-time shared query state &amp; side-channel chat.
          </span>
          {room && (
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
              {room.code}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close Together Mode drawer"
          title="Close Together Mode"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-200/70 bg-white/80 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          ✕
        </button>
      </div>

      {!room ? (
        <div className="mt-3">
          {/* 2-Tab Segmented Control */}
          <div
            role="tablist"
            aria-label="Together Mode mode selector"
            className="inline-flex rounded-lg border border-indigo-200/80 bg-white/90 p-0.5 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "create"}
              onClick={() => setTab("create")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === "create"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Room
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "join"}
              onClick={() => setTab("join")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === "join"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Join with Code
            </button>
          </div>

          {tab === "create" ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (e.g. Riya)"
                maxLength={24}
                aria-label="Your name"
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={busy}
                onClick={createRoom}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                Start Live Room
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (e.g. Riya)"
                maxLength={24}
                aria-label="Your name"
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
              />
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Room code (ABC123)"
                maxLength={6}
                aria-label="Room code"
                className="h-10 w-full sm:w-44 rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={busy}
                onClick={joinRoom}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-indigo-200/70 bg-white p-3">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Online ({room.members.length}):{" "}
                  <span className="font-mono text-indigo-700">{room.members.join(", ")}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyInvite}
                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Copy invite link
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoom(null)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Leave
                  </button>
                </div>
              </div>
              {room.query && (
                <p className="mt-2 font-mono text-xs text-slate-500">
                  Synced query: <span className="font-semibold text-slate-900">“{room.query}”</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex h-36 flex-col rounded-xl border border-indigo-200/70 bg-white">
            <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5 text-xs">
              {room.messages.map((m) => (
                <div key={m.id} className={m.name === "System" ? "text-slate-400" : "text-slate-700"}>
                  {m.name !== "System" && (
                    <span className="font-semibold text-indigo-600">{m.name}: </span>
                  )}
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 border-t border-slate-100 p-1.5">
              <input
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Message room…"
                className="h-8 flex-1 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={sendChat}
                className="rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && <p className="mt-2 font-mono text-xs text-indigo-700">{notice}</p>}
    </div>
  );
}
