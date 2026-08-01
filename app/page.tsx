import Browser from '@/components/Browser';
import type { AppCategory, SortKey } from '@/lib/types';
import { APPS } from '@/lib/apps';

const CATEGORIES = new Set(['all', 'game', 'app', 'tool']);
const SORTS = new Set(['popular', 'rating', 'newest', 'name']);

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}

export default async function HomePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;

  const q = one(sp.q).slice(0, 120).trim();
  const rawCat = one(sp.category) || 'all';
  const rawSort = one(sp.sort) || 'popular';
  const genre = one(sp.genre) || 'all';

  const category = (CATEGORIES.has(rawCat) ? rawCat : 'all') as AppCategory | 'all';
  const sort = (SORTS.has(rawSort) ? rawSort : 'popular') as SortKey;

  /* ── Server-side filtering from the seed catalogue ── */
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
      items.sort((a, b) => (a.editorChoice === b.editorChoice ? 0 : a.editorChoice ? -1 : 1));
      break;
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // popular — trending first, then editor's choice
      items.sort((a, b) => {
        if (a.trending !== b.trending) return a.trending ? -1 : 1;
        if (a.editorChoice !== b.editorChoice) return a.editorChoice ? -1 : 1;
        return 0;
      });
  }

  const allGenres = collectGenres(APPS);

  return (
    <Browser
      items={items}
      genres={allGenres}
      initialQuery={{ q, category, genre, sort }}
    />
  );
}

function collectGenres(items: typeof APPS): string[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const g of it.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([g]) => g)
    .sort();
}
