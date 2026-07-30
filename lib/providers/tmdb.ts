import type { MediaItem, Page } from '../types';

/**
 * TMDb v3 adapter.
 *
 * Requires TMDB_API_KEY. When the key is absent every function resolves to an
 * empty page so the app degrades to anime-only instead of failing the request.
 */

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';
const TIMEOUT_MS = 8000;

export function hasKey(): boolean {
  return Boolean(process.env.TMDB_API_KEY);
}

const EMPTY: Page<MediaItem> = { items: [], page: 1, hasMore: false, total: 0 };

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  genre_ids?: number[];
  popularity?: number;
  adult?: boolean;
}

/** TMDb genre ids -> labels, so the UI shows names without a second request. */
const GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

async function get(path: string): Promise<unknown> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY missing');

  const sep = path.includes('?') ? '&' : '?';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}${sep}api_key=${key}&include_adult=false`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error(`tmdb ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function img(path: string | null | undefined, size: 'w500' | 'w1280'): string | null {
  return path ? `${IMG}/${size}${path}` : null;
}

export function normalize(r: TmdbResult, kind: 'movie' | 'tv'): MediaItem {
  const date = r.release_date || r.first_air_date || '';
  const year = date ? Number(date.slice(0, 4)) : null;
  const currentYear = new Date().getFullYear();

  return {
    uid: `${kind}:${r.id}`,
    id: r.id,
    kind,
    title: r.title || r.name || 'Untitled',
    originalTitle: r.original_title || r.original_name || undefined,
    year: Number.isFinite(year) ? year : null,
    synopsis: (r.overview ?? '').trim(),
    poster: img(r.poster_path, 'w500'),
    backdrop: img(r.backdrop_path, 'w1280'),
    score: typeof r.vote_average === 'number' ? Number(r.vote_average.toFixed(1)) : null,
    genres: (r.genre_ids ?? []).map((id) => GENRES[id]).filter(Boolean),
    studio: null,
    trailerKey: null,
    rating: null,
    hindi: false,
    languages: ['English'],
    trending: typeof r.popularity === 'number' && r.popularity >= 100,
    newRelease: year != null && year >= currentYear - 1
  };
}

function toPage(raw: unknown, kind: 'movie' | 'tv', page: number): Page<MediaItem> {
  const body = raw as {
    results?: TmdbResult[];
    total_pages?: number;
    total_results?: number;
  };
  const list = (body.results ?? []).filter((r) => !r.adult);

  return {
    items: list.map((r) => normalize(r, kind)),
    page,
    hasMore: page < (body.total_pages ?? 1),
    total: body.total_results ?? list.length
  };
}

export async function trending(page = 1): Promise<Page<MediaItem>> {
  if (!hasKey()) return EMPTY;
  const raw = await get(`/trending/movie/week?page=${page}`);
  return toPage(raw, 'movie', page);
}

export async function popularTv(page = 1): Promise<Page<MediaItem>> {
  if (!hasKey()) return EMPTY;
  const raw = await get(`/tv/popular?page=${page}`);
  return toPage(raw, 'tv', page);
}

export async function search(q: string, page = 1): Promise<Page<MediaItem>> {
  if (!hasKey()) return EMPTY;
  const raw = await get(`/search/multi?query=${encodeURIComponent(q)}&page=${page}`);
  const body = raw as { results?: (TmdbResult & { media_type?: string })[] } & Record<string, unknown>;

  const filtered = (body.results ?? []).filter(
    (r) => !r.adult && (r.media_type === 'movie' || r.media_type === 'tv')
  );

  return {
    items: filtered.map((r) => normalize(r, r.media_type === 'tv' ? 'tv' : 'movie')),
    page,
    hasMore: page < ((body.total_pages as number) ?? 1),
    total: (body.total_results as number) ?? filtered.length
  };
}

export async function byId(kind: 'movie' | 'tv', id: number): Promise<MediaItem | null> {
  if (!hasKey()) return null;

  const raw = await get(`/${kind}/${id}?append_to_response=videos,credits`);
  const body = raw as TmdbResult & {
    genres?: { id: number; name: string }[];
    production_companies?: { name: string }[];
    number_of_episodes?: number;
    videos?: { results?: { key: string; site: string; type: string }[] };
  };

  if (body.adult) return null;

  const item = normalize(body, kind);
  item.genres = (body.genres ?? []).map((g) => g.name);
  item.studio = body.production_companies?.[0]?.name ?? null;
  if (kind === 'tv') item.episodes = body.number_of_episodes ?? null;

  const trailer = (body.videos?.results ?? []).find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  item.trailerKey = trailer?.key ?? null;

  return item;
}
