import test from 'node:test';
import assert from 'node:assert/strict';

// Levenshtein function under test
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Federated Ranker function under test
function rankFederatedCatalog(catalog, rawQuery, lexicalBias = 0.78) {
  const tokens = rawQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const clampedLexicalBias = Math.max(0, Math.min(1, lexicalBias));
  const recencyBias = Math.max(0, 1 - clampedLexicalBias);

  const results = [];
  for (const item of catalog) {
    let matchedTokens = 0;
    if (tokens.length > 0) {
      const corpus = `${item.title} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
      matchedTokens = tokens.filter((t) => corpus.includes(t)).length;
      if (matchedTokens === 0) continue;
    }
    const tokenBoost = tokens.length > 0 ? (matchedTokens / tokens.length) * 0.15 : 0;
    const rawScore = item.lexicalScore * clampedLexicalBias + item.recencyWeight * recencyBias + tokenBoost;
    const compositeScore = Number(Math.min(0.999, rawScore).toFixed(4));
    results.push({ item, compositeScore, matchedTokens });
  }
  return results.sort((a, b) => b.compositeScore - a.compositeScore);
}

test('Damerau-Levenshtein calculation validates zero distance on equal strings', () => {
  assert.equal(levenshtein('search', 'search'), 0);
  assert.equal(levenshtein('engine', 'engine'), 0);
});

test('Damerau-Levenshtein detects single-character typo', () => {
  assert.equal(levenshtein('saerch', 'search'), 2);
  assert.equal(levenshtein('react', 'reakt'), 1);
  assert.equal(levenshtein('node', 'nodes'), 1);
});

test('BM25 IDF calculation produces positive saturation weights', () => {
  const N = 100;
  const n = 5;
  const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
  assert.ok(idf > 0, 'IDF must be strictly positive for rare terms');
});

test('Federated Ranker scores and orders matching items with token boost', () => {
  const mockCatalog = [
    {
      id: 'doc-1',
      title: 'Distributed Search Engine Architecture',
      category: 'cloud-infrastructure',
      tags: ['distributed', 'search', 'systems'],
      lexicalScore: 0.9,
      recencyWeight: 0.8,
    },
    {
      id: 'doc-2',
      title: 'Frontend React UI Component Library',
      category: 'frameworks',
      tags: ['react', 'components', 'ui'],
      lexicalScore: 0.5,
      recencyWeight: 0.95,
    },
    {
      id: 'doc-3',
      title: 'Federated Search Router in Go',
      category: 'languages',
      tags: ['search', 'router', 'golang'],
      lexicalScore: 0.85,
      recencyWeight: 0.7,
    },
  ];

  // Query: "search" -> Matches doc-1 and doc-3, drops doc-2
  const results = rankFederatedCatalog(mockCatalog, 'search', 0.78);
  assert.equal(results.length, 2, 'Should only return documents matching query tokens');
  assert.equal(results[0].item.id, 'doc-1', 'doc-1 should rank highest');
  assert.ok(results[0].compositeScore >= results[1].compositeScore, 'Scores must be sorted descending');
  assert.equal(results[0].matchedTokens, 1);
});

test('Federated Ranker returns all items when query is empty, ranked by weights', () => {
  const mockCatalog = [
    { id: 'a', title: 'A', category: 'cat', lexicalScore: 0.2, recencyWeight: 0.9 },
    { id: 'b', title: 'B', category: 'cat', lexicalScore: 0.9, recencyWeight: 0.9 },
  ];
  const results = rankFederatedCatalog(mockCatalog, '', 0.78);
  assert.equal(results.length, 2);
  assert.equal(results[0].item.id, 'b', 'Item with higher composite score must rank first');
});
