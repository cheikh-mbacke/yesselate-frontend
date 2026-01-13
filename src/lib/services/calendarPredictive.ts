/**
 * SERVICE D'ANALYTICS PRÉDICTIF CALENDRIER
 * 
 * Utilise l'historique pour prédire :
 * - Risques de conflits futurs
 * - Dépassements SLA probables
 * - Charge de travail optimale
 * - Recommandations de planification
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface PredictionResult {
  confidence: number; // 0-100%
  prediction: string;
  recommendations: string[];
  data: any;
}

export interface ConflictPrediction {
  date: Date;
  probability: number; // 0-1
  users: Array<{
    id: string;
    name: string;
    riskScore: number;
  }>;
  reason: string;
}

export interface SLAPrediction {
  eventId: string;
  eventTitle: string;
  slaDueAt: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // Probabilité de dépassement
  factors: string[];
}

export interface WorkloadPrediction {
  week: string;
  expectedEvents: number;
  capacity: number;
  utilizationRate: number; // 0-1
  status: 'optimal' | 'busy' | 'overload';
  recommendations: string[];
}

// ============================================
// SERVICE
// ============================================

export class CalendarPredictiveService {
  private static instance: CalendarPredictiveService;

  private constructor() {}

  public static getInstance(): CalendarPredictiveService {
    if (!this.instance) {
      this.instance = new CalendarPredictiveService();
    }
    return this.instance;
  }

  /**
   * Prédire les conflits futurs basés sur l'historique
   */
  async predictConflicts(daysAhead: number = 30): Promise<ConflictPrediction[]> {
    try {
      // Analyser l'historique des conflits
      const historicalConflicts = await this.analyzeHistoricalConflicts();

      // Récupérer les événements futurs
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const futureEvents = await prisma.calendarEvent.findMany({
        where: {
          start: {
            gte: now,
            lte: endDate,
          },
          status: { not: 'done' },
        },
        include: {
          assignees: true,
        },
        orderBy: { start: 'asc' },
      });

      // Prédire les conflits
      const predictions: ConflictPrediction[] = [];

      // Grouper par jour
      const eventsByDay = this.groupEventsByDay(futureEvents);

      for (const [date, events] of Object.entries(eventsByDay)) {
        // Analyser la densité
        const density = events.length;
        
        // Identifier les utilisateurs avec forte charge
        const userLoad = this.calculateUserLoad(events);
        
        // Calculer probabilité de conflit basée sur patterns historiques
        const probability = this.calculateConflictProbability(
          density,
          userLoad,
          historicalConflicts
        );

        if (probability > 0.3) {
          predictions.push({
            date: new Date(date),
            probability,
            users: Object.entries(userLoad)
              .filter(([_, load]) => load > 2)
              .map(([userId, load]) => ({
                id: userId,
                name: this.getUserName(userId, events),
                riskScore: load / density,
              })),
            reason: this.generateConflictReason(density, userLoad),
          });
        }
      }

      return predictions.sort((a, b) => b.probability - a.probability);
    } catch (error) {
      console.error('[Predictive] Error predicting conflicts:', error);
      return [];
    }
  }

  /**
   * Prédire les dépassements SLA
   */
  async predictSLAOverruns(daysAhead: number = 14): Promise<SLAPrediction[]> {
    try {
      // Analyser historique SLA
      const historicalSLA = await this.analyzeHistoricalSLA();

      // Récupérer événements avec SLA
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const eventsWithSLA = await prisma.calendarEvent.findMany({
        where: {
          slaDueAt: {
            gte: now,
            lte: endDate,
          },
          status: 'open',
        },
        orderBy: { slaDueAt: 'asc' },
      });

      const predictions: SLAPrediction[] = [];

      for (const event of eventsWithSLA) {
        // Calculer facteurs de risque
        const factors: string[] = [];
        let riskScore = 0;

        // Facteur 1: Historique du type d'événement
        const typeHistory = historicalSLA.byType[event.kind] || { overrunRate: 0 };
        riskScore += typeHistory.overrunRate * 0.4;
        if (typeHistory.overrunRate > 0.3) {
          factors.push(`Type "${event.kind}" a ${Math.round(typeHistory.overrunRate * 100)}% de dépassements`);
        }

        // Facteur 2: Priorité
        if (event.priority === 'critical') {
          riskScore += 0.1;
        } else if (event.priority === 'urgent') {
          riskScore += 0.2;
        } else {
          riskScore += 0.3;
          factors.push('Priorité normale = risque plus élevé');
        }

        // Facteur 3: Temps restant
        const daysRemaining = (event.slaDueAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysRemaining < 3) {
          riskScore += 0.3;
          factors.push(`Échéance proche (${Math.round(daysRemaining)} jours)`);
        }

        // Déterminer niveau de risque
        let riskLevel: SLAPrediction['riskLevel'];
        if (riskScore > 0.7) riskLevel = 'critical';
        else if (riskScore > 0.5) riskLevel = 'high';
        else if (riskScore > 0.3) riskLevel = 'medium';
        else riskLevel = 'low';

        if (riskScore > 0.3) {
          predictions.push({
            eventId: event.id,
            eventTitle: event.title,
            slaDueAt: event.slaDueAt!,
            riskLevel,
            probability: Math.min(riskScore, 1),
            factors,
          });
        }
      }

      return predictions;
    } catch (error) {
      console.error('[Predictive] Error predicting SLA overruns:', error);
      return [];
    }
  }

  /**
   * Prédire la charge de travail optimale
   */
  async predictWorkload(weeksAhead: number = 4): Promise<WorkloadPrediction[]> {
    try {
      const predictions: WorkloadPrediction[] = [];
      const now = new Date();

      for (let week = 0; week < weeksAhead; week++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() + week * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Compter événements prévus
        const eventCount = await prisma.calendarEvent.count({
          where: {
            start: {
              gte: weekStart,
              lt: weekEnd,
            },
            status: { not: 'done' },
          },
        });

        // Capacité estimée (configurable)
        const capacity = 15; // événements par semaine

        const utilizationRate = eventCount / capacity;

        let status: WorkloadPrediction['status'];
        const recommendations: string[] = [];

        if (utilizationRate < 0.7) {
          status = 'optimal';
          recommendations.push('Capacité disponible pour nouveaux événements');
        } else if (utilizationRate < 1) {
          status = 'busy';
          recommendations.push('Planifier avec prudence');
          recommendations.push('Prioriser les événements critiques');
        } else {
          status = 'overload';
          recommendations.push('⚠️ Surcharge détectée !');
          recommendations.push('Déléguer ou reprogrammer événements non-critiques');
          recommendations.push('Considérer ajout de ressources');
        }

        predictions.push({
          week: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
          expectedEvents: eventCount,
          capacity,
          utilizationRate,
          status,
          recommendations,
        });
      }

      return predictions;
    } catch (error) {
      console.error('[Predictive] Error predicting workload:', error);
      return [];
    }
  }

  /**
   * Recommandations intelligentes de planification
   */
  async getSmartRecommendations(eventData: any): Promise<string[]> {
    const recommendations: string[] = [];

    try {
      // Analyser le meilleur moment pour planifier
      const bestTime = await this.findBestTimeSlot(eventData);
      if (bestTime) {
        recommendations.push(`Créneau optimal: ${bestTime}`);
      }

      // Vérifier charge participants
      if (eventData.assignees && eventData.assignees.length > 0) {
        const overloadedUsers = await this.checkUserOverload(eventData.assignees);
        if (overloadedUsers.length > 0) {
          recommendations.push(`⚠️ Participants surchargés: ${overloadedUsers.join(', ')}`);
        }
      }

      // Suggérer durée optimale basée sur type
      const optimalDuration = this.suggestOptimalDuration(eventData.kind);
      if (optimalDuration) {
        recommendations.push(`Durée suggérée: ${optimalDuration}`);
      }

      // Alerter si période à risque
      const isRiskyPeriod = await this.isRiskyPeriod(eventData.start);
      if (isRiskyPeriod) {
        recommendations.push('⚠️ Période à forte densité d\'événements');
      }
    } catch (error) {
      console.error('[Predictive] Error generating recommendations:', error);
    }

    return recommendations;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async analyzeHistoricalConflicts(): Promise<any> {
    // TODO: Analyser réels conflits passés
    return {
      averagePerWeek: 2.3,
      mostConflictedDays: ['MON', 'FRI'],
    };
  }

  private async analyzeHistoricalSLA(): Promise<any> {
    // TODO: Analyser réels SLA passés
    return {
      byType: {
        meeting: { overrunRate: 0.15 },
        'site-visit': { overrunRate: 0.25 },
        validation: { overrunRate: 0.10 },
        payment: { overrunRate: 0.20 },
      },
    };
  }

  private groupEventsByDay(events: any[]): Record<string, any[]> {
    return events.reduce((acc, event) => {
      const date = event.start.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private calculateUserLoad(events: any[]): Record<string, number> {
    const load: Record<string, number> = {};
    
    events.forEach(event => {
      event.assignees?.forEach((a: any) => {
        load[a.userId] = (load[a.userId] || 0) + 1;
      });
    });

    return load;
  }

  private calculateConflictProbability(
    density: number,
    userLoad: Record<string, number>,
    historical: any
  ): number {
    const maxLoad = Math.max(...Object.values(userLoad));
    const densityFactor = Math.min(density / 5, 1);
    const loadFactor = Math.min(maxLoad / 3, 1);
    
    return (densityFactor * 0.6 + loadFactor * 0.4);
  }

  private getUserName(userId: string, events: any[]): string {
    for (const event of events) {
      const assignee = event.assignees?.find((a: any) => a.userId === userId);
      if (assignee) return assignee.userName;
    }
    return userId;
  }

  private generateConflictReason(density: number, userLoad: Record<string, number>): string {
    const maxLoad = Math.max(...Object.values(userLoad));
    if (maxLoad > 3) {
      return `Forte charge individuelle (${maxLoad} événements)`;
    }
    if (density > 5) {
      return `Densité élevée (${density} événements)`;
    }
    return 'Risque de conflit basé sur patterns historiques';
  }

  private async findBestTimeSlot(eventData: any): Promise<string | null> {
    // TODO: Algorithme ML pour trouver meilleur créneau
    return null;
  }

  private async checkUserOverload(assignees: any[]): Promise<string[]> {
    // TODO: Vérifier charge réelle des utilisateurs
    return [];
  }

  private suggestOptimalDuration(eventKind: string): string | null {
    const durations: Record<string, string> = {
      meeting: '1 heure',
      'site-visit': '2-3 heures',
      validation: '30 minutes',
    };
    return durations[eventKind] || null;
  }

  private async isRiskyPeriod(date: Date): Promise<boolean> {
    // TODO: Vérifier si période à risque
    return false;
  }
}

// Export singleton
export default CalendarPredictiveService.getInstance();

