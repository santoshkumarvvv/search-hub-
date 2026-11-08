---
name: search-hub
description: Client-side federated search widget with BM25 ranking. Use when adding search to any website, building a search engine for static sites, or when an AI agent needs to search website content without server-side APIs. Triggers on "add search to my site", "client-side search", "BM25 search widget", "federated search", "search without backend".
---

# search-hub

India's first client-side federated search widget. BM25 ranking runs entirely in the user's browser. Zero server cost. Zero API cost per query.

## Quick Start

1. Add the script tag to any HTML page:
   `<script src="https://search-hub-live.vercel.app/embed.js"></script>`
2. Add a container: `<div id="search-hub"></div>`
3. Search is live in twenty seconds. No account, no server, no config.

## How It Works

- **BM25 engine**: Robertson-Spärck Jones IDF formula, k1=1.2, b=0.75. Same formula Google used in its early days.
- **Federated ranking**: Merges results from multiple sources with weighted scoring (0.78 primary, 0.22 secondary, plus token boost). Word-boundary regex matching with correct escaping.
- **Crypto vault**: API keys encrypted with scrypt. Never stored in plain text — not in database, not in logs.
- **Rate limiting**: IP-based mint throttle on key generation (5 per IP per hour). In-memory store with graceful degradation on serverless cold starts.
- **Service worker**: PWA support, offline fallback, correct result shape matching.
- **Radar daemon**: Weekly GitHub Actions job that scans tech trends, auto-generates a PR with updates. Synthetic numbers removed; live API pending.

## Security

- CORS: exact hostname parsing via `new URL()`, no `includes()` or `endsWith()` bypasses. Dead Vercel domains removed from allowlist.
- Auth: `x-api-key` header only. Query param `apiKey` rejected.
- No pirated tags (MOD, God Mode, Anti-Ban, Unlimited Money) in app catalog.
- Real uptime computed from process start time, not hardcoded.

## Pricing

- ₹19/month trial: 1 site, 1,000 searches
- ₹49/month base: 5 sites, 15,000 searches
- ₹99/month premium: 20 sites, 50,000 searches, radar daemon, priority support
- UPI payments via Razorpay (2.36% total fee incl. GST)

## What NOT to Do

- Do not add server-side search APIs — the entire value prop is zero server cost.
- Do not weaken CORS to `*` or subdomain wildcards.
- Do not store keys in plain text or localStorage.
- Do not break the BM25 math (k1, b, IDF formula).
- Do not change federated ranking weights without testing.

## Repository

https://github.com/santoshkumarvvv/search-hub-
Branch: feat/searchembed-product
Live demo: https://search-hub-live.vercel.app/