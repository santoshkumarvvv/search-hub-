import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import { APPS } from '@/lib/apps';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Rate limiting in-memory store: 10 requests per minute per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 10;

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

interface DocEntry extends IndexDocument {
  url: string;
  snippet: string;
}

// Documentation index documents
const DOCUMENTATION_INDEX: DocEntry[] = [
  {
    id: 'doc-search-hub',
    title: 'SearchHub Federated Search Engine',
    url: 'https://search-hub-pearl.vercel.app/',
    category: 'Search Engine',
    snippet: 'High-velocity multi-source search engine with Okapi BM25 lexical ranking and Damerau-Levenshtein typo tolerance.',
    content: 'SearchHub federated search engine Okapi BM25 lexical ranking Damerau-Levenshtein typo tolerance inverted index TypeScript web worker sharding zero-dependency microsecond latency Santosh Kumar.',
  },
  {
    id: 'doc-searchembed',
    title: 'SearchEmbed Standalone Modal Widget',
    url: 'https://santoshkumarvvv.github.io/#architecture',
    category: 'Architecture',
    snippet: 'Drop-in 14.8KB zero-dependency search widget replacing heavy Algolia and Elasticsearch for static sites.',
    content: 'SearchEmbed standalone embeddable search widget modal 14.8KB zero dependency Algolia Elasticsearch replacement client-side BM25 index headless input integration keyboard shortcuts.',
  },
  {
    id: 'doc-dev-showcase',
    title: 'Dev Showcase Flutter Mobile Engine',
    url: 'https://github.com/santoshkumarvvv/dev-showcase',
    category: 'Mobile Engine',
    snippet: '120fps native Flutter mobile platform with Domain-Driven Design (DDD), Clean Architecture, and Riverpod state.',
    content: 'Dev Showcase native Flutter mobile platform 120fps domain driven design DDD clean architecture Riverpod state management automated GitHub Actions CI CD Android iOS.',
  },
  {
    id: 'doc-scrypt-kdf',
    title: 'Scrypt KDF Cryptographic Authentication Engine',
    url: 'https://santoshkumarvvv.github.io/#works',
    category: 'Security',
    snippet: 'Sequential memory-hard key derivation safeguarding authentication credentials against GPU and ASIC attacks.',
    content: 'Scrypt KDF cryptographic key derivation function sequential memory-hard password hashing authentication GPU ASIC brute force attack resistance salt rounds security architecture.',
  },
  {
    id: 'doc-radar-api',
    title: 'Tech Radar SaaS Engine & Developer Telemetry',
    url: 'https://search-hub-pearl.vercel.app/api/v1/radar',
    category: 'SaaS API',
    snippet: 'Developer technology radar tracking framework adoption, language velocity, and architectural trends.',
    content: 'Tech Radar SaaS API developer telemetry adoption quadrants rings hold assess trial adopt language velocity framework tracking Next.js TypeScript Rust Go.',
  },
  {
    id: 'doc-santosh-portfolio',
    title: 'Santosh Kumar Systems Engineering Hub',
    url: 'https://santoshkumarvvv.github.io/',
    category: 'Portfolio',
    snippet: 'Official systems engineering and search engine portfolio for Santosh Kumar (santoshkumarvvv).',
    content: 'Santosh Kumar santoshkumarvvv systems architect search engine engineering portfolio Vite React TypeScript Tailwind CSS open source projects GitHub.',
  },
  {
    id: 'doc-bm25-algorithm',
    title: 'Okapi BM25 Probabilistic Ranking Specification',
    url: 'https://search-hub-pearl.vercel.app/',
    category: 'Documentation',
    snippet: 'Robertson-Spärck Jones probabilistic term frequency saturation and document length normalization.',
    content: 'Okapi BM25 algorithm Robertson Sparck Jones probabilistic model term frequency saturation k1 b parameter document length normalization inverse document frequency IDF calculation.',
  },
];

// Augment documentation index with catalogue apps
for (const app of APPS) {
  DOCUMENTATION_INDEX.push({
    id: `app-${app.uid}`,
    title: `${app.name} (${app.category})`,
    url: `https://search-hub-pearl.vercel.app/?app=${encodeURIComponent(app.uid)}`,
    category: app.category,
    snippet: app.description.slice(0, 140) + '...',
    content: `${app.name} ${app.category} ${app.genre || ''} ${app.developer} ${app.description} ${app.tags.join(' ')}`,
  });
}

// Initialize BM25 search engine
const searchEngine = new BM25Engine<DocEntry>(1.2, 0.75);
searchEngine.addDocuments(DOCUMENTATION_INDEX);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  const allowed =
    origin.endsWith('santoshkumarvvv.github.io') ||
    origin.includes('localhost') ||
    origin.includes('vercel.app');

  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://santoshkumarvvv.github.io',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  // Client IP for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0].trim() : '') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Rate Limiting Check
  const now = Date.now();
  let rateRecord = rateLimitStore.get(ip);
  if (!rateRecord || now > rateRecord.resetAt) {
    rateRecord = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, rateRecord);
  }

  rateRecord.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - rateRecord.count);
  const resetInSec = Math.ceil((rateRecord.resetAt - now) / 1000);

  const rateHeaders: Record<string, string> = {
    ...corsHeaders,
    'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetInSec),
    'Content-Type': 'application/json',
  };

  if (rateRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute allowed.`,
        retryAfter: resetInSec,
      },
      {
        status: 429,
        headers: {
          ...rateHeaders,
          'Retry-After': String(resetInSec),
        },
      }
    );
  }

  const query = (request.nextUrl.searchParams.get('q') || '').trim();

  if (!query) {
    // Return top 5 default highlighted results
    const defaultResults = DOCUMENTATION_INDEX.slice(0, 5).map((doc) => ({
      title: doc.title,
      url: doc.url,
      snippet: doc.snippet,
      score: 1.0,
    }));

    return NextResponse.json(
      {
        query: '',
        count: defaultResults.length,
        results: defaultResults,
      },
      { status: 200, headers: rateHeaders }
    );
  }

  // Execute BM25 search
  const ranked = searchEngine.search(query, 10);
  const results = ranked.map((item) => ({
    title: item.document.title,
    url: item.document.url,
    snippet: item.document.snippet,
    score: item.score,
  }));

  return NextResponse.json(
    {
      query,
      count: results.length,
      results,
    },
    { status: 200, headers: rateHeaders }
  );
}
