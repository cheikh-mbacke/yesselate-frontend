/**
 * Système de cache côté client pour la validation BC
 * Utilise IndexedDB pour le stockage persistant et un cache mémoire pour la rapidité
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live en millisecondes
  persistToIndexedDB?: boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DB_NAME = 'bmo_validation_bc_cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache_entries';

class ValidationBCCache {
  private memoryCache: Map<string, CacheEntry<any>>;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.memoryCache = new Map();
    this.initPromise = this.initDB();
  }

  /**
   * Initialise IndexedDB
   */
  private async initDB(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('[ValidationBCCache] IndexedDB init failed, using memory only');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[ValidationBCCache] IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  /**
   * Génère une clé de cache
   */
  private generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Vérifie si une entrée est expirée
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Récupère une entrée du cache
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. Essayer le cache mémoire d'abord
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      console.log(`[Cache HIT - Memory] ${key}`);
      return memEntry.data as T;
    }

    // 2. Si expiré ou absent, essayer IndexedDB
    if (this.db) {
      await this.initPromise;
      const dbEntry = await this.getFromDB(key);
      if (dbEntry && !this.isExpired(dbEntry)) {
        // Restaurer dans le cache mémoire
        this.memoryCache.set(key, dbEntry);
        console.log(`[Cache HIT - IndexedDB] ${key}`);
        return dbEntry.data as T;
      }
    }

    console.log(`[Cache MISS] ${key}`);
    return null;
  }

  /**
   * Stocke une entrée dans le cache
   */
  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = { ttl: DEFAULT_TTL, persistToIndexedDB: true }
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + config.ttl,
    };

    // 1. Toujours stocker en mémoire
    this.memoryCache.set(key, entry);

    // 2. Optionnellement persister dans IndexedDB
    if (config.persistToIndexedDB && this.db) {
      await this.initPromise;
      await this.saveToDB(key, entry);
    }

    console.log(`[Cache SET] ${key} (TTL: ${config.ttl}ms)`);
  }

  /**
   * Invalide une ou plusieurs entrées
   */
  async invalidate(keyOrPattern: string | RegExp): Promise<void> {
    if (typeof keyOrPattern === 'string') {
      // Invalidation exacte
      this.memoryCache.delete(keyOrPattern);
      if (this.db) {
        await this.initPromise;
        await this.deleteFromDB(keyOrPattern);
      }
      console.log(`[Cache INVALIDATE] ${keyOrPattern}`);
    } else {
      // Invalidation par pattern
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (keyOrPattern.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.memoryCache.delete(key);
        if (this.db) {
          await this.initPromise;
          await this.deleteFromDB(key);
        }
      }
      console.log(`[Cache INVALIDATE Pattern] ${keyOrPattern} (${keysToDelete.length} keys)`);
    }
  }

  /**
   * Vide tout le cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.db) {
      await this.initPromise;
      await this.clearDB();
    }
    console.log('[Cache CLEAR] All caches cleared');
  }

  /**
   * Récupère une entrée depuis IndexedDB
   */
  private getFromDB(key: string): Promise<CacheEntry<any> | null> {
    if (!this.db) return Promise.resolve(null);

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Sauvegarde une entrée dans IndexedDB
   */
  private saveToDB(key: string, entry: CacheEntry<any>): Promise<void> {
    if (!this.db) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprime une entrée d'IndexedDB
   */
  private deleteFromDB(key: string): Promise<void> {
    if (!this.db) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vide IndexedDB
   */
  private clearDB(): Promise<void> {
    if (!this.db) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Helpers pour générer des clés standardisées
   */
  keys = {
    stats: (reason?: string) => this.generateKey('stats', reason ? { reason } : undefined),
    documents: (filters?: Record<string, any>) => this.generateKey('documents', filters),
    document: (id: string) => this.generateKey('document', { id }),
    timeline: (id: string) => this.generateKey('timeline', { id }),
    insights: () => this.generateKey('insights'),
    workflow: (type: string) => this.generateKey('workflow', { type }),
  };
}

// Export d'une instance singleton
export const validationBCCache = new ValidationBCCache();

// Export de la classe pour les tests
export { ValidationBCCache };

/**
 * Hook React pour utiliser le cache avec suspense
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheConfig = { ttl: DEFAULT_TTL }
): Promise<T> {
  return validationBCCache.get<T>(key).then((cached) => {
    if (cached !== null) {
      return cached;
    }
    return fetcher().then((data) => {
      validationBCCache.set(key, data, options);
      return data;
    });
  });
}

