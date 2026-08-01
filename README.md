# SearchHub — APK, MOD & Games Download Portal

A clean, fast, and responsive APK download website built with **Next.js 15** and **Tailwind CSS**.

Inspired by APKMODY — built from scratch with clean code.

## Features

- 🔍 **Search** — real-time search across all apps, games, and tools
- 🎮 **Categories** — filter by Games, Apps, or Tools
- 🏷️ **Genre filter** — dynamic genre tags from the catalogue
- 📱 **App detail pages** — full info, MOD features, download buttons
- 🌙 **Dark theme** — sleek dark UI optimized for browsing
- ⚡ **Fast** — server-rendered first paint, instant client navigation
- 📐 **Responsive** — works on mobile, tablet, and desktop

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx              # Home page — search, filter, browse
  title/[uid]/page.tsx  # App detail + download page
  api/catalog/route.ts  # Catalog JSON API
  api/title/[uid]/route.ts  # Single app JSON API
  layout.tsx            # Root layout + footer
  globals.css           # Global styles
components/
  Browser.tsx           # Main catalog browser (client)
  Toolbar.tsx           # Search bar + category/sort filters (client)
  Card.tsx              # App card component (client)
lib/
  types.ts              # Shared TypeScript types
  apps.ts               # Seed catalogue data
```

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [TypeScript 5](https://www.typescriptlang.org/)

## License

MIT

---

Built by [Santosh Kumar](https://github.com/santoshkumarvvv)
