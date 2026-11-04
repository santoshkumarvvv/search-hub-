import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ApiKeyGateway, PricingTier } from '@/lib/saas/apiKeyGateway';

export const runtime = 'nodejs';

const VALID_TIERS: Set<PricingTier> = new Set(['free', 'pro', 'enterprise']);
const NAME_REGEX = /^[a-zA-Z0-9_\-\s]{2,50}$/;

const mintAttempts = new Map<string, { count: number; resetAt: number }>();
const MINT_LIMIT = 5;
const MINT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkMintThrottle(ip: string): boolean {
  const now = Date.now();
  for (const [k, v] of mintAttempts.entries()) {
    if (now > v.resetAt) mintAttempts.delete(k);
  }
  const entry = mintAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    mintAttempts.set(ip, { count: 1, resetAt: now + MINT_WINDOW_MS });
    return true;
  }
  if (entry.count >= MINT_LIMIT) return false;
  entry.count++;
  return true;
}

function hasValidAdminSecret(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET || '';
  const provided = req.headers.get('x-admin-secret') || '';
  if (!adminSecret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(adminSecret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method Not Allowed', help: 'The /api/v1/keys endpoint requires HTTP POST.' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  if (!checkMintThrottle(ip)) {
    return NextResponse.json(
      {
        error: 'Too many key mint requests from this IP.',
        help: 'Maximum 5 API keys per IP per hour. Try again later or contact support.',
      },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid JSON body.',
        help: 'Send a valid JSON object with {"name": "Your App Name", "tier": "free"}.',
      },
      { status: 400 }
    );
  }

  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  const rawTier = typeof body.tier === 'string' ? (body.tier.toLowerCase() as PricingTier) : 'free';

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

  if (rawTier !== 'free' && !hasValidAdminSecret(request)) {
    return NextResponse.json(
      {
        error: 'Paid tier key minting requires payment verification or admin authorization.',
        help: "Public minting may only create 'free' tier keys. Complete UPI checkout at /pricing.html or provide a valid 'x-admin-secret' header.",
      },
      { status: 403 }
    );
  }

  try {
    const { rawKey, record } = await ApiKeyGateway.generateKey(rawName, rawTier);

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
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to provision API key.',
        help: 'Internal cryptographic failure. Check server logs.',
      },
      { status: 500 }
    );
  }
}
