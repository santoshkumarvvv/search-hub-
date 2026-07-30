/**
 * Shared domain types.
 *
 * Both providers (Jikan for anime, TMDb for film/TV) are normalised into the
 * single `MediaItem` shape below so the UI never has to branch on provider.
 */

export type MediaKind = 'anime' | 'movie' | 'tv';

export interface MediaItem {
  /** Provider-scoped id, e.g. "anime:5114" or "movie:27205". Stable + URL safe. */
  uid: string;
  /** Raw provider id. */
  id: number;
  kind: MediaKind;

  title: string;
  originalTitle?: string;
  year: number | null;
  synopsis: string;

  poster: string | null;
  backdrop: string | null;

  score: number | null;
  genres: string[];
  studio: string | null;

  /** Anime only. */
  episodes?: number | null;
  /** Film/TV only — YouTube key for the trailer. */
  trailerKey?: string | null;

  rating: string | null;
  /** True when a Hindi audio track is known to exist. */
  hindi: boolean;
  languages: string[];

  trending: boolean;
  newRelease: boolean;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total: number;
}

export interface ApiError {
  error: string;
  detail?: string;
}

export type SortKey = 'popularity' | 'score' | 'year' | 'title';

export interface QueryOptions {
  q?: string;
  kind?: MediaKind | 'all';
  genre?: string;
  sort?: SortKey;
  page?: number;
}
