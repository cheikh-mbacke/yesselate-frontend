/**
 * Client API pour le module Calendrier
 * Wrapper autour de calendarClient avec mocks => points d'extension API
 */

import { calendarAPI } from '@/lib/api/pilotage/calendarClient';
import type { CalendarEvent } from '@/lib/api/pilotage/calendarClient';

// ================================
// Types étendus
// ================================

export interface CalendarEventExtended extends CalendarEvent {
  sla?: {
    dueDate: string;
    status: 'ok' | 'warning' | 'at-risk' | 'overdue';
    daysRemaining?: number;
  };
  conflicts?: string[];
  metadata?: Record<string, unknown>;
}

// ================================
// Client API
// ================================

export const calendrierAPI = {
  /**
   * Lister les événements
   */
  listEvents: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    bureau?: string;
  }): Promise<{ events: CalendarEventExtended[]; count: number; timestamp: string }> => {
    const response = await calendarAPI.listEvents(params);
    
    // Enrichir avec SLA et conflits (points d'extension)
    const enrichedEvents = response.events.map((event) => ({
      ...event,
      sla: event.priority === 'high' ? {
        dueDate: event.date,
        status: 'warning' as const,
        daysRemaining: 5,
      } : undefined,
      conflicts: [],
      metadata: {},
    }));

    return {
      ...response,
      events: enrichedEvents,
    };
  },

  /**
   * Créer un événement
   */
  createEvent: async (
    payload: Partial<CalendarEventExtended> & { title: string; date: string }
  ): Promise<{ success: boolean; event: CalendarEventExtended; message?: string }> => {
    const response = await calendarAPI.createEvent(payload);
    
    return {
      ...response,
      event: {
        ...response.event,
        sla: payload.sla,
        conflicts: payload.conflicts,
        metadata: payload.metadata,
      },
    };
  },

  /**
   * Détecter les conflits
   */
  detectConflicts: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ conflicts: any[]; count: number }> => {
    const response = await calendarAPI.detectConflicts(params);
    return {
      conflicts: response?.conflicts || [],
      count: response?.count || 0,
    };
  },

  /**
   * Obtenir les statistiques
   */
  getStats: async (): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    overdue: number;
    conflicts: number;
  }> => {
    // Point d'extension : appeler API stats réelle
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      overdue: 0,
      conflicts: 0,
    };
  },
};

