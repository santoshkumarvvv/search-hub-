const NEGATIVE_SEEDS = ['warning', 'deprecated', 'vulnerable', 'cve', 'mitigation', 'flaw', 'exploit', 'breach', 'incident', 'failure', 'risk', 'attack', 'threat', 'regression', 'broken', 'critical', 'severity', 'downtime', 'leak', 'exposure'];

const POSITIVE_SEEDS = ['guarantee', 'throughput', 'optimized', 'production-ready', 'stable', 'reliable', 'performant', 'secure', 'fixed', 'resolved', 'improved', 'robust', 'efficient', 'scalable', 'fast', 'safe', 'compliant', 'verified', 'certified', 'hardened'];

// Hindi/Devanagari seeds for Indian corpora
const NEGATIVE_SEEDS_HI = ['चेतावनी', 'कमजोरी', 'जोखिम', 'त्रुटि', 'विफलता', 'हमला', 'खतरा', 'टूटा', 'गंभीर', 'रिसाव', 'एक्सपोजर', 'दोष', 'कमजोर', 'अस्थिर'];
const POSITIVE_SEEDS_HI = ['सुधार', 'सुरक्षित', 'तेज़', 'स्थिर', 'विश्वसनीय', 'ऑप्टिमाइज़्ड', 'प्रोडक्शन', 'हल', 'बेहतर', 'मज़बूत', 'प्रभावशाली', 'सत्यापित'];

const ALL_SEEDS = new Set([
  ...NEGATIVE_SEEDS,
  ...POSITIVE_SEEDS,
  ...NEGATIVE_SEEDS_HI,
  ...POSITIVE_SEEDS_HI,
]);

function topicTokens(text: string): string[] {
  return tokenize(text).filter((t) => !ALL_SEEDS.has(t));
}

const MIN_COOCCURRENCE = 5;
const PMI_FLOOR = 0;

export interface PolarityLexicon {
  scores: Map<string, number>;
  builtAt: number;
  docCount: number;
}

function tokenize(text: string): string[] {
  // Latin tokens
  const latin = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && t.length < 30);
  // Devanagari tokens (Hindi) — keep contiguous Devanagari runs
  const devanagari = text.match(/[\u0900-\u097F]+/g) || [];
  const hi = devanagari.filter((t) => t.length > 1 && t.length < 20);
  return [...latin, ...hi];
}

export function buildPolarityLexicon(documents: string[]): PolarityLexicon {
  const df = new Map<string, number>();
  const cooccurNeg = new Map<string, number>();
  const cooccurPos = new Map<string, number>();
  const N = documents.length || 1;

  for (const doc of documents) {
    const tokens = new Set(tokenize(doc));
    for (const t of tokens) df.set(t, (df.get(t) || 0) + 1);
  }

  const negSeeds = [...NEGATIVE_SEEDS, ...NEGATIVE_SEEDS_HI];
  const posSeeds = [...POSITIVE_SEEDS, ...POSITIVE_SEEDS_HI];

  for (const doc of documents) {
    const tokens = tokenize(doc);
    const hasNeg = tokens.some((t) => negSeeds.includes(t));
    const hasPos = tokens.some((t) => posSeeds.includes(t));
    const seen = new Set<string>();
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      if (hasNeg) cooccurNeg.set(t, (cooccurNeg.get(t) || 0) + 1);
      if (hasPos) cooccurPos.set(t, (cooccurPos.get(t) || 0) + 1);
    }
  }

  const scores = new Map<string, number>();
  const allTerms = new Set([...cooccurNeg.keys(), ...cooccurPos.keys(), ...negSeeds, ...posSeeds]);

  for (const term of allTerms) {
    const dft = df.get(term) || 0;
    if (dft === 0) continue;
    const pTerm = dft / N;

    const negCount = cooccurNeg.get(term) || 0;
    if (negCount >= MIN_COOCCURRENCE) {
      const pJoint = negCount / N;
      const pSeed = negSeeds.filter((s) => (df.get(s) || 0) > 0).length / N;
      const pmi = Math.log2(pJoint / (pTerm * Math.max(pSeed, 1e-12)));
      if (pmi > PMI_FLOOR) scores.set(term, (scores.get(term) || 0) + pmi);
    }

    const posCount = cooccurPos.get(term) || 0;
    if (posCount >= MIN_COOCCURRENCE) {
      const pJoint = posCount / N;
      const pSeed = posSeeds.filter((s) => (df.get(s) || 0) > 0).length / N;
      const pmi = Math.log2(pJoint / (pTerm * Math.max(pSeed, 1e-12)));
      if (pmi > PMI_FLOOR) scores.set(term, (scores.get(term) || 0) - pmi);
    }
  }

  for (const s of negSeeds) scores.set(s, (scores.get(s) || 0) + 2);
  for (const s of posSeeds) scores.set(s, (scores.get(s) || 0) - 2);

  return { scores, builtAt: Date.now(), docCount: N };
}

export function scoreDocumentPolarity(doc: string, lexicon: PolarityLexicon): number {
  const tokens = tokenize(doc);
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  let score = 0;
  for (const [term, count] of freq) {
    const w = lexicon.scores.get(term) || 0;
    score += count * w;
  }
  return score;
}

export function detectContradiction(
  docA: string,
  docB: string,
  lexicon: PolarityLexicon,
  cosineThreshold = 0.8,
  polarityThreshold = 1.5
): { isContradiction: boolean; scoreA: number; scoreB: number; cosine: number } {
  const tokensA = new Set(topicTokens(docA));
  const tokensB = new Set(topicTokens(docB));
  const union = new Set([...tokensA, ...tokensB]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const t of union) {
    const a = tokensA.has(t) ? 1 : 0;
    const b = tokensB.has(t) ? 1 : 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const cosine = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);

  if (cosine < cosineThreshold) {
    return { isContradiction: false, scoreA: 0, scoreB: 0, cosine };
  }

  const scoreA = scoreDocumentPolarity(docA, lexicon);
  const scoreB = scoreDocumentPolarity(docB, lexicon);
  const diff = Math.abs(scoreA - scoreB);
  const isContradiction = diff >= polarityThreshold && Math.sign(scoreA) !== Math.sign(scoreB) && scoreA !== 0 && scoreB !== 0;

  return { isContradiction, scoreA, scoreB, cosine };
}
