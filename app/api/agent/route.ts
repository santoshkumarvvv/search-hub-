import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';
import { Job, validateInstruction, canRun, markRun, DeliveryChannel } from '@/lib/agent/scheduler';
import crypto from 'crypto';

const jobs = new Map<string, Job>();

async function requireUltra(req: NextRequest): Promise<NextResponse | null> {
  const key = req.headers.get('x-api-key') || '';
  const result = await ApiKeyGateway.verifyAndConsume(key);
  if (!result valid || result.record?.tier !== 'enterprise') {
    return NextResponse.json(
      { error: result.error || 'Ultra tier required', help: result.help },
      { status: result.statusCode || 403 }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requireUltra(req);
  if (denied) return denied;

  let body: { instruction?: string; cron?: string; deliveryChannel?: DeliveryChannel; threshold?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const instruction = (body.instruction || '').trim();
  const check = validateInstruction(instruction);
  if (!check valid) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const key = req.headers.get('x-api-key') || '';
  const ver = await ApiKeyGateway.verifyAndConsume(key);
  const userId = ver.record?.id || 'unknown';

  const job: Job = {
    id: `job_${crypto.randomBytes(8).toString('hex')}`,
    userId,
    instruction,
    cron: body.cron || '*/15 * * * *',
    nextRunAt: Date.now(),
    lastRunAt: null,
    lastStatus: 'ok',
    lastError: null,
    deliveryChannel: body.deliveryChannel === 'email' ? 'email' : 'in-app',
    tier: 'ultra',
    threshold: body.threshold || null,
    runCountToday: 0,
    runCountWeek: 0,
    dayKey: '',
    weekKey: '',
  };

  jobs.set(job.id, job);
  return NextResponse.json({ job }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const denied = await requireUltra(req);
  if (denied) return denied;

  const key = req.headers.get('x-api-key') || '';
  const ver = await ApiKeyGateway.verifyAndConsume(key);
  const userId = ver.record?.id || 'unknown';

  const userJobs = Array.from(jobs.values()).filter((j) => j.userId === userId);
  return NextResponse.json({ jobs: userJobs });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireUltra(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id') || '';
  if (!jobId || !jobs.has(jobId)) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  jobs.delete(jobId);
  return NextResponse.json({ deleted: jobId });
}
