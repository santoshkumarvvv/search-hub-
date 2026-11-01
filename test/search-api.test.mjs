import test from 'node:test';
import assert from 'node:assert/strict';
import { BM25Engine } from '../lib/search/bm25.ts';

test('Search route BM25 engine returns correct documentation scores', () => {
  const engine = new BM25Engine(1.2, 0.75);
  engine.addDocuments([
    {
      id: 'doc-search-hub',
      title: 'SearchHub Federated Search Engine',
      category: 'Search Engine',
      content: 'High-velocity multi-source search engine with Okapi BM25 lexical ranking and Damerau-Levenshtein typo tolerance.',
    },
    {
      id: 'doc-dev-showcase',
      title: 'Dev Showcase Flutter Mobile Engine',
      category: 'Mobile Engine',
      content: '120fps native Flutter mobile platform with Domain-Driven Design (DDD), Clean Architecture, and Riverpod state.',
    }
  ]);

  const results = engine.search('bm25 lexical', 10);
  assert.ok(results.length > 0);
  assert.equal(results[0].document.id, 'doc-search-hub');
  assert.ok(results[0].score > 0);
});
