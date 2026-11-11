import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine } from '@/lib/search/bm25';
import { CATALOG_CORPUS, CatalogDoc } from '@/lib/apps';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Pre-index BM25 search engine at module scope (Phase 2 & Phase 7)
const searchEngine = new BM25Engine<CatalogDoc>(1.2, 0.75);
searchEngine.addDocuments(CATALOG_CORPUS);

/** Exact hostname allowlist — never use includes/endsWith on the raw Origin string (CWE-20). */
const ALLOWED_HOSTNAMES = new Set([
  'search-hub-live.vercel.app',
  'localhost',
  '127.0.0.1',
]);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  let allowed = false;

  if (origin) {
    try {
      const { hostname } = new URL(origin);
      allowed = ALLOWED_HOSTNAMES.has(hostname);
    } catch {
      allowed = false;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://search-hub-live.vercel.app',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Allow-Max-Age': '86400',
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

  // API key verification (tiered quotas: starter 2k (₹19), pro 50k (₹99), ultra 500k + 3 agent runs/day (₹199) monthly)
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
    'Content-Type': 'application/json',
  };

  const query = (request.nextUrl.searchParams.get('q') || '').trim();

  if (!query) {
    const defaultResults = CATALOG_CORPUS.slice(0, 5).map((doc) => ({
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
