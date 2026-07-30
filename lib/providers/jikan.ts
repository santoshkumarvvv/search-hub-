import type { MediaItem, Page } from '../types';

/**
 * Jikan v4 adapter (unofficial MyAnimeList API).
 *
 * No API key required. Jikan rate-limits to roughly 3 req/s, so every call
 * here is issued from a Next.js route handler with a revalidating cache rather
 * than from the browser.
 */

const BASE = 'https://api.jikan.moe/v4';
const TIMEOUT_MS = 8000;

/** Anime whose MAL rating marks them as explicit are dropped outright. */
const BLOCKED_RATINGS = ['rx', 'r+'];
const BLOCKED_GENRES = ['hentai', 'erotica', 'ecchi'];

interface JikanImage { jpg?: { image_url?: string; large_image_url?: string } }
interface JikanNamed { name?: string }
interface JikanAnime {
  mal_id: number;
  title?: string;
  title_english?: string;
  title_japanese?: string;
  synopsis?: string;
  year?: number | null;
  aired?: { from?: string | null };
  episodes?: number | null;
  score?: number | null;
  rating?: string | null;
  images?: JikanImage;
  genres?: JikanNamed[];
  themes?: JikanNamed[];
  studios?: JikanNamed[];
  popularity?: number;
  status?: string;
}

async function get(path: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error(`jikan ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Reject anything flagged explicit by MAL before it reaches the UI. */
function isSafe(a: JikanAnime): boolean {
  const rating = (a.rating ?? '').toLowerCase();
  if (BLOCKED_RATINGS.some((r) => rating.startsWith(r))) return false;

  const tags = [...(a.genres ?? []), ...(a.themes ?? [])]
    .map((g) => (g.name ?? '').toLowerCase());
  return !tags.some((t) => BLOCKED_GENRES.includes(t));
}

export function normalize(a: JikanAnime): MediaItem {
  const year =
    a.year ??
    (a.aired?.from ? new Date(a.aired.from).getFullYear() : null);

  const genres = [...(a.genres ?? []), ...(a.themes ?? [])]
    .map((g) => g.name ?? '')
    .filter(Boolean);

  const currentYear = new Date().getFullYear();

  return {
    uid: `anime:${a.mal_id}`,
    id: a.mal_id,
    kind: 'anime',
    title: a.title_english || a.title || 'Untitled',
    originalTitle: a.title_japanese || undefined,
    year,
    synopsis: (a.synopsis ?? '').replace(/\s*\[Written by MAL Rewrite\]\s*$/, '').trim(),
    poster: a.images?.jpg?.large_image_url ?? a.images?.jpg?.image_url ?? null,
    backdrop: a.images?.jpg?.large_image_url ?? null,
    score: typeof a.score === 'number' ? a.score : null,
    genres,
    studio: a.studios?.[0]?.name ?? null,
    episodes: a.episodes ?? null,
    rating: a.rating ?? null,
    hindi: false,
    languages: ['Japanese', 'English'],
    trending: typeof a.popularity === 'number' && a.popularity <= 250,
    newRelease: year != null && year >= currentYear - 1
  };
}

function toPage(raw: unknown, page: number): Page<MediaItem> {
  const body = raw as {
    data?: JikanAnime[];
    pagination?: { has_next_page?: boolean; items?: { total?: number } };
  };
  const list = Array.isArray(body.data) ? body.data : [];
  const items = list.filter(isSafe).map(normalize);

  return {
    items,
    page,
    hasMore: Boolean(body.pagination?.has_next_page),
    total: body.pagination?.items?.total ?? items.length
  };
}

export async function topAnime(page = 1): Promise<Page<MediaItem>> {
  const raw = await get(`/top/anime?page=${page}&limit=24&sfw=true`);
  return toPage(raw, page);
}

export async function searchAnime(q: string, page = 1): Promise<Page<MediaItem>> {
  const raw = await get(
    `/anime?q=${encodeURIComponent(q)}&page=${page}&limit=24&sfw=true&order_by=members&sort=desc`
  );
  return toPage(raw, page);
}

export async function animeById(id: number): Promise<MediaItem | null> {
  const raw = await get(`/anime/${id}/full`);
  const body = raw as { data?: JikanAnime };
  if (!body.data || !isSafe(body.data)) return null;
  return normalize(body.data);
}

/** Returns a YouTube key for the title's promo video, when MAL has one. */
export async function animeTrailer(id: number): Promise<string | null> {
  try {
    const raw = await get(`/anime/${id}/full`);
    const body = raw as { data?: { trailer?: { youtube_id?: string | null } } };
    return body.data?.trailer?.youtube_id ?? null;
  } catch {
    return null;
  }
}
