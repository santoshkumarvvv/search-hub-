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
 * Deterministic Federated Search Ranker
 * Combines weighted lexical relevance (0.78) with exponential recency decay (0.22).
 */
export function rankFederatedCatalog<T extends RankableDocument>(
  catalog: ReadonlyArray<T>,
  rawQuery: string,
  lexicalBias = 0.78
): RankedHit<T>[] {
  const tokens = rawQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const recencyBias = Math.max(0, 1 - lexicalBias);

  return catalog
    .map((item) => {
      let matchedTokens = 0;
      if (tokens.length > 0) {
        const searchable = `${item.title} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
        matchedTokens = tokens.filter((t) => searchable.includes(t)).length;
        if (matchedTokens === 0) return null;
      }

      const tokenBoost = tokens.length > 0 ? (matchedTokens / tokens.length) * 0.15 : 0;
      const compositeScore = Number(
        Math.min(
          0.999,
          item.lexicalScore * lexicalBias + item.recencyWeight * recencyBias + tokenBoost
        ).toFixed(4)
      );

      return { item, compositeScore, matchedTokens };
    })
    .filter((entry): entry is RankedHit<T> => entry !== null)
    .sort((a, b) => b.compositeScore - a.compositeScore);
}
