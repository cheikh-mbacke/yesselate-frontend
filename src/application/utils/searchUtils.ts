/**
 * Search Utilities
 * Utilitaires pour la recherche intelligente avec scoring
 */

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: Array<{
    key: string;
    value: string;
    matchedText: string;
  }>;
}

/**
 * Calcule la pertinence d'un item pour une requête de recherche
 * Utilise l'algorithme de Levenshtein et le matching partiel
 */
export function calculateRelevance<T extends Record<string, any>>(
  item: T,
  query: string,
  searchKeys: (keyof T)[]
): number {
  if (!query.trim()) return 0;

  const normalizedQuery = query.toLowerCase().trim();
  let totalScore = 0;
  const matches: Array<{ key: string; value: string; matchedText: string }> = [];

  searchKeys.forEach(key => {
    const value = item[key];
    if (value == null) return;

    const stringValue = String(value).toLowerCase();
    
    // Exact match = score maximum
    if (stringValue === normalizedQuery) {
      totalScore += 100;
      matches.push({
        key: String(key),
        value: String(value),
        matchedText: String(value),
      });
      return;
    }

    // Starts with = score élevé
    if (stringValue.startsWith(normalizedQuery)) {
      totalScore += 80;
      matches.push({
        key: String(key),
        value: String(value),
        matchedText: String(value),
      });
      return;
    }

    // Contains = score moyen
    if (stringValue.includes(normalizedQuery)) {
      totalScore += 50;
      matches.push({
        key: String(key),
        value: String(value),
        matchedText: String(value),
      });
      return;
    }

    // Fuzzy match avec mots séparés
    const queryWords = normalizedQuery.split(/\s+/);
    const valueWords = stringValue.split(/\s+/);
    
    let fuzzyScore = 0;
    queryWords.forEach(qWord => {
      valueWords.forEach(vWord => {
        if (vWord.startsWith(qWord)) {
          fuzzyScore += 30;
        } else if (vWord.includes(qWord)) {
          fuzzyScore += 15;
        }
      });
    });

    if (fuzzyScore > 0) {
      totalScore += fuzzyScore;
      matches.push({
        key: String(key),
        value: String(value),
        matchedText: String(value),
      });
    }
  });

  return totalScore;
}

/**
 * Recherche dans une liste d'items avec scoring
 */
export function searchWithScoring<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchKeys: (keyof T)[]
): SearchResult<T>[] {
  if (!query.trim()) {
    return items.map(item => ({
      item,
      score: 0,
      matches: [],
    }));
  }

  const results: SearchResult<T>[] = items
    .map(item => {
      const score = calculateRelevance(item, query, searchKeys);
      const matches: Array<{ key: string; value: string; matchedText: string }> = [];

      if (score > 0) {
        searchKeys.forEach(key => {
          const value = item[key];
          if (value == null) return;

          const stringValue = String(value).toLowerCase();
          const normalizedQuery = query.toLowerCase();

          if (
            stringValue === normalizedQuery ||
            stringValue.startsWith(normalizedQuery) ||
            stringValue.includes(normalizedQuery)
          ) {
            matches.push({
              key: String(key),
              value: String(value),
              matchedText: String(value),
            });
          }
        });
      }

      return {
        item,
        score,
        matches,
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Highlight le texte correspondant dans une chaîne
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-amber-500/30 text-amber-200">$1</mark>');
}

