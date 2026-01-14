/**
 * Jeux d'essai pour le module Calendrier
 * Événements mockés : projets, validations, RH, ops
 */

import type { CalendarEventExtended } from '../api/client';

// ================================
// Événements Mock
// ================================

export const mockEvents: CalendarEventExtended[] = [
  // Projets
  {
    id: 'EVT-PROJ-001',
    title: 'Jalon J5 - Projet YESSELATE Phase 2',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'milestone',
    priority: 'high',
    project: 'YESSELATE',
    participants: ['A. DIALLO', 'M. KANE', 'S. TRAORE'],
    sla: {
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      daysRemaining: 5,
    },
    conflicts: [],
    metadata: {
      jalon: 'J5',
      phase: 'Phase 2',
    },
  },
  {
    id: 'EVT-PROJ-002',
    title: 'Livraison matériel - Site A',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    priority: 'high',
    project: 'Site A',
    sla: {
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'at-risk',
      daysRemaining: 3,
    },
    conflicts: [],
  },

  // Validations
  {
    id: 'EVT-VAL-001',
    title: 'Validation BC-2024-0847',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    priority: 'high',
    sla: {
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'at-risk',
      daysRemaining: 2,
    },
    conflicts: [],
    metadata: {
      documentType: 'bc',
      documentId: 'BC-2024-0847',
    },
  },
  {
    id: 'EVT-VAL-002',
    title: 'Validation Facture FC-2024-0123',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    priority: 'high',
    sla: {
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'at-risk',
      daysRemaining: 1,
    },
    conflicts: ['EVT-RH-001'],
    metadata: {
      documentType: 'facture',
      documentId: 'FC-2024-0123',
    },
  },

  // RH & Absences
  {
    id: 'EVT-RH-001',
    title: 'Congés - A. DIALLO',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'reminder',
    priority: 'medium',
    participants: ['A. DIALLO'],
    conflicts: ['EVT-VAL-002'],
    metadata: {
      type: 'conges',
      employe: 'A. DIALLO',
      duree: 5,
    },
  },
  {
    id: 'EVT-RH-002',
    title: 'Mission terrain - S. TRAORE',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'reminder',
    priority: 'medium',
    participants: ['S. TRAORE'],
    conflicts: [],
    metadata: {
      type: 'mission',
      employe: 'S. TRAORE',
      lieu: 'Diamniadio',
    },
  },

  // Opérations
  {
    id: 'EVT-OPS-001',
    title: 'Réunion coordination bureaux',
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '11:30',
    type: 'meeting',
    priority: 'high',
    participants: ['A. DIALLO', 'M. KANE'],
    conflicts: [],
    metadata: {
      type: 'reunion',
      bureau: 'BMO',
    },
  },
  {
    id: 'EVT-OPS-002',
    title: 'Visite chantier - Site A',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    priority: 'high',
    participants: ['S. TRAORE', 'M. KANE'],
    conflicts: [],
    metadata: {
      type: 'visite',
      site: 'Site A',
    },
  },

  // Retards
  {
    id: 'EVT-OVERDUE-001',
    title: 'Échéance dépassée - BC-2024-0800',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'deadline',
    priority: 'high',
    sla: {
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'overdue',
      daysRemaining: -2,
    },
    conflicts: [],
    metadata: {
      documentType: 'bc',
      documentId: 'BC-2024-0800',
      overdue: true,
    },
  },
];

// ================================
// Helpers
// ================================

/**
 * Obtenir les événements du jour
 */
export function getTodayEvents(): CalendarEventExtended[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return mockEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate < tomorrow;
  });
}

/**
 * Obtenir les événements de la semaine
 */
export function getWeekEvents(): CalendarEventExtended[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return mockEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate < nextWeek;
  });
}

/**
 * Obtenir les événements en retard
 */
export function getOverdueEvents(): CalendarEventExtended[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return mockEvents.filter((event) => {
    if (!event.sla) return false;
    const dueDate = new Date(event.sla.dueDate);
    return dueDate < today && event.sla.status === 'overdue';
  });
}

/**
 * Obtenir les événements avec conflits
 */
export function getConflictedEvents(): CalendarEventExtended[] {
  return mockEvents.filter((event) => event.conflicts && event.conflicts.length > 0);
}

