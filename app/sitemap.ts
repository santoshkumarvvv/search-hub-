import type { MetadataRoute } from 'next';
import { getAll } from '@/lib/data';
import { GENRES } from '@/lib/genres';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anime-hindi-dub.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['', '/browse', '/genres', '/search', '/watchlist'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const animeRoutes = getAll().map((a) => ({
    url: `${BASE}/anime/${a.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const episodeRoutes = getAll().flatMap((a) =>
    a.episodes.map((e) => ({
      url: `${BASE}/watch/${a.slug}/${e.number}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  const genreRoutes = GENRES.map((g) => ({
    url: `${BASE}/genres/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...animeRoutes, ...episodeRoutes, ...genreRoutes];
}
