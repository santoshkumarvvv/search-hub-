export type VideoSource =
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo'; id: string }
  | { kind: 'mp4'; url: string; poster?: string };

/** Audio language of a playable track. Hindi is the primary track for this site. */
export type AudioLang = 'hindi' | 'english' | 'japanese';

export const AUDIO_LABELS: Record<AudioLang, string> = {
  hindi: 'हिंदी डब',
  english: 'English Dub',
  japanese: 'Japanese + Sub',
};

/** One playable audio option for an episode. */
export interface AudioTrack {
  lang: AudioLang;
  source: VideoSource;
}

/**
 * Dubbing state of a series.
 * - `dubbed`      — full Hindi dub available
 * - `in-progress` — Hindi dub releasing weekly
 * - `announced`   — Hindi dub confirmed, not yet out
 * - `subbed-only` — subtitles only, no Hindi dub
 */
export type DubStatus = 'dubbed' | 'in-progress' | 'announced' | 'subbed-only';

export const DUB_LABELS: Record<DubStatus, string> = {
  dubbed: 'हिंदी डब उपलब्ध',
  'in-progress': 'हिंदी डब जारी',
  announced: 'हिंदी डब जल्द',
  'subbed-only': 'सबटाइटल',
};

export interface Episode {
  number: number;
  title: string;
  /** Hindi episode title, shown as the primary heading. */
  titleHindi?: string;
  synopsis: string;
  durationLabel: string;
  thumbnail: string;
  /** Playable audio options. The first entry is the default track. */
  audio: AudioTrack[];
  releasedAt: string;
  /** Date the Hindi dub of this episode went live. */
  dubbedAt?: string;
}

export interface Anime {
  slug: string;
  title: string;
  titleHindi?: string;
  altTitle?: string;
  synopsis: string;
  year: number;
  status: 'Airing' | 'Completed' | 'Upcoming';
  rating: number;
  views: number;
  ageRating: 'U' | 'U/A 13+' | 'U/A 16+' | 'A';
  studio: string;
  /** Studio that produced the Hindi dub. */
  dubStudio?: string;
  dubStatus: DubStatus;
  /** Audio languages available across the series. */
  languages: AudioLang[];
  genres: string[];
  poster: string;
  banner: string;
  trending: boolean;
  featured: boolean;
  newRelease: boolean;
  episodes: Episode[];
}

export interface Genre {
  slug: string;
  name: string;
  nameHindi: string;
  emoji: string;
}
