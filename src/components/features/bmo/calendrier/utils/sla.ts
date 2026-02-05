/**
 * Utilitaires de calcul SLA (risque/retard)
 * Points d'extension pour les calculs de Service Level Agreement
 */

import type { CalendrierTab } from '@/lib/types/calendrier.types';

// ================================
// Types
// ================================

export type SLAStatus = 'ok' | 'warning' | 'at-risk' | 'overdue' | 'blocked';

export interface SLACalculation {
  eventId: string;
  dueDate: Date;
  currentDate: Date;
  status: SLAStatus;
  daysRemaining: number;
  daysOverdue: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

// ================================
// Configuration SLA par type
// ================================

const SLA_CONFIG = {
  'sla-retards': { targetDays: 3, warningThreshold: 1 },
  'echeances-operationnelles': { targetDays: 5, warningThreshold: 2 },
  'jalons-projets': { targetDays: 7, warningThreshold: 3 },
  default: { targetDays: 5, warningThreshold: 2 },
} as const;

// ================================
// Fonctions de calcul
// ================================

/**
 * Calculer le statut SLA d'un événement
 */
export function calculateSLA(
  dueDate: Date | string,
  currentDate: Date = new Date(),
  type?: CalendrierTab
): SLACalculation {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = currentDate;
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const config = type && type in SLA_CONFIG 
    ? SLA_CONFIG[type as keyof typeof SLA_CONFIG] 
    : SLA_CONFIG.default;

  let status: SLAStatus;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let recommendation: string | undefined;

  if (diffMs < 0) {
    // En retard
    const daysOverdue = Math.abs(diffDays);
    status = daysOverdue >= 3 ? 'blocked' : 'overdue';
    riskLevel = daysOverdue >= 5 ? 'critical' : daysOverdue >= 3 ? 'high' : 'medium';
    recommendation = `URGENCE : ${daysOverdue} jour(s) de retard. Action immédiate requise.`;
  } else if (diffDays <= config.warningThreshold) {
    // En risque
    status = 'at-risk';
    riskLevel = diffDays === 0 ? 'high' : 'medium';
    recommendation = `Échéance dans ${diffDays} jour(s). Traiter en priorité.`;
  } else if (diffDays <= config.targetDays) {
    // Avertissement
    status = 'warning';
    riskLevel = 'low';
    recommendation = `Échéance proche (${diffDays} jours). Planifier le traitement.`;
  } else {
    // OK
    status = 'ok';
    riskLevel = 'low';
  }

  return {
    eventId: '',
    dueDate: due,
    currentDate: now,
    status,
    daysRemaining: Math.max(0, diffDays),
    daysOverdue: Math.max(0, -diffDays),
    riskLevel,
    recommendation,
  };
}

/**
 * Calculer les statistiques SLA pour une liste d'événements
 */
export function calculateSLAStats(
  events: Array<{ id: string; dueDate: Date | string; type?: CalendrierTab }>
): {
  total: number;
  ok: number;
  warning: number;
  atRisk: number;
  overdue: number;
  blocked: number;
} {
  const stats = {
    total: events.length,
    ok: 0,
    warning: 0,
    atRisk: 0,
    overdue: 0,
    blocked: 0,
  };

  for (const event of events) {
    const calculation = calculateSLA(event.dueDate, new Date(), event.type);
    switch (calculation.status) {
      case 'ok':
        stats.ok++;
        break;
      case 'warning':
        stats.warning++;
        break;
      case 'at-risk':
        stats.atRisk++;
        break;
      case 'overdue':
        stats.overdue++;
        break;
      case 'blocked':
        stats.blocked++;
        break;
    }
  }

  return stats;
}

/**
 * Filtrer les événements par statut SLA
 */
export function filterBySLAStatus<T extends { dueDate: Date | string; type?: CalendrierTab }>(
  events: T[],
  status: SLAStatus
): T[] {
  return events.filter((event) => {
    const calculation = calculateSLA(event.dueDate, new Date(), event.type);
    return calculation.status === status;
  });
}

