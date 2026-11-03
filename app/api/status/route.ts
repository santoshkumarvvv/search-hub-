import { NextRequest, NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/version';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Track process start time for real uptime computation
const processStartTime = Date.now();

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method Not Allowed', help: 'The /api/status endpoint only supports HTTP GET.' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  const uptimeMs = Date.now() - processStartTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  // Simple availability signal: if the process is running, it's up.
  // For true SLA tracking, pair with an external uptime monitor (e.g. UptimeRobot).
  const statusPayload = {
    status: 'nominal',
    service: 'search-hub-engine',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: {
      processMs: uptimeMs,
      human: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      note: 'Instance uptime only. For SLA guarantees use an external monitor.',
    },
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