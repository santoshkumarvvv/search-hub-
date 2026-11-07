import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

declare global {
  // eslint-disable-next-line no-var
  var __togetherRooms: Map<string, Room> | undefined;
}

function store(): Map<string, Room> {
  if (!globalThis.__togetherRooms) globalThis.__togetherRooms = new Map();
  return globalThis.__togetherRooms;
}

function code() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function clean(rooms: Map<string, Room>) {
  const cutoff = Date.now() - 1000 * 60 * 60 * 6;
  for (const [k, v] of rooms) {
    if (v.updatedAt < cutoff) rooms.delete(k);
  }
}

export async function GET(req: NextRequest) {
  const roomCode = (req.nextUrl.searchParams.get('code') || '').toUpperCase();
  if (!roomCode) {
    return NextResponse.json({ error: 'code required' }, { status: 400 });
  }
  const rooms = store();
  clean(rooms);
  const room = rooms.get(roomCode);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
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
  const rooms = store();
  clean(rooms);
  const name = String(body.name || 'Guest').slice(0, 24).trim() || 'Guest';

  if (action === 'create') {
    let c = code();
    while (rooms.has(c)) c = code();
    const room: Room = {
      code: c,
      query: '',
      host: name,
      members: [name],
      messages: [
        {
          id: crypto.randomUUID(),
          name: 'System',
          text: `${name} started a Together search room. Share the code so friends can join.`,
          at: Date.now(),
        },
      ],
      pins: [],
      updatedAt: Date.now(),
    };
    rooms.set(c, room);
    return NextResponse.json(room);
  }

  const roomCode = String(body.code || '').toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

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
    return NextResponse.json(room);
  }

  if (action === 'query') {
    room.query = String(body.query || '').slice(0, 200);
    room.updatedAt = Date.now();
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
    return NextResponse.json(room);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
