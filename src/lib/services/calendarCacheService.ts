/**
 * Service de cache pour le calendrier
 * ====================================
 * 
 * Améliore les performances en cachant les calculs coûteux :
 * - Statistiques
 * - Détection de conflits
 * - Événements filtrés
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class CalendarCacheService {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) { // 1 minute par défaut
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Vérifier si expiré
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  /**
   * Récupère ou calcule une valeur
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalide une clé
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalide toutes les clés correspondant à un pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instance singleton
export const calendarCache = new CalendarCacheService(60000);

// Nettoyage automatique toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    calendarCache.cleanup();
  }, 5 * 60 * 1000);
}

// ============================================
// Helpers pour clés de cache standardisées
// ============================================

export const CacheKeys = {
  stats: (bureau?: string, month?: number, year?: number) => {
    const parts = ['stats'];
    if (bureau) parts.push(`bureau:${bureau}`);
    if (month !== undefined && year !== undefined) parts.push(`${year}-${month}`);
    return parts.join(':');
  },

  events: (queue: string, filters?: Record<string, any>) => {
    const parts = ['events', `queue:${queue}`];
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) parts.push(`${key}:${value}`);
      });
    }
    return parts.join(':');
  },

  event: (id: string) => `event:${id}`,

  conflicts: (bureau?: string, startDate?: string, endDate?: string) => {
    const parts = ['conflicts'];
    if (bureau) parts.push(`bureau:${bureau}`);
    if (startDate && endDate) parts.push(`${startDate}:${endDate}`);
    return parts.join(':');
  },
};

// ============================================
// Hook pour invalider le cache après mutations
// ============================================

export const invalidateCalendarCache = {
  /**
   * Après création d'un événement
   */
  onCreate: () => {
    calendarCache.invalidatePattern(/^stats:/);
    calendarCache.invalidatePattern(/^events:/);
    calendarCache.invalidatePattern(/^conflicts:/);
  },

  /**
   * Après mise à jour d'un événement
   */
  onUpdate: (eventId: string) => {
    calendarCache.invalidate(CacheKeys.event(eventId));
    calendarCache.invalidatePattern(/^stats:/);
    calendarCache.invalidatePattern(/^events:/);
    calendarCache.invalidatePattern(/^conflicts:/);
  },

  /**
   * Après suppression d'un événement
   */
  onDelete: (eventId: string) => {
    calendarCache.invalidate(CacheKeys.event(eventId));
    calendarCache.invalidatePattern(/^stats:/);
    calendarCache.invalidatePattern(/^events:/);
    calendarCache.invalidatePattern(/^conflicts:/);
  },

  /**
   * Invalidation manuelle complète
   */
  all: () => {
    calendarCache.clear();
  },
};

export default calendarCache;

