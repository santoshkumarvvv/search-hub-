import type { MediaItem, Page, QueryOptions, SortKey } from './types';
import { FALLBACK } from './fallback';
import * as jikan from './providers/jikan';
import * as tmdb from './providers/tmdb';

/**
 * Aggregation layer.
 *
 * Merges every provider into one result set and guarantees a usable response:
 * if all upstreams fail, the seed catalogue is returned rather than an error.
 */

const EMPTY: Page<MediaItem> = { items: [], page: 1, hasMore: false, total: 0 };

/** Runs a provider call, swallowing failures so one bad upstream can't break the page. */
async function attempt(
  label: string,
  fn: () => Promise<Page<MediaItem>>
): Promise<Page<MediaItem>> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[catalog] ${label} unavailable:`, (err as Error).message);
    return EMPTY;
  }
}

function dedupe(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.uid)) return false;
    seen.add(it.uid);
    return true;
  });
}

/** Interleaves provider results so the grid isn't one long block per source. */
function interleave(groups: MediaItem[][]): MediaItem[] {
  const out: MediaItem[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < longest; i++) {
    for (const g of groups) {
      if (g[i]) out.push(g[i]);
    }
  }
  return out;
}

export function sortItems(items: MediaItem[], sort: SortKey): MediaItem[] {
  const out = [...items];
  switch (sort) {
    case 'score':
      return out.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    case 'year':
      return out.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case 'title':
      return out.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return out;
  }
}

export async function browse(opts: QueryOptions = {}): Promise<Page<MediaItem>> {
  const page = Math.max(1, opts.page ?? 1);
  const kind = opts.kind ?? 'all';
  const q = opts.q?.trim();

  const wantAnime = kind === 'all' || kind === 'anime';
  const wantVideo = kind === 'all' || kind === 'movie' || kind === 'tv';

  const jobs: Promise<Page<MediaItem>>[] = [];

  if (q) {
    if (wantAnime) jobs.push(attempt('jikan.search', () => jikan.searchAnime(q, page)));
    if (wantVideo) jobs.push(attempt('tmdb.search', () => tmdb.search(q, page)));
  } else {
    if (wantAnime) jobs.push(attempt('jikan.top', () => jikan.topAnime(page)));
    if (kind === 'all' || kind === 'movie') {
      jobs.push(attempt('tmdb.trending', () => tmdb.trending(page)));
    }
    if (kind === 'tv') {
      jobs.push(attempt('tmdb.tv', () => tmdb.popularTv(page)));
    }
  }

  const pages = await Promise.all(jobs);
  let items = dedupe(interleave(pages.map((p) => p.items)));

  // Every upstream failed: fall back to seed data so the grid still renders.
  if (items.length === 0 && page === 1) {
    const seed = q
      ? FALLBACK.filter((it) => matches(it, q))
      : FALLBACK;
    return {
      items: sortItems(seed, opts.sort ?? 'popularity'),
      page: 1,
      hasMore: false,
      total: seed.length
    };
  }

  if (opts.genre && opts.genre !== 'all') {
    const g = opts.genre.toLowerCase();
    items = items.filter((it) => it.genres.some((x) => x.toLowerCase() === g));
  }

  return {
    items: sortItems(items, opts.sort ?? 'popularity'),
    page,
    hasMore: pages.some((p) => p.hasMore),
    total: pages.reduce((n, p) => n + p.total, 0)
  };
}

function matches(it: MediaItem, q: string): boolean {
  const hay = [it.title, it.originalTitle ?? '', it.studio ?? '', ...it.genres]
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

/** Resolves a `kind:id` uid back to a full record. */
export async function detail(uid: string): Promise<MediaItem | null> {
  const [kind, rawId] = uid.split(':');
  const id = Number(rawId);
  if (!kind || !Number.isFinite(id)) return null;

  try {
    if (kind === 'anime') return await jikan.animeById(id);
    if (kind === 'movie' || kind === 'tv') return await tmdb.byId(kind, id);
  } catch (err) {
    console.warn('[catalog] detail failed:', (err as Error).message);
  }

  return FALLBACK.find((it) => it.uid === uid) ?? null;
}

/** Genre list for the filter bar, derived from whatever is on screen. */
export function collectGenres(items: MediaItem[]): string[] {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const g of it.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([g]) => g)
    .sort();
}
