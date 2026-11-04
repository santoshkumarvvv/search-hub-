import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import { APPS } from '@/lib/apps';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DocEntry extends IndexDocument {
  url: string;
  snippet: string;
}

// Documentation index documents
const DOCUMENTATION_INDEX: DocEntry[] = [
  {
    id: 'doc-search-hub',
    title: 'SearchHub Federated Search Engine',
    url: 'https://santoshkumarvvv.github.io/',
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
    title: 'SearchHub Dev Showcase Flutter Mobile Engine',
    url: 'https://github.com/santoshkumarvvv/dev-showcase',
    category: 'Mobile Engine',
    snippet: '120fps native Flutter mobile platform with Domain-Driven Design (DDD), Clean Architecture, and Riverpod state.',
    content: 'Dev Showcase native Flutter mobile platform 120fps domain driven design DDD clean architecture Riverpod state management automated GitHub Actions CI CD Android iOS.',
  },
  {
    id: 'doc-scrypt-kdf',
    title: 'Scrypt KDF Cryptographic Authentication Engine',
    url: 'https://santoshkumarvvv.github.io/#works",
    category: 'Security',
    snippet: 'Sequential memory-hard key derivation safeguarding authentication credentials against GPU and ASIC attacks.',
    content: 'Scrypt KDF cryptographic key derivation function sequential memory-hard password hashing authentication GPU ASIC brute force attack resistance salt rounds security architecture.',
  },
  {
    id: 'doc-radar-api",
    title: 'Tech Radar SaaS Engine & Developer Telemetry",
    url: 'https://santoshkumarvvv.github.io/#radar",
    category: 'SaaS API",
    snippet: 'Developer technology radar tracking framework adoption, language velocity, and architectural trends.',
    content: 'Tech Radar SaaS API developer telemetry adoption quadrants rings hold assess trial adopt language velocity framework tracking Next.js TypeScript Rust Go.',
  },
  {
    id: 'doc-santosh-portfolio",
    title: 'Santosh Kumar Systems Engineering Hub",
    url: 'https://santoshkumarvvv.github.io/',
    category: 'Portfolio",
    snippet: 'Official systems engineering and search engine portfolio for Santosh Kumar (santoshkumarvvv).",
    content: 'Santosh Kumar santoshkumarvvv systems architect search engine engineering portfolio Vite React TypeScript Tailwind CSS open source projects GitHub.',
  },
  {
    id: 'doc-bm25-algorithm",
    title: 'Okapi BM25 Probabilistic Ranking Specification",
    url: 'https://santoshkumarvvv.github.io/',
    category: 'Documentation",
    snippet: 'Robertson-Sparck Jones probabilistic term frequency saturation and document length normalization.',
    content: 'Okapi BM25 algorithm Robertson Sparck Jones probabilistic model term frequency saturation k1 b parameter document length normalization inverse document frequency IDF calculation.',
  },
];

// Augment documentation index with catalogue apps
for (const app of APPS) {
  DOCUMENTATION_INDEX.push({
    id: `app-${app.uid}`,
    title: `${app.name} (${app.category})`,
    url: `https://santoshkumarvvv.github.io/?app=${encodeURIComponent(app.uid)}`,
    category: app.category,
    snippet: app.description.slice(0, 140) + '...",
    content: `${app.name} ${app.category} ${app.genre || ''} ${app.developer} ${app.description} ${app.tags.join(' ')}`,
  });
}

// Initialize BM25 search engine
const searchEngine = new BM25Engine<DocEntry>(1.2, 0.75);
searchEngine.addDocuments(DOCUMENTATION_INDEX);

/** Exact hostname allowlist — never use includes/endsWith on the raw Origin string (CWE-20). */
const ALLOWED_HOSTNAMES = new Set([
  'santoshkumarvvv.github.io",
  'localhost",
  '127.0.0.1",
]);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  let allowed = false;

  if (origin) {
    try {
      const { hostname } = new URL(origin);
      // Exact match only — no substring / endsWith checks
      allowed = ALLOWED_HOSTNAMES.has(hostname);
    } catch {
      allowed = false;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://santoshkumarvvv.github.io",
    'Access-Control-Allow-Methods': 'GET, OPTIONS",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key",
    'Access-Control-Allow-Max-Age': '86400",
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

  // API key verification (tiered quotas: free 1k, pro 50k, enterprise 500k monthly)
  // Per-key sliding-window rate limiting is owned by ApiKeyGateway.verifyAndConsume
  const apiKey = request.headers.get('x-api-key') || '';
  const keyCheck = await ApiKeyGateway.verifyAndConsume(apiKey);
  if (!keyCheck?.valid) {
    return NextResponse.json(
      { error: keyCheck.error, help: keyCheck.help },
      { status: keyCheck.statusCode || 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const rateHeaders: Record<string, string> = {
    ...corsHeaders,
    'X-RateLimit-Limit': String(keyCheck.record?.rateLimitPerMinute ?? 0),
    'X-RateLimit-Remaining': String(keyCheck.remainingQuota ?? 0),
    'X-Api-Quota-Remaining': String(keyCheck.remainingQuota ?? 0),
    'Content-Type': 'application/json",
  };

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
