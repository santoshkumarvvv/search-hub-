import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '../../../../lib/saas/apiKeyGateway';
import { GLOBAL_TECH_RADAR } from '../../../../lib/saas/techRadarEngine';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey') || '';

  const verification = ApiKeyGateway.verifyAndConsume(apiKey);

  if (!verification.valid) {
    return NextResponse.json(
      {
        error: verification.error,
        code: 'UNAUTHORIZED_OR_RATE_LIMITED',
        help: 'Pass your API key in the `x-api-key` header or visit /api/v1/keys to mint a free developer key.',
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

  const record = verification.record!;
  return NextResponse.json(
    {
      status: 'success',
      timestamp: new Date().toISOString(),
      account: {
        tier: record.tier,
        monthlyQuota: record.monthlyQuota,
        remainingRequests: verification.remainingQuota,
      },
      telemetry: {
        activeNodes: GLOBAL_TECH_RADAR.length,
        averageVelocityScore: 94.1,
        samplingInterval: 'Real-time Edge Feed',
      },
      data: GLOBAL_TECH_RADAR,
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(record.rateLimitPerMinute),
        'X-RateLimit-Remaining': String(verification.remainingQuota),
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
