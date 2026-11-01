import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';
import { GLOBAL_TECH_RADAR, TechRadarItem } from '@/lib/saas/techRadarEngine';

export const runtime = 'nodejs';

const ALLOWED_CATEGORIES = new Set(['languages', 'frameworks', 'cloud-infrastructure', 'ai-engineering']);

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method Not Allowed', help: 'Use HTTP GET to access the /api/v1/radar endpoint.' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  // Header authentication with optional query param fallback
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey') || '';
  const verification = ApiKeyGateway.verifyAndConsume(apiKey);

  if (!verification.valid) {
    return NextResponse.json(
      {
        error: verification.error,
        code: 'UNAUTHORIZED_OR_RATE_LIMITED',
        help: verification.help || "Provide a valid API key in the 'x-api-key' header. Mint one via POST /api/v1/keys.",
      },
      {
        status: verification.statusCode || 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const categoryParam = searchParams.get('category');
  const limitParam = searchParams.get('limit');

  let filtered: TechRadarItem[] = [...GLOBAL_TECH_RADAR];

  if (categoryParam) {
    if (!ALLOWED_CATEGORIES.has(categoryParam)) {
      return NextResponse.json(
        {
          error: `Invalid category filter: '${categoryParam}'`,
          help: "Category must be one of: 'languages', 'frameworks', 'cloud-infrastructure', 'ai-engineering'.",
        },
        { status: 400 }
      );
    }
    filtered = filtered.filter((item) => item.category === categoryParam);
  }

  let limit = 20;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return NextResponse.json(
        {
          error: 'Invalid limit parameter.',
          help: "Limit must be a positive integer between 1 and 50. Example: '?limit=10'.",
        },
        { status: 400 }
      );
    }
    limit = parsedLimit;
  }

  const record = verification.record!;
  const responseData = {
    status: 'success',
    timestamp: new Date().toISOString(),
    account: {
      tier: record.tier,
      monthlyQuota: record.monthlyQuota,
      remainingRequests: verification.remainingQuota,
      hashingScheme: 'scrypt:v1',
    },
    meta: {
      totalItems: filtered.length,
      limit,
      category: categoryParam || 'all',
    },
    data: filtered.slice(0, limit),
    ...(verification.migrationNote ? { securityNotice: verification.migrationNote } : {}),
  };

  return NextResponse.json(responseData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(record.rateLimitPerMinute),
      'X-RateLimit-Remaining': String(verification.remainingQuota),
      'X-RateLimit-Reset': '60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
