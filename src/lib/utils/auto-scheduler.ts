// ============================================
// Auto-scheduling intelligent
// ============================================

export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  kind: string;
  bureau?: string;
  assignees?: { id: string; name: string }[];
  start: string;
  end: string;
  priority: string;
  severity: string;
  status: string;
  linkedTo?: { type: string; id: string; label?: string };
  slaDueAt?: string;
  project?: string;
  originalSource?: string;
}

export interface SchedulingScenario {
  id: string;
  name: string;
  score: number;
  changes: Array<{
    itemId: string;
    oldStart: string;
    newStart: string;
    newEnd: string;
    reason: string;
  }>;
  conflictsResolved: number;
  loadBalanced: boolean;
}

/**
 * Génère des scénarios d'optimisation automatique
 */
export function generateSchedulingScenarios(
  items: CalendarItem[],
  conflicts: Set<string>,
  load: Record<string, Record<string, { minutes: number; items: CalendarItem[] }>>,
  capacityByBureau: Record<string, number>
): SchedulingScenario[] {
  const scenarios: SchedulingScenario[] = [];

  // Scénario 1 : Résoudre tous les conflits
  const scenario1 = resolveConflicts(items, conflicts);
  if (scenario1.changes.length > 0) {
    scenarios.push({
      id: 'resolve-conflicts',
      name: 'Résoudre tous les conflits',
      score: calculateScore(scenario1, items, conflicts, load, capacityByBureau),
      ...scenario1,
    });
  }

  // Scénario 2 : Équilibrer la charge
  const scenario2 = balanceLoad(items, load, capacityByBureau);
  if (scenario2.changes.length > 0) {
    scenarios.push({
      id: 'balance-load',
      name: 'Équilibrer la charge',
      score: calculateScore(scenario2, items, conflicts, load, capacityByBureau),
      ...scenario2,
    });
  }

  // Scénario 3 : Optimiser les SLA
  const scenario3 = optimizeSLA(items);
  if (scenario3.changes.length > 0) {
    scenarios.push({
      id: 'optimize-sla',
      name: 'Optimiser les SLA',
      score: calculateScore(scenario3, items, conflicts, load, capacityByBureau),
      ...scenario3,
    });
  }

  // Scénario 4 : Combiné (meilleur compromis)
  const scenario4 = combinedOptimization(items, conflicts, load, capacityByBureau);
  if (scenario4.changes.length > 0) {
    scenarios.push({
      id: 'combined',
      name: 'Optimisation combinée (recommandé)',
      score: calculateScore(scenario4, items, conflicts, load, capacityByBureau),
      ...scenario4,
    });
  }

  return scenarios.sort((a, b) => b.score - a.score);
}

function resolveConflicts(
  items: CalendarItem[],
  conflicts: Set<string>
): Omit<SchedulingScenario, 'id' | 'name' | 'score'> {
  const changes: SchedulingScenario['changes'] = [];
  const conflictItems = items.filter((it) => conflicts.has(it.id));

  for (const item of conflictItems) {
    // Chercher un créneau libre dans les 7 prochains jours
    const newSlot = findFreeSlot(item, items, 7);
    if (newSlot) {
      changes.push({
        itemId: item.id,
        oldStart: item.start,
        newStart: newSlot.start,
        newEnd: newSlot.end,
        reason: 'Résolution de conflit',
      });
    }
  }

  return {
    changes,
    conflictsResolved: changes.length,
    loadBalanced: false,
  };
}

function balanceLoad(
  items: CalendarItem[],
  load: Record<string, Record<string, { minutes: number; items: CalendarItem[] }>>,
  capacityByBureau: Record<string, number>
): Omit<SchedulingScenario, 'id' | 'name' | 'score'> {
  const changes: SchedulingScenario['changes'] = [];

  for (const [bureau, days] of Object.entries(load)) {
    const capacity = capacityByBureau[bureau] || 480;
    for (const [day, data] of Object.entries(days)) {
      if (data.minutes > capacity) {
        // Déplacer des items vers des jours moins chargés
        const overloadedItems = data.items;
        for (const item of overloadedItems.slice(0, Math.ceil(overloadedItems.length / 2))) {
          const newSlot = findFreeSlotForBureau(item, items, bureau, 7);
          if (newSlot) {
            changes.push({
              itemId: item.id,
              oldStart: item.start,
              newStart: newSlot.start,
              newEnd: newSlot.end,
              reason: `Équilibrage charge ${bureau}`,
            });
          }
        }
      }
    }
  }

  return {
    changes,
    conflictsResolved: 0,
    loadBalanced: changes.length > 0,
  };
}

function optimizeSLA(items: CalendarItem[]): Omit<SchedulingScenario, 'id' | 'name' | 'score'> {
  const changes: SchedulingScenario['changes'] = [];
  const now = new Date();

  for (const item of items) {
    if (!item.slaDueAt) continue;
    const slaDate = new Date(item.slaDueAt);
    const itemStart = new Date(item.start);

    // Si l'item est planifié après le SLA, le déplacer avant
    if (itemStart > slaDate && slaDate > now) {
      const newStart = new Date(slaDate);
      newStart.setHours(9, 0, 0, 0);
      const duration = new Date(item.end).getTime() - itemStart.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      changes.push({
        itemId: item.id,
        oldStart: item.start,
        newStart: newStart.toISOString(),
        newEnd: newEnd.toISOString(),
        reason: 'Respect SLA',
      });
    }
  }

  return {
    changes,
    conflictsResolved: 0,
    loadBalanced: false,
  };
}

function combinedOptimization(
  items: CalendarItem[],
  conflicts: Set<string>,
  load: Record<string, Record<string, { minutes: number; items: CalendarItem[] }>>,
  capacityByBureau: Record<string, number>
): Omit<SchedulingScenario, 'id' | 'name' | 'score'> {
  // Combine les stratégies précédentes de manière intelligente
  const conflictRes = resolveConflicts(items, conflicts);
  const loadRes = balanceLoad(items, load, capacityByBureau);
  const slaRes = optimizeSLA(items);

  // Fusionner les changements (éviter les doublons)
  const changeMap = new Map<string, SchedulingScenario['changes'][0]>();
  
  [...conflictRes.changes, ...loadRes.changes, ...slaRes.changes].forEach((change) => {
    if (!changeMap.has(change.itemId) || changeMap.get(change.itemId)!.reason.includes('conflit')) {
      changeMap.set(change.itemId, change);
    }
  });

  return {
    changes: Array.from(changeMap.values()),
    conflictsResolved: conflictRes.conflictsResolved,
    loadBalanced: loadRes.loadBalanced,
  };
}

function findFreeSlot(
  item: CalendarItem,
  allItems: CalendarItem[],
  daysAhead: number
): { start: string; end: string } | null {
  const duration = new Date(item.end).getTime() - new Date(item.start).getTime();
  const now = new Date();
  const itemDate = new Date(item.start);

  for (let day = 0; day < daysAhead; day++) {
    const testDate = new Date(now);
    testDate.setDate(testDate.getDate() + day);
    testDate.setHours(9, 0, 0, 0);

    // Tester plusieurs créneaux dans la journée
    for (let hour = 9; hour <= 17; hour++) {
      testDate.setHours(hour, 0, 0, 0);
      const testEnd = new Date(testDate.getTime() + duration);

      // Vérifier si le créneau est libre
      const hasConflict = allItems.some((other) => {
        if (other.id === item.id) return false;
        const otherStart = new Date(other.start);
        const otherEnd = new Date(other.end);
        return (
          (testDate < otherEnd && testEnd > otherStart) &&
          (item.bureau === other.bureau || 
           (item.assignees || []).some((a) => (other.assignees || []).some((o) => o.id === a.id)))
        );
      });

      if (!hasConflict) {
        return {
          start: testDate.toISOString(),
          end: testEnd.toISOString(),
        };
      }
    }
  }

  return null;
}

function findFreeSlotForBureau(
  item: CalendarItem,
  allItems: CalendarItem[],
  bureau: string,
  daysAhead: number
): { start: string; end: string } | null {
  const duration = new Date(item.end).getTime() - new Date(item.start).getTime();
  const now = new Date();

  for (let day = 0; day < daysAhead; day++) {
    const testDate = new Date(now);
    testDate.setDate(testDate.getDate() + day);
    testDate.setHours(9, 0, 0, 0);

    for (let hour = 9; hour <= 17; hour++) {
      testDate.setHours(hour, 0, 0, 0);
      const testEnd = new Date(testDate.getTime() + duration);

      const hasConflict = allItems.some((other) => {
        if (other.id === item.id) return false;
        const otherStart = new Date(other.start);
        const otherEnd = new Date(other.end);
        return (
          (testDate < otherEnd && testEnd > otherStart) &&
          other.bureau === bureau
        );
      });

      if (!hasConflict) {
        return {
          start: testDate.toISOString(),
          end: testEnd.toISOString(),
        };
      }
    }
  }

  return null;
}

function calculateScore(
  scenario: Omit<SchedulingScenario, 'id' | 'name' | 'score'>,
  items: CalendarItem[],
  conflicts: Set<string>,
  load: Record<string, Record<string, { minutes: number; items: CalendarItem[] }>>,
  capacityByBureau: Record<string, number>
): number {
  let score = 0;

  // Bonus pour résolution de conflits
  score += scenario.conflictsResolved * 50;

  // Bonus pour équilibrage de charge
  if (scenario.loadBalanced) score += 30;

  // Bonus pour nombre de changements (mais pénalité si trop)
  score += Math.min(scenario.changes.length * 5, 50);

  // Pénalité pour changements trop importants
  const avgChangeDays = scenario.changes.reduce((sum, c) => {
    const days = Math.abs(
      (new Date(c.newStart).getTime() - new Date(c.oldStart).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0) / (scenario.changes.length || 1);

  if (avgChangeDays > 3) score -= 20;

  return Math.max(0, score);
}

