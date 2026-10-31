import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway, PricingTier } from '../../../../lib/saas/apiKeyGateway';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name || 'Developer Application';
    const tier = (body.tier as PricingTier) || 'free';

    const { rawKey, record } = ApiKeyGateway.generateKey(name, tier);

    return NextResponse.json(
      {
        message: 'API Key successfully provisioned. Store this key securely; it will not be displayed again.',
        apiKey: rawKey,
        keyDetails: {
          id: record.id,
          name: record.name,
          tier: record.tier,
          monthlyQuota: record.monthlyQuota,
          rateLimitPerMinute: record.rateLimitPerMinute,
          createdAt: record.createdAt,
        },
        documentationUrl: 'https://github.com/santoshkumarvvv/search-hub-#api-documentation',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mint API key' }, { status: 500 });
  }
}
