import type { Genre } from './types';

export const GENRES: Genre[] = [
  { slug: 'action', name: 'Action', nameHindi: 'एक्शन', emoji: '⚔️' },
  { slug: 'adventure', name: 'Adventure', nameHindi: 'एडवेंचर', emoji: '🧭' },
  { slug: 'fantasy', name: 'Fantasy', nameHindi: 'फैंटेसी', emoji: '🐉' },
  { slug: 'sci-fi', name: 'Sci-Fi', nameHindi: 'साई-फाई', emoji: '🛸' },
  { slug: 'romance', name: 'Romance', nameHindi: 'रोमांस', emoji: '💗' },
  { slug: 'comedy', name: 'Comedy', nameHindi: 'कॉमेडी', emoji: '😂' },
  { slug: 'mystery', name: 'Mystery', nameHindi: 'रहस्य', emoji: '🕵️' },
  { slug: 'sports', name: 'Sports', nameHindi: 'स्पोर्ट्स', emoji: '🏐' },
  { slug: 'slice-of-life', name: 'Slice of Life', nameHindi: 'स्लाइस ऑफ लाइफ', emoji: '🍜' },
  { slug: 'supernatural', name: 'Supernatural', nameHindi: 'अलौकिक', emoji: '👻' },
  { slug: 'mecha', name: 'Mecha', nameHindi: 'मेका', emoji: '🤖' },
  { slug: 'horror', name: 'Horror', nameHindi: 'हॉरर', emoji: '🩸' },
];

export function genreBySlug(slug: string): Genre | undefined {
  return GENRES.find((g) => g.slug === slug);
}
