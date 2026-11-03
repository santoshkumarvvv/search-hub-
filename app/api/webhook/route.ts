import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = req.headers.get('x-razorpay-signature') || '';
  const body = await req.text();

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { notes?: { plan?: string }; email?: string } } } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event === 'payment.captured') {
    const plan = event.payload?.payment?.entity?.notes?.plan || 'unknown';
    const email = event.payload?.payment?.entity?.email || '';
    // TODO: persist subscription state to KV when KV_REST_API_URL is set
    console.log(`Razorpay payment captured: plan=${plan} email=${email}`);
  }

  return NextResponse.json({ received: true });
}
