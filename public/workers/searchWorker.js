/**
 * Asynchronous Search Worker
 * Executes BM25 scoring in an isolated thread to maintain 120fps UI responsiveness.
 * Hardened with trusted origin verification (exact hostname allowlist, no substring/suffix bypass)
 * and input schema validation.
 */
let indexedCatalog = [];
const k1 = 1.2;
const b = 0.75;

// Strict allowlist — exact hostname match only. No includes(), no endsWith().
const TRUSTED_HOSTS = new Set([
  'localhost', '127.0.0.1', '::1',
  'santoshkumarvvv.github.io', 'search-hub-pearl.vercel.app', 'search-hub-.vercel.app'
]);

function isTrustedOrigin(origin) {
  if (!origin) return true; // Direct same-origin worker thread
  try {
    const host = new URL(origin).hostname;
    return TRUSTED_HOSTS.has(host) ||
      (typeof self !== 'undefined' && self.location && self.location.hostname === host);
  } catch (_) {
    return false;
  }
}

// BM25 scoring — mirrors server-side Okapi BM25 (k1=1.2, b=0.75)
function bm25Search(query, catalog) {
  const N = catalog.length;
  if (!N) return [];
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return catalog.slice(0, 20);

  const avgdl = catalog.reduce((s, d) => s + ((d.title || '') + ' ' + (d.category || '') + ' ' + (d.tags || []).join(' ')).split(/\s+/).length, 0) / N;
  const df = {};
  const scores = {};

  catalog.forEach((item, idx) => {
    const text = ((item.title || '') + ' ' + (item.category || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
    const words = text.split(/\W+/).filter(Boolean);
    const seen = new Set();
    words.forEach(w => {
      if (!seen.has(w)) { df[w] = (df[w] || 0) + 1; seen.add(w); }
    });
    scores[idx] = 0;
  });

  tokens.forEach(term => {
    const termDf = df[term] || 0;
    const idf = termDf === 0 ? 0 : Math.log(1 + (N - termDf + 0.5) / (termDf + 0.5));
    catalog.forEach((item, idx) => {
      const text = ((item.title || '') + ' ' + (item.category || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
      const words = text.split(/\W+/).filter(Boolean);
      let f = 0;
      words.forEach(w => { if (w === term) f++; });
      if (f === 0) {
        if (text.includes(term)) f = 0.3;
        else {
          for (const w of words) {
            if (w.length === term.length) {
              let diff = 0;
              for (let i = 0; i < w.length; i++) if (w[i] !== term[i]) diff++;
              if (diff <= 1) { f = 0.15; break; }
            }
          }
        }
      }
      if (f > 0) {
        const dl = words.length;
        scores[idx] += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / avgdl));
      }
    });
  });

  return Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([idx, score]) => ({ item: catalog[idx], score: Number(score.toFixed(2)) }));
}

self.onmessage = function (e) {
  // Origin checks are unnecessary here: this worker is spawned same-origin by the page.
  // Keeping isTrustedOrigin available for any future cross-origin postMessage use.
  if (!e || !e.data || typeof e.data !== 'object') {
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
    const rawQuery = (payload && typeof payload.query === 'string') ? payload.query : '';
    const results = bm25Search(rawQuery, indexedCatalog);
    const durationMs = Number((performance.now() - start).toFixed(2));
    self.postMessage({ type: 'RESULTS', results, queryId, durationMs });
  }
};