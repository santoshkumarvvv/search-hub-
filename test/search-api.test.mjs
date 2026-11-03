import test from 'node:test';
import assert from 'node:assert/strict';
import { BM25Engine } from '../lib/search/bm25.ts';

test('BM25 Documentation ranking correctly matches queries', () => {
  const engine = new BM25Engine(1.2, 0.75);
  engine.addDocuments([
    { id: '1', title: 'SearchHub Federated Engine', category: 'Search', content: 'Okapi BM25 ranking algorithm in memory.' },
    { id: '2', title: 'Flutter Clean Architecture', category: 'Mobile', content: '120fps Dart state management with Riverpod.' }
  ]);

  const res = engine.search("bm25 algorithm");
  assert.ok(res.length > 0);
  assert.equal(res[0].document.id, "1");
});

test('BM25 returns empty array when no documents match', () => {
  const engine = new BM25Engine();
  engine.addDocuments([
    { id: '1', title: 'React', category: 'UI', content: 'Component library' }
  ]);
  const res = engine.search("python");
  assert.equal(res.length, 0);
});

test('BM25 typo tolerance finds near matches via Levenshtein fallback', () => {
  const engine = new BM25Engine();
  engine.addDocuments([
    { id: '1', title: 'Search Engine', category: 'Search', content: 'Full text search ranking' }
  ]);
  const res = engine.search("saerch engine");
  assert.ok(res.length > 0);
  assert.equal(res[0].document.id, "1");
});
