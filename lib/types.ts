/**
 * APK / MOD download domain types.
 */

export type AppCategory = 'game' | 'app' | 'tool';

export interface AppItem {
  uid: string;
  name: string;
  version: string;
  size: string;
  category: AppCategory;

  icon: string;
  banner?: string;

  description: string;
  developer: string;
  updated: string;
  downloads: string;
  rating: number;
  androidReq: string;

  /** Tags shown on the card, e.g. ["APK", "MOD", "OBB"] */
  tags: string[];
  /** Mod feature label, e.g. "Premium Unlocked", "Unlimited Money" */
  modFeature?: string;

  /** Genre / sub-category, e.g. "Action", "Productivity" */
  genre: string;
  genres: string[];

  /** Whether the app is featured / trending */
  trending: boolean;
  editorChoice: boolean;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total: number;
}

export type SortKey = 'popular' | 'rating' | 'newest' | 'name';

export interface QueryOptions {
  q?: string;
  category?: AppCategory | 'all';
  genre?: string;
  sort?: SortKey;
  page?: number;
}
