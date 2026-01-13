/**
 * SERVICE DE CACHE REDIS
 * 
 * Cache distribué pour améliorer les performances :
 * - Stats calendrier/gouvernance/délégations
 * - Résultats de queries fréquentes
 * - Sessions utilisateurs
 * - Invalidation intelligente
 * - TTL configurables
 */

// ============================================
// TYPES
// ============================================

export interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export interface CacheOptions {
  ttl?: number; // secondes
  tags?: string[]; // Pour invalidation groupée
}

export type CacheKey =
  | `calendar:stats:${string}`
  | `calendar:events:${string}`
  | `delegation:stats:${string}`
  | `governance:raci:${string}`
  | `user:session:${string}`
  | string;

// ============================================
// SERVICE
// ============================================

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { value: any; expires: number; tags: string[] }> = new Map();
  private config: CacheConfig;

  private constructor(config?: CacheConfig) {
    this.config = {
      keyPrefix: 'bmo:',
      ...config,
    };

    // En production, utiliser vraie connexion Redis
    // this.client = new Redis(config);
    
    // Démarrer nettoyage périodique
    this.startCleanupWorker();
  }

  public static getInstance(config?: CacheConfig): CacheService {
    if (!this.instance) {
      this.instance = new CacheService(config);
    }
    return this.instance;
  }

  /**
   * Obtenir une valeur du cache
   */
  async get<T = any>(key: CacheKey): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      
      // Version Map (dev)
      const cached = this.cache.get(fullKey);
      if (cached && cached.expires > Date.now()) {
        console.log(`[Cache] HIT: ${key}`);
        return cached.value as T;
      }

      console.log(`[Cache] MISS: ${key}`);
      
      // Version Redis (production)
      // const value = await this.client.get(fullKey);
      // return value ? JSON.parse(value) : null;
      
      return null;
    } catch (error) {
      console.error('[Cache] Error getting:', error);
      return null;
    }
  }

  /**
   * Définir une valeur dans le cache
   */
  async set<T = any>(
    key: CacheKey,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const ttl = options?.ttl || 3600; // 1h par défaut
      const expires = Date.now() + ttl * 1000;

      // Version Map (dev)
      this.cache.set(fullKey, {
        value,
        expires,
        tags: options?.tags || [],
      });

      console.log(`[Cache] SET: ${key} (TTL: ${ttl}s)`);

      // Version Redis (production)
      // await this.client.setex(fullKey, ttl, JSON.stringify(value));

      return true;
    } catch (error) {
      console.error('[Cache] Error setting:', error);
      return false;
    }
  }

  /**
   * Supprimer une clé
   */
  async del(key: CacheKey): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      
      // Version Map
      this.cache.delete(fullKey);

      // Version Redis
      // await this.client.del(fullKey);

      console.log(`[Cache] DEL: ${key}`);
      return true;
    } catch (error) {
      console.error('[Cache] Error deleting:', error);
      return false;
    }
  }

  /**
   * Invalider par tag (utile pour invalidation groupée)
   */
  async invalidateByTag(tag: string): Promise<number> {
    try {
      let count = 0;

      // Version Map
      for (const [key, value] of this.cache.entries()) {
        if (value.tags.includes(tag)) {
          this.cache.delete(key);
          count++;
        }
      }

      console.log(`[Cache] Invalidated ${count} keys with tag: ${tag}`);
      
      // Version Redis
      // const keys = await this.client.keys(`${this.config.keyPrefix}*`);
      // ...

      return count;
    } catch (error) {
      console.error('[Cache] Error invalidating by tag:', error);
      return 0;
    }
  }

  /**
   * Invalider par pattern (glob)
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      let count = 0;
      const regex = new RegExp(pattern.replace('*', '.*'));

      // Version Map
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          count++;
        }
      }

      console.log(`[Cache] Invalidated ${count} keys matching: ${pattern}`);
      return count;
    } catch (error) {
      console.error('[Cache] Error invalidating by pattern:', error);
      return 0;
    }
  }

  /**
   * Vider tout le cache
   */
  async flush(): Promise<boolean> {
    try {
      // Version Map
      this.cache.clear();

      // Version Redis
      // await this.client.flushdb();

      console.log('[Cache] Flushed all cache');
      return true;
    } catch (error) {
      console.error('[Cache] Error flushing:', error);
      return false;
    }
  }

  /**
   * Obtenir ou calculer (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: CacheKey,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Sinon, calculer
    const value = await fn();

    // Mettre en cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Obtenir statistiques du cache
   */
  async getStats(): Promise<any> {
    // Version Map
    const keys = Array.from(this.cache.keys());
    const now = Date.now();
    const expired = keys.filter(k => this.cache.get(k)!.expires < now).length;

    return {
      keys: keys.length,
      expired,
      active: keys.length - expired,
      hitRate: 0, // TODO: tracker hits/misses
    };

    // Version Redis
    // const info = await this.client.info('stats');
    // return parseRedisInfo(info);
  }

  /**
   * Construire clé complète avec prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Worker de nettoyage des clés expirées
   */
  private startCleanupWorker(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, value] of this.cache.entries()) {
        if (value.expires < now) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[Cache] Cleaned ${cleaned} expired keys`);
      }
    }, 60000); // Toutes les minutes
  }
}

// ============================================
// HELPERS POUR PATTERNS COURANTS
// ============================================

/**
 * Cache stats calendrier
 */
export async function getCachedCalendarStats(
  bureau?: string
): Promise<any> {
  const cache = CacheService.getInstance();
  const key: CacheKey = `calendar:stats:${bureau || 'all'}`;

  return cache.getOrSet(
    key,
    async () => {
      // TODO: Récupérer vraies stats depuis DB
      return { total: 0, active: 0, expired: 0 };
    },
    { ttl: 300, tags: ['calendar', 'stats'] } // 5 min
  );
}

/**
 * Cache stats délégations
 */
export async function getCachedDelegationStats(): Promise<any> {
  const cache = CacheService.getInstance();
  const key: CacheKey = 'delegation:stats:all';

  return cache.getOrSet(
    key,
    async () => {
      // TODO: Récupérer vraies stats
      return { total: 0, active: 0, revoked: 0 };
    },
    { ttl: 300, tags: ['delegation', 'stats'] }
  );
}

/**
 * Invalider cache après modification calendrier
 */
export async function invalidateCalendarCache(bureau?: string): Promise<void> {
  const cache = CacheService.getInstance();
  
  if (bureau) {
    await cache.del(`calendar:stats:${bureau}`);
    await cache.invalidateByPattern(`calendar:events:${bureau}:*`);
  } else {
    await cache.invalidateByTag('calendar');
  }
  
  console.log('[Cache] Invalidated calendar cache');
}

/**
 * Invalider cache après modification délégation
 */
export async function invalidateDelegationCache(): Promise<void> {
  const cache = CacheService.getInstance();
  await cache.invalidateByTag('delegation');
  console.log('[Cache] Invalidated delegation cache');
}

/**
 * Invalider cache après modification gouvernance
 */
export async function invalidateGovernanceCache(): Promise<void> {
  const cache = CacheService.getInstance();
  await cache.invalidateByTag('governance');
  console.log('[Cache] Invalidated governance cache');
}

// Export singleton
export default CacheService.getInstance();


