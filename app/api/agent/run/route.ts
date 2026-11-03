import { NextRequest, NextResponse } from 'next/server';
import { BM25Engine, IndexDocument } from '@/lib/search/bm25';
import { Job, RunResult, canRun, markRun, validateInstruction } from '@/lib/agent/scheduler';
import { buildPolarityLexicon, scoreDocumentPolarity, detectContradiction } from '@/lib/agent/polarity';
import { buildSketch, detectDrift, Sketch } from '@/lib/agent/drift';
import { detectAllAnomalies, RunRecord } from '@/lib/agent/anomaly';
import { apps } from '@/lib/apps';
import fs from 'fs';
import path from 'path';

const jobs = new Map<string, Job>();
const snapshots = new Map<string, Sketch>();
const histories = new Map<string, RunRecord[]>();

function loadJobs() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    const filePath = path.join(process.cwd(), 'data', 'agent-runs.json');
    try {
      if (fs.existsSync(filePath)) {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(raw.jobs)) {
          for (const j of raw.jobs) jobs.set(j.id, j);
        }
      }
    } catch {
      // placeholder store
    }
  }
}

function saveSnapshot(jobId: string, sketch: Sketch) {
  snapshots.set(jobId, sketch);
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    fetch(`${kvUrl}/set/agent:snapshot:${jobId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(sketch),
    }).catch(() => {});
  } else {
    const filePath = path.join(process.cwd(), 'data', 'agent-runs.json');
    try {
      let data: { jobs?: Job[]; snapshots?: Record<string, Sketch> } = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data.snapshots = data.snapshots || {};
      data.snapshots[jobId] = sketch;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch {
      // placeholder
    }
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const header = req.headers.get('x-cron-secret') || '';
  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  loadJobs();

  const engine = new BM25Engine<IndexDocument>(1.2, 0.75);
  engine.addDocuments(apps.map((a) => ({
    id: a.id,
    title: a.name,
    category: a.category,
    content: `${a.description} ${a.tags.join(' ')}`,
    metadata: { link: a.link, rating: a.rating },
  })));

  const now = Date.now();
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

      const history = histories.get(job.id) || [];
      const currentRecord: RunRecord = {
        ranAt: now,
        hourOfDay: new Date(now).getUTCHours(),
        resultCount: topResults.length,
        topScore: topResults[0]?.score || 0,
        valueField: null,
      };
      const anomalies = detectAllAnomalies(history, currentRecord);
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

      if (drift.classification !== 'STABLE_EQUILIBRIUM' || (delta && (delta.newItems > 0 || delta.removedItems > 0)) || anomalies.length > 0 || thresholdMet) {
        markRun(job, now, 'ok', null);
      } else {
        markRun(job, now, 'skipped', 'no material change'');
      }

      saveSnapshot(job.id, currentSketch);
      results.push({ jobId: job.id, ranAt: now, status: 'ok', topResults, delta, anomalies, thresholdMet, error: null });
    } catch (e) {
      markRun(job, now, 'failed', String(e));
      results.push({ jobId: job.id, ranAt: now, status: 'failed', topResults: [], delta: null, anomalies: [], thresholdMet: false, error: String(e) });
    }
  }

  return NextResponse.json({ ranAt: now, results });
}
