# 狐 KitsuneStream — Modern Anime Streaming Template

A fast, dark, anime-styled streaming frontend built with **Next.js 15 (App Router)**, **TypeScript** and **Tailwind CSS**.

Responsive homepage with a featured hero carousel, a custom video player that handles **YouTube / Vimeo embeds and direct MP4**, instant search, genre browsing, a trending section, and a localStorage watchlist with "continue watching".

---

## ⚠️ About the demo content

All series in `lib/data.ts` are **original fictional titles written for this template** — they are not real licensed anime. Artwork is free Unsplash photography and the video sources are public open-license sample files (Blender Foundation open movies and Google's public sample media bucket).

**Before you go live, replace `lib/data.ts` with your own catalog and only embed video you hold the rights to.** Streaming copyrighted anime without a license is illegal in most countries.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15.2 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + custom design tokens |
| Icons | lucide-react |
| Fonts | System font stack (zero network requests) |
| State | React hooks + localStorage (no backend required) |

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

Requires Node.js **18.18+** (20 LTS recommended).

---

## Folder structure

```
.
├── app/                          # App Router
│   ├── layout.tsx                # Root layout, metadata, header/footer
│   ├── page.tsx                  # Homepage (hero + all rows)
│   ├── globals.css               # Tailwind layers + design system
│   ├── loading.tsx               # Skeleton loading UI
│   ├── error.tsx                 # Error boundary
│   ├── not-found.tsx             # Custom 404
│   ├── robots.ts                 # robots.txt
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── anime/[slug]/page.tsx     # Series detail + episode list (SSG)
│   ├── watch/[slug]/[episode]/   # Video player page (SSG)
│   ├── browse/page.tsx           # Full catalog + filters/sort
│   ├── genres/page.tsx           # Genre index
│   ├── genres/[slug]/page.tsx    # Per-genre grid (SSG)
│   ├── search/page.tsx           # Search shell (Suspense)
│   └── watchlist/page.tsx        # Saved series
│
├── components/
│   ├── Header.tsx                # Sticky nav, search, mobile drawer
│   ├── Footer.tsx
│   ├── Hero.tsx                  # Auto-rotating featured carousel
│   ├── Row.tsx                   # Horizontal scroller with edge arrows
│   ├── AnimeCard.tsx             # Poster card w/ hover overlay
│   ├── VideoPlayer.tsx           # YouTube / Vimeo / MP4 player
│   ├── EpisodeList.tsx
│   ├── ContinueWatching.tsx      # Resume from saved positions
│   ├── BrowseGrid.tsx            # Client-side filter + sort
│   ├── SearchClient.tsx          # Debounced search, URL-synced
│   ├── WatchlistButton.tsx
│   ├── GenreChips.tsx
│   └── EmptyState.tsx
│
├── hooks/useWatchlist.ts         # localStorage watchlist + cross-tab sync
├── lib/
│   ├── data.ts                   # 👈 Demo catalog + selectors (replace this)
│   ├── genres.ts
│   ├── types.ts                  # Anime / Episode / VideoSource
│   └── utils.ts                  # cn(), formatCount(), formatDuration()
├── next.config.ts                # Image domains + security headers
├── tailwind.config.ts            # Theme tokens & animations
└── tsconfig.json                 # Strict TS, @/* path alias
```

---

## The video player

`components/VideoPlayer.tsx` switches on a discriminated union, so a source is type-safe:

```ts
type VideoSource =
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo';   id: string }
  | { kind: 'mp4'; url: string; poster?: string };
```

- **YouTube** → privacy-friendly `youtube-nocookie.com` embed
- **Vimeo** → `player.vimeo.com` with `dnt=1` (do not track)
- **MP4** → a fully custom HTML5 player with:
  - play/pause, ±10s skip, volume + mute, fullscreen
  - buffered-range indicator and scrub bar
  - keyboard shortcuts: `Space`/`K` play, `←`/`→` seek, `F` fullscreen, `M` mute
  - auto-hiding controls, loading spinner, and a retry UI on failure
  - **resume playback** — position is saved every 5s and restored on return

### Adding an episode

```ts
{
  number: 1,
  title: 'Episode title',
  synopsis: 'Short description.',
  durationLabel: '24 min',
  thumbnail: 'https://.../thumb.jpg',
  source: { kind: 'youtube', id: 'VIDEO_ID' },   // or vimeo / mp4
  releasedAt: '2025-01-01',
}
```

If you point `poster`/`banner`/`thumbnail` at a new image host, add its hostname to `images.remotePatterns` in `next.config.ts`.

---

## Performance & SEO

- **58 pages prerendered** at build time (SSG) — series, episodes and genres are all static.
- **~100 kB shared JS**; the homepage is ~128 kB First Load.
- `next/image` with AVIF/WebP, responsive `sizes`, and priority hints for above-the-fold art.
- System fonts → no font network request, no layout shift.
- Per-page `generateMetadata` with Open Graph tags, plus auto `sitemap.xml` and `robots.txt`.
- Accessibility: skip-to-content link, ARIA labels on all icon buttons, visible focus rings, `prefers-reduced-motion` support.

Set `NEXT_PUBLIC_SITE_URL` to your real domain so the sitemap and metadata emit absolute URLs.

---

## Deploy to Vercel

**Option A — dashboard**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — leave the build settings as-is.
4. Add an environment variable: `NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app`
5. Click **Deploy**.

**Option B — CLI**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

Redeploy after changing `NEXT_PUBLIC_SITE_URL` so the sitemap picks it up.

---

## Deploy to Netlify

Next.js on Netlify needs the official plugin.

1. Install it:

   ```bash
   npm i -D @netlify/plugin-nextjs
   ```

2. Create `netlify.toml` in the project root:

   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [build.environment]
     NODE_VERSION = "20"
   ```

3. Push to GitHub, then in Netlify choose **Add new site → Import an existing project**.
4. Add `NEXT_PUBLIC_SITE_URL` under **Site settings → Environment variables**.
5. Deploy.

Or via CLI:

```bash
npm i -g netlify-cli
netlify deploy --build          # preview
netlify deploy --build --prod   # production
```

### Static export (any host)

Every route is static **except** `/browse`, which reads the `?sort=` query param on the server. Remove that `searchParams` usage (default the sort client-side), then add `output: 'export'` to `next.config.ts` and set `images: { unoptimized: true }` to deploy the `out/` folder to GitHub Pages, Cloudflare Pages, S3, or any static host.

---

## Customising

| What | Where |
| --- | --- |
| Catalog / episodes | `lib/data.ts` |
| Genres | `lib/genres.ts` |
| Colors, shadows, animations | `tailwind.config.ts` |
| Buttons, chips, containers | `@layer components` in `app/globals.css` |
| Site name & metadata | `app/layout.tsx` |

To move to a real backend, keep the selector function signatures in `lib/data.ts` (`getBySlug`, `getTrending`, `searchAnime`, …) and swap their bodies for database or CMS queries — the components consume the selectors, not the array, so nothing else changes.

---

## License

Template code is free to use. Demo imagery belongs to its respective Unsplash photographers; sample videos belong to the Blender Foundation and Google. Supply your own licensed media for production.
