/**
 * Asynchronous Search Worker
 * Executes BM25 scoring in an isolated thread to maintain 120fps UI responsiveness.
 */
let indexedCatalog = [];

self.onmessage = function (e) {
  const { type, payload, queryId } = e.data;

  if (type === 'INDEX_CATALOG') {
    indexedCatalog = payload || [];
    self.postMessage({ type: 'INDEXED', count: indexedCatalog.length });
  } else if (type === 'SEARCH') {
    const start = performance.now();
    const query = (payload.query || '').toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      self.postMessage({ type: 'RESULTS', results: indexedCatalog.slice(0, 20), queryId, durationMs: 0 });
      return;
    }

    const results = indexedCatalog
      .map((item) => {
        const text = `${item.title} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
        let matches = 0;
        for (const token of tokens) {
          if (text.includes(token)) matches++;
        }
        return { item, score: matches / tokens.length };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
      .slice(0, 30);

    const durationMs = Number((performance.now() - start).toFixed(2));
    self.postMessage({ type: 'RESULTS', results, queryId, durationMs });
  }
};
