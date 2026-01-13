/**
 * SERVICE DE DÉTECTION AVANCÉE DE CONFLITS
 * 
 * Détecte et analyse différents types de conflits :
 * - Conflits de planning (personnes au même moment)
 * - Conflits de ressources (salles, équipements)
 * - Conflits de localisation
 * - Conflits de budget
 * - Conflits de dépendances
 * 
 * Propose des résolutions intelligentes
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export type ConflictType = 
  | 'scheduling'    // Personne à deux endroits
  | 'resource'      // Équipement indisponible
  | 'location'      // Salle occupée
  | 'budget'        // Dépassement budget
  | 'dependency'    // Événement dépendant non respecté
  | 'capacity'      // Capacité salle dépassée
  | 'authorization';// Personne non autorisée

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ConflictDetails {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  event1: any;
  event2?: any; // Pour conflits impliquant 2 événements
  description: string;
  impact: string;
  affectedUsers: Array<{
    id: string;
    name: string;
  }>;
  overlappingTime?: {
    start: Date;
    end: Date;
    durationMinutes: number;
  };
  suggestedResolutions: Array<{
    type: string;
    description: string;
    priority: number;
    estimatedEffort: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: ConflictDetails[];
  warnings: string[];
  canProceed: boolean;
}

// ============================================
// SERVICE DE DÉTECTION
// ============================================

export class CalendarConflictService {
  private static instance: CalendarConflictService;

  private constructor() {}

  public static getInstance(): CalendarConflictService {
    if (!this.instance) {
      this.instance = new CalendarConflictService();
    }
    return this.instance;
  }

  /**
   * Vérifier tous les conflits pour un nouvel événement
   */
  async checkNewEvent(eventData: any): Promise<ConflictCheckResult> {
    const conflicts: ConflictDetails[] = [];
    const warnings: string[] = [];

    // Vérifier conflits de planning
    const schedulingConflicts = await this.detectSchedulingConflicts(eventData);
    conflicts.push(...schedulingConflicts);

    // Vérifier conflits de ressources
    const resourceConflicts = await this.detectResourceConflicts(eventData);
    conflicts.push(...resourceConflicts);

    // Vérifier conflits de localisation
    const locationConflicts = await this.detectLocationConflicts(eventData);
    conflicts.push(...locationConflicts);

    // Vérifier budget
    const budgetConflicts = await this.detectBudgetConflicts(eventData);
    conflicts.push(...budgetConflicts);

    // Vérifier capacité
    if (eventData.location) {
      const capacityConflicts = await this.detectCapacityConflicts(eventData);
      conflicts.push(...capacityConflicts);
    }

    // Vérifier autorisations
    if (eventData.bureau) {
      const authConflicts = await this.detectAuthorizationConflicts(eventData);
      conflicts.push(...authConflicts);
    }

    // Déterminer si on peut procéder
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    const canProceed = criticalConflicts.length === 0;

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      warnings,
      canProceed,
    };
  }

  /**
   * Détecter conflits de planning (personnes au même moment)
   */
  private async detectSchedulingConflicts(eventData: any): Promise<ConflictDetails[]> {
    if (!eventData.assignees || eventData.assignees.length === 0) {
      return [];
    }

    const conflicts: ConflictDetails[] = [];
    const userIds = eventData.assignees.map((a: any) => a.id || a.userId);

    // Trouver événements chevauchants avec participants communs
    const overlappingEvents = await prisma.calendarEvent.findMany({
      where: {
        AND: [
          { status: { not: 'done' } },
          { id: { not: eventData.id || 'new' } },
          {
            OR: [
              {
                start: {
                  lt: new Date(eventData.end),
                  gte: new Date(eventData.start),
                },
              },
              {
                end: {
                  gt: new Date(eventData.start),
                  lte: new Date(eventData.end),
                },
              },
              {
                AND: [
                  { start: { lte: new Date(eventData.start) } },
                  { end: { gte: new Date(eventData.end) } },
                ],
              },
            ],
          },
          {
            assignees: {
              some: {
                userId: { in: userIds },
              },
            },
          },
        ],
      },
      include: {
        assignees: true,
      },
    });

    for (const event of overlappingEvents) {
      const sharedUsers = event.assignees.filter(a => userIds.includes(a.userId));

      if (sharedUsers.length > 0) {
        const overlapStart = new Date(Math.max(
          new Date(eventData.start).getTime(),
          event.start.getTime()
        ));
        const overlapEnd = new Date(Math.min(
          new Date(eventData.end).getTime(),
          event.end.getTime()
        ));
        const durationMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);

        const severity = this.calculateSchedulingConflictSeverity(
          durationMinutes,
          sharedUsers.length,
          eventData.priority,
          event.priority
        );

        conflicts.push({
          id: `sched-${event.id}`,
          type: 'scheduling',
          severity,
          event1: eventData,
          event2: event,
          description: `Conflit de planning avec "${event.title}"`,
          impact: `${sharedUsers.map(u => u.userName).join(', ')} ${sharedUsers.length > 1 ? 'sont attendus' : 'est attendu'} à deux événements simultanément`,
          affectedUsers: sharedUsers.map(u => ({
            id: u.userId,
            name: u.userName,
          })),
          overlappingTime: {
            start: overlapStart,
            end: overlapEnd,
            durationMinutes,
          },
          suggestedResolutions: this.generateSchedulingResolutions(
            eventData,
            event,
            sharedUsers,
            durationMinutes
          ),
        });
      }
    }

    return conflicts;
  }

  /**
   * Détecter conflits de ressources (équipement)
   */
  private async detectResourceConflicts(eventData: any): Promise<ConflictDetails[]> {
    if (!eventData.equipment) {
      return [];
    }

    const conflicts: ConflictDetails[] = [];

    // Trouver événements utilisant le même équipement au même moment
    const overlappingEvents = await prisma.calendarEvent.findMany({
      where: {
        AND: [
          { status: { not: 'done' } },
          { id: { not: eventData.id || 'new' } },
          { equipment: eventData.equipment },
          {
            OR: [
              {
                start: {
                  lt: new Date(eventData.end),
                  gte: new Date(eventData.start),
                },
              },
              {
                end: {
                  gt: new Date(eventData.start),
                  lte: new Date(eventData.end),
                },
              },
            ],
          },
        ],
      },
    });

    for (const event of overlappingEvents) {
      conflicts.push({
        id: `res-${event.id}`,
        type: 'resource',
        severity: 'high',
        event1: eventData,
        event2: event,
        description: `Équipement "${eventData.equipment}" déjà réservé`,
        impact: `L'équipement est utilisé par "${event.title}"`,
        affectedUsers: [],
        suggestedResolutions: [
          {
            type: 'reschedule',
            description: 'Reprogrammer l\'un des événements',
            priority: 1,
            estimatedEffort: 'Faible',
          },
          {
            type: 'alternative',
            description: 'Trouver un équipement alternatif',
            priority: 2,
            estimatedEffort: 'Moyen',
          },
        ],
      });
    }

    return conflicts;
  }

  /**
   * Détecter conflits de localisation (salle occupée)
   */
  private async detectLocationConflicts(eventData: any): Promise<ConflictDetails[]> {
    if (!eventData.location) {
      return [];
    }

    const conflicts: ConflictDetails[] = [];

    // Trouver événements au même lieu au même moment
    const overlappingEvents = await prisma.calendarEvent.findMany({
      where: {
        AND: [
          { status: { not: 'done' } },
          { id: { not: eventData.id || 'new' } },
          { location: eventData.location },
          {
            OR: [
              {
                start: {
                  lt: new Date(eventData.end),
                  gte: new Date(eventData.start),
                },
              },
              {
                end: {
                  gt: new Date(eventData.start),
                  lte: new Date(eventData.end),
                },
              },
            ],
          },
        ],
      },
    });

    for (const event of overlappingEvents) {
      conflicts.push({
        id: `loc-${event.id}`,
        type: 'location',
        severity: 'high',
        event1: eventData,
        event2: event,
        description: `Lieu "${eventData.location}" déjà réservé`,
        impact: `Le lieu est utilisé par "${event.title}"`,
        affectedUsers: [],
        suggestedResolutions: [
          {
            type: 'reschedule',
            description: 'Reprogrammer l\'événement',
            priority: 1,
            estimatedEffort: 'Faible',
          },
          {
            type: 'location',
            description: 'Changer de lieu',
            priority: 2,
            estimatedEffort: 'Moyen',
          },
        ],
      });
    }

    return conflicts;
  }

  /**
   * Détecter conflits de budget
   */
  private async detectBudgetConflicts(eventData: any): Promise<ConflictDetails[]> {
    if (!eventData.budget || !eventData.bureau) {
      return [];
    }

    const conflicts: ConflictDetails[] = [];

    // Calculer budget utilisé ce mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyEvents = await prisma.calendarEvent.findMany({
      where: {
        bureau: eventData.bureau,
        start: {
          gte: monthStart,
          lte: monthEnd,
        },
        budget: { not: null },
      },
      select: {
        budget: true,
      },
    });

    const totalSpent = monthlyEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
    const projectedTotal = totalSpent + eventData.budget;

    // Budget limite (exemple: 50M XOF/mois)
    const budgetLimit = 50000000;

    if (projectedTotal > budgetLimit) {
      conflicts.push({
        id: `bud-${eventData.bureau}`,
        type: 'budget',
        severity: 'high',
        event1: eventData,
        description: 'Dépassement de budget mensuel',
        impact: `Budget mensuel dépassé de ${((projectedTotal - budgetLimit) / 1000000).toFixed(2)}M XOF`,
        affectedUsers: [],
        suggestedResolutions: [
          {
            type: 'approval',
            description: 'Obtenir une approbation spéciale',
            priority: 1,
            estimatedEffort: 'Moyen',
          },
          {
            type: 'reduce',
            description: 'Réduire le budget de l\'événement',
            priority: 2,
            estimatedEffort: 'Faible',
          },
          {
            type: 'postpone',
            description: 'Reporter au mois suivant',
            priority: 3,
            estimatedEffort: 'Faible',
          },
        ],
        metadata: {
          currentSpent: totalSpent,
          limit: budgetLimit,
          requested: eventData.budget,
          overflow: projectedTotal - budgetLimit,
        },
      });
    }

    return conflicts;
  }

  /**
   * Détecter conflits de capacité (salle)
   */
  private async detectCapacityConflicts(eventData: any): Promise<ConflictDetails[]> {
    if (!eventData.assignees || eventData.assignees.length === 0 || !eventData.location) {
      return [];
    }

    const conflicts: ConflictDetails[] = [];

    // Exemple: récupérer capacité de la salle (ici hardcodé, devrait venir d'une DB)
    const roomCapacities: Record<string, number> = {
      'Salle de réunion A': 10,
      'Salle de réunion B': 20,
      'Auditorium': 100,
    };

    const capacity = roomCapacities[eventData.location];
    const attendeeCount = eventData.assignees.length;

    if (capacity && attendeeCount > capacity) {
      conflicts.push({
        id: `cap-${eventData.location}`,
        type: 'capacity',
        severity: 'medium',
        event1: eventData,
        description: 'Capacité de la salle dépassée',
        impact: `${attendeeCount} participants pour une capacité de ${capacity}`,
        affectedUsers: [],
        suggestedResolutions: [
          {
            type: 'location',
            description: 'Choisir une salle plus grande',
            priority: 1,
            estimatedEffort: 'Faible',
          },
          {
            type: 'reduce',
            description: 'Réduire le nombre de participants',
            priority: 2,
            estimatedEffort: 'Moyen',
          },
        ],
        metadata: {
          capacity,
          attendeeCount,
          overflow: attendeeCount - capacity,
        },
      });
    }

    return conflicts;
  }

  /**
   * Détecter conflits d'autorisation
   */
  private async detectAuthorizationConflicts(eventData: any): Promise<ConflictDetails[]> {
    // TODO: Vérifier si les participants ont accès au bureau/projet
    return [];
  }

  /**
   * Calculer la sévérité d'un conflit de planning
   */
  private calculateSchedulingConflictSeverity(
    durationMinutes: number,
    userCount: number,
    priority1: string,
    priority2: string
  ): ConflictSeverity {
    // Conflit critique si:
    // - Plus de 60 minutes de chevauchement
    // - Au moins un événement est critique
    // - Plus de 3 personnes concernées
    if (
      durationMinutes > 60 ||
      priority1 === 'critical' ||
      priority2 === 'critical' ||
      userCount > 3
    ) {
      return 'critical';
    }

    // Conflit élevé si:
    // - 30-60 minutes
    // - Au moins un événement est urgent
    // - Plus de 2 personnes
    if (
      durationMinutes > 30 ||
      priority1 === 'urgent' ||
      priority2 === 'urgent' ||
      userCount > 2
    ) {
      return 'high';
    }

    // Conflit moyen si:
    // - 15-30 minutes
    // - Plusieurs personnes
    if (durationMinutes > 15 || userCount > 1) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Générer résolutions pour conflits de planning
   */
  private generateSchedulingResolutions(
    event1: any,
    event2: any,
    sharedUsers: any[],
    durationMinutes: number
  ): Array<any> {
    const resolutions: any[] = [];

    // Décalage léger si conflit court
    if (durationMinutes < 30) {
      resolutions.push({
        type: 'shift',
        description: `Décaler l'un des événements de ${Math.ceil(durationMinutes)} minutes`,
        priority: 1,
        estimatedEffort: 'Très faible',
      });
    }

    // Reprogrammation basée sur priorité
    if (event1.priority !== 'critical' || event2.priority !== 'critical') {
      const lowerPriorityEvent = event1.priority === 'normal' ? event1 : event2;
      resolutions.push({
        type: 'reschedule',
        description: `Reprogrammer "${lowerPriorityEvent.title}" (priorité moindre)`,
        priority: 2,
        estimatedEffort: 'Faible',
      });
    }

    // Délégation
    if (sharedUsers.length < 3) {
      resolutions.push({
        type: 'delegate',
        description: 'Déléguer la participation d\'un événement à quelqu\'un d\'autre',
        priority: 3,
        estimatedEffort: 'Moyen',
      });
    }

    // Événement virtuel
    resolutions.push({
      type: 'virtual',
      description: 'Rendre l\'un des événements virtuel (visio)',
      priority: 4,
      estimatedEffort: 'Faible',
    });

    return resolutions;
  }

  /**
   * Obtenir tous les conflits actuels
   */
  async getAllConflicts(params?: {
    bureau?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ConflictDetails[]> {
    const where: any = {
      status: { not: 'done' },
    };

    if (params?.bureau) where.bureau = params.bureau;
    if (params?.startDate || params?.endDate) {
      where.start = {};
      if (params.startDate) where.start.gte = params.startDate;
      if (params.endDate) where.start.lte = params.endDate;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: { assignees: true },
      orderBy: { start: 'asc' },
    });

    const allConflicts: ConflictDetails[] = [];

    // Vérifier chaque événement
    for (const event of events) {
      const result = await this.checkNewEvent(event);
      allConflicts.push(...result.conflicts);
    }

    // Dédupliquer (un conflit entre A et B est le même que entre B et A)
    const uniqueConflicts = allConflicts.filter((conflict, index, self) =>
      index === self.findIndex(c => 
        c.id === conflict.id ||
        (c.event2 && conflict.event2 && 
         ((c.event1.id === conflict.event2.id && c.event2.id === conflict.event1.id)))
      )
    );

    return uniqueConflicts;
  }
}

// Export singleton
export default CalendarConflictService.getInstance();

