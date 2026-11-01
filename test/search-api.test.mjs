import test from 'node:test';
import assert from 'node:assert/strict';

// Pure JS test for BM25 search scoring logic
class TestBM25Engine {
  constructor(k1 = 1.2, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.documents = new Map();
    this.docLengths = new Map();
    this.invertedIndex = new Map();
    this.avgDocLength = 0;
    this.totalLength = 0;
  }

  static tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  }

  addDocuments(docs) {
    for (const doc of docs) {
      this.documents.set(doc.id, doc);
      const tokens = TestBM25Engine.tokenize(`${doc.title} ${doc.category} ${doc.content}`);
      const len = tokens.length;
      this.docLengths.set(doc.id, len);
      this.totalLength += len;
      for (const t of tokens) {
        let m = this.invertedIndex.get(t);
        if (!m) { m = new Map(); this.invertedIndex.set(t, m); }
        m.set(doc.id, (m.get(doc.id) || 0) + 1);
      }
    }
    this.avgDocLength = this.documents.size > 0 ? this.totalLength / this.documents.size : 0;
  }

  search(query, max = 10) {
    const tokens = TestBM25Engine.tokenize(query);
    const scores = new Map();
    for (const t of tokens) {
      const docs = this.invertedIndex.get(t);
      if (!docs) continue;
      const idf = Math.log(1 + (this.documents.size - docs.size + 0.5) / (docs.size + 0.5));
      for (const [id, f] of docs.entries()) {
        const len = this.docLengths.get(id) || this.avgDocLength;
        const norm = 1 - this.b + this.b * (len / (this.avgDocLength || 1));
        const s = idf * (f * (this.k1 + 1)) / (f + this.k1 * norm);
        scores.set(id, (scores.get(id) || 0) + s);
      }
    }
    return Array.from(scores.entries()).sort((a,b) => b[1] - a[1]).slice(0, max);
  }
}

test('BM25 Documentation ranking correctly matches queries', () => {
  const engine = new TestBM25Engine(1.2, 0.75);
  engine.addDocuments([
    { id: '1', title: 'SearchHub Federated Engine', category: 'Search', content: 'Okapi BM25 ranking algorithm in memory.' },
    { id: '2', title: 'Flutter Clean Architecture', category: 'Mobile', content: '120fps Dart state management with Riverpod.' }
  ]);

  const res = engine.search('bm25 algorithm');
  assert.ok(res.length > 0);
  assert.equal(res[0][0], '1');
});
