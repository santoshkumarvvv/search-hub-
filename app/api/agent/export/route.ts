import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyGateway } from '@/lib/saas/apiKeyGateway';
import { agentStore } from '@/lib/agent/store';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-api-key') || '';
  const ver = await ApiKeyGateway.verifyAndConsume(key);
  if (!ver?.valid || ver.record?.tier !== 'enterprise') {
    return NextResponse.json({ error: 'Ultra tier required' }, { status: 403 });
  }

  const format = (req.nextUrl.searchParams.get('format') || 'json').toLowerCase();
  const jobId = req.nextUrl.searchParams.get('jobId') || '';

  const allJobs = await agentStore.getAllJobs();
  const userJobs = allJobs.filter((j) => j.userId === ver.record?.id);
  const targetJobs = jobId ? userJobs.filter((j) => j.id === jobId) : userJobs;

  const rows: Array<{
    jobId: string;
    instruction: string;
    ranAt: number;
    hourOfDay: number;
    resultCount: number;
    topScore: number;
  }> = [];

  for (const j of targetJobs) {
    const history = await agentStore.getHistory(j.id);
    for (const h of history) {
      rows.push({
        jobId: j.id,
        instruction: j.instruction,
        ranAt: h.ranAt,
        hourOfDay: h.hourOfDay,
        resultCount: h.resultCount,
        topScore: h.topScore,
      });
    }
  }

  if (format === 'csv') {
    const header = 'jobId,instruction,ranAt,hourOfDay,resultCount,topScore';
    const lines = rows.map(
      (r) =>
        `"${r.jobId}","${r.instruction.replace(/"/g, '""')}",${r.ranAt},${r.hourOfDay},${r.resultCount},${r.topScore}`
    );
    return new NextResponse([header, ...lines].join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="agent-history.csv"',
      },
    });
  }

  return NextResponse.json({ count: rows.length, history: rows });
}
