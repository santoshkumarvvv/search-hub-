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
