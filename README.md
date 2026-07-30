<div align="center">

<img src="public/icon.svg" width="88" alt="MediaHub" />

# MediaHub

**A fast, installable catalog for anime, films and series.**
Next.js 15 · App Router · Server-rendered · Offline-capable

[![License: MIT](https://img.shields.io/badge/license-MIT-38bdf8?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square)](https://nextjs.org)
[![Audit](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-22c55e?style=flat-square)](#security)
[![PWA](https://img.shields.io/badge/PWA-installable-312e81?style=flat-square)](public/manifest.webmanifest)

[Features](#features) · [Architecture](#architecture) · [Setup](#local-setup) · [Deploy](#deployment)

</div>

---

## Overview

MediaHub aggregates metadata from **Jikan** (MyAnimeList) and **TMDb** into a single browsable
catalog. Search, filtering, sorting and deep links are all server-rendered, so every view is
shareable and indexable.

Two design rules drive the codebase:

1. **The grid is never empty.** If both upstream providers fail, a seed catalogue is served instead
   of an error page.
2. **No third-party UI ever renders.** Trailers open inside a sandboxed frame in our own shell,
   mounted only after an explicit click.

## Features

| | |
|---|---|
| **Server-rendered catalog** | First page is in the HTML — no loading flash, fully indexable |
| **Unified search** | One query hits both providers, results are interleaved and de-duplicated |
| **Filters & sort** | Type (anime / movie / series), genre, and four sort orders |
| **Deep linking** | `?q=&kind=&genre=&sort=` restores any view; `/title/anime:1535` opens a title |
| **Infinite scroll** | `IntersectionObserver` with a 600px pre-fetch margin |
| **Own player shell** | Branded frame, click-to-load, sandboxed, no-cookie host |
| **Installable PWA** | Cache-first shell, network-first API with offline fallback |
| **Graceful degradation** | Missing TMDb key → anime only; both providers down → seed catalogue |
| **Accessible** | Skip link, focus rings, ARIA labels, `prefers-reduced-motion` |

## Architecture

```
├── app/
│   ├── page.tsx                  ·  server-rendered catalog (parses ?q &kind &genre &sort)
│   ├── title/[uid]/page.tsx      ·  detail view + metadata / Open Graph
│   ├── api/catalog/route.ts      ·  browse + search, 1h revalidate
│   ├── api/title/[uid]/route.ts  ·  single title lookup
│   ├── error.tsx · not-found.tsx ·  error boundaries
│   └── globals.css
├── components/
│   ├── Browser.tsx               ·  client state, URL sync, infinite scroll
│   ├── Toolbar.tsx               ·  search, filters, sort
│   ├── Card.tsx                  ·  poster tile with fallback
│   └── Player.tsx                ·  sandboxed trailer frame
├── lib/
│   ├── catalog.ts                ·  aggregation, de-dupe, interleave, sort
│   ├── providers/jikan.ts        ·  MyAnimeList adapter
│   ├── providers/tmdb.ts         ·  TMDb adapter
│   ├── fallback.ts               ·  offline seed data
│   └── types.ts                  ·  shared MediaItem shape
└── public/                       ·  icon, manifest, service worker
```

### Request flow

```
 browser ──► app/page.tsx ──► lib/catalog.browse()
                                   ├─► jikan.topAnime()   ─┐
                                   └─► tmdb.trending()    ─┤
                                                           ├─► interleave
                                                           ├─► de-duplicate by uid
                                                           └─► sort
                              all providers failed? ──► lib/fallback.FALLBACK
```

Each provider call is wrapped so a single failing upstream degrades that source only — it never
takes down the request.

### Provider normalisation

Both APIs collapse into one `MediaItem`, keyed by a `kind:id` uid (`anime:5114`, `movie:27205`).
The UI never branches on which provider a row came from.

## Security

`npm audit` reports **0 vulnerabilities**. Verified against a running build:

| Check | Result |
|---|---|
| `<script>` payload in `?q=` | escaped in all 4 contexts, 0 executable |
| `/api/title/xss:1` | `400` |
| `/api/title/anime:abc` | `400` |
| `/api/title/anime:1;DROP` | `400` |
| `?page=99999` / `?page=-5` | clamped to 1–100 |
| `?sort=../../etc` / `?kind=evil` | rejected, safe default applied |
| Poster URLs | all `https://`, no `javascript:` or `data:` |

Hardening in place:

- **Route guards** — uid must match `^(anime|movie|tv):\d+$`; sort and kind validated against
  allow-lists; page clamped
- **Sandboxed player** — explicit `sandbox` allow-list, `no-referrer`, no-cookie YouTube host,
  frame mounts only on click
- **Adult content filtered at the source** — Jikan `sfw=true` plus a rating/genre blocklist;
  TMDb `include_adult=false` plus a per-result `adult` check
- **Response headers** — `nosniff`, `SAMEORIGIN`, `no-referrer`, restrictive `Permissions-Policy`
- **No secrets client-side** — TMDb key is read only in route handlers

## Local Setup

```bash
git clone https://github.com/santoshkumarvvv/search-hub-.git
cd search-hub-
npm install
cp .env.example .env.local     # optional — add a TMDb key for films and series
npm run dev                    # http://localhost:3000
```

The site runs with **no configuration at all**. Without `TMDB_API_KEY` it serves anime from Jikan;
add the key to unlock movies and series.

| Variable | Required | Purpose |
|---|---|---|
| `TMDB_API_KEY` | No | Enables movies and series. Free from [themoviedb.org](https://www.themoviedb.org/settings/api) |

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

`vercel.json` is committed. Add `TMDB_API_KEY` under **Settings → Environment Variables**.

### Render

`render.yaml` is committed — point Render at the repo and it builds automatically.

## Notes on content

MediaHub is a **metadata and discovery** application. It hosts no video. Playback is limited to
official trailers served by YouTube. Catalogue data belongs to
[Jikan](https://jikan.moe) and [TMDb](https://www.themoviedb.org); neither endorses this project.

## License

[MIT](LICENSE) © 2026 **Santosh Kumar**

<div align="center">
<sub>Built by <a href="https://github.com/santoshkumarvvv">Santosh Kumar</a></sub>
</div>
