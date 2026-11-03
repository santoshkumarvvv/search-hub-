import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-api-key') || '';
  const result = await ApiKeyGateway.verifyAndConsume(key);
  if (!result?.valid || result.record?.tier !== 'enterprise') {
    return NextResponse.json({ error: result.error || 'Ultra tier required' }, { status: result.statusCode || 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const jobId = searchParams.get('jobId') || '';

  // Export reads from in-memory job state exposed via the agent GET route.
  // For durable history across serverless instances, configure KV_REST_API_URL
  // and KV_REST_API_TOKEN. Without KV, export reflects the current warm instance only.
  // TODO: wire Vercel KV for cross-instance run history.
  const jobsRes = await fetch(new URL('/api/agent', req.url).toString(), {
    headers: { 'x-api-key': key },
  });
  const jobsData = await jobsRes.json().catch(() => ({ jobs: [] }));
  const jobs = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];

  let payload: unknown = jobs;
  if (jobId) {
    payload = jobs.filter((j: { id?: string }) => j.id === jobId);
  }

  if (format === 'csv') {
    const rows = Array.isArray(payload) ? payload : [payload];
    const headers = ['jobId', 'userId', 'instruction', 'cron', 'lastRunAt', 'lastStatus', 'deliveryChannel', 'threshold', 'runCountToday', 'runCountWeek'];
    const lines = [headers.join(',')];
    for (const row of rows as Array<Record<string, unknown>>) {
      lines.push([
        row.jobId || row.id || '',
        row.userId || '',
        row.instruction || '',
        row.cron || '',
        row.lastRunAt || '',
        row.lastStatus || '',
        row.deliveryChannel || '',
        row.threshold || '',
        row.runCountToday || 0,
        row.runCountWeek || 0,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="agent-export.csv"' },
    });
  }

  return NextResponse.json(payload);
}
