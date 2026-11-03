import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import { Job, RunResult, canRun, markRun, validateInstruction } from '@/lib/agent/scheduler';
import { buildPolarityLexicon, scoreDocumentPolarity, detectContradiction } from '@/lib/agent/polarity';
import { buildSketch, detectDrift, Sketch } from '@/lib/agent/drift';
import { detectAllAnomalies, RunRecord } from '@/lib/agent/anomaly';
import { apps } from '@/lib/apps';

// In-memory stores are per-instance on Vercel serverless.
// TODO: migrate to Vercel KV (KV_REST_API_URL / KV_REST_API_TOKEN) for
// durable snapshots and histories across cron invocations.
const jobs = new Map<string, Job>();
const snapshots = new Map<string, Sketch>();
const histories = new Map<string, RunRecord[]>();

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

  for (const job of jobs.values()) {
    const gate = canRun(job, now);
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
      const prevSketch = snapshots.get(job.id) || null;
      const drift = detectDrift(currentSketch, prevSketch);

      // Cross-corpus contradiction check across top results
      const contradictions: Array<string> = [];
      for (let i = 0; i < corpusTexts.length; i++) {
        for (let j = i + 1; j < corpusTexts.length; j++) {
          const c = detectContradiction(corpusTexts[i], corpusTexts[j], lexicon);
          if (c.isContradiction) {
            contradictions.push(`docs ${i}-${j}: polarity ${c.scoreA.toFixed(2)} vs ${c.scoreB.toFixed(2)}, cosine ${c.cosine.toFixed(2)}`);
          }
        }
      }

      const history = histories.get(job.id) || [];
      const currentRecord: RunRecord = {
        ranAt: now,
        hourOfDay: new Date(istNow).getUTCHours(),
        resultCount: topResults.length,
        topScore: topResults[0]?.score || 0,
        valueField: null,
      };
      const anomalies = detectAllAnomalies(history, currentRecord);
      if (contradictions.length > 0) {
        anomalies.push({ type: 'value', severity: 'high', reason: `Cross-corpus contradiction: ${contradictions.join('; ')}` });
      }
      history.push(currentRecord);
      if (history.length > 50) history.shift();
      histories.set(job.id, history);

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
        const prevTitles = new Set((prevSketch.d || []).map(String));
        const currTitles = new Set(topResults.map((r) => r.title));
        let newItems = 0;
        let removedItems = 0;
        for (const t of currTitles) if (!prevTitles.has(t)) newItems++;
        for (const t of prevTitles) if (!currTitles.has(t)) removedItems++;
        delta = { newItems, removedItems, changedFields: drift.divergence > 0.05 ? 1 : 0 };
        for (const r of topResults) {
          if (!prevTitles.has(r.title)) r.changed = true;
        }
      }

      snapshots.set(job.id, currentSketch);

      // Email delivery placeholder: when deliveryChannel is email and a material
      // change or anomaly is detected, the payload includes an emailDraft field.
      // Wire to Resend/SMTP via RESEND_API_KEY env var. TODO.
      const emailDraft = job.deliveryChannel === 'email' && (drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet)
        ? {
            to: 'TODO_USER_EMAIL',
            subject: `[SearchHub Agent] ${job.instruction.slice(0, 40)}`,
            body: `New: ${delta?.newItems || 0}, Removed: ${delta?.removedItems || 0}, Anomalies: ${anomalies.length}, Threshold: ${thresholdMet ? 'MET' : 'no'}`,
          }
        : null;

      if (drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet) {
        markRun(job, now, 'ok', null);
      } else {
        markRun(job, now, 'skipped', 'no material change');
      }

      results.push({ jobId: job.id, ranAt: now, status: 'ok', topResults, delta, anomalies, thresholdMet, error: null });
      if (emailDraft) {
        (results[results.length - 1] as RunResult & { emailDraft?: unknown }).emailDraft = emailDraft;
      }
    } catch (e) {
      markRun(job, now, 'failed', String(e));
      results.push({ jobId: job.id, ranAt: now, status: 'failed', topResults: [], delta: null, anomalies: [], thresholdMet: false, error: String(e) });
    }
  }

  return NextResponse.json({ ranAt: now, results });
}
