import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-api-key') || '';
  const result = await ApiKeyGateway.verifyAndConsume(key);
  if (!result valid || result.record?.tier !== 'enterprise') {
    return NextResponse.json({ error: result.error || 'Ultra tier required' }, { status: result.statusCode || 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';
  const jobId = searchParams.get('jobId') || '';

  const filePath = path.join(process.cwd(), 'data', 'agent-runs.json');
  let data: { jobs?: unknown[]; snapshots?: Record<string, unknown>; runs?: unknown[] } = {};
  try {
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    data = {};
  }

  let payload: unknown = data;
  if (jobId) {
    payload = {
      jobId,
      snapshot: data.snapshots?.[jobId] || null,
      runs: Array.isArray(data.runs) ? data.runs.filter((r: { jobId?: string }) => r.jobId === jobId) : [],
    };
  }

  if (format === 'csv') {
    const rows = Array.isArray(payload) ? payload : [payload];
    const headers = ['jobId', 'ranAt', 'status', 'topTitle', 'topScore', 'newItems', 'removedItems', 'anomalies'];
    const lines = [headers.join(',')];
    for (const row of rows as Array<Record<string, unknown>>) {
      const r = row as Record<string, unknown>;
      const top = Array.isArray(r.topResults) ? (r.topResults as Array<Record<string, unknown>>)[0] : null;
      const delta = r.delta as Record<string, unknown> | null;
      lines.push([
        r.jobId || '',
        r.ranAt || '',
        r.status || '',
        top?.title || '',
        top?.score || '',
        delta?.newItems || 0,
        delta?.removedItems || 0,
        Array.isArray(r.anomalies) ? (r.anomalies as unknown[]).length : 0,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="agent-export.csv"' },
    });
  }

  return NextResponse.json(payload);
}
