/**
 * Utilitaires de détection de conflits
 * Détection et résolution de conflits temporels
 */

// ================================
// Types
// ================================

export type ConflictType = 'overlap' | 'resource' | 'location' | 'capacity' | 'dependency';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  eventIds: string[];
  description: string;
  overlappingTime?: {
    start: Date;
    end: Date;
  };
  suggestedResolutions?: Array<{
    type: string;
    description: string;
    priority: number;
  }>;
}

export interface Event {
  id: string;
  start: Date | string;
  end?: Date | string;
  assignees?: string[];
  location?: string;
  resource?: string;
}

// ================================
// Fonctions de détection
// ================================

/**
 * Vérifier si deux événements se chevauchent
 */
function eventsOverlap(event1: Event, event2: Event): boolean {
  const start1 = typeof event1.start === 'string' ? new Date(event1.start) : event1.start;
  const end1 = event1.end 
    ? (typeof event1.end === 'string' ? new Date(event1.end) : event1.end)
    : new Date(start1.getTime() + 3600000); // Par défaut 1h
  const start2 = typeof event2.start === 'string' ? new Date(event2.start) : event2.start;
  const end2 = event2.end
    ? (typeof event2.end === 'string' ? new Date(event2.end) : event2.end)
    : new Date(start2.getTime() + 3600000);

  return start1 < end2 && start2 < end1;
}

/**
 * Détecter les conflits de chevauchement
 */
export function detectOverlapConflicts(events: Event[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];

      if (eventsOverlap(event1, event2)) {
        const start1 = typeof event1.start === 'string' ? new Date(event1.start) : event1.start;
        const end1 = event1.end 
          ? (typeof event1.end === 'string' ? new Date(event1.end) : event1.end)
          : new Date(start1.getTime() + 3600000);
        const start2 = typeof event2.start === 'string' ? new Date(event2.start) : event2.start;
        const end2 = event2.end
          ? (typeof event2.end === 'string' ? new Date(event2.end) : event2.end)
          : new Date(start2.getTime() + 3600000);

        const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
        const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

        conflicts.push({
          id: `conflict-${event1.id}-${event2.id}`,
          type: 'overlap',
          severity: 'high',
          eventIds: [event1.id, event2.id],
          description: `Chevauchement entre "${event1.id}" et "${event2.id}"`,
          overlappingTime: {
            start: overlapStart,
            end: overlapEnd,
          },
          suggestedResolutions: [
            {
              type: 'move',
              description: `Déplacer l'événement ${event2.id}`,
              priority: 1,
            },
            {
              type: 'merge',
              description: 'Fusionner les deux événements',
              priority: 2,
            },
          ],
        });
      }
    }
  }

  return conflicts;
}

/**
 * Détecter les conflits de ressources (assignees)
 */
export function detectResourceConflicts(events: Event[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const byAssignee = new Map<string, Event[]>();

  // Grouper par assignee
  for (const event of events) {
    if (event.assignees) {
      for (const assignee of event.assignees) {
        if (!byAssignee.has(assignee)) {
          byAssignee.set(assignee, []);
        }
        byAssignee.get(assignee)!.push(event);
      }
    }
  }

  // Détecter conflits par assignee
  for (const [assignee, assigneeEvents] of byAssignee.entries()) {
    const overlapConflicts = detectOverlapConflicts(assigneeEvents);
    for (const conflict of overlapConflicts) {
      conflicts.push({
        ...conflict,
        type: 'resource',
        severity: 'critical',
        description: `${assignee} a des activités qui se chevauchent`,
      });
    }
  }

  return conflicts;
}

/**
 * Détecter tous les conflits
 */
export function detectConflicts(events: Event[]): Conflict[] {
  const allConflicts: Conflict[] = [];

  // Conflits de chevauchement
  const overlapConflicts = detectOverlapConflicts(events);
  allConflicts.push(...overlapConflicts);

  // Conflits de ressources
  const resourceConflicts = detectResourceConflicts(events);
  allConflicts.push(...resourceConflicts);

  // Dédupliquer
  const seen = new Set<string>();
  return allConflicts.filter((conflict) => {
    const key = conflict.eventIds.sort().join('-');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Filtrer les événements avec conflits
 */
export function filterEventsWithConflicts(events: Event[]): Event[] {
  const conflicts = detectConflicts(events);
  const conflictedIds = new Set(conflicts.flatMap((c) => c.eventIds));
  return events.filter((e) => conflictedIds.has(e.id));
}

