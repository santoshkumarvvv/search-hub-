<div align="center">

# SearchHub

**High-performance catalog & search system**  
Built for speed, clarity, and scale.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Overview

SearchHub is a production-oriented web application for browsing, searching, and retrieving software packages.  
Engineered from the ground up with modern web standards — server-first rendering, type-safe APIs, and a razor-sharp dark UI.

## Core Capabilities

- **Instant Search** — real-time filtering across the entire catalogue
- **Smart Categorization** — Games · Apps · Tools with dynamic genre tags
- **Detail Pages** — rich metadata, feature lists, direct download flows
- **Dark-first UI** — optimized for long browsing sessions
- **Server Components** — fast first paint + client-side interactivity where it matters
- **Fully Responsive** — mobile, tablet, desktop without compromise

## Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Framework      | Next.js 15 (App Router) |
| Language       | TypeScript 5            |
| Styling        | Tailwind CSS 3          |
| Rendering      | RSC + Client Components |
| Deployment     | Vercel / Render ready   |

## Project Structure

```text
app/
  page.tsx                  # Catalog browser
  title/[uid]/page.tsx      # Detail + download view
  api/catalog/route.ts      # Catalogue API
  api/title/[uid]/route.ts  # Single item API
  layout.tsx
  globals.css
components/
  Browser.tsx               # Main interactive browser
  Toolbar.tsx               # Search + filters
  Card.tsx                  # Item card
lib/
  types.ts                  # Shared types
  apps.ts                   # Seed data
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Engineering Notes

- Strict TypeScript throughout
- Clean separation of data, presentation, and API layers
- Ready for CI (type-check · build · audit)
- Designed for easy extension of the catalogue source

## License

MIT © Santosh

---

<div align="center">

**Built for production.**  
[github.com/santoshkumarvvv](https://github.com/santoshkumarvvv)

</div>
