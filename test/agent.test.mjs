import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInstruction, canRun, markRun } from '../lib/agent/scheduler.ts';
import { buildPolarityLexicon, scoreDocumentPolarity, detectContradiction } from '../lib/agent/polarity.ts';
import { buildSketch, detectDrift, jensenShannonDivergence } from '../lib/agent/drift.ts';
import { detectTimeAnomaly, detectValueAnomaly, detectFrequencyAnomaly, detectAllAnomalies } from '../lib/agent/anomaly.ts';

test('validateInstruction rejects URLs and shell metacharacters', () => {
  assert.equal(validateInstruction('find jobs https://evil.com').valid, false);
  assert.equal(validateInstruction('rm -rf /').valid, false);
  assert.equal(validateInstruction('search bihar data engineering jobs').valid, true);
});

test('validateInstruction enforces 50 word cap', () => {
  const words = Array(51).fill('job').join(' ');
  assert.equal(validateInstruction(words).valid, false);
  assert.equal(validateInstruction('short query').valid, true);
});

test('canRun enforces daily cap of 3', () => {
  const job = {
    id: 'j1', userId: 'u1', instruction: 'test', cron: '*/15 * * * *', nextRunAt: 0,
    lastRunAt: null, lastStatus: 'ok', lastError: null, deliveryChannel: 'in-app', tier: 'ultra',
    threshold: null, runCountToday: 3, runCountWeek: 3, dayKey: '2026-11-04', weekKey: '2026-11-03'
  };
  const r = canRun(job, Date.now());
  assert.equal(r.allowed, false);
  assert.equal(r.reason, "daily cap reached");
});

test('polarity lexicon assigns negative weight to vulnerability terms', () => {
  const docs = [
    'critical vulnerability CVE-2024-1 exploit found in production pipeline spark jobs data engineering'
  ];
  const lex = buildPolarityLexicon(docs);
  const seed = new Set(['critical', 'vulnerability', 'cve', 'exploit', 'found', 'in', 'production', 'pipeline', 'spark', 'jobs', 'data', 'engineering']);
  const topicScores = [...lex.scores.entries()].filter(([w]) => !seed.has(w));
  assert.ok(topicScores.length > 0);
  assert.ok(topicScores.every(([, s]) => s > 0));
});

test('detectContradiction flags opposing polarity on similar docs', () => {
  const a = 'production pipeline spark jobs data engineering optimized throughput stable reliable performant secure';
  const b = 'production pipeline spark jobs data engineering vulnerable critical failure exploit breach incident risk';
  const lex = buildPolarityLexicon([a, b, a, b, a, b, a, b, a, b]);
  const r = detectContradiction(a, b, lex, 0.5, 1.0);
  assert.equal(r.isContradiction, true);
  assert.ok(Math.sign(r.scoreA) !== Math.sign(r.scoreB));
});

test('jensenShannonDivergence is zero for identical sketches', () => {
  const p = { search: 0.5, bm25: 0.5 };
  assert.equal(jensenShannonDivergence(p, p), 0);
});

test('detectDrift classifies paradigm shift on large divergence', () => {
  const cur = buildSketch(['alpha beta gamma delta epsilon'], 1000);
  const prev = buildSketch(['zeta eta theta iota kappa'], 500);
  const d = detectDrift(cur, prev);
  assert.ok(d.divergence > 0.15);
  assert.ok(['CONCEPTUAL_DRIFT', 'CONTRADICTION_ALERT', 'PARADIGM_SHIFT'].includes(d.classification));
});

test('detectTimeAnomaly flags hour outside two standard deviations', () => {
  const history = [];
  for (let i = 0; i < 10; i++) history.push({ ranAt: i * 3600000, hourOfDay: 8, resultCount: 3, topScore: 1.5, valueField: null });
  const a = detectTimeAnomaly(history, 23);
  assert.ok(a !== null);
  assert.equal(a.type, 'time');
});

test('detectValueAnomaly flags fifteen percent deviation', () => {
  const history = [];
  for (let i = 0; i < 5; i++) history.push({ ranAt: i, hourOfDay: 8, resultCount: 3, topScore: 1.5, valueField: 100 });
  const a = detectValueAnomaly(history, 200, 15);
  assert.ok(a !== null);
  assert.equal(a.type, 'value');
});

test('detectFrequencyAnomaly flags zero results after consistent non-zero', () => {
  const history = [];
  for (let i = 0; i < 6; i++) history.push({ ranAt: i, hourOfDay: 8, resultCount: 3, topScore: 1.5, valueField: null });
  history.push({ ranAt: 7, hourOfDay: 8, resultCount: 0, topScore: 0, valueField: null });
  history.push({ ranAt: 8, hourOfDay: 8, resultCount: 0, topScore: 0, valueField: null });
  const a = detectFrequencyAnomaly(history);
  assert.ok(a !== null);
  assert.equal(a.type, 'frequency');
  assert.equal(a.severity, 'high');
});

test('detectAllAnomalies aggregates all three types', () => {
  const history = [];
  for (let i = 0; i < 8; i++) history.push({ ranAt: i * 3600000, hourOfDay: 8, resultCount: 3, topScore: 1.5, valueField: 100 });
  const current = { ranAt: 9 * 3600000, hourOfDay: 23, resultCount: 0, topScore: 0, valueField: 300 };
  const all = detectAllAnomalies(history, current);
  assert.ok(all.length >= 2);
});
