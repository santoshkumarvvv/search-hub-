import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const header = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${base}/api/agent/run`, {
    method: 'POST',
    headers: { 'x-cron-secret': secret, 'Content-Type': 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ status: res.status, data });
}
