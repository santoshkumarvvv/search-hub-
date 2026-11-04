/**
 * Asynchronous Search Worker
 * Executes Okapi BM25 (k1=1.2, b=0.75) with Levenshtein (distance <= 1) typo tolerance
 * in an isolated thread to maintain 120fps UI responsiveness.
 */
let indexedCatalog = [];
const k1 = 1.2;
const b = 0.75;

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 1) return 2;
  const dp = Array.from({ length: n + 1 }, (_, i) => [i]);
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
    }
  }
  return dp[n][m];
}

function docToText(d) {
  return [
    d.title || '',
    d.name || '',
    d.category || '',
    d.developer || '',
    d.description || '',
    d.snippet || '',
    d.content || '',
    Array.isArray(d.genres) ? d.genres.join(' ') : '',
    Array.isArray(d.tags) ? d.tags.join(' ') : '',
  ].join(' ');
}

function bm25Search(query, catalog) {
  const N = catalog.length;
  if (!N) return [];
  const tokens = tokenize(query);
  if (!tokens.length) return catalog.slice(0, 45).map((item) => ({ item, score: 1 }));

  const docWords = catalog.map((item) => tokenize(docToText(item)));
  const avgdl = docWords.reduce((s, w) => s + w.length, 0) / N || 1;
  const df = new Map();
  const scores = new Float64Array(N);

  docWords.forEach((words) => {
    const seen = new Set();
    words.forEach((w) => {
      if (!seen.has(w)) {
        df.set(w, (df.get(w) || 0) + 1);
        seen.add(w);
      }
    });
  });

  const vocab = Array.from(df.keys());

  tokens.forEach((rawTerm) => {
    let term = rawTerm;
    if (!df.has(term) && term.length >= 4) {
      for (let i = 0; i < vocab.length; i++) {
        if (levenshtein(vocab[i], term) <= 1) {
          term = vocab[i];
          break;
        }
      }
    }
    const termDf = df.get(term) || 0;
    if (!termDf) return;
    const idf = Math.log(1 + (N - termDf + 0.5) / (termDf + 0.5));

    docWords.forEach((words, idx) => {
      let f = 0;
      for (let i = 0; i < words.length; i++) {
        if (words[i] === term) f++;
      }
      if (f > 0) {
        const dl = words.length;
        scores[idx] += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl))));
      }
    });
  });

  const ranked = [];
  for (let idx = 0; idx < N; idx++) {
    if (scores[idx] > 0) {
      ranked.push({ item: catalog[idx], score: Number(scores[idx].toFixed(4)) });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, 45);
}

self.onmessage = function (e) {
  if (!e || (e.origin && e.origin !== self.location.origin) || !e.data || typeof e.data !== 'object') {
    return;
  }

  const { type, payload, queryId } = e.data;

  if (type === 'INDEX_CATALOG') {
    if (Array.isArray(payload)) {
      indexedCatalog = payload;
      self.postMessage({ type: 'INDEXED', count: indexedCatalog.length });
    }
  } else if (type === 'SEARCH') {
    const start = performance.now();
    const rawQuery = payload && typeof payload.query === 'string' ? payload.query : '';
    const results = bm25Search(rawQuery, indexedCatalog);
    const durationMs = Number((performance.now() - start).toFixed(2));
    self.postMessage({ type: 'RESULTS', results, queryId, durationMs });
  }
};
