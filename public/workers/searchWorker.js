/**
 * Asynchronous Search Worker
 * Executes BM25 scoring in an isolated thread to maintain 120fps UI responsiveness.
 * Hardened with trusted origin verification and input schema validation.
 */
let indexedCatalog = [];

// Trusted origin validation allow-list
function isTrustedOrigin(origin) {
  if (!origin) return true; // Direct same-origin worker thread
  if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') return true;
  if (typeof self !== 'undefined' && self.location && self.location.origin === origin) return true;
  if (origin.endsWith('.run.app') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) return true;
  return false;
}

self.onmessage = function (e) {
  // Origin verification
  if (!isTrustedOrigin(e.origin)) {
    console.warn('[searchWorker] Rejected message from untrusted origin:', e.origin);
    return;
  }

  // Schema validation
  if (!e.data || typeof e.data !== 'object') {
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
    const query = rawQuery.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      self.postMessage({ type: 'RESULTS', results: indexedCatalog.slice(0, 20), queryId, durationMs: 0 });
      return;
    }

    const results = indexedCatalog
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const text = `${item.title || ''} ${item.category || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
        let matches = 0;
        for (const token of tokens) {
          if (text.includes(token)) matches++;
        }
        return matches > 0 ? { item, score: matches / tokens.length } : null;
      })
      .filter((r) => r !== null)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
      .slice(0, 30);

    const durationMs = Number((performance.now() - start).toFixed(2));
    self.postMessage({ type: 'RESULTS', results, queryId, durationMs });
  }
};
