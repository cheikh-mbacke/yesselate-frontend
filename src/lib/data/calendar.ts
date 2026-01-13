/**
 * Données mock pour le calendrier
 * À remplacer par des appels API réels
 */

import type { CalendarItem, SLAStatus } from '../types/calendar.types';

// ============================================
// ÉVÉNEMENTS DU CALENDRIER
// ============================================

export const calendarEvents: CalendarItem[] = [
  // Aujourd'hui
  {
    id: 'EVT-001',
    title: 'Réunion de suivi projet',
    description: 'Revue d\'avancement mensuelle du projet YESSELATE',
    kind: 'meeting',
    bureau: 'BMO',
    assignees: [
      { id: 'USR-001', name: 'A. DIALLO' },
      { id: 'USR-002', name: 'M. KANE' },
    ],
    start: new Date(Date.now() + 2 * 3600000).toISOString(), // Dans 2h
    end: new Date(Date.now() + 3 * 3600000).toISOString(), // Dans 3h
    priority: 'urgent',
    severity: 'warning',
    status: 'open',
    project: 'YESSELATE',
    slaDueAt: new Date(Date.now() + 2 * 3600000).toISOString(),
  },
  {
    id: 'EVT-002',
    title: 'Visite de chantier - Site A',
    description: 'Inspection mensuelle des travaux',
    kind: 'site-visit',
    bureau: 'BMO',
    assignees: [{ id: 'USR-003', name: 'S. TRAORE' }],
    start: new Date(Date.now() + 4 * 3600000).toISOString(), // Dans 4h
    end: new Date(Date.now() + 6 * 3600000).toISOString(), // Dans 6h
    priority: 'normal',
    severity: 'info',
    status: 'open',
    project: 'Site A',
  },
  {
    id: 'EVT-003',
    title: 'Validation BC-2026-001',
    description: 'Validation urgente du bon de commande',
    kind: 'validation',
    bureau: 'BMO',
    assignees: [{ id: 'USR-001', name: 'A. DIALLO' }],
    start: new Date(Date.now() - 2 * 3600000).toISOString(), // Il y a 2h (EN RETARD)
    end: new Date(Date.now() - 1 * 3600000).toISOString(),
    priority: 'critical',
    severity: 'critical',
    status: 'open',
    linkedTo: { type: 'purchase_order', id: 'BC-2026-001', label: 'BC-2026-001' },
    slaDueAt: new Date(Date.now() - 1 * 3600000).toISOString(), // SLA dépassé
  },
  
  // Cette semaine
  {
    id: 'EVT-004',
    title: 'Paiement fournisseur SONABEL',
    description: 'Paiement facture électricité',
    kind: 'payment',
    bureau: 'DAF',
    assignees: [{ id: 'USR-004', name: 'F. OUEDRAOGO' }],
    start: new Date(Date.now() + 24 * 3600000).toISOString(), // Demain
    end: new Date(Date.now() + 25 * 3600000).toISOString(),
    priority: 'normal',
    severity: 'info',
    status: 'open',
    linkedTo: { type: 'invoice', id: 'FACT-2026-045', label: 'Facture SONABEL' },
    slaDueAt: new Date(Date.now() + 48 * 3600000).toISOString(),
  },
  {
    id: 'EVT-005',
    title: 'Signature contrat - Fournisseur XYZ',
    description: 'Signature du contrat cadre annuel',
    kind: 'contract',
    bureau: 'BMO',
    assignees: [
      { id: 'USR-001', name: 'A. DIALLO' },
      { id: 'USR-005', name: 'B. SOME' },
    ],
    start: new Date(Date.now() + 48 * 3600000).toISOString(), // Dans 2 jours
    end: new Date(Date.now() + 50 * 3600000).toISOString(),
    priority: 'urgent',
    severity: 'warning',
    status: 'open',
    linkedTo: { type: 'contract', id: 'CONT-2026-012', label: 'Contrat XYZ' },
  },
  {
    id: 'EVT-006',
    title: 'Deadline - Rapport trimestriel',
    description: 'Date limite de soumission du rapport Q1',
    kind: 'deadline',
    bureau: 'BMO',
    assignees: [{ id: 'USR-002', name: 'M. KANE' }],
    start: new Date(Date.now() + 72 * 3600000).toISOString(), // Dans 3 jours
    end: new Date(Date.now() + 72 * 3600000).toISOString(),
    priority: 'critical',
    severity: 'critical',
    status: 'open',
    slaDueAt: new Date(Date.now() + 72 * 3600000).toISOString(),
  },
  
  // Absences
  {
    id: 'EVT-007',
    title: 'Congé - S. TRAORE',
    description: 'Congé annuel',
    kind: 'absence',
    bureau: 'BMO',
    assignees: [{ id: 'USR-003', name: 'S. TRAORE' }],
    start: new Date(Date.now() + 96 * 3600000).toISOString(), // Dans 4 jours
    end: new Date(Date.now() + 288 * 3600000).toISOString(), // +12 jours
    priority: 'normal',
    severity: 'info',
    status: 'open',
  },
  
  // Conflits (même créneau qu'EVT-001)
  {
    id: 'EVT-008',
    title: 'Comité de pilotage',
    description: 'Comité mensuel - CONFLIT avec EVT-001',
    kind: 'meeting',
    bureau: 'BMO',
    assignees: [
      { id: 'USR-001', name: 'A. DIALLO' }, // Même personne qu'EVT-001 !
      { id: 'USR-006', name: 'D. KABORE' },
    ],
    start: new Date(Date.now() + 2 * 3600000).toISOString(), // Même heure qu'EVT-001
    end: new Date(Date.now() + 4 * 3600000).toISOString(),
    priority: 'urgent',
    severity: 'critical',
    status: 'open',
  },
  
  // Événements terminés
  {
    id: 'EVT-009',
    title: 'Réunion hebdomadaire',
    description: 'Point hebdomadaire équipe',
    kind: 'meeting',
    bureau: 'BMO',
    assignees: [{ id: 'USR-002', name: 'M. KANE' }],
    start: new Date(Date.now() - 24 * 3600000).toISOString(), // Hier
    end: new Date(Date.now() - 23 * 3600000).toISOString(),
    priority: 'normal',
    severity: 'success',
    status: 'done',
  },
  {
    id: 'EVT-010',
    title: 'Validation budget Q1',
    description: 'Budget validé et approuvé',
    kind: 'validation',
    bureau: 'DAF',
    assignees: [{ id: 'USR-004', name: 'F. OUEDRAOGO' }],
    start: new Date(Date.now() - 48 * 3600000).toISOString(), // Il y a 2 jours
    end: new Date(Date.now() - 47 * 3600000).toISOString(),
    priority: 'critical',
    severity: 'success',
    status: 'done',
  },
];

// ============================================
// STATUTS SLA
// ============================================

export const slaStatuses: SLAStatus[] = [
  {
    itemId: 'EVT-003',
    isOverdue: true,
    daysOverdue: 0,
    status: 'blocked',
    recommendation: 'Action urgente requise - SLA dépassé',
  },
  {
    itemId: 'EVT-006',
    isOverdue: false,
    daysOverdue: 0,
    status: 'warning',
    recommendation: 'Deadline proche - prioriser',
  },
  {
    itemId: 'EVT-001',
    isOverdue: false,
    daysOverdue: 0,
    status: 'ok',
  },
];

// ============================================
// DÉTECTION DE CONFLITS
// ============================================

export function detectConflicts(events: CalendarItem[]): Set<string> {
  const conflicts = new Set<string>();
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const e1 = events[i];
      const e2 = events[j];
      
      // Vérifier si même personne
      const sharedAssignees = e1.assignees?.filter(a1 => 
        e2.assignees?.some(a2 => a2.id === a1.id)
      );
      
      if (!sharedAssignees || sharedAssignees.length === 0) continue;
      
      // Vérifier si chevauchement temporel
      const start1 = new Date(e1.start).getTime();
      const end1 = new Date(e1.end).getTime();
      const start2 = new Date(e2.start).getTime();
      const end2 = new Date(e2.end).getTime();
      
      const overlaps = (start1 < end2 && end1 > start2);
      
      if (overlaps) {
        conflicts.add(e1.id);
        conflicts.add(e2.id);
      }
    }
  }
  
  return conflicts;
}

// ============================================
// FILTRES
// ============================================

export function filterEventsByQueue(events: CalendarItem[], queue: string): CalendarItem[] {
  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
  const weekEnd = todayStart + 7 * 24 * 3600000;
  
  switch (queue) {
    case 'today':
      return events.filter(e => {
        const start = new Date(e.start).getTime();
        return start >= todayStart && start <= todayEnd && e.status === 'open';
      });
      
    case 'week':
      return events.filter(e => {
        const start = new Date(e.start).getTime();
        return start >= todayStart && start <= weekEnd && e.status === 'open';
      });
      
    case 'overdue':
      return events.filter(e => {
        if (!e.slaDueAt || e.status !== 'open') return false;
        const sla = new Date(e.slaDueAt).getTime();
        return sla < now;
      });
      
    case 'conflicts':
      const conflicts = detectConflicts(events);
      return events.filter(e => conflicts.has(e.id) && e.status === 'open');
      
    case 'completed':
      return events.filter(e => e.status === 'done');
      
    case 'absences':
      return events.filter(e => e.kind === 'absence');
      
    case 'all':
    default:
      return events;
  }
}

// ============================================
// STATISTIQUES
// ============================================

export function calculateStats(events: CalendarItem[]): {
  total: number;
  today: number;
  thisWeek: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  byKind: Record<string, number>;
  byBureau: Record<string, number>;
  ts: string;
} {
  const now = Date.now();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
  const weekEnd = todayStart + 7 * 24 * 3600000;
  
  const today = events.filter(e => {
    const start = new Date(e.start).getTime();
    return start >= todayStart && start <= todayEnd && e.status === 'open';
  }).length;
  
  const thisWeek = events.filter(e => {
    const start = new Date(e.start).getTime();
    return start >= todayStart && start <= weekEnd && e.status === 'open';
  }).length;
  
  const overdueSLA = events.filter(e => {
    if (!e.slaDueAt || e.status !== 'open') return false;
    const sla = new Date(e.slaDueAt).getTime();
    return sla < now;
  }).length;
  
  const conflicts = detectConflicts(events).size;
  
  const completed = events.filter(e => e.status === 'done').length;
  
  const byKind: Record<string, number> = {};
  const byBureau: Record<string, number> = {};
  
  events.forEach(e => {
    byKind[e.kind] = (byKind[e.kind] || 0) + 1;
    if (e.bureau) byBureau[e.bureau] = (byBureau[e.bureau] || 0) + 1;
  });
  
  return {
    total: events.length,
    today,
    thisWeek,
    overdueSLA,
    conflicts,
    completed,
    byKind,
    byBureau,
    ts: new Date().toISOString(),
  };
}

