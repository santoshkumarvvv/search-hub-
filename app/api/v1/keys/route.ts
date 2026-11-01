import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway, PricingTier } from '@/lib/saas/apiKeyGateway';

export const runtime = 'nodejs';

const VALID_TIERS: Set<PricingTier> = new Set(['free', 'pro', 'enterprise']);
const NAME_REGEX = /^[a-zA-Z0-9_\-\s]{2,50}$/;

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method Not Allowed', help: 'The /api/v1/keys endpoint requires HTTP POST.' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid JSON body.',
        help: 'Send a valid JSON object with {"name": "Your App Name", "tier": "free" | "pro" | "enterprise"}.',
      },
      { status: 400 }
    );
  }

  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  const rawTier = typeof body.tier === 'string' ? (body.tier.toLowerCase() as PricingTier) : 'free';

  // Strict input validation
  if (!rawName || !NAME_REGEX.test(rawName)) {
    return NextResponse.json(
      {
        error: 'Invalid application name.',
        help: "The 'name' field is required and must be between 2 and 50 alphanumeric characters (letters, numbers, hyphens, underscores).",
      },
      { status: 400 }
    );
  }

  if (!VALID_TIERS.has(rawTier)) {
    return NextResponse.json(
      {
        error: 'Invalid tier specified.',
        help: "The 'tier' field must be one of: 'free', 'pro', or 'enterprise'.",
      },
      { status: 400 }
    );
  }

  try {
    const { rawKey, record } = ApiKeyGateway.generateKey(rawName, rawTier);

    return NextResponse.json(
      {
        message: 'API Key generated successfully with scrypt:v1 salted encryption.',
        apiKey: rawKey,
        keyDetails: {
          id: record.id,
          name: record.name,
          tier: record.tier,
          monthlyQuota: record.monthlyQuota,
          rateLimitPerMinute: record.rateLimitPerMinute,
          createdAt: record.createdAt,
          hashingScheme: 'scrypt:v1 (N=16384, r=8, p=1)',
        },
        securityNotice: 'Store this API key securely. It cannot be recovered once lost.',
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to provision API key.',
        help: 'Internal cryptographic failure. Check server logs.',
      },
      { status: 500 }
    );
  }
}
