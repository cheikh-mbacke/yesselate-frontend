/**
 * Performance Utilities
 * Helpers pour le monitoring et l'optimisation des performances
 */

/**
 * Mesure le temps d'exécution d'une fonction
 */
export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (label && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Mesure le temps d'exécution d'une fonction async
 */
export async function measurePerformanceAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (label && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Crée un profiler pour mesurer plusieurs opérations
 */
export class PerformanceProfiler {
  private measurements: Map<string, number[]> = new Map();

  /**
   * Démarre une mesure
   */
  start(label: string): () => void {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const duration = end - start;

      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      this.measurements.get(label)!.push(duration);
    };
  }

  /**
   * Obtient les statistiques pour un label
   */
  getStats(label: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, val) => sum + val, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      total,
      average,
      min,
      max,
    };
  }

  /**
   * Obtient toutes les statistiques
   */
  getAllStats(): Record<string, {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  }> {
    const stats: Record<string, any> = {};
    this.measurements.forEach((_, label) => {
      stats[label] = this.getStats(label);
    });
    return stats;
  }

  /**
   * Réinitialise toutes les mesures
   */
  reset(): void {
    this.measurements.clear();
  }

  /**
   * Affiche un rapport dans la console
   */
  report(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    console.group('[Performance Profiler]');
    this.measurements.forEach((_, label) => {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`${label}:`, {
          count: stats.count,
          average: `${stats.average.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
        });
      }
    });
    console.groupEnd();
  }
}

/**
 * Détecte si le navigateur est en mode lent (3G, etc.)
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  if (!connection) return false;

  const effectiveType = connection.effectiveType;
  return effectiveType === 'slow-2g' || effectiveType === '2g';
}

/**
 * Obtient les informations de connexion
 */
export function getConnectionInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} | null {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as any).connection;
  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Vérifie si le device est mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Vérifie si le device est tablette
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|Android/i.test(navigator.userAgent) && !isMobileDevice();
}

/**
 * Détecte si le mode économie d'énergie est activé
 */
export function isLowPowerMode(): boolean {
  if (typeof navigator === 'undefined' || !('hardwareConcurrency' in navigator)) {
    return false;
  }

  // Sur certains navigateurs, hardwareConcurrency peut être réduit en mode économie d'énergie
  return navigator.hardwareConcurrency < 4;
}

/**
 * Mesure la taille d'un objet en mémoire (approximatif)
 */
export function getObjectSize(obj: any): number {
  const visited = new WeakSet();
  let size = 0;

  function calculateSize(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const type = typeof value;

    if (type === 'boolean') {
      return 4;
    } else if (type === 'number') {
      return 8;
    } else if (type === 'string') {
      return value.length * 2;
    } else if (type === 'object') {
      if (visited.has(value)) {
        return 0; // Évite les références circulaires
      }
      visited.add(value);

      if (Array.isArray(value)) {
        size += value.reduce((sum, item) => sum + calculateSize(item), 0);
      } else {
        size += Object.keys(value).reduce(
          (sum, key) => sum + key.length * 2 + calculateSize(value[key]),
          0
        );
      }
    }

    return size;
  }

  return calculateSize(obj);
}

