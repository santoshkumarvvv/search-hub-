import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { atomicRateLimit } from '@/lib/saas/apiKeyGateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROOM_TTL_SECONDS = 60 * 60 * 24; // 24 hours (86,400 seconds)
const ROOM_TTL_MS = ROOM_TTL_SECONDS * 1000;
const TOGETHER_RATE_LIMIT_PER_MIN = 20;
const VALID_ROOM_CODE = /^[A-Z2-9]{6}$/;

const KV_URL = process.env.KV_REST_API_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || '';
const USE_KV = KV_URL.length > 0 && KV_TOKEN.length > 0;
const LOCAL_KV_FILE = path.join('/tmp', 'searchhub-together-kv.json');

type Msg = { id: string; name: string; text: string; at: number };
type Room = {
  code: string;
  query: string;
  host: string;
  timestamp: number;
  updatedAt: number;
  ttl: number;
  members: string[];
  messages: Msg[];
  pins: string[];
};

type StoredRoomEntry = {
  room: Room;
  expiresAt: number;
};

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return '127.0.0.1';
}

function roomKey(code: string): string {
  return `together:room:${code}`;
}

function readDiskKv(): Record<string, StoredRoomEntry> {
  try {
    if (!fs.existsSync(LOCAL_KV_FILE)) return {};
    const raw = fs.readFileSync(LOCAL_KV_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, StoredRoomEntry>;
    const now = Date.now();
    const active: Record<string, StoredRoomEntry> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v.expiresAt === 'number' && v.expiresAt > now && v.room) {
        active[k] = v;
      }
    }
    return active;
  } catch {
    return {};
  }
}

function writeDiskKv(data: Record<string, StoredRoomEntry>): void {
  try {
    fs.writeFileSync(LOCAL_KV_FILE, JSON.stringify(data), 'utf8');
  } catch {
    // ignore disk errors on read-only fs
  }
}

async function kvGetRoom(roomCode: string): Promise<Room | null> {
  if (!VALID_ROOM_CODE.test(roomCode)) return null;
  const key = roomKey(roomCode);
  if (USE_KV) {
    try {
      const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: Room | string | null };
        if (data.result) {
          const parsed =
            typeof data.result === 'string'
              ? (JSON.parse(data.result) as Room)
              : (data.result as Room);
          if (parsed && Date.now() - parsed.updatedAt <= ROOM_TTL_MS) {
            return parsed;
          }
        }
      }
    } catch {
      // fall through to disk KV backup
    }
  }
  const disk = readDiskKv();
  const entry = disk[key];
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry.room;
}

async function kvSetRoom(
  roomCode: string,
  room: Room,
  ttlSeconds: number = ROOM_TTL_SECONDS
): Promise<void> {
  if (!VALID_ROOM_CODE.test(roomCode)) return;
  const key = roomKey(roomCode);
  if (USE_KV) {
    try {
      await fetch(`${KV_URL}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // also persist to disk KV backup
    }
  }
  const disk = readDiskKv();
  disk[key] = {
    room,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  writeDiskKv(disk);
}

function generateSixCharCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return out;
}

export async function GET(req: NextRequest) {
  const roomCode = (req.nextUrl.searchParams.get('code') || '').trim().toUpperCase();
  if (!roomCode || !VALID_ROOM_CODE.test(roomCode)) {
    return NextResponse.json({ error: 'Valid 6-character code required' }, { status: 400 });
  }
  const room = await kvGetRoom(roomCode);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = String(body.action || '');
  const name = String(body.name || 'Guest').slice(0, 24).trim() || 'Guest';

  // Section 4: Atomic rate limit (20 requests per minute per IP) on Together create and join ONLY
  if (action === 'create' || action === 'join') {
    const clientIp = getClientIp(req);
    const rl = await atomicRateLimit(`together:ip:${clientIp}`, TOGETHER_RATE_LIMIT_PER_MIN, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(TOGETHER_RATE_LIMIT_PER_MIN),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  if (action === 'create') {
    let c = generateSixCharCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await kvGetRoom(c);
      if (!existing) break;
      c = generateSixCharCode();
    }
    const now = Date.now();
    const room: Room = {
      code: c,
      query: String(body.query || '').slice(0, 200),
      host: name,
      timestamp: now,
      updatedAt: now,
      ttl: ROOM_TTL_SECONDS,
      members: [name],
      messages: [
        {
          id: crypto.randomUUID(),
          name: 'System',
          text: `${name} started a Together search room. Share the code so friends can join.`,
          at: now,
        },
      ],
      pins: [],
    };
    await kvSetRoom(c, room, ROOM_TTL_SECONDS);
    return NextResponse.json(room);
  }

  const roomCode = String(body.code || '').trim().toUpperCase();
  if (!VALID_ROOM_CODE.test(roomCode)) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // On join or update, always read directly from KV (never in-memory Map)
  const room = await kvGetRoom(roomCode);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  if (action === 'join') {
    if (!room.members.includes(name)) room.members.push(name);
    room.messages.push({
      id: crypto.randomUUID(),
      name: 'System',
      text: `${name} joined the room.`,
      at: Date.now(),
    });
    if (room.messages.length > 80) room.messages = room.messages.slice(-80);
    room.updatedAt = Date.now();
    await kvSetRoom(roomCode, room, ROOM_TTL_SECONDS);
    return NextResponse.json(room);
  }

  if (action === 'query' || action === 'sync') {
    room.query = String(body.query || '').slice(0, 200);
    room.updatedAt = Date.now();
    await kvSetRoom(roomCode, room, ROOM_TTL_SECONDS);
    return NextResponse.json(room);
  }

  if (action === 'chat') {
    const text = String(body.text || '').trim().slice(0, 400);
    if (!text) return NextResponse.json({ error: 'empty message' }, { status: 400 });
    room.messages.push({
      id: crypto.randomUUID(),
      name,
      text,
      at: Date.now(),
    });
    if (room.messages.length > 80) room.messages = room.messages.slice(-80);
    room.updatedAt = Date.now();
    await kvSetRoom(roomCode, room, ROOM_TTL_SECONDS);
    return NextResponse.json(room);
  }

  if (action === 'pin') {
    const title = String(body.title || '').trim().slice(0, 160);
    if (title && !room.pins.includes(title)) {
      room.pins.unshift(title);
      room.pins = room.pins.slice(0, 12);
      room.messages.push({
        id: crypto.randomUUID(),
        name: 'System',
        text: `${name} pinned “${title}”.`,
        at: Date.now(),
      });
    }
    room.updatedAt = Date.now();
    await kvSetRoom(roomCode, room, ROOM_TTL_SECONDS);
    return NextResponse.json(room);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
