const SKETCH_VERSION = 1;
const TOP_K = 8;
const RESERVE_BUCKET = 'other';
const EPS = 1e-12;

export interface Sketch {
  v: number;
  t: number;
  d: string[];
  p: Record<string, number>;
}

export interface DriftResult {
  classification: 'INITIAL_BASELINE' | 'STABLE_EQUILIBRIUM' | 'CONCEPTUAL_DRIFT' | 'CONTRADICTION_ALERT' | 'PARADIGM_SHIFT';
  divergence: number;
  previousSketch: Sketch | null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && t.length < 30);
}

export function buildSketch(documents: string[], now: number): Sketch {
  const df = new Map<string, number>();
  const N = documents.length || 1;
  for (const doc of documents) {
    const seen = new Set<string>();
    for (const t of tokenize(doc)) {
      if (seen.has(t)) continue;
      seen.add(t);
      df.set(t, (df.get(t) || 0) + 1);
    }
  }
  const sorted = [...df.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, TOP_K);
  const rest = sorted.slice(TOP_K);
  const p: Record<string, number> = {};
  let topSum = 0;
  for (const [term, count] of top) {
    const prob = count / N;
    p[term] = Math.max(prob, EPS);
    topSum += p[term];
  }
  const other = Math.max(1 - topSum, EPS);
  p[RESERVE_BUCKET] = other;
  const total = Object.values(p).reduce((s, v) => s + v, 0);
  for (const k of Object.keys(p)) p[k] /= total;

  return {
    v: SKETCH_VERSION,
    t: now,
    d: top.map(([term]) => term).slice(0, 3),
    p,
  };
}

function klDivergence(p: Record<string, number>, q: Record<string, number>): number {
  const keys = new Set([...Object.keys(p), ...Object.keys(q)]);
  let sum = 0;
  for (const k of keys) {
    const pv = Math.max(p[k] || 0, EPS);
    const qv = Math.max(q[k] || 0, EPS);
    sum += pv * Math.log2(pv / qv);
  }
  return sum;
}

export function jensenShannonDivergence(p: Record<string, number>, q: Record<string, number>): number {
  const m: Record<string, number> = {};
  const keys = new Set([...Object.keys(p), ...Object.keys(q)]);
  for (const k of keys) {
    m[k] = ((p[k] || 0) + (q[k] || 0)) / 2;
  }
  const klPM = klDivergence(p, m);
  const klQM = klDivergence(q, m);
  return Math.sqrt((klPM + klQM) / 2);
}

export function detectDrift(current: Sketch, previous: Sketch | null): DriftResult {
  if (!previous) {
    return { classification: 'INITIAL_BASELINE', divergence: 0, previousSketch: null };
  }
  const div = jensenShannonDivergence(current.p, previous.p);
  let classification: DriftResult['classification'];
  if (div < 0.05) classification = 'STABLE_EQUILIBRIUM';
  else if (div < 0.15) classification = 'CONCEPTUAL_DRIFT';
  else if (div < 0.35) classification = 'CONTRADICTION_ALERT';
  else classification = 'PARADIGM_SHIFT';
  return { classification, divergence: div, previousSketch: previous };
}

export function sketchToBytes(sketch: Sketch): number {
  return Buffer.byteLength(JSON.stringify(sketch), 'utf8');}
}