import Browser from '@/components/Browser';
import { browse } from '@/lib/catalog';
import type { MediaKind, SortKey } from '@/lib/types';

export const revalidate = 3600;

const KINDS = new Set(['all', 'anime', 'movie', 'tv']);
const SORTS = new Set(['popularity', 'score', 'year', 'title']);

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;

  const q = one(sp.q).slice(0, 120).trim();
  const rawKind = one(sp.kind) || 'all';
  const rawSort = one(sp.sort) || 'popularity';
  const genre = one(sp.genre) || 'all';

  const kind = (KINDS.has(rawKind) ? rawKind : 'all') as MediaKind | 'all';
  const sort = (SORTS.has(rawSort) ? rawSort : 'popularity') as SortKey;

  // Server-render the first page so the grid and its links exist in the HTML.
  const initial = await browse({
    q: q || undefined,
    kind,
    genre: genre !== 'all' ? genre : undefined,
    sort,
    page: 1
  });

  return (
    <Browser
      initial={initial}
      initialQuery={{ q, kind, genre, sort }}
    />
  );
}
