/**
 * SERVICE D'AUDIT TRAIL COMPLET
 * 
 * Enregistre et gère toutes les actions sur les événements :
 * - Création, modification, suppression
 * - Changements de participants
 * - Changements de statut
 * - Exports et consultations
 * - Avec horodatage et acteur
 */

import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

// ============================================
// TYPES
// ============================================

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'RESCHEDULED'
  | 'PARTICIPANT_ADDED'
  | 'PARTICIPANT_REMOVED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'VIEWED'
  | 'EXPORTED'
  | 'COMMENTED'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVED'
  | 'SLA_WARNING'
  | 'SLA_OVERDUE'
  | 'RECURRENCE_CREATED'
  | 'EXCEPTION_ADDED';

export interface AuditEntry {
  id?: string;
  eventId: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  details?: any;
  createdAt?: Date;
}

export interface AuditSearchParams {
  eventId?: string;
  actorId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// ============================================
// SERVICE D'AUDIT
// ============================================

export class CalendarAuditService {
  private static instance: CalendarAuditService;

  private constructor() {}

  public static getInstance(): CalendarAuditService {
    if (!this.instance) {
      this.instance = new CalendarAuditService();
    }
    return this.instance;
  }

  /**
   * Enregistrer une entrée d'audit
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.calendarEventAudit.create({
        data: {
          eventId: entry.eventId,
          action: entry.action,
          actorId: entry.actorId,
          actorName: entry.actorName,
          details: entry.details ? JSON.stringify(entry.details) : null,
        },
      });
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  }

  /**
   * Enregistrer une création
   */
  async logCreated(
    eventId: string,
    actorId: string,
    actorName: string,
    eventData: any
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'CREATED',
      actorId,
      actorName,
      details: {
        title: eventData.title,
        kind: eventData.kind,
        start: eventData.start,
        end: eventData.end,
        priority: eventData.priority,
        bureau: eventData.bureau,
      },
    });
  }

  /**
   * Enregistrer une mise à jour
   */
  async logUpdated(
    eventId: string,
    actorId: string,
    actorName: string,
    changes: Record<string, { old: any; new: any }>
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'UPDATED',
      actorId,
      actorName,
      details: { changes },
    });
  }

  /**
   * Enregistrer une reprogrammation
   */
  async logRescheduled(
    eventId: string,
    actorId: string,
    actorName: string,
    oldStart: Date,
    oldEnd: Date,
    newStart: Date,
    newEnd: Date,
    reason?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'RESCHEDULED',
      actorId,
      actorName,
      details: {
        oldStart: oldStart.toISOString(),
        oldEnd: oldEnd.toISOString(),
        newStart: newStart.toISOString(),
        newEnd: newEnd.toISOString(),
        reason,
      },
    });
  }

  /**
   * Enregistrer une annulation
   */
  async logCancelled(
    eventId: string,
    actorId: string,
    actorName: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'CANCELLED',
      actorId,
      actorName,
      details: { reason },
    });
  }

  /**
   * Enregistrer une suppression
   */
  async logDeleted(
    eventId: string,
    actorId: string,
    actorName: string,
    eventData: any,
    reason?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'DELETED',
      actorId,
      actorName,
      details: {
        title: eventData.title,
        start: eventData.start,
        reason,
      },
    });
  }

  /**
   * Enregistrer une complétion
   */
  async logCompleted(
    eventId: string,
    actorId: string,
    actorName: string,
    notes?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'COMPLETED',
      actorId,
      actorName,
      details: { notes },
    });
  }

  /**
   * Enregistrer l'ajout d'un participant
   */
  async logParticipantAdded(
    eventId: string,
    actorId: string,
    actorName: string,
    participantId: string,
    participantName: string,
    role?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'PARTICIPANT_ADDED',
      actorId,
      actorName,
      details: {
        participantId,
        participantName,
        role,
      },
    });
  }

  /**
   * Enregistrer le retrait d'un participant
   */
  async logParticipantRemoved(
    eventId: string,
    actorId: string,
    actorName: string,
    participantId: string,
    participantName: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'PARTICIPANT_REMOVED',
      actorId,
      actorName,
      details: {
        participantId,
        participantName,
        reason,
      },
    });
  }

  /**
   * Enregistrer un changement de statut
   */
  async logStatusChanged(
    eventId: string,
    actorId: string,
    actorName: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'STATUS_CHANGED',
      actorId,
      actorName,
      details: {
        oldStatus,
        newStatus,
      },
    });
  }

  /**
   * Enregistrer un changement de priorité
   */
  async logPriorityChanged(
    eventId: string,
    actorId: string,
    actorName: string,
    oldPriority: string,
    newPriority: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'PRIORITY_CHANGED',
      actorId,
      actorName,
      details: {
        oldPriority,
        newPriority,
      },
    });
  }

  /**
   * Enregistrer une consultation
   */
  async logViewed(
    eventId: string,
    actorId: string,
    actorName: string
  ): Promise<void> {
    // Pour les consultations, on peut limiter la fréquence pour éviter le spam
    // Par exemple: ne logger qu'une fois par utilisateur par événement par heure
    await this.log({
      eventId,
      action: 'VIEWED',
      actorId,
      actorName,
    });
  }

  /**
   * Enregistrer un export
   */
  async logExported(
    eventId: string,
    actorId: string,
    actorName: string,
    format: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'EXPORTED',
      actorId,
      actorName,
      details: { format },
    });
  }

  /**
   * Enregistrer un commentaire
   */
  async logCommented(
    eventId: string,
    actorId: string,
    actorName: string,
    comment: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'COMMENTED',
      actorId,
      actorName,
      details: {
        comment: comment.substring(0, 200), // Limiter la taille
      },
    });
  }

  /**
   * Enregistrer la détection d'un conflit
   */
  async logConflictDetected(
    eventId: string,
    conflictingEventId: string,
    conflictDetails: any
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'CONFLICT_DETECTED',
      actorId: 'SYSTEM',
      actorName: 'Système',
      details: {
        conflictingEventId,
        ...conflictDetails,
      },
    });
  }

  /**
   * Enregistrer la résolution d'un conflit
   */
  async logConflictResolved(
    eventId: string,
    actorId: string,
    actorName: string,
    resolution: string
  ): Promise<void> {
    await this.log({
      eventId,
      action: 'CONFLICT_RESOLVED',
      actorId,
      actorName,
      details: { resolution },
    });
  }

  /**
   * Enregistrer un avertissement SLA
   */
  async logSLAWarning(eventId: string, slaDetails: any): Promise<void> {
    await this.log({
      eventId,
      action: 'SLA_WARNING',
      actorId: 'SYSTEM',
      actorName: 'Système',
      details: slaDetails,
    });
  }

  /**
   * Enregistrer un dépassement SLA
   */
  async logSLAOverdue(eventId: string, slaDetails: any): Promise<void> {
    await this.log({
      eventId,
      action: 'SLA_OVERDUE',
      actorId: 'SYSTEM',
      actorName: 'Système',
      details: slaDetails,
    });
  }

  /**
   * Récupérer l'historique d'audit
   */
  async getHistory(params: AuditSearchParams): Promise<any[]> {
    const where: any = {};

    if (params.eventId) where.eventId = params.eventId;
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = params.action;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const entries = await prisma.calendarEventAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 100,
    });

    return entries.map(entry => ({
      ...entry,
      details: entry.details ? JSON.parse(entry.details) : null,
    }));
  }

  /**
   * Obtenir l'historique complet d'un événement
   */
  async getEventHistory(eventId: string): Promise<any[]> {
    return this.getHistory({ eventId });
  }

  /**
   * Obtenir les actions d'un utilisateur
   */
  async getUserActions(actorId: string, limit: number = 50): Promise<any[]> {
    return this.getHistory({ actorId, limit });
  }

  /**
   * Générer un rapport d'audit
   */
  async generateReport(params: {
    startDate: Date;
    endDate: Date;
    bureau?: string;
    actorId?: string;
  }): Promise<any> {
    const entries = await this.getHistory({
      startDate: params.startDate,
      endDate: params.endDate,
      actorId: params.actorId,
    });

    // Grouper par action
    const byAction = entries.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Grouper par acteur
    const byActor = entries.reduce((acc, entry) => {
      if (!acc[entry.actorId]) {
        acc[entry.actorId] = {
          id: entry.actorId,
          name: entry.actorName,
          count: 0,
        };
      }
      acc[entry.actorId].count++;
      return acc;
    }, {} as Record<string, any>);

    // Top acteurs
    const topActors = Object.values(byActor)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    return {
      period: {
        start: params.startDate.toISOString(),
        end: params.endDate.toISOString(),
      },
      totalEntries: entries.length,
      byAction,
      topActors,
      entries: entries.slice(0, 100), // Limiter pour le rapport
    };
  }

  /**
   * Comparer deux versions d'un événement
   */
  async compareVersions(eventId: string, timestamp1: Date, timestamp2: Date): Promise<any> {
    const entries = await prisma.calendarEventAudit.findMany({
      where: {
        eventId,
        createdAt: {
          gte: timestamp1,
          lte: timestamp2,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const changes: any[] = [];

    for (const entry of entries) {
      if (entry.action === 'UPDATED' || entry.action === 'RESCHEDULED') {
        const details = entry.details ? JSON.parse(entry.details) : {};
        changes.push({
          timestamp: entry.createdAt,
          actor: entry.actorName,
          action: entry.action,
          changes: details.changes || details,
        });
      }
    }

    return changes;
  }

  /**
   * Obtenir les statistiques d'audit
   */
  async getStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    bureau?: string;
  }): Promise<any> {
    const where: any = {};

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [total, byAction, recentActions] = await Promise.all([
      prisma.calendarEventAudit.count({ where }),
      
      prisma.calendarEventAudit.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      
      prisma.calendarEventAudit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      total,
      byAction: byAction.reduce((acc, curr) => {
        acc[curr.action] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      recentActions: recentActions.map(action => ({
        ...action,
        details: action.details ? JSON.parse(action.details) : null,
      })),
    };
  }
}

// Export singleton
export default CalendarAuditService.getInstance();

