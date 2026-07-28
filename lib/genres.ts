import type { Genre } from './types';

export const GENRES: Genre[] = [
  { slug: 'action', name: 'Action', emoji: '⚔️' },
  { slug: 'adventure', name: 'Adventure', emoji: '🧭' },
  { slug: 'fantasy', name: 'Fantasy', emoji: '🐉' },
  { slug: 'sci-fi', name: 'Sci-Fi', emoji: '🛸' },
  { slug: 'romance', name: 'Romance', emoji: '💗' },
  { slug: 'comedy', name: 'Comedy', emoji: '😂' },
  { slug: 'mystery', name: 'Mystery', emoji: '🕵️' },
  { slug: 'sports', name: 'Sports', emoji: '🏐' },
  { slug: 'slice-of-life', name: 'Slice of Life', emoji: '🍜' },
  { slug: 'supernatural', name: 'Supernatural', emoji: '👻' },
  { slug: 'mecha', name: 'Mecha', emoji: '🤖' },
  { slug: 'horror', name: 'Horror', emoji: '🩸' },
];

export function genreBySlug(slug: string): Genre | undefined {
  return GENRES.find((g) => g.slug === slug);
}
