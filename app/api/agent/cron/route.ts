import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { POST as runAgent } from '../run/route';

function verifyBearerSecret(authHeader: string, secret: string): boolean {
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const auth = req.headers.get('authorization') || '';
  if (!verifyBearerSecret(auth, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const forwarded = new NextRequest(req.url, {
    method: 'POST',
    headers: { 'x-cron-secret': secret },
  });
  return runAgent(forwarded);
}
