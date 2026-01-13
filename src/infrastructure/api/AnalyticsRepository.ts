/**
 * AnalyticsRepository
 * Repository Pattern avec cache et retry logic
 */

import type { PeriodData } from '@/domain/analytics/entities/Period';
import { validatePeriodDataArray } from '@/domain/analytics/schemas/PeriodSchema';
import { validateAlertArray } from '@/domain/analytics/schemas/AlertSchema';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch avec retry et exponential backoff
 */
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Repository interface
 */
export interface AnalyticsRepository {
  getKPIs(filters?: Record<string, any>): Promise<any[]>;
  getAlerts(filters?: Record<string, any>): Promise<any[]>;
  getTrends(period: string): Promise<any[]>;
  getPeriodData(
    periodType: 'months' | 'quarters' | 'years',
    category?: string,
    subCategory?: string
  ): Promise<PeriodData[]>;
  createAlert(alert: any): Promise<any>;
  resolveAlert(id: string, resolution: any): Promise<void>;
}

/**
 * Implémentation API du repository avec cache
 */
export class AnalyticsApiRepository implements AnalyticsRepository {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };

  /**
   * Nettoie le cache expiré
   */
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtient une entrée du cache
   */
  private getFromCache<T>(key: string): T | null {
    this.cleanExpiredCache();
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data as T;
    }
    return null;
  }

  /**
   * Met une entrée en cache
   */
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalide le cache pour une clé
   */
  invalidateCache(keyPattern?: string) {
    if (keyPattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Récupère les KPIs
   */
  async getKPIs(filters: Record<string, any> = {}): Promise<any[]> {
    const cacheKey = `kpis-${JSON.stringify(filters)}`;
    
    // Vérifier le cache
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch avec retry
    const data = await fetchWithRetry(
      async () => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/analytics/kpis?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
        }
        const json = await response.json();
        return json.kpis || [];
      },
      this.DEFAULT_RETRY_OPTIONS
    );

    // Mettre en cache
    this.setCache(cacheKey, data);

    return data;
  }

  /**
   * Récupère les alertes
   */
  async getAlerts(filters: Record<string, any> = {}): Promise<any[]> {
    const cacheKey = `alerts-${JSON.stringify(filters)}`;
    
    // Vérifier le cache
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch avec retry
    const data = await fetchWithRetry(
      async () => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/analytics/alerts?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch alerts: ${response.statusText}`);
        }
        const json = await response.json();
        const alerts = json.alerts || [];
        
        // Valider avec Zod
        return validateAlertArray(alerts);
      },
      this.DEFAULT_RETRY_OPTIONS
    );

    // Mettre en cache (TTL plus court pour les alertes)
    this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes

    return data;
  }

  /**
   * Récupère les tendances
   */
  async getTrends(period: string): Promise<any[]> {
    const cacheKey = `trends-${period}`;
    
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await fetchWithRetry(
      async () => {
        const response = await fetch(`/api/analytics/trends?period=${period}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trends: ${response.statusText}`);
        }
        const json = await response.json();
        return json.trends || [];
      },
      this.DEFAULT_RETRY_OPTIONS
    );

    this.setCache(cacheKey, data);

    return data;
  }

  /**
   * Récupère les données de périodes
   */
  async getPeriodData(
    periodType: 'months' | 'quarters' | 'years',
    category?: string,
    subCategory?: string
  ): Promise<PeriodData[]> {
    const cacheKey = `periods-${periodType}-${category}-${subCategory}`;
    
    const cached = this.getFromCache<PeriodData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Pour l'instant, générer les données côté client
    // TODO: Implémenter l'endpoint API si nécessaire
    const data: PeriodData[] = [];
    
    // Valider avec Zod
    return validatePeriodDataArray(data);
  }

  /**
   * Crée une alerte
   */
  async createAlert(alert: any): Promise<any> {
    const data = await fetchWithRetry(
      async () => {
        const response = await fetch('/api/analytics/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
        if (!response.ok) {
          throw new Error(`Failed to create alert: ${response.statusText}`);
        }
        return await response.json();
      },
      this.DEFAULT_RETRY_OPTIONS
    );

    // Invalider le cache des alertes
    this.invalidateCache('alerts-');

    return data;
  }

  /**
   * Résout une alerte
   */
  async resolveAlert(id: string, resolution: any): Promise<void> {
    await fetchWithRetry(
      async () => {
        const response = await fetch(`/api/analytics/alerts/${id}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resolution),
        });
        if (!response.ok) {
          throw new Error(`Failed to resolve alert: ${response.statusText}`);
        }
      },
      this.DEFAULT_RETRY_OPTIONS
    );

    // Invalider le cache des alertes
    this.invalidateCache('alerts-');
  }
}

/**
 * Instance singleton du repository
 */
export const analyticsRepository = new AnalyticsApiRepository();

