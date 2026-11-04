import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway, ApiKeyRecord } from '@/lib/saas/apiKeyGateway';
import { Job, validateInstruction, DeliveryChannel } from '@/lib/agent/scheduler';
import { agentStore } from '@/lib/agent/store';
import crypto from 'crypto';

async function authenticateUltra(
  req: NextRequest
): Promise<{ denied: NextResponse | null; record: ApiKeyRecord | null }> {
  const key = req.headers.get('x-api-key') || '';
  const result = await ApiKeyGateway.verifyAndConsume(key);
  if (!result?.valid || result.record?.tier !== 'enterprise') {
    return {
      denied: NextResponse.json(
        { error: result.error || 'Ultra tier required', help: result.help },
        { status: result.statusCode || 403 }
      ),
      record: null,
    };
  }
  return { denied: null, record: result.record };
}

export async function POST(req: NextRequest) {
  const { denied, record } = await authenticateUltra(req);
  if (denied || !record) return denied!;

  let body: {
    instruction?: string;
    cron?: string;
    deliveryChannel?: DeliveryChannel;
    threshold?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const instruction = (body.instruction || '').trim();
  const check = validateInstruction(instruction);
  if (!check?.valid) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const userId = record.id;

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

  await agentStore.setJob(job);
  await agentStore.registerJobId(job.id);
  return NextResponse.json({ job }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { denied, record } = await authenticateUltra(req);
  if (denied || !record) return denied!;

  const allJobs = await agentStore.getAllJobs();
  const userJobs = allJobs.filter((j) => j.userId === record.id);
  return NextResponse.json({ jobs: userJobs });
}

export async function DELETE(req: NextRequest) {
  const { denied, record } = await authenticateUltra(req);
  if (denied || !record) return denied!;

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id') || '';
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }
  const existing = await agentStore.getJob(jobId);
  if (!existing || existing.userId !== record.id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  await agentStore.deleteJob(jobId);
  return NextResponse.json({ deleted: jobId });
}
