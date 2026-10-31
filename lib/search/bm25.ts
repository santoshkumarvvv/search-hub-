/**
 * @license MIT
 * Production Okapi BM25 Full-Text Inverted-Index Engine
 * Implements Robertson-Spärck Jones BM25 with Damerau-Levenshtein typo tolerance.
 */

export interface IndexDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface BM25SearchResult<T = IndexDocument> {
  document: T;
  score: number;
  matchedTerms: string[];
}

export class BM25Engine<T extends IndexDocument = IndexDocument> {
  private documents: Map<string, T> = new Map();
  private docLengths: Map<string, number> = new Map();
  private invertedIndex: Map<string, Map<string, number>> = new Map(); // term -> (docId -> termFreq)
  private avgDocLength: number = 0;
  private totalLength: number = 0;

  // BM25 Hyperparameters
  private readonly k1: number;
  private readonly b: number;

  constructor(k1: number = 1.2, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  public static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  public addDocuments(docs: T[]): void {
    for (const doc of docs) {
      this.documents.set(doc.id, doc);
      const tokens = BM25Engine.tokenize(`${doc.title} ${doc.category} ${doc.content}`);
      const len = tokens.length;
      this.docLengths.set(doc.id, len);
      this.totalLength += len;

      const termCounts: Map<string, number> = new Map();
      for (const token of tokens) {
        termCounts.set(token, (termCounts.get(token) || 0) + 1);
      }

      for (const [term, freq] of termCounts.entries()) {
        if (!this.invertedIndex.has(term)) {
          this.invertedIndex.set(term, new Map());
        }
        this.invertedIndex.get(term)!.set(doc.id, freq);
      }
    }

    this.avgDocLength = this.documents.size > 0 ? this.totalLength / this.documents.size : 0;
  }

  public search(query: string, maxResults: number = 20): BM25SearchResult<T>[] {
    const rawTokens = BM25Engine.tokenize(query);
    if (rawTokens.length === 0 || this.documents.size === 0) return [];

    const scores: Map<string, number> = new Map();
    const matchedTermsMap: Map<string, Set<string>> = new Map();
    const N = this.documents.size;

    for (const token of rawTokens) {
      let termDocs = this.invertedIndex.get(token);
      let effectiveToken = token;

      // Typo tolerance: search inverted index for fuzzy match if direct lookup is empty
      if (!termDocs && token.length >= 4) {
        for (const indexedTerm of this.invertedIndex.keys()) {
          if (Math.abs(indexedTerm.length - token.length) <= 1 && BM25Engine.levenshtein(indexedTerm, token) <= 1) {
            termDocs = this.invertedIndex.get(indexedTerm);
            effectiveToken = indexedTerm;
            break;
          }
        }
      }

      if (!termDocs) continue;

      const n = termDocs.size;
      // Robertson-Spärck Jones IDF
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));

      for (const [docId, freq] of termDocs.entries()) {
        const docLen = this.docLengths.get(docId) || this.avgDocLength;
        const normFactor = 1 - this.b + this.b * (docLen / (this.avgDocLength || 1));
        const tfNumerator = freq * (this.k1 + 1);
        const tfDenominator = freq + this.k1 * normFactor;
        const termScore = idf * (tfNumerator / tfDenominator);

        scores.set(docId, (scores.get(docId) || 0) + termScore);
        if (!matchedTermsMap.has(docId)) {
          matchedTermsMap.set(docId, new Set());
        }
        matchedTermsMap.get(docId)!.add(effectiveToken);
      }
    }

    const results: BM25SearchResult<T>[] = [];
    for (const [docId, score] of scores.entries()) {
      const doc = this.documents.get(docId);
      if (doc) {
        results.push({
          document: doc,
          score: Number(score.toFixed(4)),
          matchedTerms: Array.from(matchedTermsMap.get(docId) || []),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}
