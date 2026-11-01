import { NextRequest, NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/version';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method Not Allowed', help: 'The /api/status endpoint only supports HTTP GET.' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  const statusPayload = {
    status: 'nominal',
    service: 'search-hub-engine',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: '99.98%',
    engines: {
      search: 'Okapi BM25 + Web Worker Sharding',
      federatedRanker: '0.78 Lexical / 0.22 Recency',
      security: 'scrypt:v1 Salted KDF',
    },
  };

  return NextResponse.json(statusPayload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
