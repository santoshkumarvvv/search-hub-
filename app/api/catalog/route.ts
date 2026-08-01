import { NextResponse } from 'next/server';
import type { AppCategory, SortKey } from '@/lib/types';
import { APPS } from '@/lib/apps';

export const runtime = 'nodejs';

const CATEGORIES = new Set(['all', 'game', 'app', 'tool']);
const SORTS = new Set(['popular', 'rating', 'newest', 'name']);

export async function GET(req: Request) {
  const url = new URL(req.url);

  const rawCat = url.searchParams.get('category') ?? 'all';
  const rawSort = url.searchParams.get('sort') ?? 'popular';

  const category = (CATEGORIES.has(rawCat) ? rawCat : 'all') as AppCategory | 'all';
  const sort = (SORTS.has(rawSort) ? rawSort : 'popular') as SortKey;

  const q = (url.searchParams.get('q') ?? '').slice(0, 120).trim() || undefined;
  const genre = url.searchParams.get('genre')?.slice(0, 40) || undefined;

  try {
    let items = [...APPS];

    if (q) {
      const lq = q.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(lq) ||
          a.description.toLowerCase().includes(lq) ||
          a.developer.toLowerCase().includes(lq) ||
          a.genres.some((g) => g.toLowerCase().includes(lq))
      );
    }

    if (category !== 'all') {
      items = items.filter((a) => a.category === category);
    }

    if (genre && genre !== 'all') {
      const g = genre.toLowerCase();
      items = items.filter((a) => a.genres.some((x) => x.toLowerCase() === g));
    }

    switch (sort) {
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        items.sort((a, b) =>
          a.editorChoice === b.editorChoice ? 0 : a.editorChoice ? -1 : 1
        );
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        items.sort((a, b) => {
          if (a.trending !== b.trending) return a.trending ? -1 : 1;
          if (a.editorChoice !== b.editorChoice) return a.editorChoice ? -1 : 1;
          return 0;
        });
    }

    return NextResponse.json(
      { items, page: 1, hasMore: false, total: items.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err) {
    console.error('[api/catalog]', err);
    return NextResponse.json(
      { error: 'catalog_unavailable', detail: (err as Error).message },
      { status: 502 }
    );
  }
}
