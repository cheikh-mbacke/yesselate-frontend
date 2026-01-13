// ============================================
// Helpers pour le calendrier Ops Calendar BTP
// ============================================

import type { CalendarEvent } from '@/lib/types/bmo.types';

/**
 * Data model unifié pour le calendrier Ops
 */
export interface CalendarItem {
  id: string;
  title: string;
  kind: CalendarEvent['type'];
  bureau?: string;
  assignees?: string[];
  start: string; // ISO date
  end: string; // ISO date
  priority: 'critical' | 'urgent' | 'high' | 'normal' | 'low';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  linkedTo?: string; // ID d'un autre item (dépendance)
  slaDueAt?: string; // ISO date pour SLA
  originalEvent: CalendarEvent; // Référence à l'événement original
}

/**
 * Conflit détecté entre items
 */
export interface DetectedConflict {
  type: 'overlap' | 'resource' | 'absence' | 'overload' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  itemIds: string[];
  bureau?: string;
  date: string;
}

/**
 * Charge calculée par bureau/jour
 */
export interface LoadData {
  bureau: string;
  date: string;
  totalHours: number;
  capacity: number; // Capacité en heures/jour
  overload: boolean;
  overloadPercent: number;
  items: CalendarItem[];
}

/**
 * SLA status
 */
export interface SLAStatus {
  itemId: string;
  dueAt: string;
  isOverdue: boolean;
  daysOverdue: number;
  status: 'ok' | 'warning' | 'blocked' | 'needs_substitution';
}

/**
 * Mapper les données existantes vers CalendarItem
 */
export function mapToCalendarItems(
  events: CalendarEvent[],
  options?: {
    includeBlocked?: boolean;
    includePayments?: boolean;
    includeContracts?: boolean;
  }
): CalendarItem[] {
  const items: CalendarItem[] = [];

  // Mapper les événements calendrier
  for (const event of events) {
    const startDate = event.date;
    const endDate = event.endDate || event.date;
    const startTime = event.time || '09:00';
    const endTime = event.time ? addHours(event.time, 1) : '10:00';

    items.push({
      id: event.id,
      title: event.title,
      kind: event.type,
      bureau: event.bureau,
      assignees: event.participants?.map((p) => p.name) || [],
      start: `${startDate}T${startTime}:00`,
      end: `${endDate}T${endTime}:00`,
      priority: event.priority || 'normal',
      severity: event.priority === 'critical' ? 'critical' : event.priority === 'urgent' ? 'high' : 'medium',
      status: event.status || 'planned',
      linkedTo: event.dependencies?.[0],
      slaDueAt: event.type === 'deadline' ? `${startDate}T23:59:59` : undefined,
      originalEvent: event,
    });
  }

  return items;
}

/**
 * Détecter les conflits entre items
 */
export function detectConflicts(items: CalendarItem[]): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const byBureauAndDate = new Map<string, CalendarItem[]>();

  // Grouper par bureau et date
  for (const item of items) {
    if (!item.bureau || item.status === 'cancelled') continue;
    const key = `${item.bureau}|${item.start.split('T')[0]}`;
    if (!byBureauAndDate.has(key)) byBureauAndDate.set(key, []);
    byBureauAndDate.get(key)!.push(item);
  }

  // Détecter chevauchements par assignee
  const byAssignee = new Map<string, CalendarItem[]>();
  for (const item of items) {
    if (item.status === 'cancelled') continue;
    for (const assignee of item.assignees || []) {
      if (!byAssignee.has(assignee)) byAssignee.set(assignee, []);
      byAssignee.get(assignee)!.push(item);
    }
  }

  for (const [assignee, assigneeItems] of byAssignee.entries()) {
    for (let i = 0; i < assigneeItems.length; i++) {
      for (let j = i + 1; j < assigneeItems.length; j++) {
        const a = assigneeItems[i];
        const b = assigneeItems[j];
        if (overlaps(a, b)) {
          conflicts.push({
            type: 'overlap',
            severity: 'high',
            description: `${assignee} a deux activités qui se chevauchent`,
            itemIds: [a.id, b.id],
            bureau: a.bureau,
            date: a.start.split('T')[0],
          });
        }
      }
    }
  }

  // Détecter surcharges par bureau/jour
  for (const [key, dayItems] of byBureauAndDate.entries()) {
    if (dayItems.length >= 4) {
      const [bureau, date] = key.split('|');
      conflicts.push({
        type: 'overload',
        severity: dayItems.length >= 6 ? 'critical' : 'high',
        description: `${dayItems.length} activités planifiées pour ${bureau} le ${date}`,
        itemIds: dayItems.map((i) => i.id),
        bureau,
        date,
      });
    }
  }

  return conflicts;
}

/**
 * Calculer la charge par bureau/jour
 */
export function computeLoad(
  items: CalendarItem[],
  capacityByBureau: Record<string, number> = {}
): LoadData[] {
  const defaultCapacity = 8; // 8h/jour par défaut
  const byBureauAndDate = new Map<string, CalendarItem[]>();

  for (const item of items) {
    if (!item.bureau || item.status === 'cancelled') continue;
    const date = item.start.split('T')[0];
    const key = `${item.bureau}|${date}`;
    if (!byBureauAndDate.has(key)) byBureauAndDate.set(key, []);
    byBureauAndDate.get(key)!.push(item);
  }

  const loadData: LoadData[] = [];

  for (const [key, dayItems] of byBureauAndDate.entries()) {
    const [bureau, date] = key.split('|');
    const capacity = capacityByBureau[bureau] || defaultCapacity;
    
    // Calculer les heures totales (estimation basique)
    let totalHours = 0;
    for (const item of dayItems) {
      const start = new Date(item.start);
      const end = new Date(item.end);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += Math.max(0.5, hours); // Minimum 30min
    }

    const overload = totalHours > capacity;
    const overloadPercent = capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0;

    loadData.push({
      bureau,
      date,
      totalHours: Math.round(totalHours * 10) / 10,
      capacity,
      overload,
      overloadPercent,
      items: dayItems,
    });
  }

  return loadData.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.bureau.localeCompare(b.bureau);
  });
}

/**
 * Calculer les SLA
 */
export function computeSLA(items: CalendarItem[]): SLAStatus[] {
  const now = new Date();
  const slaStatuses: SLAStatus[] = [];

  for (const item of items) {
    if (!item.slaDueAt) continue;

    const dueAt = new Date(item.slaDueAt);
    const isOverdue = dueAt < now;
    const daysOverdue = isOverdue ? Math.ceil((now.getTime() - dueAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    let status: SLAStatus['status'] = 'ok';
    if (isOverdue && item.status !== 'completed') {
      if (daysOverdue >= 3) status = 'blocked';
      else if (daysOverdue >= 1) status = 'needs_substitution';
      else status = 'warning';
    }

    slaStatuses.push({
      itemId: item.id,
      dueAt: item.slaDueAt,
      isOverdue,
      daysOverdue,
      status,
    });
  }

  return slaStatuses;
}

// ============================================
// Helpers privés
// ============================================

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h + hours, m, 0, 0);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function overlaps(a: CalendarItem, b: CalendarItem): boolean {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();

  return aStart < bEnd && bStart < aEnd;
}

