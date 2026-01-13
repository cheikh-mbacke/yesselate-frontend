/**
 * Système de timeline et d'historique enrichi pour les délégations
 * Trace complète de tous les événements et actions
 */

export type EventType =
  | 'created'
  | 'modified'
  | 'extended'
  | 'suspended'
  | 'reactivated'
  | 'revoked'
  | 'expired'
  | 'used'
  | 'transferred'
  | 'validated'
  | 'rejected'
  | 'replaced'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'alert_triggered'
  | 'backup_assigned'
  | 'comment_added'
  | 'document_attached'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_denied';

export interface TimelineEvent {
  id: string;
  delegationId: string;
  type: EventType;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    role?: string;
  };
  action: string;
  description: string;
  details?: Record<string, any>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    context?: Record<string, any>;
  };
  tags?: string[];
  relatedEvents?: string[]; // IDs d'événements liés
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

export interface AuditTrail {
  delegationId: string;
  events: TimelineEvent[];
  summary: {
    totalEvents: number;
    firstEvent: Date;
    lastEvent: Date;
    uniqueActors: number;
    majorChanges: number;
  };
  compliance: {
    complete: boolean;
    issues: string[];
  };
}

export interface ChangeSnapshot {
  eventId: string;
  timestamp: Date;
  before: any;
  after: any;
  changedFields: string[];
  actor: string;
}

/**
 * Gestionnaire de timeline et d'historique
 */
export class TimelineManager {
  private events: Map<string, TimelineEvent[]> = new Map();
  private snapshots: Map<string, ChangeSnapshot[]> = new Map();

  /**
   * Enregistrer un événement
   */
  public recordEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>): TimelineEvent {
    const fullEvent: TimelineEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    const delegationEvents = this.events.get(event.delegationId) || [];
    delegationEvents.push(fullEvent);
    this.events.set(event.delegationId, delegationEvents);

    return fullEvent;
  }

  /**
   * Enregistrer un changement avec snapshot
   */
  public recordChange(
    delegationId: string,
    before: any,
    after: any,
    actor: string
  ): ChangeSnapshot {
    const changedFields = this.getChangedFields(before, after);

    const event = this.recordEvent({
      delegationId,
      type: 'modified',
      actor: { id: actor, name: actor },
      action: 'Modification',
      description: `${changedFields.length} champ(s) modifié(s): ${changedFields.join(', ')}`,
      details: {
        changes: changedFields.map(field => ({
          field,
          before: before[field],
          after: after[field],
        })),
      },
    });

    const snapshot: ChangeSnapshot = {
      eventId: event.id,
      timestamp: event.timestamp,
      before,
      after,
      changedFields,
      actor,
    };

    const delegationSnapshots = this.snapshots.get(delegationId) || [];
    delegationSnapshots.push(snapshot);
    this.snapshots.set(delegationId, delegationSnapshots);

    return snapshot;
  }

  /**
   * Obtenir la timeline complète d'une délégation
   */
  public getTimeline(delegationId: string): TimelineEvent[] {
    const events = this.events.get(delegationId) || [];
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtenir la timeline filtrée
   */
  public getFilteredTimeline(
    delegationId: string,
    filters: {
      types?: EventType[];
      actors?: string[];
      startDate?: Date;
      endDate?: Date;
      tags?: string[];
    }
  ): TimelineEvent[] {
    let events = this.getTimeline(delegationId);

    if (filters.types) {
      events = events.filter(e => filters.types!.includes(e.type));
    }

    if (filters.actors) {
      events = events.filter(e => filters.actors!.includes(e.actor.id));
    }

    if (filters.startDate) {
      events = events.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      events = events.filter(e => e.timestamp <= filters.endDate!);
    }

    if (filters.tags) {
      events = events.filter(e => e.tags?.some(tag => filters.tags!.includes(tag)));
    }

    return events;
  }

  /**
   * Obtenir l'historique d'audit complet
   */
  public getAuditTrail(delegationId: string): AuditTrail {
    const events = this.getTimeline(delegationId);

    const uniqueActors = new Set(events.map(e => e.actor.id)).size;
    const majorChanges = events.filter(e =>
      ['modified', 'extended', 'suspended', 'revoked', 'transferred'].includes(e.type)
    ).length;

    const summary = {
      totalEvents: events.length,
      firstEvent: events[events.length - 1]?.timestamp || new Date(),
      lastEvent: events[0]?.timestamp || new Date(),
      uniqueActors,
      majorChanges,
    };

    const compliance = this.checkCompliance(delegationId, events);

    return {
      delegationId,
      events,
      summary,
      compliance,
    };
  }

  /**
   * Obtenir l'historique des changements
   */
  public getChangeHistory(delegationId: string): ChangeSnapshot[] {
    const snapshots = this.snapshots.get(delegationId) || [];
    return snapshots.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Restaurer une version antérieure
   */
  public async restoreVersion(delegationId: string, snapshotEventId: string): Promise<any> {
    const snapshots = this.snapshots.get(delegationId) || [];
    const snapshot = snapshots.find(s => s.eventId === snapshotEventId);

    if (!snapshot) {
      throw new Error('Snapshot not found');
    }

    // Logique de restauration
    console.log(`Restoring delegation ${delegationId} to version ${snapshotEventId}`);

    this.recordEvent({
      delegationId,
      type: 'modified',
      actor: { id: 'system', name: 'System' },
      action: 'Restauration',
      description: `Version restaurée du ${snapshot.timestamp.toLocaleString()}`,
      details: {
        restoredFrom: snapshotEventId,
        restoredData: snapshot.before,
      },
      tags: ['restoration'],
    });

    return snapshot.before;
  }

  /**
   * Comparer deux versions
   */
  public compareVersions(
    delegationId: string,
    eventId1: string,
    eventId2: string
  ): {
    changes: Array<{
      field: string;
      from: any;
      to: any;
    }>;
    actor: string;
    timestamp: Date;
  } | null {
    const snapshots = this.snapshots.get(delegationId) || [];
    const snapshot1 = snapshots.find(s => s.eventId === eventId1);
    const snapshot2 = snapshots.find(s => s.eventId === eventId2);

    if (!snapshot1 || !snapshot2) {
      return null;
    }

    const changes = this.getDetailedChanges(snapshot1.after, snapshot2.after);

    return {
      changes,
      actor: snapshot2.actor,
      timestamp: snapshot2.timestamp,
    };
  }

  /**
   * Obtenir les statistiques d'activité
   */
  public getActivityStats(delegationId: string, period: 'day' | 'week' | 'month' | 'year') {
    const events = this.getTimeline(delegationId);
    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodEvents = events.filter(e => e.timestamp >= cutoffDate);

    const byType = periodEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byActor = periodEvents.reduce((acc, e) => {
      acc[e.actor.name] = (acc[e.actor.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      totalEvents: periodEvents.length,
      byType,
      byActor,
      mostActive: Object.entries(byActor).sort(([, a], [, b]) => b - a)[0],
    };
  }

  /**
   * Générer un résumé d'activité
   */
  public generateActivitySummary(delegationId: string): string {
    const events = this.getTimeline(delegationId);

    if (events.length === 0) {
      return 'Aucune activité enregistrée';
    }

    const lastEvent = events[0];
    const majorEvents = events.filter(e =>
      ['created', 'modified', 'extended', 'suspended', 'revoked'].includes(e.type)
    );

    return `Dernière activité: ${lastEvent.action} par ${lastEvent.actor.name} le ${lastEvent.timestamp.toLocaleDateString()}. ${majorEvents.length} événement(s) majeur(s) enregistré(s).`;
  }

  /**
   * Exporter la timeline en format CSV
   */
  public exportToCSV(delegationId: string): string {
    const events = this.getTimeline(delegationId);

    let csv = 'Date,Type,Action,Acteur,Description\n';

    for (const event of events) {
      csv += `"${event.timestamp.toISOString()}","${event.type}","${event.action}","${event.actor.name}","${event.description}"\n`;
    }

    return csv;
  }

  /**
   * Exporter la timeline en format JSON
   */
  public exportToJSON(delegationId: string): string {
    const auditTrail = this.getAuditTrail(delegationId);
    return JSON.stringify(auditTrail, null, 2);
  }

  // Méthodes utilitaires privées
  private getChangedFields(before: any, after: any): string[] {
    const changed: string[] = [];

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(key);
      }
    }

    return changed;
  }

  private getDetailedChanges(
    before: any,
    after: any
  ): Array<{ field: string; from: any; to: any }> {
    const changed = this.getChangedFields(before, after);

    return changed.map(field => ({
      field,
      from: before[field],
      to: after[field],
    }));
  }

  private checkCompliance(delegationId: string, events: TimelineEvent[]) {
    const issues: string[] = [];

    // Vérifier que tous les événements majeurs sont documentés
    const majorEvents = events.filter(e =>
      ['suspended', 'revoked', 'transferred'].includes(e.type)
    );

    for (const event of majorEvents) {
      if (!event.details || Object.keys(event.details).length === 0) {
        issues.push(`Événement ${event.type} du ${event.timestamp.toLocaleDateString()} sans détails`);
      }
    }

    return {
      complete: issues.length === 0,
      issues,
    };
  }
}

/**
 * Instance singleton du gestionnaire de timeline
 */
export const timelineManager = new TimelineManager();

