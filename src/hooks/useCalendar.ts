/**
 * Hook React pour la gestion du calendrier
 * =========================================
 * 
 * Fournit une interface simplifiée pour :
 * - Charger les événements
 * - Créer/Modifier/Supprimer des événements
 * - Détecter les conflits
 * - Gérer le cache
 */

import { useCallback, useEffect, useState } from 'react';
import { calendarCache, CacheKeys, invalidateCalendarCache } from '@/lib/services/calendarCacheService';
import { calendarValidation, type EventData, type EventValidationResult } from '@/lib/services/calendarValidationService';

// ============================================
// Types
// ============================================

interface UseCalendarOptions {
  autoLoad?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

interface CalendarStats {
  total: number;
  today: number;
  thisWeek: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  byKind?: Record<string, number>;
  byBureau?: Record<string, number>;
  ts: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
  bureau?: string;
  attendees?: any[];
  hasConflict?: boolean;
  isOverdue?: boolean;
}

// ============================================
// Hook principal
// ============================================

export function useCalendar(options: UseCalendarOptions = {}) {
  const {
    autoLoad = true,
    cacheEnabled = true,
    cacheTTL = 60000, // 1 minute
  } = options;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge les statistiques
   */
  const loadStats = useCallback(async (bureau?: string, month?: number, year?: number) => {
    setLoading(true);
    setError(null);

    try {
      const cacheKey = CacheKeys.stats(bureau, month, year);
      
      const fetchStats = async () => {
        const params = new URLSearchParams();
        if (bureau) params.set('bureau', bureau);
        if (month !== undefined) params.set('month', month.toString());
        if (year !== undefined) params.set('year', year.toString());

        const response = await fetch(`/api/calendar/stats?${params.toString()}`);
        if (!response.ok) throw new Error('Erreur de chargement des statistiques');
        
        const result = await response.json();
        return result.data;
      };

      const data = cacheEnabled
        ? await calendarCache.getOrSet(cacheKey, fetchStats, cacheTTL)
        : await fetchStats();

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheEnabled, cacheTTL]);

  /**
   * Charge les événements
   */
  const loadEvents = useCallback(async (filters?: {
    queue?: string;
    bureau?: string;
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const cacheKey = CacheKeys.events(filters?.queue || 'all', filters);

      const fetchEvents = async () => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
          });
        }

        const response = await fetch(`/api/calendar/events?${params.toString()}`);
        if (!response.ok) throw new Error('Erreur de chargement des événements');
        
        const result = await response.json();
        return result.data.events.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
      };

      const data = cacheEnabled
        ? await calendarCache.getOrSet(cacheKey, fetchEvents, cacheTTL)
        : await fetchEvents();

      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheEnabled, cacheTTL]);

  /**
   * Crée un événement
   */
  const createEvent = useCallback(async (data: EventData) => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      const validation = calendarValidation.validateEvent(data);
      if (!validation.valid) {
        throw new Error(calendarValidation.formatErrors(validation));
      }

      // Détection de conflits
      const conflicts = await calendarValidation.detectConflicts(data, events);
      if (conflicts.length > 0 && !confirm(`${conflicts.length} conflit(s) détecté(s). Continuer ?`)) {
        return null;
      }

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      const result = await response.json();
      
      // Invalider le cache
      invalidateCalendarCache.onCreate();

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [events]);

  /**
   * Met à jour un événement
   */
  const updateEvent = useCallback(async (id: string, data: Partial<EventData>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      const result = await response.json();
      
      // Invalider le cache
      invalidateCalendarCache.onUpdate(id);

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime (annule) un événement
   */
  const deleteEvent = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (reason) params.set('reason', reason);

      const response = await fetch(`/api/calendar/events/${id}?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Erreur lors de l'annulation");

      const result = await response.json();
      
      // Invalider le cache
      invalidateCalendarCache.onDelete(id);

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Détecte les conflits
   */
  const detectConflicts = useCallback(async (filters?: {
    bureau?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      const response = await fetch(`/api/calendar/conflicts?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur de détection des conflits');
      
      const result = await response.json();
      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Valide un événement
   */
  const validateEvent = useCallback((data: EventData): EventValidationResult => {
    return calendarValidation.validateEvent(data);
  }, []);

  /**
   * Vide le cache
   */
  const clearCache = useCallback(() => {
    calendarCache.clear();
  }, []);

  // Chargement automatique initial
  useEffect(() => {
    if (autoLoad) {
      loadStats();
      loadEvents();
    }
  }, [autoLoad, loadStats, loadEvents]);

  return {
    // État
    events,
    stats,
    loading,
    error,

    // Actions
    loadStats,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    detectConflicts,
    validateEvent,
    clearCache,

    // Utilitaires
    cacheEnabled,
    setError,
  };
}

// ============================================
// Hook pour un événement spécifique
// ============================================

export function useCalendarEvent(eventId: string) {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const cacheKey = CacheKeys.event(eventId);

      const fetchEvent = async () => {
        const response = await fetch(`/api/calendar/events/${eventId}`);
        if (!response.ok) throw new Error('Événement non trouvé');
        
        const result = await response.json();
        return {
          ...result.data,
          start: new Date(result.data.start),
          end: new Date(result.data.end),
        };
      };

      const data = await calendarCache.getOrSet(cacheKey, fetchEvent, 60000);
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const refresh = useCallback(() => {
    calendarCache.invalidate(CacheKeys.event(eventId));
    loadEvent();
  }, [eventId, loadEvent]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  return {
    event,
    loading,
    error,
    refresh,
  };
}

// ============================================
// Hook pour les statistiques
// ============================================

export function useCalendarStats(bureau?: string, month?: number, year?: number) {
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cacheKey = CacheKeys.stats(bureau, month, year);

      const fetchStats = async () => {
        const params = new URLSearchParams();
        if (bureau) params.set('bureau', bureau);
        if (month !== undefined) params.set('month', month.toString());
        if (year !== undefined) params.set('year', year.toString());

        const response = await fetch(`/api/calendar/stats?${params.toString()}`);
        if (!response.ok) throw new Error('Erreur de chargement des statistiques');
        
        const result = await response.json();
        return result.data;
      };

      const data = await calendarCache.getOrSet(cacheKey, fetchStats, 60000);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bureau, month, year]);

  const refresh = useCallback(() => {
    calendarCache.invalidate(CacheKeys.stats(bureau, month, year));
    loadStats();
  }, [bureau, month, year, loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

export default useCalendar;

