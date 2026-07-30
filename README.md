<div align="center">

<img src="docs/icon.svg" width="96" alt="AnimeHub logo" />

# AnimeHub

**Fast, offline-capable Hindi-dubbed anime catalog.**
Zero-dependency frontend · Safe-boot architecture · Never a blank screen.

[![Live Demo](https://img.shields.io/badge/demo-live-22c55e?style=flat-square)](https://santoshkumarvvv.github.io/search-hub-/)
[![License: MIT](https://img.shields.io/badge/license-MIT-38bdf8?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/badge/CI-configured-1f2937?style=flat-square)](.github/README.md)
[![PWA](https://img.shields.io/badge/PWA-installable-312e81?style=flat-square)](docs/manifest.webmanifest)

[**Live Demo**](https://santoshkumarvvv.github.io/search-hub-/) · [Features](#features) · [Architecture](#architecture) · [Local Setup](#local-setup)

</div>

---

## Overview

AnimeHub is a browsable anime catalog built around one hard rule: **the user never sees a blank
screen.** The entire UI boots from an embedded fallback catalog before a single network request
fires. If the network is down, the CDN is blocked, or JSON parsing fails, the app degrades
gracefully and tells the user exactly what happened instead of failing silently.

The production frontend (`docs/`) ships as **vanilla HTML/CSS/JS with no build step and no runtime
dependencies** — it loads on a 2G connection and works fully offline after first visit.

## Features

| | |
|---|---|
| **Safe-boot rendering** | Embedded fallback catalog renders instantly; remote catalog hydrates in the background |
| **Offline-first PWA** | Service worker caches the shell + catalog. Installable to home screen |
| **Instant search** | Debounced client-side filter across title, studio and genre |
| **Deep linking** | `#anime=<id>` opens a title directly — shareable, back-button aware |
| **Multi-audio UI** | Hindi / English / Tamil / Telugu / Japanese track selection per title |
| **Watchlist** | Persisted to `localStorage`, survives reloads, quota-safe |
| **Keyboard-first** | `/` focus search · `Esc` close panel · full tab-order and focus trap |
| **Accessible** | ARIA dialog semantics, visible focus rings, `prefers-reduced-motion` honoured |
| **Hardened** | Strict CSP, sandboxed player iframe, XSS-escaped rendering, no inline event handlers |

## Architecture

```
search-hub-/
├── docs/                     ← deployed to GitHub Pages (zero-build)
│   ├── index.html            ·  app shell + critical inline CSS
│   ├── script.js             ·  safe-boot renderer, search, router, watchlist
│   ├── style.css             ·  extended component styles
│   ├── sw.js                 ·  service worker (cache-first shell, SWR catalog)
│   ├── catalog.json          ·  50-title dataset
│   ├── manifest.webmanifest  ·  PWA metadata
│   └── icon.svg              ·  brand mark
├── app/                      ← Next.js 15 rewrite (in progress)
├── prisma/schema.prisma      ← User · Anime · Watchlist · History
├── lib/prisma.ts             ← lazy DB boundary
└── .github/                  ← CI pipeline (see .github/README.md)
```

### Boot sequence

```
 1. HTML paints  ──────────────► gradient shell + static markup   (no JS needed)
 2. script.js    ──────────────► renders embedded FALLBACK_CATALOG (~0ms)
 3. fetch catalog.json (4s timeout)
        ├── success ──────────► swap in full dataset, status: "ok"
        └── fail ─────────────► keep fallback, status: visible error banner
```

Every DOM reference is null-guarded and every boot step is wrapped in `try/catch`, so a single
failure degrades one component instead of white-screening the page.

## Security

- **Content-Security-Policy** — locks scripts to `self`, blocks inline execution, restricts frames
  to the video provider allowlist
- **Sandboxed iframe** — player runs with an explicit `sandbox` allowlist, `no-referrer`
- **XSS-safe rendering** — all user-reachable strings pass through `escapeHtml()`; URLs are
  protocol-validated before injection (blocks `javascript:` / `data:`)
- **No secrets in client code** — `.env` is git-ignored; `.env.example` documents required keys
- **Referrer stripped** on all outbound image and frame requests

## Local Setup

The deployed site needs **no build** — just serve `docs/`:

```bash
git clone https://github.com/santoshkumarvvv/search-hub-.git
cd search-hub-
npx serve docs        # → http://localhost:3000
```

For the Next.js rewrite:

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

## Roadmap

- [x] Safe-boot renderer with offline fallback
- [x] PWA + service worker
- [x] Deep linking and keyboard navigation
- [x] CSP and iframe hardening
- [ ] Auth.js provider wiring
- [ ] Postgres-backed watchlist sync
- [ ] Server-rendered catalog pages (Next.js)

## Legal

This project is a **UI/UX demonstration**. It hosts no video content. Player embeds must point only
to licensed providers. Catalog metadata is used for demonstration purposes.

## License

[MIT](LICENSE) © 2026 **Santosh Kumar**

<div align="center">
<sub>Built by <a href="https://github.com/santoshkumarvvv">Santosh Kumar</a></sub>
</div>
