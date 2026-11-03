# SearchEmbed — a zero-dependency, client-side site search widget (₹29–99/mo via UPI)

Hey r/indiandevelopers,

I've been building this for the last few weeks and finally pushed something demoable. Wanted to share before it becomes another abandoned repo.

## What it is

**SearchEmbed** is a site-search widget that runs entirely in the visitor's browser. No server, no API calls, no data leaving the tab.

- **BM25 ranking** (Okapi, k1=1.2, b=0.75) with Damerau-Levenshtein fuzzy matching for typos
- **~15 KB gzipped**, zero npm dependencies — you paste one `<script>` tag
- **Static JSON index** served from any CDN or GitHub Pages
- **Web Worker** so indexing never blocks the main thread (with automatic main-thread fallback if the worker fails)
- **Crypto-vaulted API keys** + tiered rate limiting (free 1k req, pro 50k, enterprise 500k) for the server-side mode
- **PWA + service worker** so it works offline

## Why I built it

Three things pushed me:

1. **Google's Custom Search JSON API is shutting down for new customers on Jan 1, 2027.** Their replacement (Vertex AI Search) starts at $49/month. Small blogs and dev sites can't justify that.
2. **Algolia's bill climbs with traffic** — a medium site can hit $400–800/month. Meilisearch Cloud is $30/month minimum. Typesense similar.
3. **India has ~178,000 websites with site search, but only ~1.1% (~1,100) actually have decent search.** The other 99% either have nothing or the default Google widget with ads and weak typo tolerance.

## The pricing angle

- **Free** — 1,000 searches/month
- **₹29/month** — 10,000 searches
- **₹99/month** — 100,000 searches
- Payments via **Razorpay + UPI** (zero MDR on UPI in India)

No credit card. No dollar conversion. No "contact sales."

## Live demo

[Link to demo.html on GitHub Pages] — 25 sample docs, type anything, watch it rank in your browser's devtools. The whole index builds in a Web Worker; if that fails it silently falls back to the main thread so the page never white-screens.

## What I'm looking for

Not upvotes — **honest feedback**:

- Does the BM25 + fuzzy combo feel right for your use case, or do you need filters/highlighting/multilingual?
- Is ₹29–99 the right range for Indian indie sites, or should it be even cheaper?
- What would make you actually embed this on your own site this week?

## Stack

Next.js API routes, TypeScript, scrypt key hashing, sliding-window rate limiter, CodeQL + Dependabot + CI on every push. The widget itself is vanilla JS — no framework lock-in for your site.

Repo: [github.com/santoshkumarvvv/search-hub-](https://github.com/santoshkumarvvv/search-hub-)

Built solo in India. First 10 customers will come from communities like this one, not ads — that's the whole thesis. Appreciate any sharp takes.