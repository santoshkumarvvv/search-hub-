/**
 * @license MIT
 * Deterministic Federated Search Ranker
 *
 * Implements a weighted hybrid ranking algorithm combining lexical relevance (default 0.78)
 * and recency decay (default 0.22) with multi-token intersection boosts.
 */

export interface RankableDocument {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  lexicalScore: number;
  recencyWeight: number;
}

export interface RankedHit<T extends RankableDocument> {
  item: T;
  compositeScore: number;
  matchedTokens: number;
}

/**
 * Tokenizes a raw query string into normalized lowercase alphanumeric terms.
 */
function extractQueryTokens(rawQuery: string): string[] {
  return rawQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Builds a normalized searchable text corpus from an item's title, category, and tags.
 */
function buildSearchableCorpus(item: RankableDocument): string {
  const tagsStr = (item.tags || []).join(' ');
  return `${item.title} ${item.category} ${tagsStr}`.toLowerCase();
}

/**
 * Ranks an array of federated catalog documents against a search query.
 *
 * Scored as:
 *   Composite = Math.min(0.999, (lexicalScore * lexicalBias) + (recencyWeight * recencyBias) + tokenBoost)
 *
 * @param catalog Read-only array of items conforming to RankableDocument.
 * @param rawQuery Search query string.
 * @param lexicalBias Weight given to lexical match score (0.0 to 1.0, defaults to 0.78).
 * @returns Sorted array of RankedHit objects in descending compositeScore order.
 */
export function rankFederatedCatalog<T extends RankableDocument>(
  catalog: ReadonlyArray<T>,
  rawQuery: string,
  lexicalBias: number = 0.78
): RankedHit<T>[] {
  const tokens = extractQueryTokens(rawQuery);
  const clampedLexicalBias = Math.max(0, Math.min(1, lexicalBias));
  const recencyBias = Math.max(0, 1 - clampedLexicalBias);

  const rankedResults: RankedHit<T>[] = [];

  for (const item of catalog) {
    let matchedTokens = 0;

    if (tokens.length > 0) {
      const corpus = buildSearchableCorpus(item);
      matchedTokens = tokens.filter((token) => corpus.includes(token)).length;

      // When query is non-empty, prune items that match zero tokens
      if (matchedTokens === 0) {
        continue;
      }
    }

    const tokenBoost = tokens.length > 0 ? (matchedTokens / tokens.length) * 0.15 : 0;
    const rawScore = item.lexicalScore * clampedLexicalBias + item.recencyWeight * recencyBias + tokenBoost;
    const compositeScore = Number(Math.min(0.999, rawScore).toFixed(4));

    rankedResults.push({
      item,
      compositeScore,
      matchedTokens,
    });
  }

  // Sort descending by composite score
  return rankedResults.sort((a, b) => b.compositeScore - a.compositeScore);
}
