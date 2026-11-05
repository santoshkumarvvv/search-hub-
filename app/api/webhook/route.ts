import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ApiKeyGateway, PricingTier } from '@/lib/saas/apiKeyGateway';
import { agentStore } from '@/lib/agent/store';

function sanitizeLogField(value: string): string {
  return String(value || '')
    .replace(/[\r\n\t]/g, ' ')
    .slice(0, 120);
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveTier(plan: string): PricingTier {
  const normalized = plan.toLowerCase().trim();
  if (normalized === 'ultra' || normalized === 'enterprise') return 'enterprise';
  if (normalized === 'pro') return 'pro';
  return 'free';
}

/**
 * AES-256-GCM encrypt a plaintext using RAZORPAY_WEBHOOK_SECRET as the key material.
 * Returns base64(iv || authTag || ciphertext). Decryption requires the same secret,
 * so a leaked KV entry alone cannot reveal the API key.
 */
function encryptSecret(plaintext: string): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET required for key encryption');
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature') || '';
  const body = await req.text();

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          notes?: { plan?: string };
          email?: string;
        };
      };
    };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event === 'payment.captured') {
    const rawPlan = event.payload?.payment?.entity?.notes?.plan || 'pro';
    const rawEmail = event.payload?.payment?.entity?.email || '';
    const rawPaymentId =
      event.payload?.payment?.entity?.id || `pay_${crypto.randomBytes(8).toString('hex')}`;

    const safePlan = sanitizeLogField(rawPlan);
    const safeEmail = sanitizeLogField(rawEmail);
    const safePaymentId = sanitizeLogField(rawPaymentId);
    const tier = resolveTier(safePlan);

    const keyLabel =
      (safeEmail ? safeEmail.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Customer').slice(0, 30) +
      `_${safePlan.replace(/[^a-zA-Z0-9_-]/g, '') || 'plan'}`;

    const { rawKey, record } = await ApiKeyGateway.generateKey(keyLabel, tier);
    const claimToken = crypto.randomBytes(16).toString('hex');
    const createdAt = new Date().toISOString();

    // Encrypt the raw API key before persisting — KV leak alone cannot expose it
    const encryptedKey = encryptSecret(rawKey);

    await agentStore.setSubscription({
      paymentId: safePaymentId,
      plan: safePlan,
      tier,
      email: safeEmail,
      keyId: record.id,
      createdAt,
    });

    await agentStore.setOneTimeKeyClaim({
      claimToken,
      paymentId: safePaymentId,
      apiKey: encryptedKey,
      tier,
      plan: safePlan,
      email: safeEmail,
      createdAt,
    });

    console.log(
      `Razorpay payment captured: tier=${tier} keyId=${record.id}`
    );

    return NextResponse.json({
      received: true,
      tier,
      keyId: record.id,
      claimUrl: `/api/webhook?claim=${encodeURIComponent(claimToken)}`,
    });
  }

  return NextResponse.json({ received: true });
}

/**
 * Secure one-time API key display page.
 * Consumes and deletes the claim record from KV on first view so the raw key cannot be re-read.
 * Decrypts the AES-GCM encrypted key using RAZORPAY_WEBHOOK_SECRET.
 */
export async function GET(req: NextRequest) {
  const token =
    req.nextUrl.searchParams.get('claim') || req.nextUrl.searchParams.get('payment_id') || '';
  if (!token) {
    return NextResponse.json(
      { error: 'Missing claim token or payment_id parameter.' },
      { status: 400 }
    );
  }

  const claim = await agentStore.consumeOneTimeKeyClaim(token);
  if (!claim) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Key Claim Expired · SearchEmbed</title></head>
      <body style="background:#0a0a0f;color:#e8e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
        <div style="max-width:480px;padding:32px;background:#13131d;border:1px solid #222233;border-radius:12px;text-align:center">
          <h1 style="font-size:1.4rem;margin:0 0 12px">One-Time Key Link Already Used or Expired</h1>
          <p style="color:#8a8a9a;font-size:0.9rem;line-height:1.5">For security, API keys are displayed only once and never stored in plaintext.</p>
          <a href="/pricing.html" style="display:inline-block;margin-top:16px;color:#7c5cff;text-decoration:none;font-weight:600">Return to Pricing</a>
        </div>
      </body></html>`,
      {
        status: 410,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  // Decrypt the stored key
  let plaintextKey = '';
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const key = crypto.createHash('sha256').update(secret).digest();
    const buf = Buffer.from(claim.apiKey, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    plaintextKey = decipher.update(enc) + decipher.final('utf8');
  } catch {
    return NextResponse.json({ error: 'Key decryption failed' }, { status: 500 });
  }

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Your API Key · SearchEmbed</title></head>
  <body style="background:#0a0a0f;color:#e8e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
    <div style="max-width:560px;width:90%;padding:32px;background:#13131d;border:1px solid #3ddc97;border-radius:12px">
      <span style="background:#3ddc97;color:#0a0a0f;padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700">ONE-TIME DISPLAY</span>
      <h1 style="font-size:1.5rem;margin:16px 0 8px">Your ${escapeHtml(claim.plan.toUpperCase())} API Key is Ready</h1>
      <p style="color:#8a8a9a;font-size:0.9rem;margin-bottom:20px">Copy and store this key now. This one-time claim token has been permanently destroyed.</p>
      <pre style="background:#0a0a0f;border:1px solid #222233;padding:16px;border-radius:8px;overflow-x:auto;color:#f5c542;font-weight:700;font-size:0.95rem">${escapeHtml(plaintextKey)}</pre>
      <p style="color:#8a8a9a;font-size:0.8rem;margin-top:16px">Tier: <strong>${escapeHtml(claim.tier)}</strong> · Payment ID: <code>${escapeHtml(claim.paymentId)}</code></p>
    </div>
  </body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}