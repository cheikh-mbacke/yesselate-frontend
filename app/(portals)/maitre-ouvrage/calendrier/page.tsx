'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';

import {
  ActivityPlanningModal,
  ActivityDetailsPanel,
  RescheduleSimulator,
  PilotingStatistics,
} from '@/components/features/bmo/calendar';
import { ModernStatistics } from '@/components/features/bmo/calendar/ModernStatistics';
import { JournalCharts } from '@/components/features/bmo/calendar/JournalCharts';
import { CalendarFilters } from '@/components/features/bmo/calendar/CalendarFilters';
import { BMOResolveModal } from '@/components/features/bmo/calendar/BMOResolveModal';
import { BureauTimelineView } from '@/components/features/bmo/calendar/BureauTimelineView';
import { HeatmapView } from '@/components/features/bmo/calendar/HeatmapView';
import { QuickActionsPanel } from '@/components/features/bmo/calendar/QuickActionsPanel';
import { SmartSuggestions } from '@/components/features/bmo/calendar/SmartSuggestions';
import { FocusModePanel } from '@/components/features/bmo/calendar/FocusModePanel';
import { CalendarSidebar } from '@/components/features/bmo/calendar/CalendarSidebar';
import { CalendarRibbon } from '@/components/features/bmo/calendar/CalendarRibbon';
import { WorkWeekView } from '@/components/features/bmo/calendar/WorkWeekView';
import { CalendarNavigationBar } from '@/components/features/bmo/calendar/CalendarNavigationBar';
import {
  ModernCalendarGrid,
  IntelligentDashboard,
  AlternativeCalendarView,
} from '@/components/features/bmo/calendar';
import { EscalateToBMOModal } from '@/components/features/bmo/alerts/EscalateToBMOModal';
import { AdvancedSearch } from '@/components/features/bmo/calendar/AdvancedSearch';
import { CalendarExport } from '@/components/features/bmo/calendar/CalendarExport';

import {
  agendaEvents,
  plannedAbsences,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  bureaux,
} from '@/lib/data';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { verifyDecisionHash } from '../../../../lib/utils/verifyHash';

type CalendarView = 'overview' | 'statistics' | 'timeline' | 'heatmap' | 'journal';
type CalendarViewType = 'day' | 'workweek' | 'week' | 'month';

type ImpactSeverity = 'critical' | 'high' | 'medium';

type Blocker = {
  id: string;
  type: 'blocked' | 'contract' | 'payment' | 'other';
  severity: ImpactSeverity;
  title: string;
  description: string;
  bureau?: string;
  project?: string;
  supplier?: string;
  situation?: string;
  daysBlocked?: number;
};

// =============== TYPES STRONG POUR ORGA BREAKERS ===============
interface OrgaBreakerBase {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  bureau?: string;
  link: string;
}

interface BlockedDossierBreaker extends OrgaBreakerBase {
  type: 'blocked';
  daysBlocked: number;
  project: string;
}

interface PaymentBreaker extends OrgaBreakerBase {
  type: 'payment';
  dueDate: string;
}

interface ContractBreaker extends OrgaBreakerBase {
  type: 'contract';
  supplier: string;
}

interface AbsenceBreaker extends OrgaBreakerBase {
  type: 'absence';
  employeeName: string;
  startDate: string;
  endDate: string;
}

type OrgaBreaker = BlockedDossierBreaker | PaymentBreaker | ContractBreaker | AbsenceBreaker;

type BulkAction =
  | 'complete'
  | 'cancel'
  | 'reschedule'
  | 'set_priority_urgent'
  | 'set_priority_normal'
  | 'set_priority_critical';

type SortMode =
  | 'priority_desc'
  | 'date_asc'
  | 'date_desc'
  | 'bureau'
  | 'type'
  | 'status';

type RegisterEntry = {
  at: string; // ISO
  batchId?: string;
  action: 'single' | 'bulk';
  module: 'calendar';
  kind: BulkAction | 'open_details' | 'create' | 'edit';
  eventId: string;
  title: string;
  bureau?: string;
  date: string;
  time?: string;
  priority?: string;
  status?: string;
  details: string;
  hash: string; // SHA-256:...
  userId: string;
  userName: string;
  userRole: string;
};

const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 120,
  urgent: 80,
  high: 40,
  normal: 15,
  low: 5,
};

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function parseHH(time?: string) {
  if (!time) return 10;
  const h = Number(time.split(':')[0] || 10);
  return Number.isFinite(h) ? h : 10;
}

function daysUntil(dateIso: string) {
  const now = new Date();
  const d = new Date(dateIso);
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function computeEventPriorityScore(e: CalendarEvent, overloadCountForDay = 0) {
  // Score = poidsPriorité + bonus type deadline + proximité + surcharge + statut
  const w = PRIORITY_WEIGHT[e.priority || 'normal'] ?? 10;

  const isDeadline = e.type === 'deadline';
  const d = daysUntil(e.date);

  const proximity =
    d <= 0 ? 60 : d <= 1 ? 45 : d <= 3 ? 30 : d <= 7 ? 18 : d <= 14 ? 10 : 0;

  const deadlineBonus = isDeadline ? 35 : 0;

  const overloadBonus = overloadCountForDay >= 5 ? 20 : overloadCountForDay >= 4 ? 12 : overloadCountForDay >= 3 ? 6 : 0;

  const statusPenalty =
    e.status === 'cancelled' ? -50 : e.status === 'completed' ? -30 : 0;

  const score = Math.round(w + proximity + deadlineBonus + overloadBonus + statusPenalty);
  return score;
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Utilitaire pour générer un hash SHA3-256 simulé
function generateSHA3Hash(data: string): string {
  let hash = 0;
  const timestamp = Date.now();
  const combined = `${data}-${timestamp}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
  return `SHA3-256:${hexHash}${Math.random().toString(16).slice(2, 10)}`;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const m = new Map<string, T>();
  for (const item of arr) m.set(item.id, item);
  return Array.from(m.values());
}

function getEventTypeMeta(type: string) {
  const eventTypes: Record<string, { icon: string; label: string }> = {
    meeting: { icon: '📅', label: 'Réunion' },
    visio: { icon: '💻', label: 'Visio' },
    deadline: { icon: '⏰', label: 'Échéance' },
    site: { icon: '🏗️', label: 'Visite terrain' },
    delivery: { icon: '📦', label: 'Livraison' },
    legal: { icon: '⚖️', label: 'Juridique' },
    inspection: { icon: '🔍', label: 'Inspection' },
    training: { icon: '📚', label: 'Formation' },
    hr: { icon: '👥', label: 'RH' },
  };
  return eventTypes[type] || { icon: '📌', label: type };
}

function getPriorityBadge(priority?: string) {
  if (priority === 'critical') return 'urgent';
  if (priority === 'urgent') return 'urgent';
  if (priority === 'high') return 'warning';
  return 'default';
}

function getSeverityBadge(sev: ImpactSeverity) {
  if (sev === 'critical') return 'urgent';
  if (sev === 'high') return 'warning';
  return 'info';
}

function getBreakerIconAndLabel(breaker: OrgaBreaker): { icon: string; label: string } {
  switch (breaker.type) {
    case 'blocked':
      return { icon: '🚨', label: 'Dossier bloqué' };
    case 'payment':
      return { icon: '💳', label: 'Paiement urgent' };
    case 'contract':
      return { icon: '📜', label: 'Contrat en attente' };
    case 'absence':
      return { icon: '👤', label: 'Absence critique' };
    default:
      return { icon: '❓', label: 'Alerte' };
  }
}

function getRangeDates(selectedDate: Date, viewType: CalendarViewType) {
  const start = new Date(selectedDate);
  const end = new Date(selectedDate);

  if (viewType === 'day') {
    // même jour
  } else if (viewType === 'month') {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  } else {
    // workweek/week = semaine ISO simple (lundi -> dimanche)
    const day = start.getDay(); // 0 dim
    const diffToMonday = (day + 6) % 7; // lundi=0
    start.setDate(start.getDate() - diffToMonday);
    end.setDate(start.getDate() + 6);
  }

  return { startIso: isoDate(start), endIso: isoDate(end) };
}

function withinRange(dateIso: string, startIso: string, endIso: string) {
  return dateIso >= startIso && dateIso <= endIso;
}

function BulkRescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  targetCount,
  darkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => void;
  targetCount: number;
  darkMode: boolean;
}) {
  const [newDate, setNewDate] = useState(isoDate(new Date()));
  const [newTime, setNewTime] = useState('10:00');

  useEffect(() => {
    if (isOpen) {
      setNewDate(isoDate(new Date()));
      setNewTime('10:00');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">🗓️ Replanification en masse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn('p-3 rounded-lg border', darkMode ? 'bg-slate-900/20 border-slate-700' : 'bg-gray-50 border-gray-200')}>
            <p className="text-sm font-semibold">Cibles : {targetCount}</p>
            <p className="text-xs text-slate-400">La même date/heure sera appliquée à tous les événements ciblés.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className={cn(
                  'w-full h-9 rounded-md border px-3 text-sm outline-none',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Heure</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className={cn(
                  'w-full h-9 rounded-md border px-3 text-sm outline-none',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                )}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => onConfirm(newDate, newTime)} disabled={!newDate || !newTime}>
              ✓ Confirmer
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CalendrierPage() {
  // ======================
  // BLOC 0 — CONTEXTE / STORES
  // ======================
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, actionLogs } = useBMOStore();

  const currentUser = useMemo(
    () => ({
      id: 'USR-001',
      name: 'A. DIALLO',
      role: 'Directeur Général',
      bureau: 'BMO',
    }),
    []
  );

  // ======================
  // BLOC 1 — ÉTAT UI
  // ======================
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<CalendarView>('overview');
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>('workweek');

  const [selectedBureaux, setSelectedBureaux] = useState<string[]>(bureaux.map((b) => b.code));

  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<CalendarEvent | null>(null);

  const [showRescheduleSimulator, setShowRescheduleSimulator] = useState(false);
  const [activityToReschedule, setActivityToReschedule] = useState<CalendarEvent | null>(null);

  const [journalFilters, setJournalFilters] = useState<{ bureau?: string; project?: string; actionType?: string }>({});
  const [calendarFilters, setCalendarFilters] = useState<{ bureau?: string; project?: string; type?: string; priority?: string }>({});

  const [focusMode, setFocusMode] = useState<{ type?: 'bureau' | 'project' | 'priority'; value?: string }>({});

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showAlternativeView, setShowAlternativeView] = useState(false);

  // Recherche + tri + sélection
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortMode>('priority_desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkReschedule, setShowBulkReschedule] = useState(false);

  // Modales Blocages (Alternative view)
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);
  const [showBMOResolveModal, setShowBMOResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showBlockerDetailsPanel, setShowBlockerDetailsPanel] = useState(false);

  // Conflits (planning)
  const [detectedConflicts, setDetectedConflicts] = useState<Array<{ type: string; description: string; severity: string }>>([]);

  // Traçabilité
  const [register, setRegister] = useState<RegisterEntry[]>([]);
  const [lastDecisionHash, setLastDecisionHash] = useState<string | null>(null);

  // ======================
  // BLOC 2 — DONNÉES (source de vérité)
  // ======================
  const [activities, setActivities] = useState<CalendarEvent[]>(() => dedupeById(agendaEvents as CalendarEvent[]));

  // Reset view si rien n'est sélectionné/édité
  useEffect(() => {
    if (!selectedActivityId && !editingActivity) {
      setActiveView('overview');
    }
  }, [selectedActivityId, editingActivity]);

  // ESC ferme les modales importantes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      setShowPlanningModal(false);
      setShowRescheduleSimulator(false);
      setShowBulkReschedule(false);
      setShowBMOResolveModal(false);
      setShowEscalateModal(false);
      setShowBlockerDetailsPanel(false);

      setEditingActivity(null);
      setActivityToReschedule(null);
      setDetectedConflicts([]);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ======================
  // BLOC 3 — CALCULS / FILTRES / VUES
  // ======================
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(selectedDate);
    const day = start.getDay();
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Filtrage bureau + filtres + recherche texte
  const filteredActivities = useMemo(() => {
    let list = [...activities];

    // Filtre bureaux (sidebar)
    if (selectedBureaux.length < bureaux.length) {
      list = list.filter((a) => !a.bureau || selectedBureaux.includes(a.bureau));
    }

    // Filtres (panel)
    if (calendarFilters.bureau) list = list.filter((a) => a.bureau === calendarFilters.bureau);
    if (calendarFilters.project) list = list.filter((a) => (a.project || '').includes(calendarFilters.project || ''));
    if (calendarFilters.type) list = list.filter((a) => a.type === calendarFilters.type);
    if (calendarFilters.priority) list = list.filter((a) => a.priority === calendarFilters.priority);

    // Recherche texte
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((a) => {
        const hay = [a.id, a.title, a.type, a.bureau, a.project, a.status, a.priority, a.date, a.time]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(query);
      });
    }

    return list;
  }, [activities, selectedBureaux, calendarFilters, q]);

  // Range visible selon vue (pour "tout sélectionner (vue)")
  const visibleRange = useMemo(() => getRangeDates(selectedDate, calendarViewType), [selectedDate, calendarViewType]);

  const visibleActivities = useMemo(() => {
    const { startIso, endIso } = visibleRange;
    const inRange = filteredActivities.filter((a) => withinRange(a.date, startIso, endIso));

    // Tri
    const byDayCounts = new Map<string, number>();
    for (const a of inRange) byDayCounts.set(a.date, (byDayCounts.get(a.date) || 0) + 1);

    const sorted = [...inRange].sort((a, b) => {
      if (sort === 'date_asc') return (a.date + (a.time || '')) < (b.date + (b.time || '')) ? -1 : 1;
      if (sort === 'date_desc') return (a.date + (a.time || '')) > (b.date + (b.time || '')) ? -1 : 1;
      if (sort === 'bureau') return String(a.bureau || '').localeCompare(String(b.bureau || ''));
      if (sort === 'type') return String(a.type || '').localeCompare(String(b.type || ''));
      if (sort === 'status') return String(a.status || '').localeCompare(String(b.status || ''));
      // priority_desc (par défaut)
      const sa = computeEventPriorityScore(a, byDayCounts.get(a.date) || 0);
      const sb = computeEventPriorityScore(b, byDayCounts.get(b.date) || 0);
      return sb - sa;
    });

    return sorted;
  }, [filteredActivities, visibleRange, sort]);

  // Sélection / cibles (sélection > sinon visible)
  const selectedActivities = useMemo(() => {
    if (selectedIds.size === 0) return [];
    const map = new Map(activities.map((a) => [a.id, a]));
    return Array.from(selectedIds).map((id) => map.get(id)).filter(Boolean) as CalendarEvent[];
  }, [selectedIds, activities]);

  const targets = useMemo(() => (selectedActivities.length > 0 ? selectedActivities : visibleActivities), [selectedActivities, visibleActivities]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    for (const e of visibleActivities) {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    }
    return grouped;
  }, [visibleActivities]);

  const overloadPeriods = useMemo(() => {
    return Object.entries(eventsByDate)
      .filter(([, events]) => events.length > 3)
      .map(([date, events]) => ({ date, count: events.length, events }));
  }, [eventsByDate]);

  const upcomingDeadlines = useMemo(() => {
    const todayIso = isoDate(new Date());
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const in7Iso = isoDate(in7);

    return visibleActivities
      .filter((e) => e.type === 'deadline' && e.date >= todayIso && e.date <= in7Iso)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 12);
  }, [visibleActivities]);

  const activeAbsences = useMemo(() => {
    const today = new Date();
    return plannedAbsences.filter((a) => new Date(a.endDate.split('/').reverse().join('-')) >= today);
  }, []);

  // "Ce qui casse l'orga"
  const orgaBreakers = useMemo(() => {
    const breakers: OrgaBreaker[] = [];

    blockedDossiers
      .filter((d) => d.delay >= 5 || d.impact === 'critical')
      .forEach((d) => {
        breakers.push({
          id: d.id,
          type: 'blocked',
          severity: d.delay >= 7 || d.impact === 'critical' ? 'critical' : 'high',
          title: `Dossier bloqué ${d.delay}j`,
          description: d.subject,
          bureau: d.bureau,
          link: '/maitre-ouvrage/substitution',
          daysBlocked: d.delay,
          project: d.project,
        });
      });

    paymentsN1.forEach((p) => {
      const dueDate = new Date(p.dueDate.split('/').reverse().join('-'));
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 5 && diffDays >= 0) {
        breakers.push({
          id: p.id,
          type: 'payment',
          severity: diffDays <= 2 ? 'critical' : 'high',
          title: `Paiement urgent J-${diffDays}`,
          description: `${p.beneficiary} - ${p.amount} FCFA`,
          bureau: p.bureau,
          link: '/maitre-ouvrage/validation-paiements',
          dueDate: p.dueDate,
        });
      }
    });

    contractsToSign
      .filter((c) => c.status === 'pending')
      .forEach((c) => {
        breakers.push({
          id: c.id,
          type: 'contract',
          severity: 'medium',
          title: 'Contrat en attente',
          description: c.subject,
          bureau: c.bureau,
          link: '/maitre-ouvrage/validation-contrats',
          supplier: c.partner,
        });
      });

    activeAbsences
      .filter((a) => a.impact === 'high')
      .forEach((a) => {
        breakers.push({
          id: a.id,
          type: 'absence',
          severity: 'high',
          title: `Absence: ${a.employeeName}`,
          description: `${a.startDate} → ${a.endDate}`,
          bureau: a.bureau,
          link: '/maitre-ouvrage/substitution',
          employeeName: a.employeeName,
          startDate: a.startDate,
          endDate: a.endDate,
        });
      });

    const order: Record<ImpactSeverity, number> = { critical: 0, high: 1, medium: 2 };
    return breakers.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 12);
  }, [activeAbsences]);

  // Stats rapides
  const todayIso = isoDate(new Date());
  const todayEvents = useMemo(() => activities.filter((e) => e.date === todayIso), [activities, todayIso]);
  const urgentEvents = useMemo(
    () => activities.filter((e) => e.priority === 'urgent' || e.priority === 'critical'),
    [activities]
  );

  // ======================
  // BLOC 4 — TRAÇABILITÉ & LOGS
  // ======================
  const pushRegister = useCallback((entry: RegisterEntry) => {
    setRegister((prev) => [entry, ...prev].slice(0, 800));
    setLastDecisionHash(entry.hash.replace('SHA-256:', ''));
  }, []);

  const logCalendarAction = useCallback(
    async (payload: {
      kind: RegisterEntry['kind'];
      action: RegisterEntry['action'];
      event: CalendarEvent;
      details: string;
      batchId?: string;
    }) => {
      const at = new Date().toISOString();
      const raw = {
        at,
        batchId: payload.batchId,
        kind: payload.kind,
        eventId: payload.event.id,
        date: payload.event.date,
        time: payload.event.time,
        title: payload.event.title,
        bureau: payload.event.bureau,
        priority: payload.event.priority,
        status: payload.event.status,
        details: payload.details,
        user: currentUser,
      };
      const hex = await sha256Hex(JSON.stringify(raw));
      const hash = `SHA-256:${hex}`;

      // Store log
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        module: 'calendar',
        action: payload.kind === 'create' ? 'creation' : payload.kind === 'edit' ? 'modification' : 'validation',
        targetId: payload.event.id,
        targetType: 'Activity',
        targetLabel: payload.event.title,
        bureau: payload.event.bureau,
        details: `${payload.details} • Hash: ${hash}`,
      });

      // Registre local exportable
      pushRegister({
        at,
        batchId: payload.batchId,
        action: payload.action,
        module: 'calendar',
        kind: payload.kind,
        eventId: payload.event.id,
        title: payload.event.title,
        bureau: payload.event.bureau,
        date: payload.event.date,
        time: payload.event.time,
        priority: payload.event.priority,
        status: payload.event.status,
        details: payload.details,
        hash,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      });
    },
    [addActionLog, currentUser, pushRegister]
  );

  const exportRegister = useCallback(() => {
    const filename = `registre_calendrier_${isoDate(new Date())}.json`;
    downloadJson(filename, {
      generatedAt: new Date().toISOString(),
      user: currentUser,
      view: { activeView, calendarViewType, selectedDate: isoDate(selectedDate) },
      filters: { q, sort, selectedBureaux, calendarFilters, focusMode },
      selection: Array.from(selectedIds),
      register,
    });
    addToast('📤 Registre exporté (JSON)', 'success');
  }, [register, currentUser, activeView, calendarViewType, selectedDate, q, sort, selectedBureaux, calendarFilters, focusMode, selectedIds, addToast]);

  const copyLastHash = useCallback(async () => {
    if (!lastDecisionHash) return;
    await navigator.clipboard.writeText(lastDecisionHash);
    addToast('🔗 Hash copié', 'success');
  }, [lastDecisionHash, addToast]);

  // Résolution de blocages
  const resolveBlocker = useCallback(async (
    blockerId: string,
    action: 'resolve' | 'escalate' | 'relaunch',
    data?: any
  ) => {
    // Mapping des actions internes vers ActionLogType
    const actionMap: Record<string, 'modification' | 'escalation' | 'audit'> = {
      resolve: 'modification',
      escalate: 'escalation',
      relaunch: 'audit',
    };

    const actionLogType = actionMap[action] || 'audit';

    // 1. Log l'action
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'blocages',
      action: actionLogType,
      targetId: blockerId,
      targetType: 'Blocker',
      details: `Action: ${action}${data ? ` - ${JSON.stringify(data)}` : ''}`,
      bureau: selectedBlocker?.bureau,
    });

    // 2. Fermer les modales
    setShowBMOResolveModal(false);
    setShowEscalateModal(false);
    setSelectedBlocker(null);

    // 3. Optionnel : générer un nouveau hash de résolution
    if (action === 'resolve') {
      const resolutionHash = generateSHA3Hash(`resolve-${blockerId}-${Date.now()}`);
      setLastDecisionHash(resolutionHash.replace('SHA3-256:', ''));
      addToast(`✅ Blocage résolu – Hash: ${resolutionHash.slice(0, 12)}...`, 'success');
    } else if (action === 'escalate') {
      addToast('🔺 Blocage escaladé', 'info');
    } else if (action === 'relaunch') {
      addToast('🔄 Blocage relancé', 'info');
    }
  }, [currentUser, selectedBlocker, addActionLog, addToast, setLastDecisionHash]);

  // ======================
  // BLOC 5 — ACTIONS (sélection & masse)
  // ======================
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const selectAllVisible = useCallback(() => setSelectedIds(new Set(visibleActivities.map((a) => a.id))), [visibleActivities]);
  const selectNoneVisible = useCallback(() => setSelectedIds(new Set()), []);

  const runBulk = useCallback(
    async (action: BulkAction, extra?: { newDate?: string; newTime?: string }) => {
      if (targets.length === 0) {
        addToast('Aucune cible', 'warning');
        return;
      }

      const batchId = `BATCH-${Date.now()}`;
      const startedAt = new Date().toISOString();

      // En-tête bulk dans registre (utile audit)
      const headerRaw = { batchId, action, count: targets.length, extra: extra || {}, at: startedAt, user: currentUser };
      const headerHash = await sha256Hex(JSON.stringify(headerRaw));
      setRegister((prev) => [
        {
          at: startedAt,
          batchId,
          action: 'bulk',
          module: 'calendar',
          kind: action,
          eventId: `__BULK__${batchId}`,
          title: `Bulk ${action} (${targets.length})`,
          bureau: currentUser.bureau,
          date: isoDate(new Date()),
          time: '',
          priority: '',
          status: '',
          details: `Opération en masse: ${action} • Extra: ${JSON.stringify(extra || {})}`,
          hash: `SHA-256:${headerHash}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
        },
        ...prev,
      ]);
      setLastDecisionHash(headerHash);

      // Application
      setActivities((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]));
        for (const t of targets) {
          const cur = map.get(t.id);
          if (!cur) continue;

          let next: CalendarEvent = cur;

          if (action === 'complete') next = { ...cur, status: 'completed' as const };
          if (action === 'cancel') next = { ...cur, status: 'cancelled' as const };
          if (action === 'reschedule' && extra?.newDate && extra?.newTime)
            next = { ...cur, date: extra.newDate, time: extra.newTime, status: 'rescheduled' as const };
          if (action === 'set_priority_urgent') next = { ...cur, priority: 'urgent' as const };
          if (action === 'set_priority_normal') next = { ...cur, priority: 'normal' as const };
          if (action === 'set_priority_critical') next = { ...cur, priority: 'critical' as const };

          map.set(t.id, next);
        }
        return Array.from(map.values());
      });

      // Logs par item (audit)
      for (const t of targets) {
        const meta = action === 'reschedule' ? `Replanifié → ${extra?.newDate} ${extra?.newTime}` : `Action: ${action}`;
        await logCalendarAction({
          kind: action,
          action: 'bulk',
          event: t,
          details: `${meta} (batchId=${batchId})`,
          batchId,
        });
      }

      addToast(
        action === 'complete'
          ? `✓ Terminé en masse (${targets.length})`
          : action === 'cancel'
          ? `✖ Annulé en masse (${targets.length})`
          : action === 'reschedule'
          ? `🗓️ Replanifié en masse (${targets.length})`
          : action.includes('priority')
          ? `⚡ Priorité modifiée (${targets.length})`
          : `Action exécutée (${targets.length})`,
        'success'
      );
    },
    [targets, addToast, logCalendarAction, currentUser]
  );

  // Navigation calendrier
  const handlePrevious = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (calendarViewType === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    addToast(`Navigation vers ${newDate.toLocaleDateString('fr-FR')}`, 'info');
  }, [selectedDate, calendarViewType, addToast]);

  const handleNext = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (calendarViewType === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (calendarViewType === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    addToast(`Navigation vers ${newDate.toLocaleDateString('fr-FR')}`, 'info');
  }, [selectedDate, calendarViewType, addToast]);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
    addToast("Navigation vers aujourd'hui", 'success');
  }, [addToast]);

  const handleBureauToggle = useCallback((bureauCode: string) => {
    setSelectedBureaux((prev) => (prev.includes(bureauCode) ? prev.filter((b) => b !== bureauCode) : [...prev, bureauCode]));
  }, []);

  // ======================
  // BLOC 6 — DÉTECTION DE CONFLITS (planning)
  // ======================
  const detectConflicts = useCallback(
    (activityData: Partial<CalendarEvent>, existingActivityId?: string): Array<{ type: string; description: string; severity: string }> => {
      const conflicts: Array<{ type: string; description: string; severity: string }> = [];
      if (!activityData.date || !activityData.bureau) return conflicts;

      const activityDate = activityData.date;
      const activityBureau = activityData.bureau;
      const activityTime = activityData.time || '10:00';

      // surcharge par bureau / jour
      const sameDay = activities.filter((a) => a.date === activityDate && a.bureau === activityBureau && a.id !== existingActivityId);
      if (sameDay.length >= 3) {
        conflicts.push({
          type: 'overload',
          description: `${sameDay.length} activités déjà planifiées ce jour pour ${activityBureau}`,
          severity: sameDay.length >= 5 ? 'critical' : 'high',
        });
      }

      // absences participants
      if (activityData.participants) {
        const activityDateObj = new Date(activityDate);
        const absent = activityData.participants.filter((p) => {
          const absence = plannedAbsences.find(
            (a) =>
              a.bureau === p.bureau &&
              a.employeeName.includes(p.name.split(' ')[0]) &&
              new Date(a.startDate.split('/').reverse().join('-')) <= activityDateObj &&
              new Date(a.endDate.split('/').reverse().join('-')) >= activityDateObj
          );
          return Boolean(absence);
        });
        if (absent.length > 0) {
          conflicts.push({
            type: 'absence',
            description: `${absent.length} participant(s) absent(s) à cette date`,
            severity: absent.length === activityData.participants.length ? 'critical' : 'high',
          });
        }
      }

      // chevauchement par heure (±2h)
      const overlap = activities.filter(
        (a) =>
          a.date === activityDate &&
          a.bureau === activityBureau &&
          a.id !== existingActivityId &&
          a.time &&
          Math.abs(parseHH(a.time) - parseHH(activityTime)) < 2
      );
      if (overlap.length > 0) {
        conflicts.push({
          type: 'overlap',
          description: `${overlap.length} activité(s) chevauchant(nt) cette plage horaire`,
          severity: 'high',
        });
      }

      // dépendances
      if (activityData.dependencies && activityData.dependencies.length > 0) {
        const unmet = activityData.dependencies.filter((depId) => {
          const dep = activities.find((a) => a.id === depId);
          if (!dep) return true;
          const depDate = new Date(dep.date);
          const actDate = new Date(activityDate);
          return depDate > actDate || dep.status === 'cancelled';
        });
        if (unmet.length > 0) {
          conflicts.push({
            type: 'dependency',
            description: `${unmet.length} dépendance(s) non respectée(s)`,
            severity: 'critical',
          });
        }
      }

      return conflicts;
    },
    [activities]
  );

  // ======================
  // RENDER
  // ======================
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden w-full max-w-full -m-4">
      {/* ===== BLOC 1 — Ribbon (Outlook) ===== */}
      <CalendarRibbon
        activeView={calendarViewType}
        onViewChange={(view) => {
          setCalendarViewType(view);
          addToast(`Vue changée: ${view}`, 'success');
        }}
        onNewEvent={() => {
          setEditingActivity(null);
          setDetectedConflicts([]);
          setShowPlanningModal(true);
          addToast('Ouverture du formulaire de planification', 'info');
        }}
        onFilter={() => {
          setShowFiltersPanel((v) => !v);
          addToast(showFiltersPanel ? 'Fermeture des filtres' : 'Ouverture des filtres', 'info');
        }}
        onPrint={() => {
          window.print();
          addToast('Impression du calendrier...', 'info');
        }}
        onDisplayClick={() => {
          setShowAlternativeView((v) => !v);
          addToast(showAlternativeView ? 'Retour à la vue calendrier standard' : 'Affichage alternatif: Blocages & événements', 'info');
        }}
        onHelpClick={() => {
          window.alert(
            'Raccourcis clavier:\n- Échap : fermer modales\n- Utilise les boutons de navigation pour semaine/mois/jour'
          );
        }}
      />

      {/* ===== BLOC 2 — Layout : Sidebar + Main ===== */}
      <div className="flex flex-1 overflow-hidden w-full max-w-full">
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedBureaux={selectedBureaux}
          onBureauToggle={handleBureauToggle}
          activities={activities}
        />

        <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
          {/* ===== BLOC 3 — Navigation + outils ===== */}
          <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30 px-4 py-2">
            <CalendarNavigationBar
              currentDate={selectedDate}
              viewType={calendarViewType}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToday={handleToday}
            />

            <div className="flex items-center gap-2">
              <AdvancedSearch
                activities={activities}
                onSelectActivity={(id) => {
                  setSelectedActivityId(id);
                  addToast("Navigation vers l'activité sélectionnée", 'info');
                }}
                onFilterChange={() => {
                  // Tu peux connecter ici une recherche avancée si tu veux unifier avec q/calendarFilters
                  addToast('Recherche avancée mise à jour', 'info');
                }}
              />

              <CalendarExport
                activities={activities}
                onImport={(imported) => {
                  setActivities((prev) => dedupeById([...prev, ...imported]));
                  addToast(`${imported.length} activité(s) importée(s)`, 'success');
                }}
              />
            </div>
          </div>

          {/* ===== BLOC 4 — Panel filtres ===== */}
          {showFiltersPanel && (
            <div className="border-b border-slate-700/50 bg-slate-800/50 p-4">
              <CalendarFilters
                filters={calendarFilters}
                onFiltersChange={(newFilters) => {
                  setCalendarFilters(newFilters);
                  addToast('Filtres appliqués', 'success');
                }}
              />
            </div>
          )}

          {/* ===== BLOC 5 — Command Center (recherche / tri / sélection / bulk / registre) ===== */}
          <div className={cn('border-b p-3', darkMode ? 'border-slate-700/50 bg-slate-900/20' : 'border-gray-200 bg-white')}>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher (titre, id, bureau, projet, statut...)"
                  className={cn(
                    'h-9 w-96 max-w-full rounded-md border px-3 text-sm outline-none',
                    darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                  )}
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className={cn(
                    'h-9 rounded-md border px-3 text-sm',
                    darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                  )}
                >
                  <option value="priority_desc">Priorité ↓</option>
                  <option value="date_asc">Date ↑</option>
                  <option value="date_desc">Date ↓</option>
                  <option value="bureau">Bureau</option>
                  <option value="type">Type</option>
                  <option value="status">Statut</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">Visibles: {visibleActivities.length}</Badge>
                <Badge variant="default">Sélection: {selectedIds.size}</Badge>
                <Badge variant="warning">Cibles: {targets.length}</Badge>

                <Button size="sm" variant="secondary" onClick={selectAllVisible}>
                  Tout sélectionner (vue)
                </Button>
                <Button size="sm" variant="secondary" onClick={selectNoneVisible}>
                  Désélectionner
                </Button>
                <Button size="sm" variant="secondary" onClick={clearSelection}>
                  Vider sélection
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="success" onClick={() => runBulk('complete')}>
                ✓ Terminer (masse)
              </Button>
              <Button size="sm" variant="destructive" onClick={() => runBulk('cancel')}>
                ✖ Annuler (masse)
              </Button>
              <Button size="sm" variant="info" onClick={() => setShowBulkReschedule(true)}>
                🗓️ Replanifier (masse)
              </Button>

              <div className="h-4 w-px bg-slate-700/50 mx-1" />

              <Button size="sm" variant="warning" onClick={() => runBulk('set_priority_critical')}>
                🚨 Priorité: critical
              </Button>
              <Button size="sm" variant="warning" onClick={() => runBulk('set_priority_urgent')}>
                ⚡ Priorité: urgent
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runBulk('set_priority_normal')}>
                🧊 Priorité: normal
              </Button>

              <div className="flex-1" />

              <Button size="sm" variant="default" onClick={exportRegister}>
                📤 Export registre (JSON)
              </Button>
              <Button size="sm" variant="secondary" onClick={copyLastHash} disabled={!lastDecisionHash}>
                🔗 Copier dernier hash
              </Button>
            </div>

            {lastDecisionHash && (
              <div className={cn('mt-3 p-2 rounded border', darkMode ? 'border-slate-700 bg-slate-900/20' : 'border-gray-200 bg-gray-50')}>
                <p className="text-[10px] text-slate-400">Dernier hash</p>
                <p className="font-mono text-[11px] break-all">{lastDecisionHash}</p>
                <Button
                  size="xs"
                  variant="ghost"
                  className="mt-1 text-[10px]"
                  onClick={async () => {
                    // Chercher l'entrée correspondante dans le registre
                    const entry = register.find((r) => r.hash.replace('SHA-256:', '') === lastDecisionHash);
                    if (entry) {
                      // Utiliser eventId comme decisionId pour la vérification
                      const isValid = await verifyDecisionHash(entry.eventId, `SHA-256:${lastDecisionHash}`);
                      addToast(
                        isValid ? '✅ Hash valide – décision authentique' : '❌ Hash invalide – altération détectée',
                        isValid ? 'success' : 'error'
                      );
                    } else {
                      // Vérifier directement dans le registre si le hash existe
                      const hashExists = register.some((r) => r.hash.replace('SHA-256:', '') === lastDecisionHash);
                      addToast(
                        hashExists ? '✅ Hash trouvé dans le registre' : '⚠️ Hash non trouvé dans le registre',
                        hashExists ? 'success' : 'warning'
                      );
                    }
                  }}
                >
                  🔍 Vérifier l'intégrité
                </Button>
              </div>
            )}
          </div>

          {/* ===== BLOC 6 — Contenu (Alternative ou Standard + onglets) ===== */}
          <div className="flex-1 overflow-auto p-4 w-full max-w-full overflow-x-hidden">
            {showAlternativeView ? (
              <AlternativeCalendarView
                activities={activities}
                onResolveBlocker={(blockerId) => {
                  const blocked = blockedDossiers.find((b) => b.id === blockerId);
                  const contract = contractsToSign.find((c) => c.id === blockerId);

                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : blocked.impact === 'high' ? 'high' : 'medium') as ImpactSeverity,
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowBMOResolveModal(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowBMOResolveModal(true);
                  }
                }}
                onViewBlockerDetails={(blockerId) => {
                  const blocked = blockedDossiers.find((b) => b.id === blockerId);
                  const contract = contractsToSign.find((c) => c.id === blockerId);

                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : blocked.impact === 'high' ? 'high' : 'medium') as ImpactSeverity,
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowBlockerDetailsPanel(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowBlockerDetailsPanel(true);
                  }
                }}
                onEscalateBlocker={(blockerId) => {
                  const blocked = blockedDossiers.find((b) => b.id === blockerId);
                  const contract = contractsToSign.find((c) => c.id === blockerId);

                  if (blocked) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'blocked',
                      severity: (blocked.impact === 'critical' ? 'critical' : blocked.impact === 'high' ? 'high' : 'medium') as ImpactSeverity,
                      title: `Dossier bloqué ${blocked.delay || 0}j`,
                      description: blocked.reason || blocked.subject,
                      bureau: blocked.bureau,
                      project: blocked.project,
                      situation: blocked.reason,
                      daysBlocked: blocked.delay,
                    });
                    setShowEscalateModal(true);
                  } else if (contract) {
                    setSelectedBlocker({
                      id: blockerId,
                      type: 'contract',
                      severity: 'medium',
                      title: 'Contrat en attente',
                      description: contract.subject,
                      bureau: contract.bureau,
                      supplier: contract.partner,
                    });
                    setShowEscalateModal(true);
                  }
                }}
                onViewEventDetails={(eventId) => {
                  setSelectedActivityId(eventId);
                  addToast("Ouverture des détails de l'événement", 'info');
                }}
              />
            ) : (
              <>
                {/* Onglets (toujours visibles en mode standard) */}
                <div className="flex gap-2 border-b border-slate-700/50 pb-2 mb-4 overflow-x-auto">
                  <Button size="sm" variant={activeView === 'overview' ? 'default' : 'ghost'} onClick={() => setActiveView('overview')} className="whitespace-nowrap">
                    📋 Vue d'ensemble
                  </Button>
                  <Button size="sm" variant={activeView === 'heatmap' ? 'default' : 'ghost'} onClick={() => setActiveView('heatmap')} className="whitespace-nowrap">
                    🔥 Heatmap
                  </Button>
                  <Button size="sm" variant={activeView === 'timeline' ? 'default' : 'ghost'} onClick={() => setActiveView('timeline')} className="whitespace-nowrap">
                    📊 Timeline
                  </Button>
                  <Button size="sm" variant={activeView === 'statistics' ? 'default' : 'ghost'} onClick={() => setActiveView('statistics')} className="whitespace-nowrap">
                    📈 Statistiques
                  </Button>
                  <Button size="sm" variant={activeView === 'journal' ? 'default' : 'ghost'} onClick={() => setActiveView('journal')} className="whitespace-nowrap">
                    📜 Journal ({actionLogs.filter((l) => l.module === 'calendar' || l.module === 'alerts').length})
                  </Button>
                </div>

                {/* VUE: Overview */}
                {activeView === 'overview' && (
                  <div className="space-y-6">
                    <IntelligentDashboard activities={activities} selectedDate={selectedDate} />

                    {/* Widgets synthèse */}
                    <div className="grid md:grid-cols-3 gap-3">
                      <Card className="border-red-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            ⏰ Échéances à 7 jours <Badge variant="urgent">{upcomingDeadlines.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                          {upcomingDeadlines.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">Aucune échéance</p>
                          ) : (
                            upcomingDeadlines.map((event) => {
                              const meta = getEventTypeMeta(event.type);
                              const diff = daysUntil(event.date);
                              const score = computeEventPriorityScore(event, (eventsByDate[event.date] || []).length);

                              return (
                                <div
                                  key={`deadline-${event.id}`}
                                  className={cn(
                                    'flex items-center gap-2 p-2 rounded text-xs transition-colors hover:opacity-80 cursor-pointer',
                                    darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                                  )}
                                  onClick={async () => {
                                    setSelectedActivityId(event.id);
                                    await logCalendarAction({
                                      kind: 'open_details',
                                      action: 'single',
                                      event,
                                      details: `Ouverture détails (score=${score})`,
                                    });
                                    addToast(`Consultation: ${event.title}`, 'info');
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(event.id)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleSelected(event.id);
                                    }}
                                  />
                                  <span>{meta.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{event.title}</p>
                                    <p className="text-[10px] text-slate-400">{event.date} • {event.time}</p>
                                  </div>
                                  <Badge variant={diff <= 2 ? 'urgent' : diff <= 4 ? 'warning' : 'default'}>J-{diff}</Badge>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            🔥 Surcharges <Badge variant="warning">{overloadPeriods.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                          {overloadPeriods.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">Aucune surcharge</p>
                          ) : (
                            overloadPeriods.map((p) => (
                              <div
                                key={`over-${p.date}`}
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:opacity-80',
                                  darkMode ? 'bg-amber-500/10' : 'bg-amber-50'
                                )}
                                onClick={() => {
                                  setSelectedDate(new Date(p.date));
                                  setCalendarViewType('day');
                                  addToast(`Navigation vers ${p.date}`, 'info');
                                }}
                              >
                                <span>⚠️</span>
                                <div className="flex-1">
                                  <p className="font-semibold">{p.date}</p>
                                </div>
                                <Badge variant="warning">{p.count} évts</Badge>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-blue-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            👥 Absences <Badge variant="info">{activeAbsences.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                          {activeAbsences.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">Aucune absence</p>
                          ) : (
                            activeAbsences.map((a) => (
                              <div
                                key={a.id}
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded text-xs cursor-pointer hover:opacity-80',
                                  a.impact === 'high' ? 'bg-red-500/10' : darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                                )}
                                onClick={() => {
                                  setSelectedDate(new Date(a.startDate.split('/').reverse().join('-')));
                                  setCalendarViewType('day');
                                  addToast(`Navigation vers absence: ${a.employeeName}`, 'info');
                                }}
                              >
                                <span>{a.type === 'congé' ? '🏖️' : '✈️'}</span>
                                <div className="flex-1">
                                  <p className="font-semibold">{a.employeeName}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {a.startDate} → {a.endDate}
                                  </p>
                                </div>
                                <BureauTag bureau={a.bureau} />
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Stats rapides */}
                    <div className="grid grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-blue-400">{todayEvents.length}</p>
                          <p className="text-[10px] text-slate-400">Aujourd'hui</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-red-400">{urgentEvents.length}</p>
                          <p className="text-[10px] text-slate-400">Urgents</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-amber-400">{activities.filter((e) => e.type === 'deadline').length}</p>
                          <p className="text-[10px] text-slate-400">Échéances</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl font-bold text-emerald-400">{activities.filter((e) => e.type === 'meeting').length}</p>
                          <p className="text-[10px] text-slate-400">Réunions</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions rapides */}
                    <QuickActionsPanel
                      onQuickAction={(action) => {
                        if (action === 'focus-urgent') {
                          setCalendarFilters((f) => ({ ...f, priority: 'urgent' }));
                          addToast('Focus sur les urgents', 'info');
                        } else if (action === 'focus-overload') {
                          setActiveView('heatmap');
                          addToast('Heatmap surcharges', 'info');
                        } else if (action === 'view-all') {
                          setCalendarFilters({});
                          addToast('Réinitialisation filtres', 'info');
                        }
                      }}
                      stats={{
                        urgentCount: activities.filter((a) => a.priority === 'urgent' || a.priority === 'critical').length,
                        overloadedDays: Object.values(eventsByDate).filter((evts) => evts.length > 3).length,
                        criticalAlerts: orgaBreakers.filter((b) => b.severity === 'critical').length,
                      }}
                    />

                    {/* Focus + suggestions */}
                    <div className="space-y-4">
                      <FocusModePanel
                        activeFocus={focusMode}
                        onFocusChange={(focus) => {
                          setFocusMode(focus);
                          if (focus.type === 'bureau' && focus.value) setCalendarFilters((f) => ({ ...f, bureau: focus.value }));
                          else if (focus.type === 'priority' && focus.value) setCalendarFilters((f) => ({ ...f, priority: focus.value }));
                          else setCalendarFilters({});
                        }}
                      />

                      <SmartSuggestions
                        activities={activities}
                        onApplySuggestion={(s) => {
                          if (s.type === 'overload') {
                            setCalendarFilters({ bureau: s.data.bureau, priority: 'urgent' });
                            addToast(`Focus ${s.data.bureau} (urgent)`, 'info');
                          } else if (s.type === 'conflict') {
                            setSelectedDate(new Date(s.data.date));
                            addToast(`Navigation vers ${s.data.date}`, 'info');
                          } else if (s.type === 'optimization') {
                            setActiveView('heatmap');
                            addToast('Heatmap optimisation', 'info');
                          }
                        }}
                      />
                    </div>

                    {/* Blocages organisationnels */}
                    {orgaBreakers.length > 0 && (
                      <Card className="border-red-500/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                            🚨 Ce qui casse l'organisation <Badge variant="urgent">{orgaBreakers.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {orgaBreakers.map((b) => {
                            const { icon, label } = getBreakerIconAndLabel(b);
                            return (
                              <div
                                key={b.id}
                                className={cn(
                                  'p-3 rounded-lg border-l-4',
                                  b.severity === 'critical'
                                    ? 'border-l-red-500 bg-red-500/10'
                                    : b.severity === 'high'
                                    ? 'border-l-amber-500 bg-amber-500/10'
                                    : 'border-l-blue-500 bg-blue-500/10'
                                )}
                                aria-label={`${label}: ${b.title}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-lg" aria-hidden="true">
                                    {icon}
                                  </span>
                                  <span className="sr-only">{label}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={getSeverityBadge(b.severity)}>{b.severity}</Badge>
                                      {b.bureau && <BureauTag bureau={b.bureau} />}
                                    </div>
                                    <p className="text-xs font-semibold mt-1">{b.title}</p>
                                    <p className="text-[10px] text-slate-400 line-clamp-2">{b.description}</p>
                                  </div>
                                </div>

                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="flex-1 text-[10px] border border-slate-600 hover:bg-slate-700/50"
                                  onClick={() => {
                                    setSelectedBlocker({
                                      id: b.id,
                                      type: b.type as any,
                                      severity: b.severity,
                                      title: b.title,
                                      description: b.description,
                                      bureau: b.bureau,
                                    });
                                    setShowBlockerDetailsPanel(true);
                                    addToast('Détails blocage', 'info');
                                  }}
                                >
                                  📋 Détails
                                </Button>

                                <Button
                                  size="xs"
                                  variant={b.severity === 'critical' ? 'destructive' : 'warning'}
                                  className="flex-1 text-[10px]"
                                  onClick={() => {
                                    setSelectedBlocker({
                                      id: b.id,
                                      type: b.type as any,
                                      severity: b.severity,
                                      title: b.title,
                                      description: b.description,
                                      bureau: b.bureau,
                                    });
                                    setShowBMOResolveModal(true);
                                  }}
                                >
                                  ⚡ Résoudre
                                </Button>
                              </div>

                              {b.severity !== 'critical' && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="w-full mt-2 text-[10px] border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                                  onClick={() => {
                                    setSelectedBlocker({
                                      id: b.id,
                                      type: b.type as any,
                                      severity: b.severity,
                                      title: b.title,
                                      description: b.description,
                                      bureau: b.bureau,
                                    });
                                    setShowEscalateModal(true);
                                  }}
                                >
                                  🔺 Escalader
                                </Button>
                              )}
                            </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}

                    {/* Calendrier principal */}
                    <Card className="border-slate-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          🗓️ Vue calendrier <Badge variant="info">{visibleActivities.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ModernCalendarGrid
                          activities={visibleActivities}
                          selectedDate={selectedDate}
                          viewType={calendarViewType}
                          onActivityClick={async (activity) => {
                            setSelectedActivityId(activity.id);
                            await logCalendarAction({
                              kind: 'open_details',
                              action: 'single',
                              event: activity,
                              details: 'Consultation activité',
                            });
                            addToast(`Consultation: ${activity.title}`, 'info');
                          }}
                          onTimeSlotClick={(date, hour) => {
                            const dateStr = isoDate(date);
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                            setEditingActivity({
                              id: '',
                              title: '',
                              type: 'meeting',
                              date: dateStr,
                              time: timeStr,
                              priority: 'normal',
                              status: 'planned',
                              createdAt: new Date().toISOString(),
                              createdBy: currentUser.id,
                            });
                            setShowPlanningModal(true);
                            addToast(`Planification à ${timeStr}`, 'info');
                          }}
                          onDateClick={(date) => {
                            setSelectedDate(date);
                            setCalendarViewType('day');
                            addToast(`Navigation vers ${date.toLocaleDateString('fr-FR')}`, 'info');
                          }}
                        />
                      </CardContent>
                    </Card>

                    {/* Liste triée (utile pour sélection/masse) */}
                    <Card className="border-slate-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>📌 Liste priorisée (vue)</span>
                          <Badge variant="warning">Tri: {sort}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {visibleActivities.slice(0, 20).map((e) => {
                          const meta = getEventTypeMeta(e.type);
                          const overload = (eventsByDate[e.date] || []).length;
                          const score = computeEventPriorityScore(e, overload);

                          return (
                            <div
                              key={`list-${e.id}`}
                              className={cn('p-2 rounded-lg border flex items-center gap-2', darkMode ? 'border-slate-700 bg-slate-900/10' : 'border-gray-200 bg-gray-50')}
                            >
                              <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelected(e.id)} />
                              <span className="text-lg">{meta.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm truncate">{e.title}</p>
                                  <Badge variant={getPriorityBadge(e.priority)} className="text-[10px]">
                                    {e.priority || 'normal'}
                                  </Badge>
                                  <Badge variant="info" className="text-[10px]">
                                    score {score}
                                  </Badge>
                                  {e.bureau && <BureauTag bureau={e.bureau} className="text-[10px]" />}
                                  {e.project && <span className="text-[10px] text-slate-400 font-mono">{e.project}</span>}
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  {e.date} • {e.time} • {meta.label} • statut: {e.status || 'planned'}
                                </p>
                              </div>

                              <div className="flex gap-1">
                                <Button size="xs" variant="secondary" onClick={() => toggleSelected(e.id)}>
                                  {selectedIds.has(e.id) ? '–' : '+'}
                                </Button>
                                <Button
                                  size="xs"
                                  variant="info"
                                  onClick={async () => {
                                    setSelectedActivityId(e.id);
                                    await logCalendarAction({
                                      kind: 'open_details',
                                      action: 'single',
                                      event: e,
                                      details: 'Ouverture détails depuis liste',
                                    });
                                  }}
                                >
                                  👁️
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {visibleActivities.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucun événement visible</p>}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* VUE: Heatmap */}
                {activeView === 'heatmap' && <HeatmapView activities={visibleActivities} selectedDate={selectedDate} />}

                {/* VUE: Timeline */}
                {activeView === 'timeline' && <BureauTimelineView activities={visibleActivities} weekDays={weekDays} />}

                {/* VUE: Statistics */}
                {activeView === 'statistics' && (
                  <div className="space-y-6">
                    <PilotingStatistics
                      activities={activities}
                      actionLogs={actionLogs.map((l) => ({ ...l, targetId: l.targetId || '' }))}
                    />
                    <ModernStatistics
                      activities={activities}
                      actionLogs={actionLogs.map((l) => ({ ...l, targetId: l.targetId || '' }))}
                    />
                  </div>
                )}

                {/* VUE: Journal */}
                {activeView === 'journal' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>📜 Journal d'organisation</span>
                        <Badge variant="info">
                          {
                            actionLogs.filter((log) => {
                              if (log.module !== 'calendar' && log.module !== 'alerts') return false;
                              if (journalFilters.bureau && log.bureau !== journalFilters.bureau) return false;
                              if (journalFilters.actionType && log.action !== journalFilters.actionType) return false;
                              return true;
                            }).length
                          }{' '}
                          entrées
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold mb-1">Bureau</label>
                            <select
                              value={journalFilters.bureau || ''}
                              onChange={(e) => setJournalFilters({ ...journalFilters, bureau: e.target.value || undefined })}
                              className={cn(
                                'w-full px-2 py-1 rounded text-[9px] border',
                                darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-white border-gray-300 text-gray-700'
                              )}
                            >
                              <option value="">Tous</option>
                              {bureaux.map((b) => (
                                <option key={b.code} value={b.code}>
                                  {b.code}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold mb-1">Type d'action</label>
                            <select
                              value={journalFilters.actionType || ''}
                              onChange={(e) => setJournalFilters({ ...journalFilters, actionType: e.target.value || undefined })}
                              className={cn(
                                'w-full px-2 py-1 rounded text-[9px] border',
                                darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-white border-gray-300 text-gray-700'
                              )}
                            >
                              <option value="">Tous</option>
                              <option value="creation">Création</option>
                              <option value="modification">Modification</option>
                              <option value="validation">Validation</option>
                              <option value="notification">Notification</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Button size="sm" variant="ghost" onClick={() => setJournalFilters({})} className="text-[9px]">
                              Réinitialiser
                            </Button>
                          </div>
                        </div>
                      </div>

                      <JournalCharts
                        actionLogs={actionLogs
                          .filter((log) => log.targetId)
                          .map((log) => ({
                            module: log.module,
                            action: log.action,
                            timestamp: log.timestamp,
                            targetId: String(log.targetId || ''),
                            bureau: log.bureau,
                          }))}
                        journalFilters={journalFilters}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* =======================
          MODALES / PANELS
         ======================= */}

      {/* Bulk reschedule */}
      <BulkRescheduleModal
        isOpen={showBulkReschedule}
        onClose={() => setShowBulkReschedule(false)}
        onConfirm={(newDate, newTime) => {
          setShowBulkReschedule(false);
          runBulk('reschedule', { newDate, newTime });
        }}
        targetCount={targets.length}
        darkMode={darkMode}
      />

      {/* Planification */}
      <ActivityPlanningModal
        isOpen={showPlanningModal}
        onClose={() => {
          setShowPlanningModal(false);
          setEditingActivity(null);
          setDetectedConflicts([]);
        }}
        existingActivity={editingActivity || undefined}
        conflicts={detectedConflicts}
        onConflictDetect={(activityData) => {
          setDetectedConflicts(detectConflicts(activityData, editingActivity?.id));
        }}
        onSave={async (activityData) => {
          const conflictData = detectConflicts(activityData, editingActivity?.id);
          const conflicts =
            conflictData.length > 0
              ? conflictData.map((c) => ({
                  type: (c.type as any) || 'overlap',
                  description: c.description,
                  severity: (c.severity as any) || 'medium',
                  detectedAt: new Date().toISOString(),
                }))
              : undefined;

          const newActivity: CalendarEvent = {
            id: editingActivity?.id || `ACT-${Date.now()}`,
            title: activityData.title || '',
            type: activityData.type || 'meeting',
            date: activityData.date || '',
            time: activityData.time || '10:00',
            priority: activityData.priority || 'normal',
            bureau: activityData.bureau,
            project: activityData.project,
            estimatedCharge: activityData.estimatedCharge,
            participants: activityData.participants,
            dependencies: activityData.dependencies,
            status: 'planned',
            createdAt: editingActivity?.createdAt || new Date().toISOString(),
            createdBy: editingActivity?.createdBy || currentUser.id,
            conflicts,
          };

          setActivities((prev) => {
            if (editingActivity) return prev.map((a) => (a.id === editingActivity.id ? newActivity : a));
            return dedupeById([...prev, newActivity]);
          });

          await logCalendarAction({
            kind: editingActivity ? 'edit' : 'create',
            action: 'single',
            event: newActivity,
            details: editingActivity ? 'Activité modifiée' : `Activité créée (bureau=${newActivity.bureau || 'N/A'})`,
          });

          addToast(editingActivity ? `Activité modifiée: ${newActivity.title}` : `Activité créée: ${newActivity.title}`, 'success');

          setShowPlanningModal(false);
          setEditingActivity(null);
          setDetectedConflicts([]);
        }}
      />

      {/* Détails activité */}
      {selectedActivityId && (() => {
        const activity = activities.find((a) => a.id === selectedActivityId);
        if (!activity) return null;

        return (
          <ActivityDetailsPanel
            isOpen={selectedActivityId !== null}
            onClose={() => setSelectedActivityId(null)}
            activity={activity}
            onEdit={() => {
              setEditingActivity(activity);
              setSelectedActivityId(null);
              setShowPlanningModal(true);
            }}
            onReschedule={() => {
              setActivityToReschedule(activity);
              setShowRescheduleSimulator(true);
            }}
            onComplete={async () => {
              setActivities((prev) => prev.map((a) => (a.id === activity.id ? { ...a, status: 'completed' as const } : a)));
              await logCalendarAction({ kind: 'complete', action: 'single', event: activity, details: 'Activité terminée' });
              addToast('Activité terminée', 'success');
            }}
            onCancel={async () => {
              setActivities((prev) => prev.map((a) => (a.id === activity.id ? { ...a, status: 'cancelled' as const } : a)));
              await logCalendarAction({ kind: 'cancel', action: 'single', event: activity, details: 'Activité annulée' });
              addToast('Activité annulée', 'warning');
            }}
            onAddNote={(note) => {
              const newNote = { id: `NOTE-${Date.now()}`, content: note, author: currentUser.name, createdAt: new Date().toISOString() };
              setActivities((prev) =>
                prev.map((a) => (a.id === activity.id ? { ...a, notes: [...(a.notes || []), newNote] } : a))
              );
              addToast('Note ajoutée', 'success');
            }}
          />
        );
      })()}

      {/* Simulateur replanification unitaire */}
      {activityToReschedule && (
        <RescheduleSimulator
          isOpen={showRescheduleSimulator}
          onClose={() => {
            setShowRescheduleSimulator(false);
            setActivityToReschedule(null);
          }}
          onConfirm={async (newDate, newTime) => {
            setActivities((prev) =>
              prev.map((a) => (a.id === activityToReschedule.id ? { ...a, date: newDate, time: newTime, status: 'rescheduled' as const } : a))
            );

            await logCalendarAction({
              kind: 'reschedule',
              action: 'single',
              event: activityToReschedule,
              details: `Replanifié → ${newDate} ${newTime}`,
            });

            addToast('Activité replanifiée', 'success');
            setShowRescheduleSimulator(false);
            setActivityToReschedule(null);
          }}
          activity={activityToReschedule}
          allActivities={activities}
        />
      )}

      {/* BMO Resolve Modal (blocages) */}
      {selectedBlocker && (
        <BMOResolveModal
          isOpen={showBMOResolveModal}
          onClose={() => {
            setShowBMOResolveModal(false);
            setSelectedBlocker(null);
          }}
          onAction={async (action, data) => {
            if (!selectedBlocker) return;
            
            // Utiliser resolveBlocker pour les actions resolve, escalate, relaunch
            if (action === 'resolve' || action === 'escalate' || action === 'relaunch') {
              await resolveBlocker(selectedBlocker.id, action, data);
            } else if (action === 'reschedule') {
              const related = activities.find((a) => a.project === selectedBlocker.project || a.bureau === selectedBlocker.bureau);
              if (related) {
                setActivityToReschedule(related);
                setShowRescheduleSimulator(true);
              }
            }
          }}
          blocker={selectedBlocker}
        />
      )}

      {/* Escalade BMO */}
      {selectedBlocker && (
        <EscalateToBMOModal
          isOpen={showEscalateModal}
          onClose={() => setShowEscalateModal(false)}
          alert={{
            id: selectedBlocker.id,
            title: selectedBlocker.title,
            description: selectedBlocker.description,
            bureau: selectedBlocker.bureau,
            type: selectedBlocker.type,
          }}
          onEscalate={async (message: string) => {
            if (!selectedBlocker) return;
            await resolveBlocker(selectedBlocker.id, 'escalate', { message });
          }}
        />
      )}

      {/* Panel détails blocage (si tu as un composant dédié, branche-le ici) */}
      {showBlockerDetailsPanel && selectedBlocker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowBlockerDetailsPanel(false);
            }
          }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>📋 Détails blocage</span>
                <Badge variant={getSeverityBadge(selectedBlocker.severity)}>{selectedBlocker.severity}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={cn('p-3 rounded border', darkMode ? 'bg-slate-900/20 border-slate-700' : 'bg-gray-50 border-gray-200')}>
                <p className="font-semibold">{selectedBlocker.title}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedBlocker.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedBlocker.bureau && <BureauTag bureau={selectedBlocker.bureau} />}
                  {selectedBlocker.project && <Badge variant="info">{selectedBlocker.project}</Badge>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="warning" onClick={() => { setShowBlockerDetailsPanel(false); setShowEscalateModal(true); }}>
                  🔺 Escalader
                </Button>
                <Button className="flex-1" variant="success" onClick={() => { setShowBlockerDetailsPanel(false); setShowBMOResolveModal(true); }}>
                  ⚡ Résoudre
                </Button>
                <Button variant="secondary" onClick={() => setShowBlockerDetailsPanel(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
