import { NextResponse } from 'next/server';
import { detail } from '@/lib/catalog';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid: raw } = await params;
  const uid = decodeURIComponent(raw ?? '');

  if (!/^(anime|movie|tv):\d+$/.test(uid)) {
    return NextResponse.json({ error: 'bad_uid' }, { status: 400 });
  }

  try {
    const item = await detail(uid);
    if (!item) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (err) {
    console.error('[api/title]', err);
    return NextResponse.json(
      { error: 'lookup_failed', detail: (err as Error).message },
      { status: 502 }
    );
  }
}
