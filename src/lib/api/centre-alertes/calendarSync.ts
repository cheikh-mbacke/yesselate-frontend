/**
 * Synchronisation avec le Calendrier pour les alertes SLA
 */

import { fetchJson } from '../pilotage/http';
import type { AlertItem } from '../pilotage/alertsClient';

export interface SLAEvent {
  id: string;
  title: string;
  slaDueAt: Date;
  status: 'ok' | 'warning' | 'overdue';
  daysUntil?: number;
  hoursUntil?: number;
  eventType: string;
  priority: string;
  bureau?: string;
}

export interface SLAAlertsResponse {
  overdue: SLAEvent[];
  atRisk: SLAEvent[];
  today: SLAEvent[];
}

/**
 * Convertir les événements SLA du calendrier en alertes
 */
export function convertSLAEventsToAlerts(events: SLAEvent[]): AlertItem[] {
  return events.map((event) => ({
    id: `sla-${event.id}`,
    type: event.status === 'overdue' ? 'critical' : event.status === 'warning' ? 'warning' : 'info',
    title: `SLA ${event.status === 'overdue' ? 'dépassé' : event.status === 'warning' ? 'en risque' : 'du jour'}: ${event.title}`,
    description: `Échéance SLA: ${event.slaDueAt.toLocaleString('fr-FR')}`,
    source: 'calendar',
    createdAt: new Date().toISOString(),
    status: event.status === 'overdue' ? 'open' : 'open',
    priority: event.priority === 'critical' ? 1 : event.priority === 'high' ? 2 : 3,
    queue: 'sla',
    tags: ['sla', 'calendar', event.eventType],
    metadata: {
      slaDueAt: event.slaDueAt.toISOString(),
      daysUntil: event.daysUntil,
      hoursUntil: event.hoursUntil,
      eventId: event.id,
      bureau: event.bureau,
    },
  }));
}

/**
 * Récupérer les alertes SLA depuis le calendrier
 */
export async function getSLAAlertsFromCalendar(): Promise<SLAAlertsResponse> {
  try {
    // Récupérer les événements avec SLA depuis le calendrier
    const response = await fetchJson<{
      overdue: any[];
      atRisk: any[];
      today: any[];
    }>('/api/calendar/sla-alerts');

    return {
      overdue: response.overdue.map((e) => ({
        ...e,
        slaDueAt: new Date(e.slaDueAt),
        status: 'overdue' as const,
      })),
      atRisk: response.atRisk.map((e) => ({
        ...e,
        slaDueAt: new Date(e.slaDueAt),
        status: 'warning' as const,
      })),
      today: response.today.map((e) => ({
        ...e,
        slaDueAt: new Date(e.slaDueAt),
        status: 'ok' as const,
      })),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes SLA:', error);
    return {
      overdue: [],
      atRisk: [],
      today: [],
    };
  }
}

