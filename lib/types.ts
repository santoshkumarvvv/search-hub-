export type VideoSource =
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo'; id: string }
  | { kind: 'mp4'; url: string; poster?: string };

export interface Episode {
  number: number;
  title: string;
  synopsis: string;
  durationLabel: string;
  thumbnail: string;
  source: VideoSource;
  releasedAt: string;
}

export interface Anime {
  slug: string;
  title: string;
  altTitle?: string;
  synopsis: string;
  year: number;
  status: 'Airing' | 'Completed' | 'Upcoming';
  rating: number;
  views: number;
  ageRating: 'U' | 'U/A 13+' | 'U/A 16+' | 'A';
  studio: string;
  languages: string[];
  genres: string[];
  poster: string;
  banner: string;
  accentFrom: string;
  accentTo: string;
  trending: boolean;
  featured: boolean;
  newRelease: boolean;
  episodes: Episode[];
}

export interface Genre {
  slug: string;
  name: string;
  emoji: string;
}
