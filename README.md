# Kitsu — Hindi Anime Hub

A fast, dark, responsive Hindi-dubbed anime streaming frontend built with Next.js 15, TypeScript, Tailwind CSS and Prisma/PostgreSQL foundations.

## Run locally
```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

The homepage includes a responsive hero, search, trending/popular/new release rows, watchlist interactions, and Hindi-first UI. `prisma/schema.prisma` contains User, Anime, Watchlist, and History models ready for NextAuth and database-backed persistence.

## Production next steps
Add an Auth.js `auth.ts` provider configuration, connect the sign-in button to your preferred OAuth provider, and populate `Anime` records via `prisma db seed`. Video embeds should only point to licensed providers.
