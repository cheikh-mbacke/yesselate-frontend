/**
 * SERVICE DE CALCUL AVANCÉ DES SLA
 * 
 * Calcule et gère les Service Level Agreements pour les événements :
 * - Calcul automatique des échéances
 * - Prise en compte des jours ouvrés
 * - Exclusion des jours fériés
 * - Alertes proactives
 * - Escalade automatique
 * - Rapports de conformité
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export type SLAStatus = 'ok' | 'warning' | 'overdue' | 'none';

export interface SLAConfig {
  eventType: string; // meeting, site-visit, etc.
  priority: string; // normal, urgent, critical
  targetDays: number; // Nombre de jours ouvrés
  warningThreshold: number; // Pourcentage avant alerte (ex: 80%)
  escalationEnabled: boolean;
  escalationDelayHours: number;
}

export interface SLACalculationResult {
  status: SLAStatus;
  dueAt: Date;
  remainingDays?: number;
  remainingHours?: number;
  daysOverdue?: number;
  compliance: number; // 0-100%
  recommendation: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SLAReport {
  period: {
    start: Date;
    end: Date;
  };
  totalEvents: number;
  compliant: number;
  noncompliant: number;
  complianceRate: number;
  byType: Record<string, { compliant: number; total: number; rate: number }>;
  byPriority: Record<string, { compliant: number; total: number; rate: number }>;
  averageCompletionTime: number; // en heures
  trends: {
    direction: 'improving' | 'degrading' | 'stable';
    change: number; // pourcentage
  };
}

// ============================================
// CONFIGURATION DES SLA
// ============================================

const SLA_CONFIGS: SLAConfig[] = [
  // Réunions
  {
    eventType: 'meeting',
    priority: 'critical',
    targetDays: 1,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 4,
  },
  {
    eventType: 'meeting',
    priority: 'urgent',
    targetDays: 2,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 12,
  },
  {
    eventType: 'meeting',
    priority: 'normal',
    targetDays: 5,
    warningThreshold: 80,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },

  // Visites de site
  {
    eventType: 'site-visit',
    priority: 'critical',
    targetDays: 2,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 8,
  },
  {
    eventType: 'site-visit',
    priority: 'urgent',
    targetDays: 5,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 24,
  },
  {
    eventType: 'site-visit',
    priority: 'normal',
    targetDays: 10,
    warningThreshold: 80,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },

  // Validations
  {
    eventType: 'validation',
    priority: 'critical',
    targetDays: 1,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 2,
  },
  {
    eventType: 'validation',
    priority: 'urgent',
    targetDays: 3,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 12,
  },
  {
    eventType: 'validation',
    priority: 'normal',
    targetDays: 7,
    warningThreshold: 80,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },

  // Paiements
  {
    eventType: 'payment',
    priority: 'critical',
    targetDays: 1,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 4,
  },
  {
    eventType: 'payment',
    priority: 'urgent',
    targetDays: 3,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 12,
  },
  {
    eventType: 'payment',
    priority: 'normal',
    targetDays: 15,
    warningThreshold: 85,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },

  // Contrats
  {
    eventType: 'contract',
    priority: 'critical',
    targetDays: 3,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 12,
  },
  {
    eventType: 'contract',
    priority: 'urgent',
    targetDays: 7,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 24,
  },
  {
    eventType: 'contract',
    priority: 'normal',
    targetDays: 15,
    warningThreshold: 85,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },

  // Échéances
  {
    eventType: 'deadline',
    priority: 'critical',
    targetDays: 1,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 2,
  },
  {
    eventType: 'deadline',
    priority: 'urgent',
    targetDays: 2,
    warningThreshold: 75,
    escalationEnabled: true,
    escalationDelayHours: 8,
  },
  {
    eventType: 'deadline',
    priority: 'normal',
    targetDays: 5,
    warningThreshold: 80,
    escalationEnabled: false,
    escalationDelayHours: 0,
  },
];

// Jours fériés (Sénégal 2025-2026)
const HOLIDAYS: Date[] = [
  new Date('2025-01-01'), // Jour de l'an
  new Date('2025-04-04'), // Fête nationale
  new Date('2025-04-21'), // Lundi de Pâques
  new Date('2025-05-01'), // Fête du travail
  new Date('2025-05-08'), // Fin du Ramadan (Korité)
  new Date('2025-07-15'), // Tabaski
  new Date('2025-08-15'), // Assomption
  new Date('2025-09-14'), // Tamkharit (Nouvel An musulman)
  new Date('2025-11-01'), // Toussaint
  new Date('2025-11-23'), // Maouloud
  new Date('2025-12-25'), // Noël
];

// ============================================
// SERVICE DE CALCUL SLA
// ============================================

export class CalendarSLAService {
  private static instance: CalendarSLAService;

  private constructor() {}

  public static getInstance(): CalendarSLAService {
    if (!this.instance) {
      this.instance = new CalendarSLAService();
    }
    return this.instance;
  }

  /**
   * Calculer le SLA pour un événement
   */
  calculate(event: any): SLACalculationResult {
    // Récupérer la config SLA
    const config = this.getSLAConfig(event.kind, event.priority);

    if (!config) {
      return {
        status: 'none',
        dueAt: event.start,
        compliance: 100,
        recommendation: 'Aucun SLA défini',
        urgencyLevel: 'low',
      };
    }

    // Calculer la date d'échéance
    const dueAt = this.calculateDueDate(event.createdAt || new Date(), config.targetDays);

    // Calculer le statut actuel
    const now = new Date();
    const diffMs = dueAt.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    // Calculer le temps écoulé et la compliance
    const totalDuration = dueAt.getTime() - event.createdAt.getTime();
    const elapsed = now.getTime() - event.createdAt.getTime();
    const compliance = Math.max(0, Math.min(100, 100 - (elapsed / totalDuration) * 100));

    // Déterminer le statut
    let status: SLAStatus;
    let recommendation: string;
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';

    if (diffMs < 0) {
      // SLA dépassé
      const daysOverdue = Math.abs(Math.floor(diffDays));
      status = 'overdue';
      recommendation = `URGENCE : SLA dépassé de ${daysOverdue} jour(s). Action immédiate requise.`;
      urgencyLevel = 'critical';

      return {
        status,
        dueAt,
        daysOverdue,
        compliance: 0,
        recommendation,
        urgencyLevel,
      };
    }

    if (compliance < config.warningThreshold) {
      // Avertissement
      status = 'warning';
      
      if (diffHours < 24) {
        recommendation = `⚠️ Échéance dans ${Math.floor(diffHours)}h. Traiter en priorité.`;
        urgencyLevel = 'high';
      } else {
        recommendation = `Échéance proche (${Math.floor(diffDays)} jours). Planifier le traitement.`;
        urgencyLevel = 'medium';
      }

      return {
        status,
        dueAt,
        remainingDays: Math.floor(diffDays),
        remainingHours: Math.floor(diffHours),
        compliance,
        recommendation,
        urgencyLevel,
      };
    }

    // OK
    status = 'ok';
    recommendation = `Dans les délais (${Math.floor(diffDays)} jours restants)`;
    urgencyLevel = 'low';

    return {
      status,
      dueAt,
      remainingDays: Math.floor(diffDays),
      remainingHours: Math.floor(diffHours),
      compliance,
      recommendation,
      urgencyLevel,
    };
  }

  /**
   * Calculer la date d'échéance en jours ouvrés
   */
  calculateDueDate(startDate: Date, businessDays: number): Date {
    let date = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      date.setDate(date.getDate() + 1);

      // Vérifier si c'est un jour ouvré
      if (this.isBusinessDay(date)) {
        daysAdded++;
      }
    }

    // Définir l'heure à 17h (fin de journée)
    date.setHours(17, 0, 0, 0);

    return date;
  }

  /**
   * Vérifier si c'est un jour ouvré
   */
  isBusinessDay(date: Date): boolean {
    // Weekend (samedi = 6, dimanche = 0)
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return false;
    }

    // Jour férié
    const dateStr = date.toISOString().split('T')[0];
    const isHoliday = HOLIDAYS.some(
      h => h.toISOString().split('T')[0] === dateStr
    );

    return !isHoliday;
  }

  /**
   * Obtenir la configuration SLA
   */
  getSLAConfig(eventType: string, priority: string): SLAConfig | null {
    return SLA_CONFIGS.find(
      c => c.eventType === eventType && c.priority === priority
    ) || null;
  }

  /**
   * Obtenir tous les événements en dépassement SLA
   */
  async getOverdueEvents(bureau?: string): Promise<any[]> {
    const where: any = {
      status: 'open',
      slaDueAt: { lt: new Date() },
    };

    if (bureau) where.bureau = bureau;

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        assignees: true,
      },
      orderBy: { slaDueAt: 'asc' },
    });

    return events.map(event => ({
      ...event,
      slaCalculation: this.calculate(event),
    }));
  }

  /**
   * Obtenir les événements proches de l'échéance
   */
  async getWarningEvents(bureau?: string, hoursThreshold: number = 24): Promise<any[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

    const where: any = {
      status: 'open',
      slaDueAt: {
        gte: now,
        lte: threshold,
      },
    };

    if (bureau) where.bureau = bureau;

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        assignees: true,
      },
      orderBy: { slaDueAt: 'asc' },
    });

    return events.map(event => ({
      ...event,
      slaCalculation: this.calculate(event),
    }));
  }

  /**
   * Générer un rapport de conformité SLA
   */
  async generateComplianceReport(params: {
    startDate: Date;
    endDate: Date;
    bureau?: string;
  }): Promise<SLAReport> {
    const where: any = {
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
      status: 'done', // Seulement les événements terminés
      slaDueAt: { not: null },
    };

    if (params.bureau) where.bureau = params.bureau;

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        assignees: true,
      },
    });

    // Calculer conformité globale
    const compliant = events.filter(e => e.updatedAt <= e.slaDueAt!).length;
    const noncompliant = events.length - compliant;
    const complianceRate = events.length > 0
      ? Math.round((compliant / events.length) * 100)
      : 100;

    // Par type
    const byType = this.groupByField(events, 'kind');

    // Par priorité
    const byPriority = this.groupByField(events, 'priority');

    // Temps moyen de complétion
    const completionTimes = events.map(e =>
      (e.updatedAt.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60)
    );
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    // Tendances (comparer avec période précédente)
    const trends = await this.calculateTrends(params);

    return {
      period: {
        start: params.startDate,
        end: params.endDate,
      },
      totalEvents: events.length,
      compliant,
      noncompliant,
      complianceRate,
      byType,
      byPriority,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      trends,
    };
  }

  /**
   * Grouper par champ et calculer conformité
   */
  private groupByField(events: any[], field: string): Record<string, any> {
    const groups: Record<string, any[]> = {};

    events.forEach(e => {
      const key = e[field] || 'non-défini';
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    const result: Record<string, any> = {};

    Object.keys(groups).forEach(key => {
      const groupEvents = groups[key];
      const compliant = groupEvents.filter(e => e.updatedAt <= e.slaDueAt).length;
      const total = groupEvents.length;
      const rate = Math.round((compliant / total) * 100);

      result[key] = { compliant, total, rate };
    });

    return result;
  }

  /**
   * Calculer les tendances
   */
  private async calculateTrends(params: any): Promise<any> {
    // Période précédente (même durée)
    const duration = params.endDate.getTime() - params.startDate.getTime();
    const prevStartDate = new Date(params.startDate.getTime() - duration);
    const prevEndDate = new Date(params.endDate.getTime() - duration);

    const prevReport = await this.generateComplianceReport({
      startDate: prevStartDate,
      endDate: prevEndDate,
      bureau: params.bureau,
    });

    // Ne pas appeler récursivement, juste calculer la compliance de base
    const prevWhere: any = {
      createdAt: {
        gte: prevStartDate,
        lte: prevEndDate,
      },
      status: 'done',
      slaDueAt: { not: null },
    };

    if (params.bureau) prevWhere.bureau = params.bureau;

    const prevEvents = await prisma.calendarEvent.findMany({ where: prevWhere });
    const prevCompliant = prevEvents.filter(e => e.updatedAt <= e.slaDueAt!).length;
    const prevComplianceRate = prevEvents.length > 0
      ? Math.round((prevCompliant / prevEvents.length) * 100)
      : 100;

    const change = prevComplianceRate > 0
      ? Math.round(((params.complianceRate - prevComplianceRate) / prevComplianceRate) * 100)
      : 0;

    let direction: 'improving' | 'degrading' | 'stable';
    if (change > 5) {
      direction = 'improving';
    } else if (change < -5) {
      direction = 'degrading';
    } else {
      direction = 'stable';
    }

    return { direction, change };
  }

  /**
   * Vérifier automatiquement les SLA et envoyer alertes
   */
  async checkAndAlertSLA(): Promise<void> {
    // Événements en warning
    const warningEvents = await this.getWarningEvents(undefined, 24);
    
    // Événements en retard
    const overdueEvents = await this.getOverdueEvents();

    // TODO: Envoyer notifications via CalendarNotificationService
    console.log(`[SLA Check] ${warningEvents.length} avertissements, ${overdueEvents.length} dépassements`);
  }
}

// Export singleton
export default CalendarSLAService.getInstance();

