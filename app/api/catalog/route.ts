import { NextResponse } from 'next/server';
import { browse } from '@/lib/catalog';
import type { MediaKind, SortKey } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 3600;

const KINDS = new Set(['all', 'anime', 'movie', 'tv']);
const SORTS = new Set(['popularity', 'score', 'year', 'title']);

export async function GET(req: Request) {
  const url = new URL(req.url);

  const rawKind = url.searchParams.get('kind') ?? 'all';
  const rawSort = url.searchParams.get('sort') ?? 'popularity';
  const rawPage = Number(url.searchParams.get('page') ?? '1');

  const kind = (KINDS.has(rawKind) ? rawKind : 'all') as MediaKind | 'all';
  const sort = (SORTS.has(rawSort) ? rawSort : 'popularity') as SortKey;
  const page = Number.isFinite(rawPage) ? Math.min(Math.max(1, rawPage), 100) : 1;

  const q = (url.searchParams.get('q') ?? '').slice(0, 120).trim() || undefined;
  const genre = url.searchParams.get('genre')?.slice(0, 40) || undefined;

  try {
    const result = await browse({ q, kind, genre, sort, page });
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (err) {
    console.error('[api/catalog]', err);
    return NextResponse.json(
      { error: 'catalog_unavailable', detail: (err as Error).message },
      { status: 502 }
    );
  }
}
