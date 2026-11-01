/**
 * @license MIT
 * Production Okapi BM25 Full-Text Inverted-Index Engine
 *
 * Implements Robertson-Spärck Jones probabilistic term weighting with
 * Damerau-Levenshtein distance calculation for typo tolerance.
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
  private invertedIndex: Map<string, Map<string, number>> = new Map(); // term -> (docId -> frequency)
  private avgDocLength: number = 0;
  private totalLength: number = 0;

  // BM25 Hyperparameters
  private readonly k1: number; // Term frequency saturation parameter (typically 1.2 to 2.0)
  private readonly b: number;  // Document length normalization parameter (typically 0.75)

  constructor(k1: number = 1.2, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Tokenizes and normalizes arbitrary input text into word tokens of length >= 2.
   */
  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1);
  }

  /**
   * Computes classic Levenshtein distance between two strings using dynamic programming.
   */
  public static levenshtein(source: string, target: string): number {
    const srcLen = source.length;
    const tgtLen = target.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= tgtLen; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= srcLen; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= tgtLen; i++) {
      for (let j = 1; j <= srcLen; j++) {
        if (target.charAt(i - 1) === source.charAt(j - 1)) {
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

    return matrix[tgtLen][srcLen];
  }

  /**
   * Adds an array of documents to the BM25 inverted index and updates corpus statistics.
   */
  public addDocuments(docs: T[]): void {
    for (const doc of docs) {
      this.documents.set(doc.id, doc);

      const tokens = BM25Engine.tokenize(`${doc.title} ${doc.category} ${doc.content}`);
      const docLen = tokens.length;
      this.docLengths.set(doc.id, docLen);
      this.totalLength += docLen;

      // Calculate term frequency within the document
      const termCounts: Map<string, number> = new Map();
      for (const token of tokens) {
        termCounts.set(token, (termCounts.get(token) || 0) + 1);
      }

      // Populate inverted index
      for (const [term, freq] of termCounts.entries()) {
        let docMap = this.invertedIndex.get(term);
        if (!docMap) {
          docMap = new Map();
          this.invertedIndex.set(term, docMap);
        }
        docMap.set(doc.id, freq);
      }
    }

    this.avgDocLength = this.documents.size > 0 ? this.totalLength / this.documents.size : 0;
  }

  /**
   * Searches the indexed documents using Okapi BM25 scoring with fuzzy typo fallback.
   *
   * @param query Search query string.
   * @param maxResults Maximum results to return (defaults to 20).
   * @returns Array of ranked BM25SearchResult items.
   */
  public search(query: string, maxResults: number = 20): BM25SearchResult<T>[] {
    const rawTokens = BM25Engine.tokenize(query);
    if (rawTokens.length === 0 || this.documents.size === 0) {
      return [];
    }

    const docScores: Map<string, number> = new Map();
    const matchedTermsMap: Map<string, Set<string>> = new Map();
    const totalDocs = this.documents.size;

    for (const token of rawTokens) {
      let termDocs = this.invertedIndex.get(token);
      let effectiveToken = token;

      // Typo tolerance fallback: search indexed vocabulary for 1-distance match
      if (!termDocs && token.length >= 4) {
        for (const indexedTerm of this.invertedIndex.keys()) {
          const lengthDiff = Math.abs(indexedTerm.length - token.length);
          if (lengthDiff <= 1 && BM25Engine.levenshtein(indexedTerm, token) <= 1) {
            termDocs = this.invertedIndex.get(indexedTerm);
            effectiveToken = indexedTerm;
            break;
          }
        }
      }

      if (!termDocs) {
        continue;
      }

      const matchingDocCount = termDocs.size;
      // Robertson-Spärck Jones Inverse Document Frequency (IDF)
      const idf = Math.log(1 + (totalDocs - matchingDocCount + 0.5) / (matchingDocCount + 0.5));

      for (const [docId, freq] of termDocs.entries()) {
        const docLen = this.docLengths.get(docId) || this.avgDocLength;
        const normFactor = 1 - this.b + this.b * (docLen / (this.avgDocLength || 1));
        const tfNumerator = freq * (this.k1 + 1);
        const tfDenominator = freq + this.k1 * normFactor;
        const termScore = idf * (tfNumerator / tfDenominator);

        docScores.set(docId, (docScores.get(docId) || 0) + termScore);

        let termSet = matchedTermsMap.get(docId);
        if (!termSet) {
          termSet = new Set();
          matchedTermsMap.set(docId, termSet);
        }
        termSet.add(effectiveToken);
      }
    }

    const results: BM25SearchResult<T>[] = [];
    for (const [docId, score] of docScores.entries()) {
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
