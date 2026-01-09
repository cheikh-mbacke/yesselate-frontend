'use client';

import { useCallback, useEffect, useMemo, useState, useDeferredValue, memo, useRef, lazy, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  agendaEvents, 
  paymentsN1, 
  contractsToSign, 
  blockedDossiers,
  plannedAbsences 
} from '@/lib/data';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Filter,
  Download,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Users,
  Building2,
  Target,
  Lightbulb,
  BarChart3,
  Eye,
  EyeOff,
  Sparkles,
  GanttChart,
  User,
  Kanban,
  TrendingDown,
  CalendarDays,
  Repeat,
  FileUp,
  Command,
  Edit2,
  Trash2,
  Copy,
  Clipboard,
  Plus,
  Wifi,
  WifiOff,
  Bell,
  MessageSquare,
  Share2,
  BarChart2,
  AtSign,
  FileText,
  Maximize2,
  History as HistoryIcon,
  GitCompare,
  CalendarRange
} from 'lucide-react';
import { downloadICal } from '@/lib/utils/ical-export';
import { generateSchedulingScenarios, type SchedulingScenario } from '@/lib/utils/auto-scheduler';
import type { FocusMode } from '@/lib/types/calendar.types';
import { EventModal } from './EventModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { addWeeks, addMonths, addQuarters, isBefore } from 'date-fns';

// Helpers pour traçabilité avec hash
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function stableStringify(obj: unknown) {
  return JSON.stringify(obj, Object.keys(obj as any).sort());
}

function logWithHash(addActionLog: any, baseLog: any, payload: unknown) {
  void (async () => {
    try {
      const h = await sha256Hex(stableStringify(payload));
      addActionLog({ ...baseLog, details: `${baseLog.details ?? ''} | hash:${h}` });
    } catch {
      addActionLog(baseLog);
    }
  })();
}

type CalendarView = 'week' | 'day' | 'month' | 'agenda' | 'gantt' | 'resource' | 'kanban';
type PrimaryTab = 'planning' | 'pilotage' | 'outils';
type SecondaryTab =
  | 'vues'
  | 'inspector'
  | 'kpis'
  | 'previsions'
  | 'comparaison'
  | 'exports'
  | 'templates'
  | 'auto'
  | 'historique'
  | 'presentation';

type UIMode = 'windows' | 'classic';

type WorkspaceTab = {
  id: string;
  title: string;
  tab: PrimaryTab;
  sub: SecondaryTab;
  view?: CalendarView;
  itemId?: string | null;
};
export type Priority = 'critical' | 'urgent' | 'normal';
export type Severity = 'critical' | 'warning' | 'info' | 'success';
export type Status = 'open' | 'done' | 'snoozed' | 'ack' | 'blocked';

export type CalendarKind =
  | 'meeting'
  | 'site-visit'
  | 'validation'
  | 'payment'
  | 'contract'
  | 'deadline'
  | 'absence'
  | 'project'
  | 'event'
  | 'sortie'
  | 'other';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

type EventFormData = {
  title: string;
  description: string;
  kind: CalendarKind;
  bureau?: string;
  assignees: { id: string; name: string }[];
  start: Date;
  end: Date;
  priority: Priority;
  severity: Severity;
  status: Status;
  project?: string;
  recurrence: RecurrenceType;
  recurrenceEnd?: Date;
  notation?: number; // 0-5 étoiles
  notes?: string;
};

export type CalendarItem = {
  id: string;
  title: string;
  description?: string;
  kind: CalendarKind;
  bureau?: string;
  assignees?: { id: string; name: string }[];
  start: string; // ISO
  end: string; // ISO
  priority: Priority;
  severity: Severity;
  status: Status;
  linkedTo?: { type: string; id: string; label?: string };
  slaDueAt?: string; // ISO
  project?: string;
  originalSource?: 'agenda' | 'payment' | 'contract' | 'blocked' | 'absence';
  reminders?: Reminder[]; // Rappels configurés
  notes?: Note[]; // Notes/commentaires sur l'événement
};

type Reminder = {
  id: string;
  minutesBefore: number; // Minutes avant l'événement
  notified: boolean; // Si la notification a déjà été envoyée
};

type Note = {
  id: string;
  content: string;
  author: { id: string; name: string };
  timestamp: string; // ISO
  mentions?: string[]; // IDs des personnes mentionnées
};

type SLAStatus = {
  itemId: string;
  isOverdue: boolean;
  daysOverdue: number;
  status: 'ok' | 'warning' | 'blocked' | 'needs_substitution';
  recommendation?: string;
};

const BUREAUX = ['BMO', 'BFC', 'BMCM', 'BAA', 'BCT', 'BACQ', 'BJ'] as const;
const CAPACITY_BY_BUREAU: Record<string, number> = {
  BMO: 8 * 60, // 8h en minutes
  BFC: 6 * 60,
  BMCM: 6 * 60,
  BAA: 6 * 60,
  BCT: 8 * 60,
  BACQ: 6 * 60,
  BJ: 6 * 60,
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1
  return new Date(date.setDate(diff));
};
const getDaysInMonth = (d: Date) => endOfMonth(d).getDate();

function iso(d: Date) {
  if (!d || isNaN(d.getTime())) {
    return new Date().toISOString(); // Retourne une date valide par défaut
  }
  return d.toISOString();
}
function fmtDayLabel(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
}
function fmtHour(h: number) {
  return String(h).padStart(2, '0') + ':00';
}
function minutesSinceStartOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}
function minutesDiff(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}
function parseFRDate(dateStr: string): Date {
  if (!dateStr || !dateStr.includes('/')) {
    return new Date(); // Retourne la date actuelle si le format est invalide
  }
  const [d, m, y] = dateStr.split('/').map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) {
    return new Date(); // Retourne la date actuelle si le format est invalide
  }
  const date = new Date(y, m - 1, d);
  // Vérifier si la date créée est valide
  if (isNaN(date.getTime())) {
    return new Date(); // Retourne la date actuelle si la date est invalide
  }
  return date;
}

function dayKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function uid(prefix = 'EVT') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Ne jamais générer ?x=undefined
function buildQuery(current: URLSearchParams, patch: Record<string, string | undefined | null>) {
  const next = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null || v === '') next.delete(k);
    else next.set(k, v);
  }
  const s = next.toString();
  return s ? `?${s}` : '';
}

// Mapper les vraies données vers CalendarItem
function mapToCalendarItems(): CalendarItem[] {
  const items: CalendarItem[] = [];
  const now = new Date();

  // Agenda events
  agendaEvents.forEach((evt) => {
    const date = new Date(evt.date);
    const time = evt.time ? evt.time.split(':') : [9, 0];
    const start = new Date(date);
    start.setHours(Number(time[0]), Number(time[1]), 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    items.push({
      id: evt.id,
      title: evt.title,
      description: evt.location,
      kind: evt.type === 'meeting' ? 'meeting' : evt.type === 'site' ? 'site-visit' : evt.type === 'deadline' ? 'deadline' : 'other',
      bureau: evt.bureau,
      assignees: evt.participants?.map((p) => ({ id: p.employeeId, name: p.name })) || [],
      start: iso(start),
      end: iso(end),
      priority: evt.priority === 'critical' ? 'critical' : evt.priority === 'urgent' ? 'urgent' : 'normal',
      severity: evt.priority === 'critical' ? 'critical' : evt.priority === 'urgent' ? 'warning' : 'info',
      status: evt.status === 'completed' ? 'done' : evt.status === 'cancelled' ? 'ack' : 'open',
      project: evt.project,
      slaDueAt: evt.type === 'deadline' ? iso(end) : undefined,
      originalSource: 'agenda',
    });
  });

  // Payments
  paymentsN1.forEach((pay) => {
    const dueDate = parseFRDate(pay.dueDate);
    const start = new Date(dueDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntil < 0;

    items.push({
      id: `PAY-${pay.id}`,
      title: `Paiement ${isOverdue ? 'en retard' : 'à échéance'} — ${pay.beneficiary}`,
      description: `${pay.amount || '—'} FCFA`,
      kind: 'payment',
      bureau: pay.bureau || 'BFC',
      assignees: [{ id: 'compta', name: 'Comptabilité' }],
      start: iso(start),
      end: iso(end),
      priority: isOverdue ? 'critical' : daysUntil <= 2 ? 'urgent' : 'normal',
      severity: isOverdue ? 'critical' : daysUntil <= 2 ? 'warning' : 'info',
      status: 'open',
      linkedTo: { type: 'Facture', id: pay.id, label: pay.beneficiary },
      slaDueAt: iso(dueDate),
      originalSource: 'payment',
    });
  });

  // Contracts
  contractsToSign.filter((c) => c.status === 'pending').forEach((ctr) => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(11, 0, 0, 0);
    const end = new Date(start);
    end.setHours(12, 0, 0, 0);

    items.push({
      id: `CTR-${ctr.id}`,
      title: `Contrat à signer — ${ctr.subject}`,
      description: ctr.partner,
      kind: 'contract',
      bureau: ctr.bureau,
      assignees: [{ id: 'juriste', name: 'Juriste' }],
      start: iso(start),
      end: iso(end),
      priority: 'urgent',
      severity: 'warning',
      status: 'open',
      linkedTo: { type: 'Contrat', id: ctr.id, label: ctr.subject },
      originalSource: 'contract',
    });
  });

  // Blocked dossiers
  blockedDossiers.filter((d) => d.delay >= 3).forEach((blk) => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 0, 0, 0);

    items.push({
      id: `BLK-${blk.id}`,
      title: `Dossier bloqué ${blk.delay}j — ${blk.subject}`,
      description: blk.reason,
      kind: 'validation',
      bureau: blk.bureau,
      assignees: [{ id: blk.responsible, name: blk.responsible }],
      start: iso(start),
      end: iso(end),
      priority: blk.impact === 'critical' ? 'critical' : blk.delay >= 5 ? 'urgent' : 'normal',
      severity: blk.impact === 'critical' ? 'critical' : blk.delay >= 5 ? 'warning' : 'info',
      status: 'blocked',
      linkedTo: { type: blk.type, id: blk.id, label: blk.subject },
      project: blk.project,
      originalSource: 'blocked',
    });
  });

  // Absences
  plannedAbsences.forEach((abs) => {
    const start = parseFRDate(abs.startDate);
    const end = parseFRDate(abs.endDate);
    end.setHours(23, 59, 59, 999);

    items.push({
      id: `ABS-${abs.id}`,
      title: `Absence — ${abs.employeeName}`,
      description: `${abs.type} • ${abs.startDate} → ${abs.endDate}`,
      kind: 'absence',
      bureau: abs.bureau,
      assignees: [{ id: abs.employeeId, name: abs.employeeName }],
      start: iso(start),
      end: iso(end),
      priority: abs.impact === 'high' ? 'urgent' : 'normal',
      severity: abs.impact === 'high' ? 'warning' : 'info',
      status: 'open',
      originalSource: 'absence',
    });
  });

  return items;
}

// Conflit : overlap sur assignee OU bureau
function detectConflicts(items: CalendarItem[]) {
  const conflicts = new Set<string>();
  const byDay = new Map<string, CalendarItem[]>();

  for (const it of items) {
    if (it.status === 'done' || it.status === 'ack') continue;
    const d = dayKeyLocal(startOfDay(new Date(it.start)));
    const arr = byDay.get(d) ?? [];
    arr.push(it);
    byDay.set(d, arr);
  }

  for (const arr of byDay.values()) {
    const sorted = [...arr].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    for (let i = 0; i < sorted.length; i++) {
      const A = sorted[i];
      const aStart = new Date(A.start).getTime();
      const aEnd = new Date(A.end).getTime();
      for (let j = i + 1; j < sorted.length; j++) {
        const B = sorted[j];
        const bStart = new Date(B.start).getTime();
        const bEnd = new Date(B.end).getTime();
        if (bStart >= aEnd) break;

        const overlap = bStart < aEnd && bEnd > aStart;
        if (!overlap) continue;

        const sameBureau = A.bureau && B.bureau && A.bureau === B.bureau;
        const shareAssignee = (A.assignees ?? []).some((x) =>
          (B.assignees ?? []).some((y) => y.id === x.id)
        );

        if (sameBureau || shareAssignee) {
          conflicts.add(A.id);
          conflicts.add(B.id);
        }
      }
    }
  }

  return conflicts;
}

// Charge par bureau/jour avec surcharge
function computeLoad(items: CalendarItem[]) {
  const load: Record<string, Record<string, { minutes: number; items: CalendarItem[] }>> = {};
  for (const it of items) {
    if (it.status === 'done' || it.status === 'ack') continue;
    const bureau = it.bureau ?? 'N/A';
    const day = dayKeyLocal(startOfDay(new Date(it.start)));
    load[bureau] ??= {};
    load[bureau][day] ??= { minutes: 0, items: [] };
    load[bureau][day].minutes += Math.max(0, minutesDiff(new Date(it.start), new Date(it.end)));
    load[bureau][day].items.push(it);
  }
  return load;
}

// Calcul SLA avec recommandations
function computeSLA(items: CalendarItem[]): SLAStatus[] {
  const now = new Date();
  const slaStatuses: SLAStatus[] = [];

  for (const it of items) {
    if (!it.slaDueAt || it.status === 'done') continue;

    const dueAt = new Date(it.slaDueAt);
    const isOverdue = dueAt < now;
    const daysOverdue = isOverdue ? Math.ceil((now.getTime() - dueAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    let status: SLAStatus['status'] = 'ok';
    let recommendation: string | undefined;

    if (isOverdue) {
      if (daysOverdue >= 3) {
        status = 'blocked';
        recommendation = 'Escalader immédiatement + substitution';
      } else if (daysOverdue >= 1) {
        status = 'needs_substitution';
        recommendation = 'Replanifier ou substituer';
      } else {
        status = 'warning';
        recommendation = 'Traiter en priorité';
      }
    }

    slaStatuses.push({
      itemId: it.id,
      isOverdue,
      daysOverdue,
      status,
      recommendation,
    });
  }

  return slaStatuses;
}

// Suggestions intelligentes
function generateSuggestions(
  items: CalendarItem[],
  conflicts: Set<string>,
  load: ReturnType<typeof computeLoad>,
  slaStatuses: SLAStatus[]
): Array<{ type: string; title: string; description: string; action?: () => void }> {
  const suggestions: Array<{ type: string; title: string; description: string; action?: () => void }> = [];

  // Conflits critiques
  const criticalConflicts = Array.from(conflicts).slice(0, 3);
  if (criticalConflicts.length > 0) {
    suggestions.push({
      type: 'conflict',
      title: `${criticalConflicts.length} conflit(s) critique(s)`,
      description: 'Replanifier pour éviter les overlaps',
    });
  }

  // Surcharges
  for (const [bureau, days] of Object.entries(load)) {
    for (const [day, data] of Object.entries(days)) {
      const capacity = CAPACITY_BY_BUREAU[bureau] || 480;
      if (data.minutes > capacity) {
        const percent = Math.round((data.minutes / capacity) * 100);
        suggestions.push({
          type: 'overload',
          title: `Surcharge ${bureau} (${percent}%)`,
          description: `${data.items.length} items le ${day}`,
        });
        break;
      }
    }
  }

  // SLA en retard
  const overdueSLAs = slaStatuses.filter((s) => s.isOverdue && s.status === 'blocked');
  if (overdueSLAs.length > 0) {
    suggestions.push({
      type: 'sla',
      title: `${overdueSLAs.length} SLA bloqué(s)`,
      description: 'Action immédiate requise',
    });
  }

  return suggestions.slice(0, 5);
}

// Génération automatique des événements récurrents
function generateRecurringEvents(
  baseEvent: EventFormData,
  recurrence: RecurrenceType,
  recurrenceEnd?: Date
): CalendarItem[] {
  if (recurrence === 'none' || !recurrenceEnd) {
    // Événement unique
    return [
      {
        id: uid('EVT'),
        title: baseEvent.title,
        description: baseEvent.description,
        kind: baseEvent.kind,
        bureau: baseEvent.bureau,
        assignees: baseEvent.assignees,
        start: baseEvent.start.toISOString(),
        end: baseEvent.end.toISOString(),
        priority: baseEvent.priority,
        severity: baseEvent.severity,
        status: baseEvent.status,
        project: baseEvent.project,
      },
    ];
  }

  const events: CalendarItem[] = [];
  const duration = baseEvent.end.getTime() - baseEvent.start.getTime();
  let currentDate = startOfDay(new Date(baseEvent.start));
  const endDate = startOfDay(new Date(recurrenceEnd));
  let occurrenceCount = 0;
  const maxOccurrences = 365; // Limite de sécurité

  while (isBefore(currentDate, endDate) && occurrenceCount < maxOccurrences) {
    const start = new Date(currentDate);
    start.setHours(baseEvent.start.getHours(), baseEvent.start.getMinutes(), 0, 0);
    const end = new Date(start.getTime() + duration);

    events.push({
      id: uid('EVT'),
      title: baseEvent.title,
      description: baseEvent.description,
      kind: baseEvent.kind,
      bureau: baseEvent.bureau,
      assignees: baseEvent.assignees,
      start: start.toISOString(),
      end: end.toISOString(),
      priority: baseEvent.priority,
      severity: baseEvent.severity,
      status: baseEvent.status,
      project: baseEvent.project,
    });

    // Calculer la prochaine occurrence
    switch (recurrence) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        currentDate = addQuarters(currentDate, 1);
        break;
      default:
        break;
    }

    occurrenceCount++;
  }

  return events;
}

function severityBadgeVariant(sev: Severity) {
  if (sev === 'critical') return 'urgent';
  if (sev === 'warning') return 'warning';
  if (sev === 'success') return 'success';
  return 'info';
}

export default function CalendrierPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, addNotification } = useBMOStore();
  const EventModalAny = EventModal as any;
  
  // Service Worker pour mode hors ligne
  const { swState, isOnline, cacheData, getCachedData } = useServiceWorker();
  
  // Notifications proactives SLA - Track des notifications déjà envoyées
  const notifiedSLAs = useRef<Set<string>>(new Set());
  const notifiedReminders = useRef<Set<string>>(new Set());

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Ouvrir automatiquement l'inspecteur si ?item=... dans l'URL
  useEffect(() => {
    const sharedId = sp.get('item');
    if (!sharedId) return;
    setInspectedId(sharedId);
    setSelectedIds((prev) => ({ ...prev, [sharedId]: true }));
  }, [sp]);

  // État UI
  const view = (sp.get('view') as CalendarView) || 'week';
  const q = sp.get('q') || '';
  const deferredQ = useDeferredValue(q); // Debouncing pour améliorer les performances
  const bureauParam = sp.get('bureau') || 'ALL';
  const priorityFilter = sp.get('priority') || 'ALL';
  const kindFilter = sp.get('kind') || 'ALL';

  // Navigation "logiciel métier" (onglets hiérarchiques via URL)
  const primaryTab = ((sp.get('tab') as PrimaryTab) || 'planning') satisfies PrimaryTab;
  const secondaryTab = ((sp.get('sub') as SecondaryTab) ||
    (primaryTab === 'planning'
      ? 'vues'
      : primaryTab === 'pilotage'
      ? 'kpis'
      : 'exports')) satisfies SecondaryTab;

  // UI "modèle Windows Explorer"
  const uiMode = ((sp.get('ui') as UIMode) || 'windows') satisfies UIMode;

  const [cursorDate, setCursorDate] = useState(() => startOfDay(new Date()));
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Presets de filtres sauvegardables
  type FilterPreset = {
    id: string;
    name: string;
    priority: Priority | 'ALL';
    kind: CalendarKind | 'ALL';
    bureaux: string[];
  };
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    try {
      const saved = localStorage.getItem('calendrier.filterPresets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [showPeriodComparison, setShowPeriodComparison] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start?: Date; end?: Date }>({});
  
  // Support mobile : gestes tactiles
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  
  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsNarrow(window.innerWidth < 1280); // < xl
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [focusMode, setFocusMode] = useState<FocusMode>({ enabled: false, showOnly: 'all' });
  const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [schedulingScenarios, setSchedulingScenarios] = useState<SchedulingScenario[]>([]);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [showMultiBureau, setShowMultiBureau] = useState(false);
  
  // Modales modernes pour remplacer window.prompt/confirm
  const [showBureauPrompt, setShowBureauPrompt] = useState(false);
  const [bureauPromptValue, setBureauPromptValue] = useState('');
  const [bureauPromptCallback, setBureauPromptCallback] = useState<((value: string) => void) | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmCallback, setDeleteConfirmCallback] = useState<(() => void) | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');
  
  // Historique de recherche
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('calendrier.searchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Copier/Coller/Dupliquer
  const [copiedItem, setCopiedItem] = useState<CalendarItem | null>(null);
  
  // Système Undo/Redo
  const [history, setHistory] = useState<CalendarItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  
  // Helper pour ajouter un état à l'historique
  const addToHistory = useCallback((newItems: CalendarItem[]) => {
    setHistory((prev) => {
      const cutIndex = historyIndexRef.current;
      const base = prev.slice(0, cutIndex + 1);

      const snapshot = typeof structuredClone === 'function'
        ? structuredClone(newItems)
        : JSON.parse(JSON.stringify(newItems));

      const nextHistory = [...base, snapshot].slice(-50);

      historyIndexRef.current = nextHistory.length - 1;
      setHistoryIndex(historyIndexRef.current);

      return nextHistory;
    });
  }, []);
  
  // Fonction pour mettre à jour items avec historique
  const updateItemsWithHistory = useCallback((updater: (prev: CalendarItem[]) => CalendarItem[]) => {
    setItems((prev) => {
      const newItems = updater(prev);
      addToHistory(newItems);
      return newItems;
    });
  }, [addToHistory]);
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setItems(history[prevIndex]);
      setHistoryIndex(prevIndex);
      historyIndexRef.current = prevIndex;
      addToast('↶ Action annulée', 'info');
    }
  }, [history, historyIndex, addToast]);
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setItems(history[nextIndex]);
      setHistoryIndex(nextIndex);
      historyIndexRef.current = nextIndex;
      addToast('↷ Action rétablie', 'info');
    }
  }, [history, historyIndex, addToast]);

  // Données mappées - initialisation unique
  const allItemsBase = useMemo(() => mapToCalendarItems(), []);
  
  // Validation des données CalendarItem
  const isValidCalendarItem = useCallback((item: unknown): item is CalendarItem => {
    if (typeof item !== 'object' || item === null) return false;
    const it = item as Record<string, unknown>;
    return (
      typeof it.id === 'string' &&
      typeof it.title === 'string' &&
      typeof it.start === 'string' &&
      typeof it.end === 'string' &&
      !isNaN(new Date(it.start as string).getTime()) &&
      !isNaN(new Date(it.end as string).getTime())
    );
  }, []);

  // Sauvegarde automatique dans localStorage et cache Service Worker (avec debounce)
  useEffect(() => {
    if (items.length === 0) return;

    const t = window.setTimeout(() => {
      try {
        const validItems = items.filter(isValidCalendarItem);
        if (validItems.length === 0) return;

        localStorage.setItem('calendrier.items', JSON.stringify(validItems));
        if (cacheData) cacheData(validItems);
      } catch (error) {
        addToast(`❌ Erreur de sauvegarde: ${error instanceof Error ? error.message : 'Inconnu'}`, 'error');
      }
    }, 600);

    return () => window.clearTimeout(t);
  }, [items, isValidCalendarItem, addToast, cacheData]);
  
  // Restaurer depuis localStorage ou cache Service Worker au montage
  useEffect(() => {
    let initial: CalendarItem[] | null = null;

    const loadData = async () => {
      try {
        // Essayer localStorage d'abord
        const saved = localStorage.getItem('calendrier.items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validItems = parsed.filter(isValidCalendarItem);
            if (validItems.length > 0) {
              initial = validItems;
            }
          }
        }
        
        // Si pas de données dans localStorage, essayer le cache Service Worker
        if (!initial && getCachedData) {
          const cached = await getCachedData();
          if (cached && Array.isArray(cached) && cached.length > 0) {
            const validItems = cached.filter(isValidCalendarItem);
            if (validItems.length > 0) {
              initial = validItems;
              // Synchroniser avec localStorage
              localStorage.setItem('calendrier.items', JSON.stringify(validItems));
            }
          }
        }
      } catch (error) {
        addToast(`❌ Erreur de lecture: ${error instanceof Error ? error.message : 'Inconnu'}`, 'error');
      }

      const fallback = allItemsBase.length > 0 ? allItemsBase : [];
      const next = initial ?? fallback;

      if (next.length > 0) {
        setItems(next);
        addToHistory(next); // Initialize history with the loaded items
      }
    };

    loadData();
  }, [allItemsBase, isValidCalendarItem, addToast, addToHistory, getCachedData]);
  
  // Afficher un indicateur de statut de connexion
  useEffect(() => {
    if (!isOnline) {
      addToast('📡 Mode hors ligne activé - Les modifications seront synchronisées au retour en ligne', 'info');
    }
  }, [isOnline, addToast]);
  
  const allItems = items.length > 0 ? items : allItemsBase;
  
  const visibleBureaux = useMemo(() => {
    if (showMultiBureau) return new Set<string>(BUREAUX);
    if (bureauParam === 'ALL') return new Set<string>(BUREAUX);
    return new Set<string>([bureauParam]);
  }, [bureauParam, showMultiBureau]);

  // Recherche sémantique améliorée
  const parseNaturalDate = useCallback((query: string): Date | null => {
    const q = query.toLowerCase().trim();
    const today = startOfDay(new Date());
    
    if (q === 'aujourd\'hui' || q === 'today' || q === 'auj') return today;
    if (q === 'demain' || q === 'tomorrow' || q === 'dem') return addDays(today, 1);
    if (q === 'hier' || q === 'yesterday' || q === 'hie') return addDays(today, -1);
    if (q === 'cette semaine' || q === 'this week') return today;
    if (q === 'semaine prochaine' || q === 'next week') return addDays(today, 7);
    if (q === 'semaine dernière' || q === 'last week') return addDays(today, -7);
    if (q === 'ce mois' || q === 'this month') return today;
    if (q === 'mois prochain' || q === 'next month') {
      const d = new Date(today);
      d.setMonth(d.getMonth() + 1);
      return d;
    }
    
    return null;
  }, []);
  
  // Filtrage de base (sans mode focus) - utilise deferredQ pour debouncing
  const preFiltered = useMemo(() => {
    const qq = deferredQ.trim().toLowerCase();
    const naturalDate = parseNaturalDate(deferredQ);
    
    return allItems.filter((it) => {
      if (visibleBureaux.size && it.bureau && !visibleBureaux.has(it.bureau)) return false;
      if (priorityFilter !== 'ALL' && it.priority !== priorityFilter) return false;
      if (kindFilter !== 'ALL' && it.kind !== kindFilter) return false;
      
      // Recherche par date naturelle
      if (naturalDate) {
        const itemDate = startOfDay(new Date(it.start));
        const targetDate = startOfDay(naturalDate);
        if (deferredQ.toLowerCase().includes('semaine')) {
          // Pour "cette semaine", vérifier si dans la même semaine
          const weekStart = startOfWeek(targetDate);
          const weekEnd = addDays(weekStart, 6);
          return itemDate >= weekStart && itemDate <= weekEnd;
        }
        if (deferredQ.toLowerCase().includes('mois')) {
          // Pour "ce mois", vérifier si dans le même mois
          return itemDate.getMonth() === targetDate.getMonth() && 
                 itemDate.getFullYear() === targetDate.getFullYear();
        }
        // Pour les dates exactes (aujourd'hui, demain, etc.)
        return dayKeyLocal(itemDate) === dayKeyLocal(targetDate);
      }
      
      // Recherche textuelle
      if (!qq) return true;
      const hay = `${it.id} ${it.title} ${it.description ?? ''} ${it.bureau ?? ''} ${it.project ?? ''}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [allItems, deferredQ, visibleBureaux, priorityFilter, kindFilter, parseNaturalDate]);

  // Calculs optimisés avec cache granulaire (utilise preFiltered final)
  const activeItems = useMemo(() => 
    preFiltered.filter(it => it.status !== 'done' && it.status !== 'ack'),
    [preFiltered]
  );
  
  const conflicts = useMemo(() => {
    if (activeItems.length === 0) return new Set<string>();
    return detectConflicts(activeItems);
  }, [activeItems]);
  
  const load = useMemo(() => {
    if (activeItems.length === 0) return {};
    return computeLoad(activeItems);
  }, [activeItems]);
  
  const slaStatuses = useMemo(() => {
    if (activeItems.length === 0) return [];
    return computeSLA(activeItems);
  }, [activeItems]);

  // Notifications SLA en retard
  useEffect(() => {
    if (!slaStatuses.length) return;

    for (const s of slaStatuses) {
      if (!s.isOverdue) continue;
      const key = `sla:${s.itemId}:${s.status}:${s.daysOverdue}`;
      if (notifiedSLAs.current.has(key)) continue;

      notifiedSLAs.current.add(key);

      const it = allItems.find(x => x.id === s.itemId);
      const title = it?.title ?? s.itemId;

      addNotification?.({
        id: uid('NOTIF'),
        title: 'SLA en retard',
        message: `${title} • ${s.daysOverdue}j • ${s.recommendation ?? 'Action requise'}`,
        severity: s.status === 'blocked' ? 'critical' : 'warning',
        module: 'calendrier',
        targetId: s.itemId,
        createdAt: new Date().toISOString(),
      } as any);

      addToast(`⏱️ SLA: ${title} (${s.daysOverdue}j)`, s.status === 'blocked' ? 'error' : 'warning');
    }
  }, [slaStatuses, allItems, addToast, addNotification]);

  // Notifications pour les reminders (vérifie toutes les minutes)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      for (const it of allItems) {
        if (!it.reminders || it.reminders.length === 0) continue;
        if (it.status === 'done' || it.status === 'ack') continue;

        const eventStart = new Date(it.start);
        const minutesUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60);

        for (const reminder of it.reminders) {
          if (reminder.notified) continue;
          
          const key = `reminder:${it.id}:${reminder.id}`;
          if (notifiedReminders.current.has(key)) continue;

          // Vérifier si on est dans la fenêtre de notification (minutesBefore ± 1 minute)
          if (minutesUntilEvent > 0 && minutesUntilEvent <= reminder.minutesBefore + 1 && minutesUntilEvent >= reminder.minutesBefore - 1) {
            notifiedReminders.current.add(key);

            addNotification?.({
              id: uid('NOTIF'),
              title: `Rappel: ${it.title}`,
              message: `L'événement commence dans ${Math.round(minutesUntilEvent)} minute(s)`,
              severity: 'info',
              module: 'calendrier',
              targetId: it.id,
              createdAt: new Date().toISOString(),
            } as any);

            addToast(`🔔 Rappel: ${it.title} dans ${Math.round(minutesUntilEvent)} min`, 'info');
          }
        }
      }
    };

    // Vérifier immédiatement
    checkReminders();

    // Puis vérifier toutes les minutes
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [allItems, addToast, addNotification]);

  // Recherche sémantique améliorée - détecte des patterns intelligents
  const parseSemanticQuery = useCallback((query: string) => {
    const q = query.toLowerCase().trim();

    const patterns: Record<string, (it: CalendarItem) => boolean> = {
      'paiements en retard': (it) => it.kind === 'payment' && it.status !== 'done',
      'paiements à échéance': (it) => it.kind === 'payment' && it.status === 'open',
      'paiements critiques': (it) => it.kind === 'payment' && it.priority === 'critical',

      'conflits': (it) => conflicts.has(it.id),
      'surcharges': (it) => {
        if (!it.bureau) return false;
        const day = dayKeyLocal(startOfDay(new Date(it.start)));
        const bureauLoad = load[it.bureau]?.[day];
        if (!bureauLoad) return false;
        const capacity = CAPACITY_BY_BUREAU[it.bureau] ?? 480;
        return bureauLoad.minutes > capacity;
      },

      'sla en retard': (it) => {
        const s = slaStatuses.find(x => x.itemId === it.id);
        return !!s?.isOverdue;
      },
      'sla critiques': (it) => {
        const s = slaStatuses.find(x => x.itemId === it.id);
        return s?.status === 'blocked';
      },

      'terminés': (it) => it.status === 'done',
      'annulés': (it) => it.status === 'ack',
      'bloqués': (it) => it.status === 'blocked',
      'en cours': (it) => it.status === 'open',

      'critiques': (it) => it.priority === 'critical' || it.severity === 'critical',
      'urgents': (it) => it.priority === 'urgent',

      'réunions': (it) => it.kind === 'meeting',
      'validations': (it) => it.kind === 'validation',
      'contrats': (it) => it.kind === 'contract',
      'échéances': (it) => it.kind === 'deadline',
      'absences': (it) => it.kind === 'absence',
    };

    for (const [pattern, matcher] of Object.entries(patterns)) {
      if (q.includes(pattern)) return matcher;
    }
    return null;
  }, [conflicts, load, slaStatuses]);

  // Filtrage final avec mode focus
  const filtered = useMemo(() => {
    let result = preFiltered;

    // Recherche sémantique (si reconnue)
    const semanticMatcher = parseSemanticQuery(deferredQ);
    if (semanticMatcher) {
      result = result.filter((it) => semanticMatcher(it));
    }

    // Mode Focus
    if (focusMode.enabled) {
      if (focusMode.showOnly === 'critical') {
        result = result.filter((it) => it.priority === 'critical' || it.severity === 'critical');
      } else if (focusMode.showOnly === 'my-items' && focusMode.myUserId) {
        result = result.filter((it) =>
          it.assignees?.some((a) => a.id === focusMode.myUserId)
        );
      } else if (focusMode.showOnly === 'conflicts') {
        result = result.filter((it) => conflicts.has(it.id));
      } else if (focusMode.showOnly === 'overdue-sla') {
        const overdueIds = new Set(slaStatuses.filter((s) => s.isOverdue).map((s) => s.itemId));
        result = result.filter((it) => overdueIds.has(it.id));
      }
    }

    return result;
  }, [preFiltered, deferredQ, parseSemanticQuery, focusMode, conflicts, slaStatuses]);
  const suggestions = useMemo(
    () => generateSuggestions(filtered, conflicts, load, slaStatuses),
    [filtered, conflicts, load, slaStatuses]
  );

  // Range selon vue
  const weekStart = useMemo(() => {
    const d = new Date(cursorDate);
    const dow = (d.getDay() + 6) % 7;
    return startOfDay(addDays(d, -dow));
  }, [cursorDate]);

  const weekDays = useMemo(() => Array.from({ length: 5 }, (_, i) => startOfDay(addDays(weekStart, i))), [weekStart]);

  const selectionCount = useMemo(() => Object.values(selectedIds).filter(Boolean).length, [selectedIds]);
  const inspected = useMemo(() => filtered.find((x) => x.id === inspectedId) ?? null, [filtered, inspectedId]);

  // Actions Inspector (desktop + mobile)
  const handleInspectorAction = useCallback((a: string) => {
    if (!inspected) return;

    // Édition / replanification => ouvre la modale
    if (a === 'modifier' || a === 'replanifier') {
      setEditingItem(inspected);
      setEventModalDate(new Date(inspected.start));
      setShowEventModal(true);
      return;
    }

    // Assigner bureau (modale)
    if (a === 'assigner-bureau') {
      setBureauPromptValue(inspected.bureau || 'BMO');
      setBureauPromptCallback((value: string) => {
        if (!value?.trim()) return;
        const nextBureau = value.trim();
        updateItemsWithHistory((prev) => prev.map((it) => (it.id === inspected.id ? { ...it, bureau: nextBureau } : it)));
        addToast(`✓ Bureau assigné: ${nextBureau}`, 'success');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'assigner-bureau' as any,
          module: 'calendrier',
          targetId: inspected.id,
          targetType: 'CalendarItem',
          targetLabel: inspected.title,
          details: `Bureau assigné: ${nextBureau}`,
          bureau: nextBureau,
        });
      });
      setShowBureauPrompt(true);
      return;
    }

    // Copier / dupliquer
    if (a === 'copier') {
      setCopiedItem(inspected);
      addToast(`✓ "${inspected.title}" copié (Ctrl+V pour coller)`, 'success');
      return;
    }

    if (a === 'dupliquer') {
      const newItem: CalendarItem = {
        ...inspected,
        id: uid('EVT'),
        title: `${inspected.title} (copie)`,
        start: new Date(new Date(inspected.start).getTime() + 86400000).toISOString(), // +1 jour
        end: new Date(new Date(inspected.end).getTime() + 86400000).toISOString(),
      };
      updateItemsWithHistory((prev) => [...prev, newItem]);
      addToast(`✓ "${newItem.title}" dupliqué`, 'success');
      return;
    }

    // Escalade / terminer
    if (a === 'escalader') {
      addToast(`⚠️ Escalade de "${inspected.title}" vers BMO`, 'warning');
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'escalader' as any,
        module: 'calendrier',
        targetId: inspected.id,
        targetType: 'CalendarItem',
        targetLabel: inspected.title,
        details: 'Escalade vers BMO',
        bureau: inspected.bureau ?? 'BMO',
      });
      return;
    }

    if (a === 'terminer') {
      updateItemsWithHistory((prev) => prev.map((it) => (it.id === inspected.id ? { ...it, status: 'done' as Status } : it)));
      addToast(`✓ ${inspected.title} marqué comme terminé`, 'success');
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'terminer' as any,
        module: 'calendrier',
        targetId: inspected.id,
        targetType: 'CalendarItem',
        targetLabel: inspected.title,
        details: 'Événement terminé',
        bureau: inspected.bureau ?? 'BMO',
      });
      return;
    }

    // Annuler / supprimer => confirmation
    if (a === 'annuler' || a === 'supprimer') {
      setDeleteConfirmTitle(inspected.title);
      setDeleteConfirmCallback(() => {
        logWithHash(
          addActionLog,
          {
            userId: 'USR-001',
            userName: 'A. DIALLO',
            userRole: 'Directeur Général',
            action: 'supprimer' as any,
            module: 'calendrier',
            targetId: inspected.id,
            targetType: 'CalendarItem',
            targetLabel: inspected.title,
            details: 'Événement supprimé',
            bureau: inspected.bureau ?? 'BMO',
          },
          { before: inspected, after: null }
        );
        updateItemsWithHistory((prev) => prev.filter((it) => it.id !== inspected.id));
        addToast(`✓ ${inspected.title} supprimé`, 'success');
        setInspectedId(null);
      });
      setShowDeleteConfirm(true);
      return;
    }

    // Default
    addToast(`Action: ${a} sur ${inspected.id}`, 'success');
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: a as any,
      module: 'calendrier',
      targetId: inspected.id,
      targetType: 'CalendarItem',
      targetLabel: inspected.title,
      details: `Action '${a}' depuis inspector`,
      bureau: inspected.bureau ?? 'BMO',
    });
  }, [inspected, updateItemsWithHistory, addToast, addActionLog, setCopiedItem]);

  const setParam = useCallback(
    (patch: Record<string, string | undefined | null>) => {
      router.replace(pathname + buildQuery(sp, patch));
    },
    [router, pathname, sp]
  );

  const labels = useMemo(() => {
    const tabLabel: Record<PrimaryTab, string> = {
      planning: 'Planification',
      pilotage: 'Pilotage',
      outils: 'Outils',
    };
    const subLabel: Record<SecondaryTab, string> = {
      vues: 'Vues',
      inspector: 'Inspecteur',
      kpis: 'KPIs',
      previsions: 'Prévisions',
      comparaison: 'Comparaison',
      exports: 'Exports',
      templates: 'Templates',
      auto: 'Auto-planif',
      historique: 'Historique',
      presentation: 'Présentation',
    };
    const viewLabel: Record<CalendarView, string> = {
      week: 'Semaine',
      day: 'Jour',
      month: 'Mois',
      agenda: 'Agenda',
      gantt: 'Gantt',
      resource: 'Ressource',
      kanban: 'Kanban',
    };
    return { tabLabel, subLabel, viewLabel };
  }, []);

  // Onglets internes (style Chrome) - basés sur l'URL + persistés
  const makeWorkspaceTab = useCallback((next: { tab: PrimaryTab; sub: SecondaryTab; view?: CalendarView; itemId?: string | null }) => {
    const id = `${next.tab}:${next.sub}:${next.view ?? ''}:${next.itemId ?? ''}`;
    const base =
      next.tab === 'planning'
        ? `${labels.tabLabel.planning} • ${labels.viewLabel[next.view ?? 'week']}`
        : `${labels.tabLabel[next.tab]} • ${labels.subLabel[next.sub]}`;
    return { id, title: base, tab: next.tab, sub: next.sub, view: next.view, itemId: next.itemId ?? null } satisfies WorkspaceTab;
  }, [labels]);

  const [workspaceTabs, setWorkspaceTabs] = useState<WorkspaceTab[]>(() => {
    try {
      const saved = localStorage.getItem('calendrier.workspaceTabs');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as WorkspaceTab[];
    } catch {}
    return [];
  });

  const [activeWorkspaceTabId, setActiveWorkspaceTabId] = useState<string | null>(() => {
    try {
      const v = localStorage.getItem('calendrier.activeWorkspaceTabId');
      return v && v.length ? v : null;
    } catch {
      return null;
    }
  });

  const openWorkspaceTab = useCallback((next: { tab: PrimaryTab; sub: SecondaryTab; view?: CalendarView; itemId?: string | null }) => {
    const t = makeWorkspaceTab(next);
    setWorkspaceTabs((prev) => {
      const exists = prev.some((x) => x.id === t.id);
      const nextTabs = exists ? prev : [...prev, t].slice(-12);
      try { localStorage.setItem('calendrier.workspaceTabs', JSON.stringify(nextTabs)); } catch {}
      return nextTabs;
    });
    setActiveWorkspaceTabId(t.id);
    try { localStorage.setItem('calendrier.activeWorkspaceTabId', t.id); } catch {}
    setParam({ tab: t.tab, sub: t.sub, view: t.view ?? undefined, item: t.itemId ?? undefined });
  }, [makeWorkspaceTab, setParam]);

  const activateWorkspaceTab = useCallback((t: WorkspaceTab) => {
    setActiveWorkspaceTabId(t.id);
    try { localStorage.setItem('calendrier.activeWorkspaceTabId', t.id); } catch {}
    setParam({ tab: t.tab, sub: t.sub, view: t.view ?? undefined, item: t.itemId ?? undefined });
  }, [setParam]);

  const closeWorkspaceTab = useCallback((id: string) => {
    setWorkspaceTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const nextTabs = prev.filter((t) => t.id !== id);
      try { localStorage.setItem('calendrier.workspaceTabs', JSON.stringify(nextTabs)); } catch {}

      if (activeWorkspaceTabId === id) {
        const fallback = nextTabs[Math.min(idx, nextTabs.length - 1)] ?? nextTabs[nextTabs.length - 1] ?? null;
        const nextActiveId = fallback?.id ?? null;
        setActiveWorkspaceTabId(nextActiveId);
        try { localStorage.setItem('calendrier.activeWorkspaceTabId', nextActiveId ?? ''); } catch {}
        if (fallback) setParam({ tab: fallback.tab, sub: fallback.sub, view: fallback.view ?? undefined, item: fallback.itemId ?? undefined });
        else setParam({ tab: 'planning', sub: 'vues', view: 'week', item: undefined });
      }

      return nextTabs;
    });
  }, [activeWorkspaceTabId, setParam]);

  // A chaque changement d'URL (back/forward, partage…), s'assurer qu'un onglet existe et activer l'onglet correspondant
  useEffect(() => {
    const current = makeWorkspaceTab({ tab: primaryTab, sub: secondaryTab, view, itemId: inspectedId });
    setWorkspaceTabs((prev) => {
      const exists = prev.some((t) => t.id === current.id);
      const nextTabs = exists ? prev : [...prev, current].slice(-12);
      try { localStorage.setItem('calendrier.workspaceTabs', JSON.stringify(nextTabs)); } catch {}
      return nextTabs;
    });
    setActiveWorkspaceTabId(current.id);
    try { localStorage.setItem('calendrier.activeWorkspaceTabId', current.id); } catch {}
  }, [primaryTab, secondaryTab, view, inspectedId, makeWorkspaceTab]);

  // Prévisions (7 prochains jours)
  const predictions = useMemo(() => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return dayKeyLocal(startOfDay(date));
    });

    return next7Days.map((day) => {
      const dayLoad: Record<string, number> = {};
      for (const [bureau, days] of Object.entries(load)) {
        dayLoad[bureau] = days[day]?.minutes || 0;
      }
      const totalLoad = Object.values(dayLoad).reduce((sum, mins) => sum + mins, 0);
      const maxBureauLoad = Math.max(...Object.values(dayLoad), 0);
      const maxBureau = Object.entries(dayLoad).find(([, mins]) => mins === maxBureauLoad)?.[0] || 'N/A';
      const capacity = CAPACITY_BY_BUREAU[maxBureau] || 480;
      const isOverloaded = maxBureauLoad > capacity;

      return {
        date: day,
        totalLoad,
        maxBureau,
        maxBureauLoad,
        capacity,
        isOverloaded,
        overloadPercent: capacity > 0 ? Math.round((maxBureauLoad / capacity) * 100) : 0,
      };
    });
  }, [load]);

  // Vue ressource : groupement par assigné
  const byAssignee = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of filtered) {
      for (const assignee of it.assignees || []) {
        if (!map.has(assignee.id)) map.set(assignee.id, []);
        map.get(assignee.id)!.push(it);
      }
    }
    return map;
  }, [filtered]);

  // Vue Kanban : groupement par statut
  const byStatus = useMemo(() => {
    const map = new Map<Status, CalendarItem[]>();
    for (const it of filtered) {
      if (!map.has(it.status)) map.set(it.status, []);
      map.get(it.status)!.push(it);
    }
    return map;
  }, [filtered]);

  // Auto-scheduling
  const handleAutoSchedule = useCallback(() => {
    const scenarios = generateSchedulingScenarios(allItems, conflicts, load, CAPACITY_BY_BUREAU);
    setSchedulingScenarios(scenarios);
    setShowAutoSchedule(true);
  }, [allItems, conflicts, load]);

  // Export iCal
  const handleExportICal = useCallback(() => {
    downloadICal(filtered, `calendrier-${new Date().toISOString().split('T')[0]}.ics`);
    addToast('📥 Calendrier exporté (iCal)', 'success');
  }, [filtered, addToast]);
  
  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Titre', 'Type', 'Bureau', 'Début', 'Fin', 'Priorité', 'Statut', 'Projet', 'Conflit', 'SLA', 'SLA_Jours'];
    const rows = filtered.map((it) => {
      const sla = slaStatuses.find(s => s.itemId === it.id);
      return [
        it.id,
        it.title,
        it.kind,
        it.bureau || 'N/A',
        new Date(it.start).toLocaleString('fr-FR'),
        new Date(it.end).toLocaleString('fr-FR'),
        it.priority,
        it.status,
        it.project || '',
        conflicts.has(it.id) ? 'YES' : 'NO',
        sla?.status ?? '',
        sla?.daysOverdue ?? 0,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calendrier-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('📥 Calendrier exporté (CSV)', 'success');
  }, [filtered, conflicts, slaStatuses, addToast]);
  
  // Export JSON
  const handleExportJSON = useCallback(() => {
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        count: filtered.length,
        filters: { q, bureau: bureauParam, priorityFilter, kindFilter, view },
      },
      data: filtered.map(it => ({
        ...it,
        conflict: conflicts.has(it.id),
        sla: slaStatuses.find(s => s.itemId === it.id) ?? null,
      })),
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calendrier-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast('📥 Calendrier exporté (JSON)', 'success');
  }, [filtered, conflicts, slaStatuses, q, bureauParam, priorityFilter, kindFilter, view, addToast]);

  // Export PDF (impression) - version "métier" simple
  const handleExportPDF = useCallback(() => {
    if (typeof window === 'undefined') return;

    const dateStr = new Date().toISOString().split('T')[0];
    const rows = filtered
      .slice(0, 500)
      .map((it) => {
        const sla = slaStatuses.find((s) => s.itemId === it.id);
        const conflict = conflicts.has(it.id) ? 'Oui' : 'Non';
        const slaTxt = sla ? `${sla.status}${sla.daysOverdue ? ` (${sla.daysOverdue}j)` : ''}` : '';
        return `<tr>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;">${it.id}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${(it.title || '').replace(/</g, '&lt;')}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${it.kind}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${it.bureau || ''}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${new Date(it.start).toLocaleString('fr-FR')}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${new Date(it.end).toLocaleString('fr-FR')}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${it.status}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${conflict}</td>
          <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${slaTxt}</td>
        </tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Calendrier - Rapport ${dateStr}</title>
  <style>
    @page { margin: 12mm; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #0f172a; }
    h1 { font-size: 16px; margin: 0 0 6px; }
    .meta { font-size: 12px; color: #475569; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 6px; border-bottom: 2px solid #e5e7eb; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Calendrier — Rapport</h1>
  <div class="meta">
    Exporté le ${new Date().toLocaleString('fr-FR')} • ${filtered.length} item(s) • Vue: ${view} • Bureau: ${bureauParam} • Priorité: ${priorityFilter} • Type: ${kindFilter}
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Titre</th><th>Type</th><th>Bureau</th><th>Début</th><th>Fin</th><th>Statut</th><th>Conflit</th><th>SLA</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${filtered.length > 500 ? `<p style="margin-top:10px;color:#475569;font-size:12px;">Note: export limité à 500 lignes pour l'impression.</p>` : ''}
</body>
</html>`;

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
      addToast('⚠️ Popup bloquée: autorisez les popups pour exporter PDF', 'warning');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    addToast('📄 Rapport prêt à imprimer (PDF)', 'success');
  }, [filtered, conflicts, slaStatuses, view, bureauParam, priorityFilter, kindFilter, addToast]);

  // Export Excel (CSV compatible Excel)
  const handleExportExcel = useCallback(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    const headers = ['ID','Titre','Type','Bureau','Début','Fin','Priorité','Statut','Projet','Conflit','SLA','SLA_Jours'];
    const rows = filtered.map((it) => {
      const sla = slaStatuses.find(s => s.itemId === it.id);
      return [
        it.id,
        it.title,
        it.kind,
        it.bureau || 'N/A',
        new Date(it.start).toLocaleString('fr-FR'),
        new Date(it.end).toLocaleString('fr-FR'),
        it.priority,
        it.status,
        it.project || '',
        conflicts.has(it.id) ? 'YES' : 'NO',
        sla?.status ?? '',
        sla?.daysOverdue ?? 0,
      ];
    });
    const sep = ';';
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(sep))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calendrier-${dateStr}-excel.csv`;
    link.click();
    addToast('📊 Calendrier exporté (Excel/CSV)', 'success');
  }, [filtered, conflicts, slaStatuses, addToast]);

  // Gestion clic sur créneau horaire
  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    setEventModalDate(d);
    setEditingItem(null);
    setShowEventModal(true);
  }, []);

  // Raccourcis clavier avancés
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si dans un input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') return;
      }

      // Recherche
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        input?.focus();
      }

      // Navigation temporelle (adaptée à la vue)
      if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const offset = view === 'month' ? -30 : view === 'day' ? -1 : -7;
        setCursorDate(addDays(cursorDate, offset));
      }
      if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const offset = view === 'month' ? 30 : view === 'day' ? 1 : 7;
        setCursorDate(addDays(cursorDate, offset));
      }
      if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCursorDate(startOfDay(new Date()));
      }

      // Vues
      if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'week' });
      }
      if (e.key === '2' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'day' });
      }
      if (e.key === '3' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'gantt' });
      }
      if (e.key === '4' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'resource' });
      }
      if (e.key === '5' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'month' });
      }
      if (e.key === '6' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'agenda' });
      }
      if (e.key === '7' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setParam({ view: 'kanban' });
      }

      // Actions
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setFocusMode((prev) => ({ ...prev, enabled: !prev.enabled }));
      }
      if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleAutoSchedule();
      }
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleExportICal();
      }

      // Fermer modales
      if (e.key === 'Escape') {
        setInspectedId(null);
        setShowFilters(false);
        setShowAutoSchedule(false);
        setShowTemplates(false);
        setShowPredictions(false);
        setShowShortcuts(false);
      }

      // Aide
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Undo/Redo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorDate, setParam, handleAutoSchedule, handleExportICal, handleUndo, handleRedo, inspectedId, allItems, copiedItem, updateItemsWithHistory, addToast, view]);

  // Gestion de l'événement personnalisé open-edit-modal
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ item?: CalendarItem }>;
      const it = ce.detail?.item;
      if (!it) return;
      setEditingItem(it);
      setEventModalDate(new Date(it.start));
      setShowEventModal(true);
    };

    window.addEventListener('open-edit-modal', handler as EventListener);
    return () => window.removeEventListener('open-edit-modal', handler as EventListener);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openInspector = (id: string) => {
    setInspectedId(id);
    setSelectedIds((prev) => ({ ...prev, [id]: true }));
  };

  const doMass = (action: 'done' | 'cancel' | 'replan') => {
    if (!selectionCount) return;

    const selected = new Set(Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k));

    updateItemsWithHistory((prev) => prev.map((it) => {
      if (!selected.has(it.id)) return it;

      if (action === 'done') return { ...it, status: 'done' as Status };
      if (action === 'cancel') return { ...it, status: 'ack' as Status };
      // replan = on ne change rien ici (tu peux ouvrir la modale d'édition via scénario ensuite)
      return it;
    }));

    addToast(`✓ Action masse: ${action} sur ${selectionCount} item(s)`, 'success');

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: `mass-${action}` as any,
      module: 'calendrier',
      targetId: `selection:${selectionCount}`,
      targetType: 'CalendarItem',
      targetLabel: 'Sélection calendrier',
      details: `Action masse '${action}' sur ${selectionCount} items: ${Array.from(selected).slice(0, 20).join(', ')}${selectionCount > 20 ? '…' : ''}`,
      bureau: 'BMO',
    });
  };

  // Drag & Drop handlers avec preview amélioré
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; item: CalendarItem | null }>({ x: 0, y: 0, item: null });
  
  const handleDragStart = (e: React.DragEvent, item: CalendarItem) => {
    setDraggedItem(item);
    setDragPreview({ x: e.clientX, y: e.clientY, item });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    // Créer une image personnalisée pour le drag
    const dragImage = document.createElement('div');
    dragImage.className = cn(
      'px-3 py-2 rounded-lg border shadow-lg',
      darkMode ? 'bg-slate-800 border-orange-500/50' : 'bg-white border-orange-500',
      'text-sm font-semibold'
    );
    dragImage.textContent = item.title;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedItem) {
      setDragPreview({ x: e.clientX, y: e.clientY, item: draggedItem });
    }
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragPreview({ x: 0, y: 0, item: null });
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date, targetHour?: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newStart = new Date(targetDate);
    if (targetHour !== undefined) {
      newStart.setHours(targetHour, 0, 0, 0);
    } else {
      // Pour la vue mois, conserver l'heure originale
      const originalStart = new Date(draggedItem.start);
      newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
    }
    const duration = new Date(draggedItem.end).getTime() - new Date(draggedItem.start).getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    // Vérifier conflits avant de déplacer
    const hasConflict = allItems.some((it) => {
      if (it.id === draggedItem.id) return false;
      if (it.status === 'done' || it.status === 'ack') return false;
      const itStart = new Date(it.start);
      const itEnd = new Date(it.end);
      return (
        (newStart < itEnd && newEnd > itStart) &&
        (draggedItem.bureau === it.bureau ||
         (draggedItem.assignees || []).some((a) => (it.assignees || []).some((o) => o.id === a.id)))
      );
    });

    if (hasConflict) {
      addToast('⚠️ Conflit détecté à ce créneau', 'warning');
      setDraggedItem(null);
      return;
    }

    // Mettre à jour l'item avec historique
    updateItemsWithHistory((prev) =>
      prev.map((it) =>
        it.id === draggedItem.id
          ? { ...it, start: newStart.toISOString(), end: newEnd.toISOString() }
          : it
      )
    );

    addToast(`✓ ${draggedItem.title} déplacé`, 'success');
    
    // Traçabilité avec hash pour drag & drop
    const updatedItem = { ...draggedItem, start: newStart.toISOString(), end: newEnd.toISOString() };
    logWithHash(addActionLog, {
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'replanifier' as any,
      module: 'calendrier',
      targetId: draggedItem.id,
      targetType: 'CalendarItem',
      targetLabel: draggedItem.title,
      details: `Déplacé vers ${newStart.toLocaleString('fr-FR')}`,
      bureau: draggedItem.bureau ?? 'BMO',
    }, { before: draggedItem, after: updatedItem });

    setDraggedItem(null);
  };

  const applySchedulingScenario = (scenario: SchedulingScenario) => {
    updateItemsWithHistory((prev) => {
      const byId = new Map(scenario.changes.map(c => [c.itemId, c]));
      return prev.map((it) => {
        const ch = byId.get(it.id);
        return ch ? { ...it, start: ch.newStart, end: ch.newEnd } : it;
      });
    });

    addToast(`✓ Scénario "${scenario.name}" appliqué`, 'success');
    setShowAutoSchedule(false);
  };

  // Handler pour sauvegarder un événement (avec génération récurrente)
  const handleSaveEvent = useCallback((formData: EventFormData) => {
    if (editingItem) {
      // Modification d'un événement existant
      updateItemsWithHistory((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                title: formData.title,
                description: formData.description,
                kind: formData.kind,
                bureau: formData.bureau,
                assignees: formData.assignees,
                start: formData.start.toISOString(),
                end: formData.end.toISOString(),
                priority: formData.priority,
                severity: formData.severity,
                status: formData.status,
                project: formData.project,
              }
            : it
        )
      );
      // Traçabilité avec hash pour modification
      const updatedItem = {
        ...editingItem,
        title: formData.title,
        description: formData.description,
        kind: formData.kind,
        bureau: formData.bureau,
        assignees: formData.assignees,
        start: formData.start.toISOString(),
        end: formData.end.toISOString(),
        priority: formData.priority,
        severity: formData.severity,
        status: formData.status,
        project: formData.project,
      };
      logWithHash(addActionLog, {
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'modifier' as any,
        module: 'calendrier',
        targetId: editingItem.id,
        targetType: 'CalendarItem',
        targetLabel: formData.title,
        details: '',
        bureau: formData.bureau ?? 'BMO',
      }, { before: editingItem, after: updatedItem });
      
      addToast(`✓ ${formData.title} modifié`, 'success');
    } else {
      // Création d'un nouvel événement (avec récurrence si nécessaire)
      const newEvents = generateRecurringEvents(formData, formData.recurrence, formData.recurrenceEnd);
      updateItemsWithHistory((prev) => [...prev, ...newEvents]);
      
      if (newEvents.length > 1) {
        addToast(`✓ ${newEvents.length} occurrences créées pour "${formData.title}"`, 'success');
      } else {
        addToast(`✓ ${formData.title} créé`, 'success');
      }
      
      // Traçabilité avec hash pour création
      logWithHash(addActionLog, {
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'creer' as any,
        module: 'calendrier',
        targetId: newEvents[0]?.id || 'N/A',
        targetType: 'CalendarItem',
        targetLabel: formData.title,
        details: formData.recurrence !== 'none' ? `Récurrence: ${formData.recurrence}` : '',
        bureau: formData.bureau ?? 'BMO',
      }, { before: null, after: newEvents[0] || newEvents });
    }
    
    setShowEventModal(false);
    setEditingItem(null);
  }, [editingItem, updateItemsWithHistory, addToast, addActionLog]);

  // Stats
  const stats = useMemo(() => {
    const overdue = slaStatuses.filter((s) => s.isOverdue).length;

    const overloaded = Object.entries(load).some(([bureau, days]) => {
      const capacity = CAPACITY_BY_BUREAU[bureau] ?? 480;
      return Object.values(days).some((d) => d.minutes > capacity);
    });

    return { conflicts: conflicts.size, overdue, overloaded };
  }, [conflicts, slaStatuses, load]);

  return (
    <div
      className={cn(
        'h-full min-h-0 w-full overflow-hidden',
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      )}
    >
      <div className="mx-auto max-w-[1800px] p-4 h-full min-h-0">
        <div className="flex gap-4 h-full min-h-0 min-w-0">
          {/* Sidebar */}
          <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-3 h-full min-h-0 overflow-y-auto scrollbar-subtle">
            {/* Navigation style Explorateur Windows */}
            {uiMode === 'windows' && (
              <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1 text-sm">
                    <button
                      type="button"
                      onClick={() => openWorkspaceTab({ tab: 'planning', sub: 'vues', view })}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded border transition',
                        primaryTab === 'planning' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' : darkMode ? 'border-slate-700/60 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {labels.tabLabel.planning}
                      <span className="ml-2 text-xs text-slate-400">› {labels.viewLabel[view]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openWorkspaceTab({ tab: 'pilotage', sub: 'kpis' })}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded border transition',
                        primaryTab === 'pilotage' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' : darkMode ? 'border-slate-700/60 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {labels.tabLabel.pilotage}
                      <span className="ml-2 text-xs text-slate-400">› {labels.subLabel[secondaryTab]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openWorkspaceTab({ tab: 'outils', sub: 'exports' })}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded border transition',
                        primaryTab === 'outils' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' : darkMode ? 'border-slate-700/60 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {labels.tabLabel.outils}
                      <span className="ml-2 text-xs text-slate-400">› {labels.subLabel[secondaryTab]}</span>
                    </button>
                  </div>

                  {primaryTab === 'planning' && (
                    <div className="pt-2 border-t border-slate-700/40">
                      <p className="text-[11px] text-slate-400 mb-2">Vues</p>
                      <div className="grid grid-cols-2 gap-1">
                        {(['week','day','month','agenda','gantt','resource','kanban'] as CalendarView[]).map((v) => (
                          <Button
                            key={v}
                            type="button"
                            size="sm"
                            variant={view === v ? 'default' : 'secondary'}
                            onClick={() => openWorkspaceTab({ tab: 'planning', sub: 'vues', view: v })}
                          >
                            {labels.viewLabel[v]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bureaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={bureauParam === 'ALL' ? 'default' : 'secondary'}
                    onClick={() => setParam({ bureau: 'ALL' })}
                  >
                    Tous
                  </Button>
                  {BUREAUX.map((b) => (
                    <Button
                      key={b}
                      size="sm"
                      variant={bureauParam === b ? 'default' : 'secondary'}
                      onClick={() => setParam({ bureau: b })}
                    >
                      {b}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats widgets */}
            <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Indicateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={cn('rounded-lg p-3', darkMode ? 'bg-slate-950/40' : 'bg-white')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn('w-4 h-4', stats.conflicts ? 'text-red-400' : 'text-emerald-400')} />
                      <p className="text-xs text-slate-400">Conflits</p>
                    </div>
                    <p className={cn('text-2xl font-bold', stats.conflicts ? 'text-red-400' : 'text-emerald-400')}>
                      {stats.conflicts}
                    </p>
                  </div>
                </div>

                <div className={cn('rounded-lg p-3', darkMode ? 'bg-slate-950/40' : 'bg-white')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={cn('w-4 h-4', stats.overdue ? 'text-red-400' : 'text-slate-400')} />
                      <p className="text-xs text-slate-400">SLA en retard</p>
                    </div>
                    <p className={cn('text-2xl font-bold', stats.overdue ? 'text-red-400' : 'text-slate-400')}>
                      {stats.overdue}
                    </p>
                  </div>
                </div>

                <div className={cn('rounded-lg p-3', darkMode ? 'bg-slate-950/40' : 'bg-white')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={cn('w-4 h-4', stats.overloaded ? 'text-amber-400' : 'text-slate-400')} />
                      <p className="text-xs text-slate-400">Surcharges</p>
                    </div>
                    <p className={cn('text-2xl font-bold', stats.overloaded ? 'text-amber-400' : 'text-slate-400')}>
                      {stats.overloaded ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charge par bureau */}
            <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Charge (aujourd'hui)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from(visibleBureaux).map((b) => {
                  const dayKey = dayKeyLocal(startOfDay(new Date()));
                  const data = load[b]?.[dayKey];
                  const mins = data?.minutes ?? 0;
                  const hours = (mins / 60).toFixed(1);
                  const capacity = CAPACITY_BY_BUREAU[b] || 480;
                  const percent = Math.round((mins / capacity) * 100);
                  const isOverloaded = mins > capacity;

                  return (
                    <div key={b} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{b}</span>
                        <span className={cn('font-mono', isOverloaded ? 'text-red-400' : 'text-slate-200')}>
                          {hours}h / {(capacity / 60).toFixed(0)}h
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all', isOverloaded ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mode Focus */}
            {focusMode.enabled && (
              <Card className={cn('border-orange-500/30', darkMode ? 'bg-orange-500/5' : 'bg-orange-50')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-orange-400" />
                      Mode Focus
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setFocusMode({ enabled: false, showOnly: 'all' })}>
                      <X className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <select
                    value={focusMode.showOnly}
                    onChange={(e) => setFocusMode((prev) => ({ ...prev, showOnly: e.target.value as any }))}
                    className={cn(
                      'w-full h-8 rounded-lg px-3 text-sm border',
                      darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
                    )}
                  >
                    <option value="all">Tout afficher</option>
                    <option value="critical">Priorités critiques uniquement</option>
                    <option value="my-items">Mes items</option>
                    <option value="conflicts">Conflits uniquement</option>
                    <option value="overdue-sla">SLA en retard</option>
                  </select>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className={cn('border-amber-500/30', darkMode ? 'bg-amber-500/5' : 'bg-amber-50')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Suggestions
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowSuggestions(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <p className="font-semibold text-amber-300">{s.title}</p>
                      <p className="text-slate-400 mt-1">{s.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
            {/* Command bar sticky */}
            <div
              className={cn(
                'sticky top-0 z-30 rounded-xl border p-3 backdrop-blur',
                darkMode ? 'bg-slate-950/70 border-slate-700/60' : 'bg-white/80 border-slate-200'
              )}
            >
              {/* Mode "Explorateur Windows" : barre commandes + barre d'adresse */}
              {uiMode === 'windows' && (
                <div className="mb-3 pb-3 border-b border-slate-700/40 space-y-2">
                  {/* Onglets internes (style Chrome) */}
                  <div className={cn(
                    'flex items-center gap-1 overflow-x-auto scrollbar-subtle pb-1',
                    darkMode ? '' : ''
                  )}>
                    {workspaceTabs.map((t) => {
                      const active = t.id === activeWorkspaceTabId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => activateWorkspaceTab(t)}
                          className={cn(
                            'group inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg border text-xs whitespace-nowrap transition',
                            active
                              ? 'bg-slate-900 border-slate-700 text-white'
                              : darkMode
                              ? 'bg-slate-900/30 border-slate-700/60 text-slate-300 hover:bg-slate-900/50'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          )}
                          title={t.title}
                        >
                          <span className="max-w-[220px] truncate">{t.title}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              closeWorkspaceTab(t.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                closeWorkspaceTab(t.id);
                              }
                            }}
                            className={cn(
                              'ml-1 inline-flex items-center justify-center w-4 h-4 rounded hover:bg-slate-800/60',
                              'opacity-70 group-hover:opacity-100'
                            )}
                            aria-label={`Fermer l'onglet ${t.title}`}
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </button>
                      );
                    })}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openWorkspaceTab({ tab: 'planning', sub: 'vues', view: 'week' })}
                      title="Nouvel onglet Planification"
                      className="ml-1"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Commandes */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEventModalDate(new Date());
                        setEditingItem(null);
                        setShowEventModal(true);
                      }}
                    >
                      Nouveau
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={!selectionCount} onClick={() => doMass('done')}>
                      Terminer
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={!selectionCount} onClick={() => doMass('cancel')}>
                      Annuler
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={handleAutoSchedule}>
                      Optimiser
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowTemplates(true)}>
                      Templates
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowAnalytics(true)}>
                      Analytics
                    </Button>
                    <div className="flex-1" />
                    <Button type="button" size="sm" variant="outline" onClick={() => setParam({ ui: 'classic' })}>
                      UI classique
                    </Button>
                  </div>

                  {/* Barre d'adresse */}
                  <div className={cn('flex items-center gap-2 rounded-lg border px-2 py-1', darkMode ? 'border-slate-700/60 bg-slate-900/30' : 'border-slate-200 bg-white')}>
                    <span className="text-xs text-slate-400">Maitre-ouvrage</span>
                    <span className="text-xs text-slate-500">›</span>
                    <button type="button" className="text-xs hover:underline" onClick={() => openWorkspaceTab({ tab: 'planning', sub: 'vues', view })}>Calendrier</button>
                    <span className="text-xs text-slate-500">›</span>
                    <button
                      type="button"
                      className="text-xs hover:underline"
                      onClick={() => openWorkspaceTab({ tab: primaryTab, sub: primaryTab === 'planning' ? 'vues' : primaryTab === 'pilotage' ? 'kpis' : 'exports', view })}
                    >
                      {labels.tabLabel[primaryTab]}
                    </button>
                    <span className="text-xs text-slate-500">›</span>
                    <button type="button" className="text-xs hover:underline" onClick={() => openWorkspaceTab({ tab: primaryTab, sub: secondaryTab, view })}>
                      {labels.subLabel[secondaryTab]}
                    </button>
                    {primaryTab === 'planning' && (
                      <>
                        <span className="text-xs text-slate-500">›</span>
                        <button type="button" className="text-xs hover:underline" onClick={() => openWorkspaceTab({ tab: 'planning', sub: 'vues', view })}>
                          {labels.viewLabel[view]}
                        </button>
                      </>
                    )}
                    <div className="flex-1" />
                    <span className="text-[11px] text-slate-500">Recherche:</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1 max-w-[520px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={q}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParam({ q: value });
                        setShowSearchSuggestions(value.length > 0 && searchHistory.length > 0);
                      }}
                      onFocus={() => {
                        if (q.length > 0 && searchHistory.length > 0) {
                          setShowSearchSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Délai pour permettre le clic sur une suggestion
                        setTimeout(() => setShowSearchSuggestions(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && q.trim()) {
                          // Ajouter à l'historique
                          const trimmed = q.trim();
                          if (!searchHistory.includes(trimmed)) {
                            const newHistory = [trimmed, ...searchHistory].slice(0, 10);
                            setSearchHistory(newHistory);
                            try {
                              localStorage.setItem('calendrier.searchHistory', JSON.stringify(newHistory));
                            } catch {}
                          }
                          setShowSearchSuggestions(false);
                        }
                      }}
                      placeholder="Rechercher (id, titre, bureau, projet...) [Appuyez sur /]"
                      className={cn(
                        'pl-9',
                        darkMode
                          ? 'bg-slate-900/60 border-slate-700/60 placeholder:text-slate-500'
                          : 'bg-white border-slate-200'
                      )}
                      aria-label="Rechercher dans le calendrier"
                      role="searchbox"
                      aria-autocomplete="list"
                      aria-expanded={showSearchSuggestions}
                    />
                    {q !== deferredQ && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                    )}
                    
                    {/* Suggestions de recherche */}
                    {showSearchSuggestions && searchHistory.length > 0 && (
                      <div className={cn(
                        'absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-60 overflow-y-auto',
                        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                      )}>
                        {searchHistory
                          .filter((h) => h.toLowerCase().includes(q.toLowerCase()))
                          .slice(0, 5)
                          .map((hist, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setParam({ q: hist });
                                setShowSearchSuggestions(false);
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2 text-sm hover:bg-slate-800/50 transition-colors',
                                darkMode ? 'text-slate-200' : 'text-slate-900'
                              )}
                            >
                              <Search className="w-3 h-3 inline mr-2 text-slate-400" />
                              {hist}
                            </button>
                          ))}
                        {q.trim() && !searchHistory.includes(q.trim()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = q.trim();
                              const newHistory = [trimmed, ...searchHistory].slice(0, 10);
                              setSearchHistory(newHistory);
                              try {
                                localStorage.setItem('calendrier.searchHistory', JSON.stringify(newHistory));
                              } catch {}
                              setShowSearchSuggestions(false);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm hover:bg-slate-800/50 transition-colors border-t',
                              darkMode ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'
                            )}
                          >
                            <FileUp className="w-3 h-3 inline mr-2 text-slate-400" />
                            Ajouter "{q.trim()}" à l'historique
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1" role="group" aria-label="Navigation calendrier">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => setCursorDate(startOfDay(new Date()))}
                      aria-label="Aller à aujourd'hui"
                      title="Aller à aujourd'hui (Ctrl+Home)"
                    >
                      Aujourd'hui
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => {
                        const offset = view === 'month' ? -30 : view === 'day' ? -1 : -7;
                        setCursorDate(addDays(cursorDate, offset));
                      }}
                      aria-label={view === 'month' ? 'Mois précédent' : view === 'day' ? 'Jour précédent' : 'Semaine précédente'}
                      title={view === 'month' ? 'Mois précédent (Ctrl+←)' : view === 'day' ? 'Jour précédent (Ctrl+←)' : 'Semaine précédente (Ctrl+←)'}
                    >
                      ←
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => {
                        const offset = view === 'month' ? 30 : view === 'day' ? 1 : 7;
                        setCursorDate(addDays(cursorDate, offset));
                      }}
                      aria-label={view === 'month' ? 'Mois suivant' : view === 'day' ? 'Jour suivant' : 'Semaine suivante'}
                      title={view === 'month' ? 'Mois suivant (Ctrl+→)' : view === 'day' ? 'Jour suivant (Ctrl+→)' : 'Semaine suivante (Ctrl+→)'}
                    >
                      →
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle UI (visible aussi en mode classic) */}
                  {uiMode !== 'windows' && (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setParam({ ui: 'windows' })} title="Activer le modèle Explorateur Windows">
                      <Users className="w-4 h-4 mr-1" />
                      Windows
                    </Button>
                  )}
                  <Tabs
                    value={primaryTab}
                    onValueChange={(v) => {
                      setParam({ tab: v, sub: undefined });
                      if (v === 'planning') setParam({ view: view || 'week' });
                    }}
                    className="w-full"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <TabsList className="bg-slate-900/40">
                        <TabsTrigger value="planning">Planification</TabsTrigger>
                        <TabsTrigger value="pilotage">Pilotage</TabsTrigger>
                        <TabsTrigger value="outils">Outils</TabsTrigger>
                      </TabsList>

                      {/* Sous-onglets (niveau 2) */}
                      {primaryTab === 'planning' && (
                        <Tabs value={secondaryTab} onValueChange={(v) => openWorkspaceTab({ tab: 'planning', sub: v as SecondaryTab, view })}>
                          <TabsList className="bg-slate-900/40">
                            <TabsTrigger value="vues">Vues</TabsTrigger>
                            <TabsTrigger value="inspector">Inspecteur</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                      {primaryTab === 'pilotage' && (
                        <Tabs value={secondaryTab} onValueChange={(v) => openWorkspaceTab({ tab: 'pilotage', sub: v as SecondaryTab })}>
                          <TabsList className="bg-slate-900/40">
                            <TabsTrigger value="kpis">KPIs</TabsTrigger>
                            <TabsTrigger value="previsions">Prévisions</TabsTrigger>
                            <TabsTrigger value="comparaison">Comparaison</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                      {primaryTab === 'outils' && (
                        <Tabs value={secondaryTab} onValueChange={(v) => openWorkspaceTab({ tab: 'outils', sub: v as SecondaryTab })}>
                          <TabsList className="bg-slate-900/40">
                            <TabsTrigger value="exports">Exports</TabsTrigger>
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger value="auto">Auto-planif</TabsTrigger>
                            <TabsTrigger value="historique">Historique</TabsTrigger>
                            <TabsTrigger value="presentation">Présentation</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                    </div>

                    {/* Sous-sous-onglets (niveau 3) : seulement en Planification/Vues */}
                    <TabsContent value="planning" className="mt-2">
                      {secondaryTab === 'vues' && (
                        <Tabs value={view} onValueChange={(v) => openWorkspaceTab({ tab: 'planning', sub: 'vues', view: v as CalendarView })}>
                          <TabsList className="bg-slate-900/40">
                            <TabsTrigger value="week">Semaine</TabsTrigger>
                            <TabsTrigger value="day">Jour</TabsTrigger>
                            <TabsTrigger value="month">Mois</TabsTrigger>
                            <TabsTrigger value="agenda">Agenda</TabsTrigger>
                            <TabsTrigger value="gantt">Gantt</TabsTrigger>
                            <TabsTrigger value="resource">Ressource</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                    </TabsContent>
                  </Tabs>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowShortcuts(true)}
                    title="Raccourcis clavier (Ctrl+?)"
                  >
                    <Command className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={focusMode.enabled ? 'default' : 'secondary'}
                    onClick={() => setFocusMode((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    title="Mode Focus"
                  >
                    {focusMode.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Filtres avancés */}
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                  <div className="flex flex-wrap gap-2">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setParam({ priority: e.target.value === 'ALL' ? undefined : e.target.value })}
                    className={cn(
                      'h-8 rounded-lg px-3 text-sm border',
                      darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
                    )}
                  >
                    <option value="ALL">Toutes priorités</option>
                    <option value="critical">Critical</option>
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                  </select>
                  <select
                    value={kindFilter}
                    onChange={(e) => setParam({ kind: e.target.value === 'ALL' ? undefined : e.target.value })}
                    className={cn(
                      'h-8 rounded-lg px-3 text-sm border',
                      darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
                    )}
                  >
                    <option value="ALL">Tous types</option>
                    <option value="meeting">Réunion</option>
                    <option value="validation">Validation</option>
                    <option value="payment">Paiement</option>
                    <option value="contract">Contrat</option>
                    <option value="deadline">Échéance</option>
                    <option value="absence">Absence</option>
                  </select>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
                    <select
                      value=""
                      onChange={(e) => {
                        const presetId = e.target.value;
                        if (presetId && presetId !== '') {
                          const preset = filterPresets.find((p) => p.id === presetId);
                          if (preset) {
                            setParam({
                              priority: preset.priority === 'ALL' ? undefined : preset.priority,
                              kind: preset.kind === 'ALL' ? undefined : preset.kind,
                            });
                            addToast(`✓ Preset "${preset.name}" chargé`, 'success');
                          }
                        }
                        e.target.value = '';
                      }}
                      className={cn(
                        'h-8 rounded-lg px-3 text-sm border flex-1',
                        darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
                      )}
                    >
                      <option value="">Charger un preset...</option>
                      {filterPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPresetName('');
                        setShowPresetModal(true);
                      }}
                      title="Sauvegarder le preset actuel"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {filterPresets.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeleteConfirmTitle('tous les presets');
                          setDeleteConfirmCallback(() => {
                            setFilterPresets([]);
                            localStorage.removeItem('calendrier.filterPresets');
                            addToast('✓ Presets supprimés', 'success');
                          });
                          setShowDeleteConfirm(true);
                        }}
                        title="Supprimer tous les presets"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Actions masse */}
              <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="info">Sélection: {selectionCount}</Badge>
                  <Button type="button" size="sm" disabled={!selectionCount} onClick={() => doMass('done')}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Terminer
                  </Button>
                  <Button type="button" size="sm" variant="destructive" disabled={!selectionCount} onClick={() => doMass('cancel')}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Annuler
                  </Button>
                  <Button type="button" size="sm" variant="secondary" disabled={!selectionCount} onClick={() => doMass('replan')}>
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Replanifier
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isOnline ? 'success' : 'warning'} 
                    className="flex items-center gap-1"
                    title={isOnline ? 'En ligne' : 'Hors ligne - Mode cache activé'}
                  >
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                  <Badge variant={stats.conflicts ? 'urgent' : 'success'}>Conflits: {stats.conflicts}</Badge>
                  <Badge variant={stats.overdue ? 'urgent' : 'default'}>SLA: {stats.overdue}</Badge>
                  <Button type="button" size="sm" variant="secondary" onClick={() => { setSelectedIds({}); setInspectedId(null); }}>
                    Vider
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleExportICal} title="Exporter iCal (Ctrl+E)">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleExportCSV} title="Exporter CSV">
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleExportJSON} title="Exporter JSON">
                    <Download className="w-4 h-4" />
                    JSON
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAnalytics(true)}
                    title="Analytics avancés"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Analytics
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.ics';
                      input.onchange = async (e) => {
                        try {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;

                          const content = await file.text();
                          const mod = await import('@/lib/utils/ical-export');
                          const parseICal = mod.parseICal;

                          if (!parseICal) {
                            addToast("⚠️ Import iCal indisponible (parseICal manquant)", 'warning');
                            return;
                          }

                          const importedRaw = parseICal(content);
                          if (!Array.isArray(importedRaw) || importedRaw.length === 0) {
                            addToast("⚠️ Aucun événement valide trouvé dans le fichier", 'warning');
                            return;
                          }

                          const imported = importedRaw.map((it: any) => ({
                            ...it,
                            id: uid('EVT'),
                            kind: (it.kind || 'event') as CalendarKind,
                            priority: (it.priority || 'normal') as Priority,
                            severity: (it.severity || 'info') as Severity,
                            status: (it.status || 'open') as Status,
                          } as CalendarItem));

                          updateItemsWithHistory((prev) => [...prev, ...imported]);
                          addToast(`✓ ${imported.length} événement(s) importé(s)`, 'success');
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                          addToast(`❌ Erreur lors de l'import du fichier iCal: ${errorMessage}`, 'error');
                        }
                      };
                      input.click();
                    }}
                    title="Importer iCal"
                  >
                    <FileUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={handleAutoSchedule}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    title="Auto-scheduling intelligent (Ctrl+O)"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Optimiser
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowTemplates(true)}
                    title="Templates & événements récurrents"
                  >
                    <Repeat className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowPredictions(!showPredictions)}
                    title="Prévisions charge"
                  >
                    <TrendingDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setEventModalDate(new Date());
                      setEditingItem(null);
                      setShowEventModal(true);
                    }}
                    title="Créer un événement"
                  >
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Nouveau
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowMultiBureau(!showMultiBureau)}
                    title="Vue multi-bureaux"
                  >
                    <Building2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Canvas avec transitions */}
            <div
              className={cn(
                'flex-1 min-h-0 rounded-xl border overflow-hidden transition-all duration-300 ease-in-out',
                darkMode ? 'border-slate-700/60 bg-slate-900/30' : 'border-slate-200 bg-white'
              )}
            >
              <div className="h-full flex">
                <div className="flex-1 h-full overflow-auto scrollbar-subtle">
                  <div className={cn(
                    'transition-opacity duration-300 ease-in-out',
                    'opacity-100'
                  )}>
                  {/* PILOTAGE / OUTILS : contenu métier dans la page (pas caché) */}
                  {primaryTab === 'pilotage' && (
                    <div className="p-4 space-y-4">
                      {secondaryTab === 'kpis' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4" />
                              <p className="text-sm font-semibold">KPIs & Performance</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowAnalytics(true)}>
                              Ouvrir en plein écran
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">
                            Les KPIs sont disponibles ici. (Option “plein écran” conservée pour le confort.)
                          </p>
                        </div>
                      )}

                      {secondaryTab === 'previsions' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-amber-400" />
                              <p className="text-sm font-semibold">Prévisions (7 jours)</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowPredictions(true)}>
                              Widget
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {predictions.map((pred, idx) => (
                              <div
                                key={pred.date}
                                className={cn(
                                  'p-3 rounded-lg border',
                                  pred.isOverloaded
                                    ? 'border-red-500/30 bg-red-500/10'
                                    : pred.overloadPercent > 80
                                    ? 'border-amber-500/30 bg-amber-500/10'
                                    : darkMode
                                    ? 'bg-slate-800/40 border-slate-700/60'
                                    : 'bg-slate-50 border-slate-200'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {idx === 0 ? "Aujourd'hui" : idx === 1 ? 'Demain' : new Date(pred.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                  </span>
                                  <Badge variant={pred.isOverloaded ? 'urgent' : pred.overloadPercent > 80 ? 'warning' : 'default'}>
                                    {pred.overloadPercent}%
                                  </Badge>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {pred.maxBureau}: {(pred.maxBureauLoad / 60).toFixed(1)}h / {(pred.capacity / 60).toFixed(0)}h
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {secondaryTab === 'comparaison' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <GitCompare className="w-4 h-4" />
                              <p className="text-sm font-semibold">Comparaison de périodes</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowPeriodComparison(true)}>
                              Ouvrir
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">
                            Compare deux périodes (activité / terminés). Ouverture via panneau dédié.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {primaryTab === 'outils' && (
                    <div className="p-4 space-y-4">
                      {secondaryTab === 'exports' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              <p className="text-sm font-semibold">Exports</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" size="sm" variant="secondary" onClick={handleExportCSV}>CSV</Button>
                            <Button type="button" size="sm" variant="secondary" onClick={handleExportJSON}>JSON</Button>
                            <Button type="button" size="sm" variant="secondary" onClick={handleExportICal}>iCal</Button>
                            <Button type="button" size="sm" variant="outline" onClick={handleExportPDF}>PDF</Button>
                            <Button type="button" size="sm" variant="outline" onClick={handleExportExcel}>Excel</Button>
                          </div>
                          <p className="text-xs text-slate-400 mt-3">
                            Les exports incluent conflits/SLA (CSV + JSON enrichis).
                          </p>
                        </div>
                      )}

                      {secondaryTab === 'templates' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Repeat className="w-4 h-4" />
                              <p className="text-sm font-semibold">Templates</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
                              Ouvrir
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">Catalogue de modèles pour créer rapidement des événements.</p>
                        </div>
                      )}

                      {secondaryTab === 'auto' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <p className="text-sm font-semibold">Auto-planification</p>
                            </div>
                            <Button type="button" size="sm" variant="default" onClick={handleAutoSchedule}>
                              Optimiser
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">Génère des scénarios pour réduire conflits / surcharge / SLA.</p>
                        </div>
                      )}

                      {secondaryTab === 'historique' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <HistoryIcon className="w-4 h-4" />
                              <p className="text-sm font-semibold">Historique</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowHistory(true)}>
                              Ouvrir
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">Restaurer des états précédents (Undo/Redo étendu).</p>
                        </div>
                      )}

                      {secondaryTab === 'presentation' && (
                        <div className={cn('rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Maximize2 className="w-4 h-4" />
                              <p className="text-sm font-semibold">Mode Présentation</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowPresentationMode(true)}>
                              Lancer
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">Plein écran pour réunion (navigation clavier).</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PLANIFICATION : calendrier */}
                  {primaryTab === 'planning' && view === 'week' && (
                    <WeekView
                      days={weekDays}
                      items={filtered}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      onOpen={openInspector}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      darkMode={darkMode}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onTimeSlotClick={handleTimeSlotClick}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'agenda' && (
                    <AgendaView
                      items={filtered}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      onOpen={openInspector}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      darkMode={darkMode}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'day' && (
                    <DayView
                      day={cursorDate}
                      items={filtered}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      onOpen={openInspector}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      darkMode={darkMode}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onTimeSlotClick={handleTimeSlotClick}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'gantt' && (
                    <GanttView
                      items={filtered}
                      conflicts={conflicts}
                      weekStart={weekStart}
                      onOpen={openInspector}
                      darkMode={darkMode}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'month' && (
                    <MonthView
                      cursorDate={cursorDate}
                      items={filtered}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      selectedIds={selectedIds}
                      onOpen={openInspector}
                      onToggleSelect={toggleSelect}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      darkMode={darkMode}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'resource' && (
                    <ResourceView
                      byAssignee={byAssignee}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      weekDays={weekDays}
                      onOpen={openInspector}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      darkMode={darkMode}
                    />
                  )}
                  {primaryTab === 'planning' && view === 'kanban' && (
                    <KanbanView
                      byStatus={byStatus}
                      conflicts={conflicts}
                      slaStatuses={slaStatuses}
                      onOpen={openInspector}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      onMoveItem={(itemId, newStatus) => {
                        updateItemsWithHistory((prev) =>
                          prev.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
                        );
                        addToast(`✓ Statut mis à jour: ${newStatus}`, 'success');
                        addActionLog({
                          userId: 'USR-001',
                          userName: 'A. DIALLO',
                          userRole: 'Directeur Général',
                          action: 'changer-statut' as any,
                          module: 'calendrier',
                          targetId: itemId,
                          targetType: 'CalendarItem',
                          targetLabel: itemId,
                          details: `Kanban: ${newStatus}`,
                          bureau: 'BMO',
                        });
                      }}
                      darkMode={darkMode}
                    />
                  )}
                  </div>
                </div>

                {/* Inspector */}
                <div
                  className={cn(
                    'hidden xl:flex w-[420px] shrink-0 border-l h-full',
                    primaryTab !== 'planning' && 'hidden',
                    darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-white'
                  )}
                >
                  <Inspector
                    item={inspected}
                    conflicts={conflicts}
                    slaStatuses={slaStatuses}
                    onClose={() => setInspectedId(null)}
                    onAction={handleInspectorAction}
                    darkMode={darkMode}
                    onEdit={() => {
                      if (!inspected) return;
                      setEditingItem(inspected);
                      setEventModalDate(new Date(inspected.start));
                      setShowEventModal(true);
                    }}
                    onDelete={() => {
                      if (!inspected) return;
                      setDeleteConfirmTitle(inspected.title);
                      setDeleteConfirmCallback(() => {
                        // Traçabilité avec hash pour suppression
                        logWithHash(addActionLog, {
                          userId: 'USR-001',
                          userName: 'A. DIALLO',
                          userRole: 'Directeur Général',
                          action: 'supprimer' as any,
                          module: 'calendrier',
                          targetId: inspected.id,
                          targetType: 'CalendarItem',
                          targetLabel: inspected.title,
                          details: 'Événement supprimé',
                          bureau: inspected.bureau ?? 'BMO',
                        }, { before: inspected, after: null });
                        
                        updateItemsWithHistory((prev) => prev.filter((it) => it.id !== inspected.id));
                        addToast(`✓ ${inspected.title} supprimé`, 'success');
                        setInspectedId(null);
                      });
                      setShowDeleteConfirm(true);
                    }}
                    onUpdateItem={(itemId, updates) => {
                      updateItemsWithHistory((prev) =>
                        prev.map((it) => (it.id === itemId ? { ...it, ...updates } : it))
                      );
                      addToast('✓ Note ajoutée', 'success');
                    }}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modale Auto-scheduling */}
      {showAutoSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className={cn('w-full max-w-3xl', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Auto-scheduling</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAutoSchedule(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedulingScenarios.length === 0 ? (
                <p className="text-sm text-slate-400">Aucun scénario proposé (ou données insuffisantes).</p>
              ) : (
                <div className="space-y-2">
                  {schedulingScenarios.map((sc, idx) => (
                    <div key={idx} className={cn('p-3 rounded-lg border', darkMode ? 'border-slate-700/60 bg-slate-950/30' : 'border-slate-200 bg-slate-50')}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{sc.name}</p>
                          <p className="text-xs text-slate-400">{sc.changes?.length ?? 0} déplacement(s) proposé(s)</p>
                        </div>
                        <Button type="button" size="sm" onClick={() => applySchedulingScenario(sc)}>
                          Appliquer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panneau Prévisions */}
      {showPredictions && (
        <PredictionsPanel
          predictions={predictions}
          onClose={() => setShowPredictions(false)}
          darkMode={darkMode}
        />
      )}

      {/* Panneau Analytics */}
      {showAnalytics && (
        <AnalyticsPanel
          items={filtered}
          conflicts={conflicts}
          load={load}
          slaStatuses={slaStatuses}
          stats={stats}
          onClose={() => setShowAnalytics(false)}
          darkMode={darkMode}
        />
      )}

      {/* Mode Présentation */}
      {showPresentationMode && (
        <PresentationMode
          items={filtered}
          onClose={() => setShowPresentationMode(false)}
          darkMode={darkMode}
        />
      )}

      {/* Comparaison de périodes */}
      {showPeriodComparison && (
        <PeriodComparisonPanel
          items={allItems}
          onClose={() => setShowPeriodComparison(false)}
          darkMode={darkMode}
        />
      )}

      {/* Historique des modifications */}
      {showHistory && (
        <HistoryPanel
          history={history}
          historyIndex={historyIndex}
          onClose={() => setShowHistory(false)}
          onRestore={(idx) => {
            setItems(history[idx]);
            setHistoryIndex(idx);
            addToast(`✓ État #${history.length - idx} restauré`, 'success');
          }}
          darkMode={darkMode}
        />
      )}

      {/* Inspector en modale sur écrans < xl (le panneau droit est caché) */}
      <Dialog
        open={Boolean(inspectedId) && isNarrow}
        onOpenChange={(v) => {
          if (!v) setInspectedId(null);
        }}
      >
        <DialogContent className={cn('max-w-2xl p-0 overflow-hidden', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <Inspector
            item={inspected}
            conflicts={conflicts}
            slaStatuses={slaStatuses}
            onClose={() => setInspectedId(null)}
            onAction={handleInspectorAction}
            darkMode={darkMode}
            onEdit={() => handleInspectorAction('modifier')}
            onDelete={() => handleInspectorAction('supprimer')}
            onUpdateItem={(itemId, updates) => {
              updateItemsWithHistory((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...updates } : it)));
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modale Templates */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={(template) => {
          const base = eventModalDate ?? new Date();
          const start = new Date(base);
          const end = new Date(start.getTime() + 60 * 60000);

          setItems((prev) => [
            ...prev,
            {
              ...template,
              id: uid('EVT'),
              start: start.toISOString(),
              end: end.toISOString(),
              status: 'open',
            },
          ]);

          addToast('✓ Template ajouté au calendrier', 'success');
        }}
        darkMode={darkMode}
      />

      {/* Modale Raccourcis */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        darkMode={darkMode}
      />

      {/* Modale Événement */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEditingItem(null);
          }}
          initialDate={eventModalDate}
          editingItem={editingItem}
          onSave={handleSaveEvent}
          darkMode={darkMode}
        />
      )}

      {/* Modale Assigner Bureau */}
      <Dialog open={showBureauPrompt} onOpenChange={setShowBureauPrompt}>
        <DialogContent className={cn(darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <DialogHeader>
            <DialogTitle className={cn(darkMode ? 'text-white' : 'text-slate-900')}>
              Assigner à quel bureau ?
            </DialogTitle>
            <DialogDescription className={cn(darkMode ? 'text-slate-400' : 'text-slate-600')}>
              Saisissez le nom du bureau (ex: BMO, BFC, BTP, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={bureauPromptValue}
              onChange={(e) => setBureauPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && bureauPromptValue.trim()) {
                  bureauPromptCallback?.(bureauPromptValue);
                  setShowBureauPrompt(false);
                  setBureauPromptCallback(null);
                } else if (e.key === 'Escape') {
                  setShowBureauPrompt(false);
                  setBureauPromptCallback(null);
                }
              }}
              autoFocus
              className={cn(darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900')}
              placeholder="BMO"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowBureauPrompt(false);
                setBureauPromptCallback(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (bureauPromptValue.trim()) {
                  bureauPromptCallback?.(bureauPromptValue);
                  setShowBureauPrompt(false);
                  setBureauPromptCallback(null);
                }
              }}
              disabled={!bureauPromptValue.trim()}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Confirmation Suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className={cn(darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <DialogHeader>
            <DialogTitle className={cn(darkMode ? 'text-white' : 'text-slate-900')}>
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className={cn(darkMode ? 'text-slate-400' : 'text-slate-600')}>
              Êtes-vous sûr de vouloir supprimer "{deleteConfirmTitle}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmCallback(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deleteConfirmCallback?.();
                setShowDeleteConfirm(false);
                setDeleteConfirmCallback(null);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Sauvegarder Preset */}
      <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
        <DialogContent className={cn(darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
          <DialogHeader>
            <DialogTitle className={cn(darkMode ? 'text-white' : 'text-slate-900')}>
              Sauvegarder un preset de filtres
            </DialogTitle>
            <DialogDescription className={cn(darkMode ? 'text-slate-400' : 'text-slate-600')}>
              Donnez un nom à ce preset pour le réutiliser plus tard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && presetName.trim()) {
                  const newPreset: FilterPreset = {
                    id: uid('PRESET'),
                    name: presetName.trim(),
                    priority: priorityFilter as Priority | 'ALL',
                    kind: kindFilter as CalendarKind | 'ALL',
                    bureaux: Array.from(visibleBureaux),
                  };
                  const updated = [...filterPresets, newPreset];
                  setFilterPresets(updated);
                  try {
                    localStorage.setItem('calendrier.filterPresets', JSON.stringify(updated));
                  } catch (error) {
                    addToast('❌ Erreur de sauvegarde du preset', 'error');
                  }
                  addToast(`✓ Preset "${presetName.trim()}" sauvegardé`, 'success');
                  setShowPresetModal(false);
                  setPresetName('');
                } else if (e.key === 'Escape') {
                  setShowPresetModal(false);
                  setPresetName('');
                }
              }}
              autoFocus
              className={cn(darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900')}
              placeholder="Nom du preset (ex: Paiements urgents)"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowPresetModal(false);
                setPresetName('');
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (presetName.trim()) {
                  const newPreset: FilterPreset = {
                    id: uid('PRESET'),
                    name: presetName.trim(),
                    priority: priorityFilter as Priority | 'ALL',
                    kind: kindFilter as CalendarKind | 'ALL',
                    bureaux: Array.from(visibleBureaux),
                  };
                  const updated = [...filterPresets, newPreset];
                  setFilterPresets(updated);
                  try {
                    localStorage.setItem('calendrier.filterPresets', JSON.stringify(updated));
                  } catch (error) {
                    addToast('❌ Erreur de sauvegarde du preset', 'error');
                    return;
                  }
                  addToast(`✓ Preset "${presetName.trim()}" sauvegardé`, 'success');
                  setShowPresetModal(false);
                  setPresetName('');
                }
              }}
              disabled={!presetName.trim()}
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview visuel pendant drag & drop */}
      {dragPreview.item && draggedItem && (
        <div
          className={cn(
            'fixed pointer-events-none z-[100] px-3 py-2 rounded-lg border shadow-2xl',
            'bg-slate-800/95 border-orange-500/50 backdrop-blur-sm',
            'transform -translate-x-1/2 -translate-y-1/2'
          )}
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            transition: 'none',
          }}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              draggedItem.priority === 'critical' ? 'bg-red-500' :
              draggedItem.priority === 'urgent' ? 'bg-amber-500' : 'bg-blue-500'
            )} />
            <span className="text-sm font-semibold text-white">{draggedItem.title}</span>
            <Badge variant="default" className="text-xs">
              {draggedItem.kind}
            </Badge>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Glissez vers un créneau pour replanifier
          </div>
        </div>
      )}
    </div>
  );
}

const ViewPill = memo(function ViewPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'px-3 py-1.5 rounded-lg text-sm border transition',
        active
          ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
          : 'bg-transparent border-slate-700/60 text-slate-300 hover:bg-slate-800/40'
      )}
      aria-pressed={active}
      aria-label={`Vue ${label}`}
    >
      {label}
    </button>
  );
});

const WeekView = memo(function WeekView({
  days,
  items,
  conflicts,
  slaStatuses,
  onOpen,
  selectedIds,
  onToggleSelect,
  darkMode,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onTimeSlotClick,
}: {
  days: Date[];
  items: CalendarItem[];
  conflicts: Set<string>;
  slaStatuses: SLAStatus[];
  onOpen: (id: string) => void;
  selectedIds: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  darkMode: boolean;
  onDragStart: (e: React.DragEvent, item: CalendarItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetDate: Date, targetHour?: number) => void;
  onDragEnd: () => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}) {
  const HOUR_HEIGHT = 56;
  const START_HOUR = 6;
  const END_HOUR = 20;

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const d of days) map.set(dayKeyLocal(d), []);
    for (const it of items) {
      const k = dayKeyLocal(startOfDay(new Date(it.start)));
      if (!map.has(k)) continue;
      map.get(k)!.push(it);
    }
    for (const [k, arr] of map) {
      map.set(k, [...arr].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
    }
    return map;
  }, [days, items]);

  const gridCols = `72px repeat(${days.length}, minmax(220px, 1fr))`;

  return (
    <div className="min-w-[980px]">
      <div className={cn('grid border-b', darkMode ? 'border-slate-700/60' : 'border-slate-200')} style={{ gridTemplateColumns: gridCols }}>
        <div className="p-2 text-xs text-slate-500">Heure</div>
        {days.map((d) => (
          <div key={d.toISOString()} className="p-2 text-sm font-semibold">
            {fmtDayLabel(d)}
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: gridCols }}>
        <div className={cn('border-r', darkMode ? 'border-slate-700/60' : 'border-slate-200')}>
          <div style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }} className="relative">
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
              <div
                key={i}
                className={cn('px-2 text-[11px] text-slate-500', i ? 'border-t' : '', darkMode ? 'border-slate-800/60' : 'border-slate-100')}
                style={{ height: HOUR_HEIGHT }}
              >
                <div className="pt-1">{fmtHour(START_HOUR + i)}</div>
              </div>
            ))}
          </div>
        </div>

        {days.map((d) => {
          const k = dayKeyLocal(d);
          const dayItems = byDay.get(k) ?? [];
          return (
            <div key={k} className={cn('relative border-r', darkMode ? 'border-slate-700/60' : 'border-slate-200')}>
              <div
                style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
                className="relative"
                onDragOver={onDragOver}
                onDrop={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = Math.floor(y / HOUR_HEIGHT) + START_HOUR;
                  onDrop(e, d, hour);
                }}
                onClick={(e) => {
                  if (onTimeSlotClick && e.target === e.currentTarget) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const hour = Math.floor(y / HOUR_HEIGHT) + START_HOUR;
                    if (hour >= START_HOUR && hour < END_HOUR) {
                      onTimeSlotClick(d, hour);
                    }
                  }
                }}
              >
                {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                  <div
                    key={i}
                    className={cn('absolute left-0 right-0 border-t', darkMode ? 'border-slate-800/60' : 'border-slate-100')}
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                ))}

                {dayItems.map((it) => {
                  const s = new Date(it.start);
                  const e = new Date(it.end);
                  const top = ((minutesSinceStartOfDay(s) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = clamp((minutesDiff(s, e) / 60) * HOUR_HEIGHT, 26, 6 * HOUR_HEIGHT);
                  const isConflict = conflicts.has(it.id);
                  const isSelected = !!selectedIds[it.id];
                  const slaStatus = slaStatuses.find((s) => s.itemId === it.id);

                  return (
                    <div
                      key={it.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, it)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        'absolute left-2 right-2 rounded-lg border p-2 cursor-move select-none transition-all',
                        darkMode ? 'bg-slate-950/60' : 'bg-white',
                        isConflict ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-slate-700/40',
                        isSelected ? 'ring-2 ring-orange-500/60' : '',
                        slaStatus?.isOverdue ? 'bg-red-500/10' : '',
                        'hover:shadow-lg hover:scale-[1.02]'
                      )}
                      style={{ top: Math.max(0, top), height, zIndex: 10 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpen(it.id);
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const customEvent = new CustomEvent('open-edit-modal', { detail: { item: it } });
                        window.dispatchEvent(customEvent);
                      }}
                      title={`${it.title} - Clic: voir détails | Double-clic: modifier | Glisser: déplacer`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Événement ${it.title}, ${it.kind}, ${it.bureau || 'non assigné'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpen(it.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(ev) => {
                              ev.stopPropagation();
                              onToggleSelect(it.id);
                            }}
                            className="accent-orange-500"
                          />
                          <span className="font-mono text-[10px] text-slate-400 truncate">{it.id}</span>
                        </div>
                        <Badge variant={severityBadgeVariant(it.severity)} className="text-[10px]">
                          {it.severity}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm font-semibold line-clamp-2">{it.title}</div>
                      <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                        <span>{it.bureau ?? '—'}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isConflict && <span className="text-red-400 font-bold">⚠</span>}
                        {slaStatus?.isOverdue && <span className="text-red-400 font-bold">SLA</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const DayView = memo(function DayView(props: Omit<Parameters<typeof WeekView>[0], 'days'> & { day: Date }) {
  return <WeekView {...props} days={[props.day]} />;
});

const GanttView = memo(function GanttView({
  items,
  conflicts,
  weekStart,
  onOpen,
  darkMode,
}: {
  items: CalendarItem[];
  conflicts: Set<string>;
  weekStart: Date;
  onOpen: (id: string) => void;
  darkMode: boolean;
}) {
  const days = Array.from({ length: 14 }, (_, i) => startOfDay(addDays(weekStart, i)));
  const byBureau = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of items) {
      const bureau = it.bureau || 'N/A';
      if (!map.has(bureau)) map.set(bureau, []);
      map.get(bureau)!.push(it);
    }
    return map;
  }, [items]);

  const dayWidth = 120;
  const rowHeight = 60;
  const gridCols = `200px repeat(${days.length}, minmax(120px, 1fr))`;

  return (
    <div className="p-4 overflow-auto" style={{ minWidth: days.length * dayWidth + 200 }}>
      <div className="inline-block min-w-full">
        {/* Header */}
        <div className={cn('grid border-b sticky top-0 z-10', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')} style={{ gridTemplateColumns: gridCols }}>
          <div className="p-3 font-semibold text-sm">Bureau</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="p-2 text-center border-l text-xs" style={{ width: dayWidth }}>
              <div className="font-semibold">{fmtDayLabel(d)}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from(byBureau.entries()).map(([bureau, bureauItems]) => (
          <div key={bureau} className={cn('grid border-b', darkMode ? 'border-slate-700' : 'border-slate-200')} style={{ gridTemplateColumns: gridCols, height: rowHeight }}>
            <div className="p-3 font-semibold text-sm border-r flex items-center">{bureau}</div>
            {days.map((day) => {
              const dayKey = dayKeyLocal(day);
              const dayItems = bureauItems.filter((it) => {
                const itDay = dayKeyLocal(startOfDay(new Date(it.start)));
                return itDay === dayKey;
              });

              return (
                <div
                  key={dayKey}
                  className={cn('relative border-l p-1', darkMode ? 'border-slate-700' : 'border-slate-200')}
                  style={{ width: dayWidth }}
                >
                  {dayItems.map((it) => {
                    const isConflict = conflicts.has(it.id);
                    const start = new Date(it.start);
                    const end = new Date(it.end);
                    const left = parseFloat((((start.getHours() * 60 + start.getMinutes()) / (24 * 60)) * 100).toFixed(2));
                    const width = parseFloat((((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) * 100).toFixed(2));

                    return (
                      <div
                        key={it.id}
                        className={cn(
                          'absolute rounded px-2 py-1 text-xs cursor-pointer truncate',
                          darkMode ? 'bg-slate-800' : 'bg-slate-100',
                          isConflict ? 'border-2 border-red-500' : 'border border-slate-400',
                          it.priority === 'critical' ? 'bg-red-500/20' : it.priority === 'urgent' ? 'bg-amber-500/20' : ''
                        )}
                        style={{ left: `${left}%`, width: `${Math.max(5, width)}%`, top: 2, height: rowHeight - 4 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpen(it.id);
                        }}
                        title={it.title}
                      >
                        <div className="font-semibold truncate">{it.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

const AgendaView = memo(function AgendaView({
  items,
  conflicts,
  slaStatuses,
  onOpen,
  selectedIds,
  onToggleSelect,
  darkMode,
}: {
  items: CalendarItem[];
  conflicts: Set<string>;
  slaStatuses: SLAStatus[];
  onOpen: (id: string) => void;
  selectedIds: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  darkMode: boolean;
}) {
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [items]);

  if (!sorted.length) {
    return (
      <div className="p-6">
        <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : '')}>
          <CardContent className="p-6">
            <p className="text-sm font-semibold">Aucun élément dans cette vue</p>
            <p className="text-xs text-slate-400 mt-1">Change les filtres ou la période.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Virtualisation simple : limiter le rendu initial et charger plus au scroll
  const [visibleCount, setVisibleCount] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sorted.length <= visibleCount) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Charger 20 items de plus quand on approche de la fin
      if (scrollTop + clientHeight > scrollHeight - 200 && visibleCount < sorted.length) {
        setVisibleCount((prev) => Math.min(prev + 20, sorted.length));
      }
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [sorted.length, visibleCount]);
  
  const visibleItems = sorted.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="p-4 space-y-3 h-full overflow-auto">
      {visibleItems.map((it) => {
        const isConflict = conflicts.has(it.id);
        const isSelected = !!selectedIds[it.id];
        const slaStatus = slaStatuses.find((s) => s.itemId === it.id);
        const s = new Date(it.start);
        const e = new Date(it.end);

        return (
          <Card
            key={it.id}
            className={cn(
              'cursor-pointer hover:border-orange-500/40 transition',
              darkMode ? 'bg-slate-950/30 border-slate-700/60' : '',
              isConflict ? 'border-red-500/50' : '',
              isSelected ? 'ring-2 ring-orange-500/60' : '',
              slaStatus?.isOverdue ? 'bg-red-500/5' : ''
            )}
            onClick={(e) => {
              // Ne pas ouvrir si on clique sur un bouton ou un input
              if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) {
                return;
              }
              onOpen(it.id);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(ev) => {
                        ev.stopPropagation();
                        onToggleSelect(it.id);
                      }}
                      className="accent-orange-500"
                    />
                    <span className="font-mono text-xs text-slate-400">{it.id}</span>
                    <Badge variant={severityBadgeVariant(it.severity)}>{it.severity}</Badge>
                    <Badge variant="info">{it.kind}</Badge>
                    {it.bureau && <Badge variant="default">{it.bureau}</Badge>}
                    {isConflict && <Badge variant="urgent">CONFLIT</Badge>}
                    {slaStatus?.isOverdue && <Badge variant="urgent">SLA {slaStatus.daysOverdue}j</Badge>}
                  </div>
                  <div className="mt-1 font-semibold">{it.title}</div>
                  {it.description && <div className="mt-1 text-xs text-slate-400">{it.description}</div>}
                  <div className="mt-1 text-xs text-slate-400 font-mono">
                    {s.toLocaleDateString('fr-FR')} • {s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}–{e.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpen(it.id);
                  }}
                >
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

function Inspector({
  item,
  conflicts,
  slaStatuses,
  onClose,
  onAction,
  darkMode,
  onEdit,
  onDelete,
  onUpdateItem,
}: {
  item: CalendarItem | null;
  conflicts: Set<string>;
  slaStatuses: SLAStatus[];
  onClose: () => void;
  onAction: (a: string) => void;
  darkMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateItem?: (itemId: string, updates: Partial<CalendarItem>) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  // Extraire les mentions @personne dans une note
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.matchAll(mentionRegex);
    return Array.from(matches, m => m[1]);
  };
  
  // Ajouter une note
  const handleAddNote = () => {
    if (!item || !newNote.trim() || !onUpdateItem) return;
    
    const mentions = extractMentions(newNote);
    const note: Note = {
      id: uid('NOTE'),
      content: newNote.trim(),
      author: { id: 'USR-001', name: 'A. DIALLO' },
      timestamp: new Date().toISOString(),
      mentions: mentions.length > 0 ? mentions : undefined,
    };
    
    const updatedNotes = [...(item.notes || []), note];
    onUpdateItem(item.id, { notes: updatedNotes });
    setNewNote('');
    setShowNotes(false);
  };
  
  // Générer un lien de partage
  const handleGenerateShareLink = () => {
    if (!item) return;
    if (typeof window === 'undefined') return; // Guard pour SSR

    const params = new URLSearchParams({
      view: 'week',
      item: item.id,
    });

    const link = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    setShareLink(link);
    setShowShare(true);
    
    // Copier dans le presse-papiers avec gestion d'erreur
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).catch(() => {
        // Fallback silencieux si clipboard API n'est pas disponible
      });
    }
  };
  if (!item) {
    return (
      <div className="h-full p-4">
        <div className={cn('h-full rounded-xl border p-4', darkMode ? 'border-slate-700/60 bg-slate-950/40' : 'border-slate-200 bg-white')}>
          <p className="text-sm font-semibold">Inspecteur</p>
          <p className="text-xs text-slate-400 mt-1">
            Clique un item pour voir détails, actions, pièces, log.
          </p>
        </div>
      </div>
    );
  }

  const isConflict = conflicts.has(item.id);
  const slaStatus = slaStatuses.find((s) => s.itemId === item.id);
  const s = new Date(item.start);
  const e = new Date(item.end);

  return (
    <div className="h-full p-4 overflow-y-auto scrollbar-subtle" onClick={(e) => e.stopPropagation()}>
      <div
        className={cn('rounded-xl border p-4 flex flex-col gap-3', darkMode ? 'border-slate-700/60 bg-slate-950/40' : 'border-slate-200 bg-white')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-xs text-slate-400">{item.id}</span>
              <Badge variant={severityBadgeVariant(item.severity)}>{item.severity}</Badge>
              <Badge variant="info">{item.kind}</Badge>
              {item.bureau && <Badge variant="default">{item.bureau}</Badge>}
              {isConflict && <Badge variant="urgent">CONFLIT</Badge>}
              {slaStatus?.isOverdue && <Badge variant="urgent">SLA {slaStatus.daysOverdue}j</Badge>}
            </div>
            <div className="mt-2 font-bold text-base">{item.title}</div>
            {item.description && <div className="mt-1 text-sm text-slate-400">{item.description}</div>}
            <div className="mt-1 text-xs text-slate-400 font-mono">
              {s.toLocaleDateString('fr-FR')} • {s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}–{e.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && item.status !== 'done' && item.status !== 'ack' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                title="Modifier (Ctrl+E)"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                title="Supprimer (Suppr)"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              title="Fermer (ESC)"
            >
            <X className="w-4 h-4" />
          </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
            <CardContent className="p-3">
              <p className="text-xs text-slate-400">Statut</p>
              <p className="font-semibold">{item.status}</p>
            </CardContent>
          </Card>
          <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
            <CardContent className="p-3">
              <p className="text-xs text-slate-400">Priorité</p>
              <p className="font-semibold">{item.priority}</p>
            </CardContent>
          </Card>
        </div>

        {item.assignees && item.assignees.length > 0 && (
          <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {item.assignees.map((a, idx) => (
                <div key={idx} className="text-sm">{a.name}</div>
              ))}
            </CardContent>
          </Card>
        )}

        {item.linkedTo && (
          <Card className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lien</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <p className="text-sm font-semibold">{item.linkedTo.type}</p>
              <p className="text-xs text-slate-400">{item.linkedTo.label || item.linkedTo.id}</p>
            </CardContent>
          </Card>
        )}

        {slaStatus && (
          <div className={cn('rounded-lg p-3 border', darkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50')}>
            <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              SLA
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {item.slaDueAt && (
                <>À traiter avant : <span className="font-mono">{new Date(item.slaDueAt).toLocaleString('fr-FR')}</span></>
              )}
            </p>
            {slaStatus.isOverdue && (
              <p className="text-xs text-red-400 mt-1 font-semibold">
                ⚠️ En retard de {slaStatus.daysOverdue} jour(s)
              </p>
            )}
            {slaStatus.recommendation && (
              <p className="text-xs text-amber-300 mt-1">{slaStatus.recommendation}</p>
            )}
          </div>
        )}

        {isConflict && (
          <div className={cn('rounded-lg p-3 border', darkMode ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50')}>
            <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Conflit détecté
            </p>
            <p className="text-xs text-slate-400 mt-1">Chevauchement avec une autre activité</p>
          </div>
        )}

        <div className="mt-auto space-y-2">
          {item.status !== 'done' && item.status !== 'ack' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit();
                  } else {
                    onAction('modifier');
                  }
                }}
                variant="default"
                size="sm"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Modifier
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction('replanifier');
                }}
                variant="secondary"
                size="sm"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Replanifier
              </Button>
        </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction('copier');
              }}
              variant="outline"
              size="sm"
              title="Copier (Ctrl+C)"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copier
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction('dupliquer');
              }}
              variant="outline"
              size="sm"
              title="Dupliquer (Ctrl+D)"
            >
              <Plus className="w-4 h-4 mr-1" />
              Dupliquer
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {item.status !== 'done' && item.status !== 'ack' && (
              <>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAction('terminer');
                  }}
                  variant="success"
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Terminer
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onDelete) {
                      onDelete();
                    } else {
                      onAction('annuler');
                    }
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </>
            )}
            {item.status === 'done' && (
              <div className="col-span-2 flex items-center justify-center gap-2 text-emerald-400 py-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Événement terminé</span>
              </div>
            )}
            {item.status === 'ack' && (
              <div className="col-span-2 flex items-center justify-center gap-2 text-red-400 py-2">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Événement annulé</span>
              </div>
            )}
          </div>

          {item.status !== 'done' && item.status !== 'ack' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction('assigner-bureau');
                }}
                variant="outline"
                size="sm"
              >
                <Building2 className="w-4 h-4 mr-1" />
                Assigner bureau
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction('escalader');
                }}
                variant="warning"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Escalader
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthView({
  cursorDate,
  items,
  conflicts,
  slaStatuses,
  selectedIds,
  onOpen,
  onToggleSelect,
  onDragStart,
  onDragOver,
  onDrop,
  darkMode,
}: {
  cursorDate: Date;
  items: CalendarItem[];
  conflicts: Set<string>;
  slaStatuses: Array<{ itemId: string; isOverdue: boolean }>;
  selectedIds: Record<string, boolean>;
  onOpen: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, item: CalendarItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date, hour?: number) => void;
  darkMode: boolean;
}) {
  const monthStart = startOfMonth(cursorDate);
  const monthEnd = endOfMonth(cursorDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = addDays(startOfWeek(monthEnd), 6);
  
  const days: Date[] = [];
  for (let d = new Date(calendarStart); d <= calendarEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const d of days) map.set(dayKeyLocal(d), []);
    for (const it of items) {
      const k = dayKeyLocal(startOfDay(new Date(it.start)));
      if (map.has(k)) {
        map.get(k)!.push(it);
      }
    }
    for (const [k, arr] of map) {
      map.set(k, [...arr].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
    }
    return map;
  }, [days, items]);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const isCurrentMonth = (d: Date) => d.getMonth() === cursorDate.getMonth();
  const isToday = (d: Date) => dayKeyLocal(d) === dayKeyLocal(new Date());

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 gap-1 min-w-[800px]">
        {/* En-têtes jours */}
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              'p-2 text-center text-xs font-semibold',
              darkMode ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {day}
          </div>
        ))}

        {/* Grille calendrier */}
        {days.map((d) => {
          const k = dayKeyLocal(d);
          const dayItems = byDay.get(k) ?? [];
          const inMonth = isCurrentMonth(d);
          const today = isToday(d);
          const itemCount = dayItems.length;
          const hasConflict = dayItems.some((it) => conflicts.has(it.id));
          const hasOverdue = dayItems.some((it) => slaStatuses.some((s) => s.itemId === it.id && s.isOverdue));

          return (
            <div
              key={k}
              className={cn(
                'min-h-[120px] border rounded-lg p-2 transition-colors',
                darkMode ? 'border-slate-700/60' : 'border-slate-200',
                !inMonth && (darkMode ? 'opacity-30' : 'opacity-40'),
                today && 'ring-2 ring-orange-500/50',
                hasConflict && 'bg-red-500/10',
                hasOverdue && 'bg-red-500/5'
              )}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, d)}
            >
              <div
                className={cn(
                  'text-sm font-semibold mb-1',
                  today ? 'text-orange-500' : inMonth ? (darkMode ? 'text-slate-200' : 'text-slate-900') : (darkMode ? 'text-slate-500' : 'text-slate-400')
                )}
              >
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map((it) => {
                  const isConflict = conflicts.has(it.id);
                  const isSelected = !!selectedIds[it.id];
                  const slaStatus = slaStatuses.find((s) => s.itemId === it.id);

                  return (
                    <div
                      key={it.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, it)}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded cursor-move truncate',
                        darkMode ? 'bg-slate-800/60' : 'bg-slate-100',
                        isConflict && 'border-l-2 border-red-500',
                        isSelected && 'ring-1 ring-orange-500',
                        slaStatus?.isOverdue && 'bg-red-500/20'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpen(it.id);
                      }}
                      title={it.title}
                      role="button"
                      tabIndex={0}
                      aria-label={`${it.title}, ${it.kind}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpen(it.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!selectedIds[it.id]}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelect(it.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3 h-3"
                        />
                        <span className="truncate">{it.title}</span>
                      </div>
                    </div>
                  );
                })}
                {itemCount > 3 && (
                  <div className={cn('text-[10px] px-1.5 text-center', darkMode ? 'text-slate-400' : 'text-slate-500')}>
                    +{itemCount - 3} autre{itemCount - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vue Ressource (par personne)
function ResourceView({
  byAssignee,
  conflicts,
  slaStatuses,
  weekDays,
  onOpen,
  selectedIds,
  onToggleSelect,
  darkMode,
}: {
  byAssignee: Map<string, CalendarItem[]>;
  conflicts: Set<string>;
  slaStatuses: SLAStatus[];
  weekDays: Date[];
  onOpen: (id: string) => void;
  selectedIds: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  darkMode: boolean;
}) {
  const HOUR_HEIGHT = 56;
  const START_HOUR = 6;
  const END_HOUR = 20;

  if (byAssignee.size === 0) {
  return (
    <div className="p-6">
      <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : '')}>
        <CardContent className="p-6">
            <p className="text-sm font-semibold">Aucune ressource assignée</p>
            <p className="text-xs text-slate-400 mt-1">Les événements sans assigné n'apparaissent pas ici.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-auto">
      {Array.from(byAssignee.entries()).map(([assigneeId, assigneeItems]) => {
        const assigneeName = assigneeItems[0]?.assignees?.find((a) => a.id === assigneeId)?.name || assigneeId;
        const byDay = new Map<string, CalendarItem[]>();
        for (const it of assigneeItems) {
          const k = dayKeyLocal(startOfDay(new Date(it.start)));
          if (!byDay.has(k)) byDay.set(k, []);
          byDay.get(k)!.push(it);
        }

        const totalHours = assigneeItems.reduce((sum, it) => {
          return sum + minutesDiff(new Date(it.start), new Date(it.end)) / 60;
        }, 0);

        return (
          <Card key={assigneeId} className={cn(darkMode ? 'bg-slate-900/40 border-slate-700/60' : '')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{assigneeName}</span>
                  <Badge variant="info">{assigneeItems.length} item(s)</Badge>
                  <Badge variant="default">{totalHours.toFixed(1)}h</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2">
                <div className="text-xs text-slate-400 p-2">Heure</div>
                {weekDays.map((d) => (
                  <div key={d.toISOString()} className="text-xs font-semibold p-2 text-center">
                    {fmtDayLabel(d)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2">
                <div className={cn('border-r p-2', darkMode ? 'border-slate-700' : 'border-slate-200')}>
                  <div style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }} className="relative">
                    {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                      <div
                        key={i}
                        className={cn('text-[10px] text-slate-500', i ? 'border-t' : '', darkMode ? 'border-slate-800' : 'border-slate-100')}
                        style={{ height: HOUR_HEIGHT, paddingTop: 4 }}
                      >
                        {fmtHour(START_HOUR + i)}
                      </div>
                    ))}
                  </div>
                </div>
                {weekDays.map((d) => {
                  const k = dayKeyLocal(d);
                  const dayItems = byDay.get(k) || [];
                  return (
                    <div
                      key={k}
                      className={cn('relative border-r', darkMode ? 'border-slate-700' : 'border-slate-200')}
                      style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
                    >
                      {dayItems.map((it) => {
                        const s = new Date(it.start);
                        const top = ((minutesSinceStartOfDay(s) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                        const height = clamp((minutesDiff(s, new Date(it.end)) / 60) * HOUR_HEIGHT, 20, 6 * HOUR_HEIGHT);
                        const isConflict = conflicts.has(it.id);
                        return (
                          <div
                            key={it.id}
                            className={cn(
                              'absolute left-1 right-1 rounded p-1 text-xs cursor-pointer',
                              darkMode ? 'bg-slate-800' : 'bg-white',
                              isConflict ? 'border-2 border-red-500' : 'border border-slate-400'
                            )}
                            style={{ top: Math.max(0, top), height }}
                            onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpen(it.id);
                        }}
                            title={it.title}
                          >
                            <div className="font-semibold truncate">{it.title}</div>
                            <div className="text-[10px] text-slate-400">
                              {s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Vue Kanban
function KanbanView({
  byStatus,
  conflicts,
  slaStatuses,
  onOpen,
  selectedIds,
  onToggleSelect,
  onMoveItem,
  darkMode,
}: {
  byStatus: Map<Status, CalendarItem[]>;
  conflicts: Set<string>;
  slaStatuses: SLAStatus[];
  onOpen: (id: string) => void;
  selectedIds: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  onMoveItem: (itemId: string, newStatus: Status) => void;
  darkMode: boolean;
}) {
  const columns: Array<{ status: Status; label: string; color: string }> = [
    { status: 'open', label: 'Ouvert', color: 'blue' },
    { status: 'done', label: 'Terminé', color: 'green' },
    { status: 'blocked', label: 'Bloqué', color: 'red' },
    { status: 'ack', label: 'Annulé', color: 'gray' },
    { status: 'snoozed', label: 'Reporté', color: 'amber' },
  ];

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {columns.map((col) => {
          const items = byStatus.get(col.status) || [];
          return (
            <div
              key={col.status}
              data-status={col.status}
              className={cn('w-80 shrink-0 rounded-lg border p-3', darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="info">{items.length}</Badge>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {items.map((it) => {
                  const isConflict = conflicts.has(it.id);
                  const slaStatus = slaStatuses.find((s) => s.itemId === it.id);
                  return (
                    <Card
                      key={it.id}
                      draggable
                      onDragEnd={(e) => {
                        const target = document.elementFromPoint(e.clientX, e.clientY);
                        const targetColumn = target?.closest('[data-status]')?.getAttribute('data-status');
                        if (targetColumn && targetColumn !== it.status) {
                          onMoveItem(it.id, targetColumn as Status);
                        }
                      }}
                      className={cn(
                        'cursor-move hover:shadow-md transition',
                        darkMode ? 'bg-slate-800/50' : 'bg-slate-50',
                        isConflict ? 'border-red-500/50' : '',
                        selectedIds[it.id] ? 'ring-2 ring-orange-500' : ''
                      )}
                      onClick={() => onOpen(it.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedIds[it.id]}
                            onChange={(e) => {
                              e.stopPropagation();
                              onToggleSelect(it.id);
                            }}
                            className="accent-orange-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-[10px] text-slate-400">{it.id}</span>
                              <Badge variant={severityBadgeVariant(it.severity)} className="text-[10px]">
                                {it.severity}
                              </Badge>
                              {isConflict && <Badge variant="urgent" className="text-[10px]">CONFLIT</Badge>}
                              {slaStatus?.isOverdue && <Badge variant="urgent" className="text-[10px]">SLA</Badge>}
                            </div>
                            <p className="font-semibold text-sm truncate">{it.title}</p>
          <p className="text-xs text-slate-400 mt-1">
                              {new Date(it.start).toLocaleDateString('fr-FR')} • {it.bureau || '—'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">Aucun item</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Panel Prévisions
function PredictionsPanel({
  predictions,
  onClose,
  darkMode,
}: {
  predictions: Array<{
    date: string;
    totalLoad: number;
    maxBureau: string;
    maxBureauLoad: number;
    capacity: number;
    isOverloaded: boolean;
    overloadPercent: number;
  }>;
  onClose: () => void;
  darkMode: boolean;
}) {
  return (
    <div className="fixed bottom-4 right-4 w-96 z-40">
      <Card className={cn('shadow-2xl', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Prévisions (7j)
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {predictions.map((pred, idx) => (
            <div
              key={pred.date}
              className={cn(
                'p-3 rounded-lg border',
                pred.isOverloaded
                  ? 'border-red-500/30 bg-red-500/10'
                  : pred.overloadPercent > 80
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">
                  {idx === 0 ? "Aujourd'hui" : idx === 1 ? 'Demain' : new Date(pred.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </span>
                <Badge variant={pred.isOverloaded ? 'urgent' : pred.overloadPercent > 80 ? 'warning' : 'default'}>
                  {pred.overloadPercent}%
                </Badge>
              </div>
              <div className="text-xs text-slate-400">
                {pred.maxBureau}: {(pred.maxBureauLoad / 60).toFixed(1)}h / {(pred.capacity / 60).toFixed(0)}h
              </div>
              {pred.isOverloaded && (
                <div className="text-xs text-red-400 mt-1">⚠️ Surcharge prévue</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Panneau Analytics Avancés
function AnalyticsPanel({
  items,
  conflicts,
  load,
  slaStatuses,
  stats,
  onClose,
  darkMode,
}: {
  items: CalendarItem[];
  conflicts: Set<string>;
  load: ReturnType<typeof computeLoad>;
  slaStatuses: SLAStatus[];
  stats: { conflicts: number; overdue: number; overloaded: boolean };
  onClose: () => void;
  darkMode: boolean;
}) {
  // Calculs de performance
  const analytics = useMemo(() => {
    const totalItems = items.length;
    const doneItems = items.filter(it => it.status === 'done').length;
    const completionRate = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    
    // Taux de respect SLA
    const slaItems = slaStatuses.length;
    const slaRespected = slaStatuses.filter(s => !s.isOverdue).length;
    const slaRate = slaItems > 0 ? Math.round((slaRespected / slaItems) * 100) : 100;
    
    // Charge moyenne par bureau
    const bureauLoads: Record<string, { total: number; days: number; avg: number }> = {};
    for (const [bureau, days] of Object.entries(load)) {
      const totalMinutes = Object.values(days).reduce((sum, d) => sum + d.minutes, 0);
      const dayCount = Object.keys(days).length;
      bureauLoads[bureau] = {
        total: totalMinutes,
        days: dayCount,
        avg: dayCount > 0 ? Math.round(totalMinutes / dayCount) : 0,
      };
    }
    
    // Répartition par type
    const byKind: Record<string, number> = {};
    items.forEach(it => {
      byKind[it.kind] = (byKind[it.kind] || 0) + 1;
    });
    
    // Répartition par priorité
    const byPriority: Record<string, number> = {};
    items.forEach(it => {
      byPriority[it.priority] = (byPriority[it.priority] || 0) + 1;
    });
    
    return {
      totalItems,
      doneItems,
      completionRate,
      slaItems,
      slaRespected,
      slaRate,
      bureauLoads,
      byKind,
      byPriority,
    };
  }, [items, slaStatuses, load]);
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-4xl max-h-[90vh] overflow-auto', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              Analytics & Performance
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPIs Principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Taux de complétion</p>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                <p className="text-xs text-slate-400 mt-1">{analytics.doneItems}/{analytics.totalItems}</p>
              </CardContent>
            </Card>
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Respect SLA</p>
                <p className={cn('text-2xl font-bold', analytics.slaRate >= 90 ? 'text-emerald-400' : analytics.slaRate >= 70 ? 'text-amber-400' : 'text-red-400')}>
                  {analytics.slaRate}%
                </p>
                <p className="text-xs text-slate-400 mt-1">{analytics.slaRespected}/{analytics.slaItems}</p>
              </CardContent>
            </Card>
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Conflits</p>
                <p className={cn('text-2xl font-bold', stats.conflicts === 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {stats.conflicts}
                </p>
              </CardContent>
            </Card>
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">SLA en retard</p>
                <p className={cn('text-2xl font-bold', stats.overdue === 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {stats.overdue}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charge par bureau */}
          <div>
            <CardTitle className="text-sm mb-3">Charge moyenne par bureau</CardTitle>
            <div className="space-y-2">
              {Object.entries(analytics.bureauLoads).map(([bureau, data]) => {
                const capacity = CAPACITY_BY_BUREAU[bureau] ?? 480;
                const percent = Math.round((data.avg / capacity) * 100);
                return (
                  <div key={bureau} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-semibold">{bureau}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{data.avg} min/jour</span>
                        <span className={cn('text-xs font-semibold', percent > 100 ? 'text-red-400' : percent > 80 ? 'text-amber-400' : 'text-emerald-400')}>
                          {percent}%
                        </span>
                      </div>
                      <div className={cn('h-2 rounded-full overflow-hidden', darkMode ? 'bg-slate-800' : 'bg-slate-200')}>
                        <div
                          className={cn('h-full transition-all', percent > 100 ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Répartition par type */}
          <div>
            <CardTitle className="text-sm mb-3">Répartition par type</CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(analytics.byKind).map(([kind, count]) => (
                <Card key={kind} className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-400">{kind}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Répartition par priorité */}
          <div>
            <CardTitle className="text-sm mb-3">Répartition par priorité</CardTitle>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(analytics.byPriority).map(([priority, count]) => (
                <Card key={priority} className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
                  <CardContent className="p-3">
                    <p className="text-xs text-slate-400">{priority}</p>
                    <p className={cn('text-lg font-bold', priority === 'critical' ? 'text-red-400' : priority === 'urgent' ? 'text-amber-400' : 'text-slate-400')}>
                      {count}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Modale Templates
function TemplatesModal({
  isOpen,
  onClose,
  onApply,
  darkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: CalendarItem) => void;
  darkMode: boolean;
}) {
  const templates: CalendarItem[] = [
    {
      id: 'TMP-1',
      title: 'Réunion hebdo BMO',
      description: 'Point hebdomadaire',
      kind: 'meeting',
      bureau: 'BMO',
      assignees: [{ id: 'USR-001', name: 'A. DIALLO' }],
      start: new Date().toISOString(),
      end: new Date(Date.now() + 60 * 60000).toISOString(),
      priority: 'normal',
      severity: 'info',
      status: 'open',
    },
    {
      id: 'TMP-2',
      title: 'Point projet',
      description: 'Suivi projet',
      kind: 'meeting',
      bureau: 'BCT',
      assignees: [{ id: 'u4', name: 'Chef de projet' }],
      start: new Date().toISOString(),
      end: new Date(Date.now() + 90 * 60000).toISOString(),
      priority: 'normal',
      severity: 'info',
      status: 'open',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-lg', darkMode ? 'bg-slate-900' : 'bg-white')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Templates & Événements récurrents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={cn('cursor-pointer hover:border-orange-500/50', darkMode ? 'bg-slate-800/50' : 'bg-slate-50')}
              onClick={() => {
                onApply(template);
                onClose();
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{template.title}</p>
                    <p className="text-xs text-slate-400">{template.description}</p>
                  </div>
                  <Button size="sm">Appliquer</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="pt-2 border-t">
            <p className="text-xs text-slate-400 text-center">
              💡 Les événements récurrents seront ajoutés prochainement
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Modale Raccourcis
function ShortcutsModal({
  isOpen,
  onClose,
  darkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', action: 'Focus recherche' },
    { key: 'Ctrl+←', action: 'Semaine précédente' },
    { key: 'Ctrl+→', action: 'Semaine suivante' },
    { key: 'Ctrl+Home', action: "Aujourd'hui" },
    { key: 'Ctrl+1', action: 'Vue Semaine' },
    { key: 'Ctrl+2', action: 'Vue Jour' },
    { key: 'Ctrl+3', action: 'Vue Gantt' },
    { key: 'Ctrl+4', action: 'Vue Ressource' },
    { key: 'Ctrl+F', action: 'Toggle Mode Focus' },
    { key: 'Ctrl+O', action: 'Auto-scheduling' },
    { key: 'Ctrl+E', action: 'Export iCal' },
    { key: 'Ctrl+Z', action: 'Annuler (Undo)' },
    { key: 'Ctrl+Y ou Ctrl+Shift+Z', action: 'Rétablir (Redo)' },
    { key: 'Ctrl+?', action: 'Afficher raccourcis' },
    { key: 'ESC', action: 'Fermer modales' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-2xl', darkMode ? 'bg-slate-900' : 'bg-white')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              Raccourcis clavier
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded border">
                <span className="text-sm">{s.action}</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-xs font-mono">{s.key}</kbd>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-slate-400 text-center">
              💡 Sur Mac, utilisez ⌘ au lieu de Ctrl
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mode Présentation pour réunions
function PresentationMode({
  items,
  onClose,
  darkMode,
}: {
  items: CalendarItem[];
  onClose: () => void;
  darkMode: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex] || null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) setCurrentIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex((i) => i - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose]);

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-2xl text-white mb-4">Aucun événement à afficher</p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-4">{currentItem.title}</h1>
          {currentItem.description && <p className="text-2xl text-gray-300 mb-6">{currentItem.description}</p>}
          <div className="flex items-center justify-center gap-6 text-lg">
            <div>
              <span className="text-gray-400">Début:</span>{' '}
              {new Date(currentItem.start).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
            </div>
            <div>
              <span className="text-gray-400">Fin:</span>{' '}
              {new Date(currentItem.end).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
            </div>
          </div>
          {currentItem.bureau && (
            <p className="mt-4 text-xl text-gray-400">Bureau: {currentItem.bureau}</p>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="text-white">
          <X className="w-4 h-4 mr-2" />
          Quitter (ESC)
        </Button>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="text-white"
          >
            ← Précédent
          </Button>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {items.length}
          </span>
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={currentIndex === items.length - 1}
            className="text-white"
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  );
}

// Comparaison de périodes
function PeriodComparisonPanel({
  items,
  onClose,
  darkMode,
}: {
  items: CalendarItem[];
  onClose: () => void;
  darkMode: boolean;
}) {
  const [period1, setPeriod1] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
  });
  const [period2, setPeriod2] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    end.setDate(end.getDate() - 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start, end };
  });

  const period1Items = useMemo(() => {
    return items.filter((it) => {
      const date = new Date(it.start);
      return date >= period1.start && date <= period1.end;
    });
  }, [items, period1]);

  const period2Items = useMemo(() => {
    return items.filter((it) => {
      const date = new Date(it.start);
      return date >= period2.start && date <= period2.end;
    });
  }, [items, period2]);

  const comparison = useMemo(() => {
    const p1Stats = {
      total: period1Items.length,
      conflicts: period1Items.filter((it) => it.status === 'open').length,
      done: period1Items.filter((it) => it.status === 'done').length,
    };
    const p2Stats = {
      total: period2Items.length,
      conflicts: period2Items.filter((it) => it.status === 'open').length,
      done: period2Items.filter((it) => it.status === 'done').length,
    };
    return {
      period1: p1Stats,
      period2: p2Stats,
      diff: {
        total: p1Stats.total - p2Stats.total,
        conflicts: p1Stats.conflicts - p2Stats.conflicts,
        done: p1Stats.done - p2Stats.done,
      },
    };
  }, [period1Items, period2Items]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-4xl max-h-[90vh] overflow-auto', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Comparaison de périodes
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Période 1</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={dayKeyLocal(period1.start)}
                  onChange={(e) => setPeriod1((p) => ({ ...p, start: new Date(e.target.value + 'T00:00:00') }))}
                  className={cn(darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}
                />
                <Input
                  type="date"
                  value={dayKeyLocal(period1.end)}
                  onChange={(e) => setPeriod1((p) => ({ ...p, end: new Date(e.target.value + 'T23:59:59') }))}
                  className={cn(darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Période 2</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={dayKeyLocal(period2.start)}
                  onChange={(e) => setPeriod2((p) => ({ ...p, start: new Date(e.target.value + 'T00:00:00') }))}
                  className={cn(darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}
                />
                <Input
                  type="date"
                  value={dayKeyLocal(period2.end)}
                  onChange={(e) => setPeriod2((p) => ({ ...p, end: new Date(e.target.value + 'T23:59:59') }))}
                  className={cn(darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Total événements</p>
                <p className="text-2xl font-bold">{comparison.period1.total}</p>
                <p className={cn('text-xs mt-1', comparison.diff.total > 0 ? 'text-green-400' : comparison.diff.total < 0 ? 'text-red-400' : 'text-slate-400')}>
                  {comparison.diff.total > 0 ? '+' : ''}{comparison.diff.total} vs Période 2
                </p>
              </CardContent>
            </Card>
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">En cours</p>
                <p className="text-2xl font-bold">{comparison.period1.conflicts}</p>
                <p className={cn('text-xs mt-1', comparison.diff.conflicts > 0 ? 'text-red-400' : comparison.diff.conflicts < 0 ? 'text-green-400' : 'text-slate-400')}>
                  {comparison.diff.conflicts > 0 ? '+' : ''}{comparison.diff.conflicts} vs Période 2
                </p>
              </CardContent>
            </Card>
            <Card className={cn(darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200')}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Terminés</p>
                <p className="text-2xl font-bold">{comparison.period1.done}</p>
                <p className={cn('text-xs mt-1', comparison.diff.done > 0 ? 'text-green-400' : comparison.diff.done < 0 ? 'text-red-400' : 'text-slate-400')}>
                  {comparison.diff.done > 0 ? '+' : ''}{comparison.diff.done} vs Période 2
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Historique des modifications
function HistoryPanel({
  history,
  historyIndex,
  onClose,
  onRestore,
  darkMode,
}: {
  history: CalendarItem[][];
  historyIndex: number;
  onClose: () => void;
  onRestore: (index: number) => void;
  darkMode: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-3xl max-h-[90vh] overflow-auto', darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5" />
              Historique des modifications
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((snapshot, idx) => (
              <Card
                key={idx}
                className={cn(
                  'cursor-pointer transition',
                  idx === historyIndex ? 'border-orange-500 bg-orange-500/10' : darkMode ? 'bg-slate-950/40 border-slate-700/60' : 'bg-slate-50 border-slate-200',
                  'hover:border-slate-400'
                )}
                onClick={() => onRestore(idx)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        État #{history.length - idx} {idx === historyIndex && '(actuel)'}
                      </p>
                      <p className="text-xs text-slate-400">{snapshot.length} événement(s)</p>
                    </div>
                    {idx === historyIndex && (
                      <Badge variant="default">Actuel</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
