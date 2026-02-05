/**
 * Array Utilities
 * Helpers pour manipuler les tableaux
 */

/**
 * Groupe un tableau par une clé
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(keyFn(item));
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Trie un tableau par une clé
 */
export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => number | string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Déduplique un tableau
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Déduplique par une clé
 */
export function uniqueBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Partitionne un tableau selon une condition
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  
  return [truthy, falsy];
}

/**
 * Chunk un tableau en groupes de taille donnée
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten un tableau à plusieurs niveaux
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * Obtient les N premiers éléments
 */
export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

/**
 * Obtient les N derniers éléments
 */
export function takeLast<T>(array: T[], n: number): T[] {
  return array.slice(-n);
}

/**
 * Omet les N premiers éléments
 */
export function skip<T>(array: T[], n: number): T[] {
  return array.slice(n);
}

/**
 * Omet les N derniers éléments
 */
export function skipLast<T>(array: T[], n: number): T[] {
  return array.slice(0, -n);
}

/**
 * Shuffle un tableau (aléatoire)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Obtient un élément aléatoire
 */
export function random<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Obtient plusieurs éléments aléatoires
 */
export function randomSample<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return take(shuffled, count);
}

