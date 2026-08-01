import { NextResponse } from 'next/server';
import { APPS } from '@/lib/apps';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid: raw } = await params;
  const uid = decodeURIComponent(raw ?? '');

  const app = APPS.find((a) => a.uid === uid) ?? null;

  if (!app) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(app, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
