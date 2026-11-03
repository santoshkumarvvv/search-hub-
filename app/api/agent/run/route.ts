import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import { Job, RunResult, canRun, markRun, validateInstruction } from '@/lib/agent/scheduler';
import { buildPolarityLexicon, scoreDocumentPolarity, detectContradiction } from '@/lib/agent/polarity';
import { buildSketch, detectDrift, Sketch } from '@/lib/agent/drift';
import { detectAllAnomalies, RunRecord } from '@/lib/agent/anomaly';
import { apps } from '@/lib/apps';
import { agentStore } from '@/lib/agent/store';

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const header = req.headers.get('x-cron-secret') || '';
  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const engine = new BM25Engine<IndexDocument>(1.2, 0.75);
  engine.addDocuments(apps.map((a) => ({
    id: a.id,
    title: a.name,
    category: a.category,
    content: `${a.description} ${a.tags.join(' ')}`,
    metadata: { link: a.link, rating: a.rating },
  })));

  const now = Date.now();
  // IST = UTC+5:30 for Indian users
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = now + istOffsetMs;
  const results: RunResult[] = [];

  const jobs = await agentStore.getAllJobs();

  for (const job of jobs) {
    const gate = canRun(job, now);
    if (gate.patch) {
      await agentStore.setJob({ ...job, ...gate.patch });
    }
    if (!gate.allowed) {
      results.push({ jobId: job.id, ranAt: now, status: 'skipped', topResults: [], delta: null, anomalies: [], thresholdMet: false, error: gate.reason || null });
      continue;
    }

    try {
      const searchResults = engine.search(job.instruction, 3);
      const topResults = searchResults.map((r) => ({
        title: r.document.title,
        link: String(r.document.metadata?.link || ''),
        score: r.score,
        changed: false,
      }));

      const corpusTexts = searchResults.map((r) => `${r.document.title} ${r.document.content}`);
      const lexicon = buildPolarityLexicon(corpusTexts);
      const currentSketch = buildSketch(corpusTexts, now);
      const prevSketch = await agentStore.getSnapshot(job.id);
      const drift = detectDrift(currentSketch, prevSketch);

      // Cross-corpus contradiction check across top results
      const contradictions: Array<string> = [];
      for (let i = 0; i < corpusTexts.length; i++) {
        for (let j = i + 1; j < corpusTexts.length; j++) {
          const c = detectContradiction(corpusTexts[i], corpusTexts[j], lexicon);
          if (c.isContradiction) {
            contradictions.push(`docs ${i}-${j}: polarity ${c.scoreA.toFixed(2)} vs ${c.scoreB.toFixed(2)}, cosine ${c.cosine.toFixed(2)}`)
          }
        }
      }

      const history = await agentStore.getHistory(job.id);
      // Value anomaly: use top score as the numeric signal when no explicit value field exists
      const currentRecord: RunRecord = {
        ranAt: now,
        hourOfDay: new Date(istNow).getUTCHours(),
        resultCount: topResults.length,
        topScore: topResults[0]?.score || 0,
        valueField: topResults[0]?.score || null,
      };
      const anomalies = detectAllAnomalies(history, currentRecord);
      if (contradictions.length > 0) {
        anomalies.push({ type: 'value', severity: 'high', reason: `Cross-corpus contradiction: ${contradictions.join('; ')}` });
      }
      history.push(currentRecord);
      if (history.length > 50) history.shift();
      await agentStore.setHistory(job.id, history);

      let thresholdMet = false;
      if (job.threshold) {
        const t = job.threshold.toLowerCase();
        if (t.startsWith('score >')) {
          const v = parseFloat(t.split('>')[1]);
          thresholdMet = topResults.some((r) => r.score > v);
        } else if (t.includes('contains')) {
          const word = t.split('contains')[1].trim().replace(/['"]/g, '');
          thresholdMet = topResults.some((r) => r.title.toLowerCase().includes(word));
        }
      }

      let delta: RunResult['delta'] = null;
      if (prevSketch) {
        // Expand delta: compare full sketch doc lists, not just top-3 titles
        const prevTitles = new Set((prevSketch.d || []).map(String));
        const currTitles = new Set(topResults.map((r) => r.title));
        let newItems = 0;
        let removedItems = 0;
        for (const t of currTitles) if (!prevTitles.has(t)) newItems++;
        for (const t of prevTitles) if (!currTitles.has(t)) removedItems++;
        // Also flag score drift as changedFields when divergence crosses threshold
        delta = { newItems, removedItems, changedFields: drift.divergence > 0.05 ? 1 : 0 };
        for (const r of topResults) {
          if (!prevTitles.has(r.title)) r.changed = true;
        }
      }

      await agentStore.setSnapshot(job.id, currentSketch);

      // Email delivery: wire to Resend when RESEND_API_KEY is set
      const emailDraft = job.deliveryChannel === 'email' && (drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet)
        ? {
            to: process.env.AGENT_EMAIL_TO || 'TODO_USER_EMAIL',
            subject: `[SearchHub Agent] ${job.instruction.slice(0, 40)}`,
            body: `New: ${delta?.newItems || 0}, Removed: ${delta?.removedItems || 0}, Anomalies: ${anomalies.length}, Threshold: ${thresholdMet ? 'MET' : 'no'}`,
          }
        : null;

      const updatedJob = markRun(job, now,
        drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet
          ? 'ok' : 'skipped',
        drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet
          ? null : 'no material change'
      );
      await agentStore.setJob(updatedJob);

      results.push({ jobId: job.id, ranAt: now, status: 'ok', topResults, delta, anomalies, thresholdMet, error: null });
      if (emailDraft) {
        (results[results.length - 1] as RunResult & { emailDraft?: unknown }).emailDraft = emailDraft;
      }
    } catch (e) {
      const failedJob = markRun(job, now, 'failed', String(e));
      await agentStore.setJob(failedJob);
      results.push({ jobId: job.id, ranAt: now, status: 'failed', topResults: [], delta: null, anomalies: [], thresholdMet: false, error: String(e) });
    }
  }

  return NextResponse.json({ ranAt: now, results });
}
