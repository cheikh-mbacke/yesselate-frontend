'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';

import { CalendarWorkspaceTabs } from '@/components/features/calendar/workspace/CalendarWorkspaceTabs';
import { CalendarWorkspaceContent } from '@/components/features/calendar/workspace/CalendarWorkspaceContent';
import { CalendarCommandPalette } from '@/components/features/calendar/workspace/CalendarCommandPalette';
import { CalendarDirectionPanel } from '@/components/features/calendar/workspace/CalendarDirectionPanel';
import { CalendarAlertsBanner } from '@/components/features/calendar/workspace/CalendarAlertsBanner';
import { CalendarToastProvider, useCalendarToast } from '@/components/features/calendar/workspace/CalendarToast';
import { CalendarStatsModal } from '@/components/features/calendar/workspace/CalendarStatsModal';
import { CalendarHelpModal } from '@/components/features/calendar/modals/CalendarHelpModal';
import {
  CalendarEventsTrendChart,
  CalendarEventTypesChart,
  CalendarPriorityChart,
  CalendarTimeDistributionChart,
  CalendarCompletionRateChart,
  CalendarConflictsChart,
  CalendarProjectsChart,
} from '@/components/features/calendar/analytics/CalendarAnalyticsCharts';

import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Button } from '@/components/ui/button';

import { useHotkeys } from '@/hooks/useHotkeys';
import {
  CalendarIcon,
  Activity,
  HelpCircle,
  RefreshCw,
  Download,
  Plus,
  BarChart2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Star,
  StarOff,
  Search,
  LayoutGrid,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  PanelRight,
  PanelRightClose,
  Maximize,
  Minimize,
  MoreHorizontal,
  Keyboard,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarGrid } from '@/components/features/calendar/CalendarGrid';
import { calendarAPI } from '@/lib/api/pilotage/calendarClient';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';

// ================================
// Types
// ================================
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  project?: string;
  participants?: string[];
  location?: string;
  hasConflict?: boolean;
  conflictWith?: string[];
}

type CalendarStats = {
  total: number;
  today: number;
  thisWeek: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  ts: string;
};

type ExportFormat = 'ical' | 'csv' | 'json' | 'pdf';
type ExportQueue = 'today' | 'week' | 'month' | 'all';
type LoadReason = 'init' | 'manual' | 'auto';
type DashboardTab = 'overview' | 'calendar' | 'metrics' | 'history' | 'favorites';

// ================================
// Helpers
// ================================
function safeFRTime(isoOrDate?: string): string {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR');
}

function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Watchlist (pinned views)
// ================================
const LS_PINNED_VIEWS = 'bmo.calendar.pinnedViews.v1';
type PinnedView = { key: string; title: string; icon: string; queue: string };

const readPinnedViews = (): PinnedView[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_PINNED_VIEWS);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x: Record<string, unknown>) => ({
        key: String(x.key ?? ''),
        title: String(x.title ?? ''),
        icon: String(x.icon ?? ''),
        queue: String(x.queue ?? ''),
      }))
      .filter((x) => x.key && x.queue)
      .slice(0, 20);
  } catch {
    return [];
  }
};

const writePinnedViews = (views: PinnedView[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PINNED_VIEWS, JSON.stringify(views.slice(0, 20)));
  } catch {
    // no-op
  }
};

// ================================
// Component Content
// ================================
function CalendrierPageContent() {
  const { tabs, openTab } = useCalendarWorkspaceStore();
  const toast = useCalendarToast();

  const showDashboard = tabs.length === 0;

  // Calendar (API-backed) for dashboard view
  const now = new Date();
  const monthStartISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEndISO = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useApiQuery(async (_signal: AbortSignal) => calendarAPI.listEvents({ startDate: monthStartISO, endDate: monthEndISO }), [
    monthStartISO,
    monthEndISO,
  ]);

  const {
    data: conflictsData,
    isLoading: conflictsLoading,
    error: conflictsError,
    refetch: refetchConflicts,
  } = useApiQuery(async (_signal: AbortSignal) => calendarAPI.detectConflicts({ startDate: monthStartISO, endDate: monthEndISO }), [
    monthStartISO,
    monthEndISO,
  ]);

  const gridEvents = useMemo((): CalendarEvent[] => {
    const list = eventsData?.events ?? [];
    return list.map((e): CalendarEvent => ({
      id: e.id,
      title: e.title,
      date: new Date(e.date),
      startTime: e.startTime,
      endTime: e.endTime,
      type: (e.type as CalendarEvent['type']) || 'meeting',
      priority: (e.priority as CalendarEvent['priority']) || 'medium',
      project: e.project,
      participants: e.participants,
      location: e.location,
      hasConflict: conflictsData?.conflicts?.some((c: any) => c.eventIds?.includes(e.id)),
      conflictWith: conflictsData?.conflicts
        ?.filter((c: any) => c.eventIds?.includes(e.id))
        ?.flatMap((c: any) => c.eventIds?.filter((id: string) => id !== e.id) ?? []),
    }));
  }, [eventsData, conflictsData]);

  // UI State
  const [fullscreen, setFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');

  // Stats
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<CalendarStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);

  // UX
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Export
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('ical');
  const [exportQueue, setExportQueue] = useState<ExportQueue>('week');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Centre de décision
  const [decisionOpen, setDecisionOpen] = useState(false);

  // Watchlist
  const [pinnedViews, setPinnedViews] = useState<PinnedView[]>([]);

  // Abort controllers
  const abortStatsRef = useRef<AbortController | null>(null);
  const abortExportRef = useRef<AbortController | null>(null);

  // init pinnedViews
  useEffect(() => {
    setPinnedViews(readPinnedViews());
  }, []);
  
  useEffect(() => {
    writePinnedViews(pinnedViews);
  }, [pinnedViews]);

  // Fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const pinView = useCallback((view: PinnedView) => {
    setPinnedViews((prev) => {
      const exists = prev.some((x) => x.key === view.key);
      const next = exists ? prev : [view, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  const unpinView = useCallback((key: string) => {
    setPinnedViews((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const openInbox = useCallback(
    (queue: string, title: string, icon: string) => {
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title,
        icon,
        data: { queue },
      });
    },
    [openTab]
  );

  const openCreateWizard = useCallback(() => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard',
      title: 'Nouvel événement',
      icon: '➕',
      data: { action: 'create' },
    });
  }, [openTab]);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent('calendar:open-command-palette'));
  }, []);

  // ================================
  // Stats loader
  // ================================
  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const { calculateStats, calendarEvents } = await import('@/lib/data/calendar');
      await new Promise((r) => setTimeout(r, reason === 'init' ? 250 : 150));

      if (ac.signal.aborted) return;

      const stats = calculateStats(calendarEvents);
      const data: CalendarStats = {
        total: Number(stats.total ?? 0),
        today: Number(stats.today ?? 0),
        thisWeek: Number(stats.thisWeek ?? 0),
        overdueSLA: Number(stats.overdueSLA ?? 0),
        conflicts: Number(stats.conflicts ?? 0),
        completed: Number(stats.completed ?? 0),
        ts: String(stats.ts ?? new Date().toISOString()),
      };

      setStatsData(data);
      setLastUpdatedISO(new Date().toISOString());
      
      if (reason === 'manual') {
        toast.success('Statistiques actualisées', `${data.total} événements au total`);
      }
    } catch (e: unknown) {
      const error = e as { name?: string };
      if (error?.name === 'AbortError') return;
      setStatsData(null);
      const errorMsg = 'Impossible de charger les statistiques (réseau ou calcul).';
      setStatsError(errorMsg);
      if (reason === 'manual') {
        toast.error('Erreur de chargement', errorMsg);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  // initial load
  useEffect(() => {
    loadStats('init');
    return () => {
      abortStatsRef.current?.abort();
      abortExportRef.current?.abort();
    };
  }, [loadStats]);

  // Auto-refresh
  useInterval(
    () => {
      if (!autoRefresh) return;
      if (!showDashboard && !statsOpen && !decisionOpen) return;
      loadStats('auto');
    },
    autoRefresh ? 60_000 : null
  );

  // Events from command palette
  useEffect(() => {
    const handleOpenStats = () => {
      setStatsOpen(true);
      loadStats('manual');
    };
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenHelp = () => setHelpOpen(true);
    const handleOpenDecision = () => setDecisionOpen(true);

    window.addEventListener('calendar:open-stats', handleOpenStats);
    window.addEventListener('calendar:open-export', handleOpenExport);
    window.addEventListener('calendar:open-help', handleOpenHelp);
    window.addEventListener('calendar:open-decision-center', handleOpenDecision);

    return () => {
      window.removeEventListener('calendar:open-stats', handleOpenStats);
      window.removeEventListener('calendar:open-export', handleOpenExport);
      window.removeEventListener('calendar:open-help', handleOpenHelp);
      window.removeEventListener('calendar:open-decision-center', handleOpenDecision);
    };
  }, [loadStats]);

  // ================================
  // Hotkeys
  // ================================
  useHotkeys('ctrl+1', () => openInbox('today', "Aujourd'hui", '📅'));
  useHotkeys('ctrl+2', () => openInbox('week', 'Cette semaine', '📆'));
  useHotkeys('ctrl+3', () => openInbox('overdue', 'En retard SLA', '⏰'));
  useHotkeys('ctrl+4', () => openInbox('conflicts', 'Conflits', '⚠️'));

  useHotkeys('ctrl+n', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    openCreateWizard();
  });

  useHotkeys('ctrl+s', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    setStatsOpen(true);
  });

  useHotkeys('ctrl+e', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    setExportOpen(true);
  });

  useHotkeys('ctrl+k', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    openCommandPalette();
  });

  useHotkeys('ctrl+d', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    setDecisionOpen(true);
  });

  useHotkeys('ctrl+m', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    openTab({
      id: 'calendar:month',
      type: 'calendar',
      title: 'Vue Mensuelle',
      icon: '📅',
      data: { view: 'month' },
    });
  });

  useHotkeys('shift+?', () => setHelpOpen(true));
  useHotkeys('f1', () => setHelpOpen(true));

  useHotkeys('escape', () => {
    setStatsOpen(false);
    setExportOpen(false);
    setHelpOpen(false);
    setDecisionOpen(false);
  });

  // ================================
  // Export
  // ================================
  const handleExport = useCallback(async () => {
    abortExportRef.current?.abort();
    const ac = new AbortController();
    abortExportRef.current = ac;

    setExporting(true);
    setExportError(null);

    try {
      const q = `queue=${encodeURIComponent(exportQueue)}`;

      if (exportFormat === 'pdf') {
        const url = `/api/calendar/export?format=html&${q}&print=true`;
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        w?.focus();
        setExportOpen(false);
        toast.success('Export PDF', 'Ouverture de la vue imprimable');
        return;
      }

      const url = `/api/calendar/export?format=${encodeURIComponent(exportFormat)}&${q}`;
      const res = await fetch(url, { cache: 'no-store', signal: ac.signal });

      if (!res.ok) {
        setExportError(`Export impossible (HTTP ${res.status}).`);
        return;
      }

      const blob = await res.blob();
      const date = new Date().toISOString().slice(0, 10);
      const ext =
        exportFormat === 'ical' ? 'ics' : exportFormat === 'csv' ? 'csv' : exportFormat === 'json' ? 'json' : 'dat';

      const filename = `calendrier_${exportQueue}_${date}.${ext}`;
      downloadBlob(blob, filename);
      setExportOpen(false);
      toast.success('Export réussi', `Fichier ${filename} téléchargé`);
    } catch (e: unknown) {
      const error = e as { name?: string };
      if (error?.name === 'AbortError') return;
      const errorMsg = "Erreur lors de l'export (réseau ou API).";
      setExportError(errorMsg);
      toast.error('Export échoué', errorMsg);
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportQueue, toast]);

  // ================================
  // Refresh label
  // ================================
  const refreshLabel = useMemo(() => {
    if (!lastUpdatedISO) return 'Jamais';
    const s = Math.floor((Date.now() - new Date(lastUpdatedISO).getTime()) / 1000);
    if (s < 60) return `il y a ${s}s`;
    const m = Math.floor(s / 60);
    return `il y a ${m} min`;
  }, [lastUpdatedISO]);

  // ================================
  // Banner
  // ================================
  const banner = useMemo(() => {
    if (!statsData) return null;

    const alerts: { id: string; type: 'overdue' | 'conflict'; title: string; count: number; queue: string }[] = [];
    if (statsData.overdueSLA > 0) {
      alerts.push({ id: 'overdue', type: 'overdue', title: 'En retard SLA', count: statsData.overdueSLA, queue: 'overdue' });
    }
    if (statsData.conflicts > 0) {
      alerts.push({ id: 'conflicts', type: 'conflict', title: 'Conflits', count: statsData.conflicts, queue: 'conflicts' });
    }

    if (alerts.length === 0) return null;
    return <CalendarAlertsBanner alerts={alerts} />;
  }, [statsData]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
          showSidebar ? 'w-64' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          {showSidebar && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-slate-200 text-sm">Calendrier</span>
            </div>
          )}
          {!showSidebar && (
            <CalendarIcon className="h-5 w-5 text-blue-400 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        {showSidebar && (
          <div className="p-3">
            <button
              onClick={openCommandPalette}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Rechercher...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-400">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-2">
            {[
              { id: 'today', icon: CalendarIcon, label: "Aujourd'hui", color: 'text-blue-400', count: statsData?.today },
              { id: 'week', icon: CalendarIcon, label: 'Semaine', color: 'text-emerald-400', count: statsData?.thisWeek },
              { id: 'overdue', icon: Clock, label: 'Retard SLA', color: 'text-amber-400', count: statsData?.overdueSLA },
              { id: 'conflicts', icon: AlertTriangle, label: 'Conflits', color: 'text-rose-400', count: statsData?.conflicts },
              { id: 'completed', icon: CheckCircle2, label: 'Terminés', color: 'text-slate-400', count: statsData?.completed },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => openInbox(item.id, item.label, '📅')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {showSidebar && (
                  <>
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 px-2 pt-4 border-t border-slate-800/50">
            <button
              onClick={openCreateWizard}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-200 hover:bg-slate-800/70 border border-slate-700/50 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-400" />
              {showSidebar && <span className="text-sm">Nouvel événement</span>}
            </button>
            <button
              onClick={() => openTab({
                id: 'calendar:month',
                type: 'calendar',
                title: 'Vue Mensuelle',
                icon: '📅',
                data: { view: 'month' },
              })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors mt-1"
            >
              <LayoutGrid className="h-5 w-5 text-indigo-400" />
              {showSidebar && <span className="text-sm">Vue mensuelle</span>}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3">
          {showSidebar && (
            <div className="text-xs text-slate-500 text-center">
              Calendrier v2.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-200">Calendrier & Planification</h1>
            <span className="px-2 py-0.5 text-xs rounded bg-slate-800/50 text-slate-300 border border-slate-700/50">
              v2.0
            </span>
            <span className="text-xs text-slate-500">{refreshLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFullscreen((p) => !p)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              title="Plein écran"
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setActionsOpen((p) => !p)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                title="Actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
                    <button
                      onClick={() => {
                        openCommandPalette();
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Search className="w-4 h-4" />
                      Rechercher
                      <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">⌘K</kbd>
                    </button>

                    <div className="border-t border-slate-700/50 my-1" />

                    <button
                      onClick={() => {
                        loadStats('manual');
                        refetchEvents();
                        refetchConflicts();
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} />
                      Rafraîchir
                    </button>

                    <button
                      onClick={() => {
                        setExportOpen(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>

                    <button
                      onClick={() => {
                        setStatsOpen(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <BarChart2 className="w-4 h-4" />
                      Statistiques
                    </button>

                    <button
                      onClick={() => {
                        setDecisionOpen(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Activity className="w-4 h-4" />
                      Centre de décision
                    </button>

                    <div className="border-t border-slate-700/50 my-1" />

                    <button
                      onClick={() => {
                        setHelpOpen(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Keyboard className="w-4 h-4" />
                      Aide & Raccourcis
                      <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">F1</kbd>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* KPI Bar */}
        <div className="bg-slate-900/40 border-b border-slate-700/40">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Indicateurs temps réel
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn('h-6 px-2 text-xs', autoRefresh ? 'text-emerald-400' : 'text-slate-500')}
              >
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKpiCollapsed(!kpiCollapsed)}
                className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
              >
                {kpiCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {!kpiCollapsed && statsData && (
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-px bg-slate-800/30 p-px">
              <button onClick={() => openInbox('today', "Aujourd'hui", '📅')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Aujourd&apos;hui</p>
                <span className="text-lg font-bold text-blue-400">{statsData.today}</span>
              </button>
              <button onClick={() => openInbox('week', 'Semaine', '📆')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Semaine</p>
                <span className="text-lg font-bold text-emerald-400">{statsData.thisWeek}</span>
              </button>
              <button onClick={() => openInbox('overdue', 'Retard SLA', '⏰')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Retard SLA</p>
                <span className="text-lg font-bold text-amber-400">{statsData.overdueSLA}</span>
              </button>
              <button onClick={() => openInbox('conflicts', 'Conflits', '⚠️')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Conflits</p>
                <span className="text-lg font-bold text-rose-400">{statsData.conflicts}</span>
              </button>
              <button onClick={() => openInbox('completed', 'Terminés', '✅')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Terminés</p>
                <span className="text-lg font-bold text-slate-300">{statsData.completed}</span>
              </button>
              <div className="bg-slate-900/60 px-3 py-2 text-left">
                <p className="text-xs text-slate-500 mb-0.5">Total</p>
                <span className="text-lg font-bold text-slate-300">{statsData.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Banner */}
        {banner && <div className="px-4 py-2">{banner}</div>}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1920px] p-4 sm:p-6 lg:p-8">
            {showDashboard ? (
              <div className="space-y-6">
                {/* Navigation dashboard tabs */}
                <nav className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {[
                    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutGrid },
                    { id: 'calendar' as DashboardTab, label: 'Grille mensuelle', icon: CalendarIcon },
                    { id: 'metrics' as DashboardTab, label: 'Indicateurs', icon: BarChart2 },
                    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
                    { id: 'favorites' as DashboardTab, label: 'Épinglés', icon: Star },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = dashboardTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setDashboardTab(t.id)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                          isActive
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        )}
                        type="button"
                      >
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </nav>

                {dashboardTab === 'overview' && (
                  <>
                {/* Poste de contrôle */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">
                        Poste de contrôle Calendrier
                      </h2>
                      <p className="text-slate-400 max-w-2xl">
                        Planification, conflits, SLA : une vue direction pour organiser sans surprises.
                        Chaque conflit ou retard doit déboucher sur une action.
                      </p>
                    </div>
                    <FluentButton variant="primary" onClick={openCreateWizard}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvel événement
                    </FluentButton>
                  </div>

                  {/* Stats cards */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">Aujourd&apos;hui</div>
                        <CalendarIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-200">{statsData?.today ?? 0}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">Semaine</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-200">{statsData?.thisWeek ?? 0}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">Retard SLA</div>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-200">{statsData?.overdueSLA ?? 0}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">Conflits</div>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-200">{statsData?.conflicts ?? 0}</div>
                    </div>
                  </div>

                  {((statsData?.overdueSLA ?? 0) + (statsData?.conflicts ?? 0)) > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <FluentButton size="sm" variant="ghost" onClick={() => openInbox('overdue', 'En retard SLA', '⏰')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Traiter SLA
                      </FluentButton>
                      <FluentButton size="sm" variant="ghost" onClick={() => openInbox('conflicts', 'Conflits', '⚠️')}>
                        Résoudre conflits
                      </FluentButton>
                      <FluentButton size="sm" variant="ghost" onClick={() => setDecisionOpen(true)}>
                        Centre de décision
                      </FluentButton>
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-slate-500">
                      Aucun point bloquant détecté. Tu peux rester en mode &quot;pilotage&quot;.
                    </div>
                  )}
                </div>

                {/* Vue calendrier (API) */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-semibold text-slate-200">Vue mensuelle (pilotage)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          refetchEvents();
                          refetchConflicts();
                        }}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                      </Button>
                    </div>
                  </div>

                  {(eventsLoading || conflictsLoading) && (
                    <div className="text-sm text-slate-500">Chargement…</div>
                  )}
                  {(eventsError || conflictsError) && (
                    <div className="text-sm text-slate-400">
                      {eventsError ? `Événements: ${eventsError.message}` : null}
                      {eventsError && conflictsError ? ' • ' : null}
                      {conflictsError ? `Conflits: ${conflictsError.message}` : null}
                    </div>
                  )}

                  {!eventsLoading && !eventsError && (
                    <div className="mt-4">
                      <CalendarGrid
                        events={gridEvents}
                        onEventClick={(ev) => {
                          // ouvrir détail via workspace (si besoin) ou toast
                          toast.info('Événement', String(ev.title ?? ''));
                        }}
                        onCreateEvent={() => openCreateWizard()}
                      />
                    </div>
                  )}
                </div>

                {/* Watchlist */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-slate-200">Watchlist (vues épinglées)</h3>
                      <span className="text-xs text-slate-500">({pinnedViews.length})</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <FluentButton size="sm" variant="secondary" onClick={() => pinView({ key: 'pin:overdue', title: 'Retard SLA', icon: '⏰', queue: 'overdue' })}>
                        Épingler SLA
                      </FluentButton>
                      <FluentButton size="sm" variant="secondary" onClick={() => pinView({ key: 'pin:conflicts', title: 'Conflits', icon: '⚠️', queue: 'conflicts' })}>
                        Épingler Conflits
                      </FluentButton>
                    </div>
                  </div>

                  {pinnedViews.length === 0 ? (
                    <p className="text-sm text-slate-500 mt-2">Aucune vue épinglée. Épingle SLA / Conflits / Aujourd&apos;hui / Semaine.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pinnedViews.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                          onClick={() => openInbox(v.queue, v.title, v.icon)}
                          title="Ouvrir"
                        >
                          <span className="text-sm">{v.icon}</span>
                          <span className="text-sm text-slate-300">{v.title}</span>
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              unpinView(v.key);
                            }}
                            title="Retirer"
                          >
                            <StarOff className="w-4 h-4 text-slate-500" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direction Panel */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <CalendarDirectionPanel onOpenStats={() => setStatsOpen(true)} onOpenExport={() => setExportOpen(true)} />
                </div>

                {/* Prévention (discipline) */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-purple-400" />
                    Prévention — discipline de planification
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Chaque conflit ou retard SLA doit déboucher sur une action : replanifier, escalader, ou documenter une dérogation.
                    Objectif : zéro surprise, zéro &quot;agenda fantôme&quot;.
                  </div>
                </div>

                {/* Erreur stats */}
                {!statsData && statsError && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-300">{statsError}</div>
                    <FluentButton size="sm" variant="secondary" onClick={() => loadStats('manual')}>
                      Réessayer
                    </FluentButton>
                  </div>
                )}

                {/* Astuce raccourcis */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      <strong className="text-slate-300">Astuce :</strong> utilise{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘1-4</kbd>{' '}
                      pour les vues,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘N</kbd>{' '}
                      pour créer, et{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘K</kbd>{' '}
                      pour la palette.
                    </p>
                  </div>
                </div>
                  </>
                )}

                {dashboardTab === 'calendar' && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-blue-400" />
                        <h3 className="font-semibold text-slate-200">Vue mensuelle complète</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            refetchEvents();
                            refetchConflicts();
                          }}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Actualiser
                        </Button>
                      </div>
                    </div>

                    {(eventsLoading || conflictsLoading) && (
                      <div className="text-sm text-slate-500">Chargement…</div>
                    )}
                    {(eventsError || conflictsError) && (
                      <div className="text-sm text-slate-400">
                        {eventsError ? `Événements: ${eventsError.message}` : null}
                        {eventsError && conflictsError ? ' • ' : null}
                        {conflictsError ? `Conflits: ${conflictsError.message}` : null}
                      </div>
                    )}

                    {!eventsLoading && !eventsError && (
                      <div className="mt-4">
                        <CalendarGrid
                          events={gridEvents}
                          onEventClick={(ev) => {
                            toast.info('Événement', String(ev.title ?? ''));
                          }}
                          onCreateEvent={() => openCreateWizard()}
                        />
                      </div>
                    )}
                  </div>
                )}

                {dashboardTab === 'metrics' && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-slate-200">Indicateurs de performance</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">Taux de respect SLA</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            {statsData ? Math.round(((statsData.total - statsData.overdueSLA) / Math.max(statsData.total, 1)) * 100) : 0}%
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">Taux de conflits</div>
                          <div className="text-2xl font-bold text-rose-400">
                            {statsData ? Math.round((statsData.conflicts / Math.max(statsData.total, 1)) * 100) : 0}%
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">Taux de complétion</div>
                          <div className="text-2xl font-bold text-blue-400">
                            {statsData ? Math.round((statsData.completed / Math.max(statsData.total, 1)) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Charts */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-slate-200">Analytics & Tendances</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trend Chart */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Tendance des événements</h4>
                          <CalendarEventsTrendChart />
                        </div>

                        {/* Event Types */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Répartition par type</h4>
                          <CalendarEventTypesChart />
                        </div>

                        {/* Priority Distribution */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Distribution par priorité</h4>
                          <CalendarPriorityChart />
                        </div>

                        {/* Time Distribution */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Répartition horaire</h4>
                          <CalendarTimeDistributionChart />
                        </div>

                        {/* Completion Rate */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Taux de complétion</h4>
                          <CalendarCompletionRateChart />
                        </div>

                        {/* Conflicts */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Conflits détectés</h4>
                          <CalendarConflictsChart />
                        </div>

                        {/* Projects Distribution */}
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 lg:col-span-2">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Répartition par projet</h4>
                          <div className="max-w-2xl mx-auto">
                            <CalendarProjectsChart />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                      <CalendarDirectionPanel onOpenStats={() => setStatsOpen(true)} onOpenExport={() => setExportOpen(true)} />
                    </div>
                  </div>
                )}

                {dashboardTab === 'history' && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-slate-200">Historique des événements</h3>
                    </div>
                    <div className="text-sm text-slate-400">
                      L'historique complet des événements passés et des modifications est disponible dans la vue mensuelle.
                    </div>
                    <div className="mt-4">
                      <FluentButton 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => openInbox('completed', 'Terminés', '✅')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Voir les événements terminés
                      </FluentButton>
                    </div>
                  </div>
                )}

                {dashboardTab === 'favorites' && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <h3 className="font-semibold text-slate-200">Vues épinglées</h3>
                        <span className="text-xs text-slate-500">({pinnedViews.length})</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <FluentButton size="sm" variant="secondary" onClick={() => pinView({ key: 'pin:today', title: "Aujourd'hui", icon: '📅', queue: 'today' })}>
                          Épingler Aujourd'hui
                        </FluentButton>
                        <FluentButton size="sm" variant="secondary" onClick={() => pinView({ key: 'pin:overdue', title: 'Retard SLA', icon: '⏰', queue: 'overdue' })}>
                          Épingler SLA
                        </FluentButton>
                        <FluentButton size="sm" variant="secondary" onClick={() => pinView({ key: 'pin:conflicts', title: 'Conflits', icon: '⚠️', queue: 'conflicts' })}>
                          Épingler Conflits
                        </FluentButton>
                      </div>
                    </div>

                    {pinnedViews.length === 0 ? (
                      <p className="text-sm text-slate-500">Aucune vue épinglée. Épingle SLA / Conflits / Aujourd&apos;hui / Semaine.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {pinnedViews.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                            onClick={() => openInbox(v.queue, v.title, v.icon)}
                            title="Ouvrir"
                          >
                            <span className="text-sm">{v.icon}</span>
                            <span className="text-sm text-slate-300">{v.title}</span>
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-700/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                unpinView(v.key);
                              }}
                              title="Retirer"
                            >
                              <StarOff className="w-4 h-4 text-slate-500" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {tabs.length > 0 && <CalendarWorkspaceTabs />}
                <CalendarWorkspaceContent />
              </div>
            )}
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Màj: {refreshLabel}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">{statsData?.total ?? 0} événements • {statsData?.today ?? 0} aujourd&apos;hui</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', statsLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
              <span className="text-slate-500">{statsLoading ? 'Synchronisation...' : 'Connecté'}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <CalendarCommandPalette />

      {/* Modals */}
      
      {/* Centre de décision */}
      <FluentModal open={decisionOpen} title="Centre de décision — Arbitrages" onClose={() => setDecisionOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Objectif : trancher vite (SLA / Conflits) et garder une traçabilité propre.
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Raccourci : ⌘3 (SLA) • ⌘4 (Conflits)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className="p-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 transition-colors text-left"
              onClick={() => {
                openInbox('overdue', 'En retard SLA', '⏰');
                setDecisionOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="font-semibold text-slate-200">Retards SLA</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">Priorité : replanifier / escalader / documenter.</div>
            </button>

            <button
              type="button"
              className="p-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 transition-colors text-left"
              onClick={() => {
                openInbox('conflicts', 'Conflits', '⚠️');
                setDecisionOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <div className="font-semibold text-slate-200">Conflits</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">Priorité : arbitrer ressources, créneaux, salles, acteurs.</div>
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setDecisionOpen(false)}>
              Fermer
            </FluentButton>
            <FluentButton size="sm" variant="primary" onClick={() => { openCreateWizard(); setDecisionOpen(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </FluentButton>
          </div>
        </div>
      </FluentModal>

      {/* Stats Modal */}
      <CalendarStatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
      />

      {/* Export */}
      <FluentModal
        open={exportOpen}
        title="Exporter le calendrier"
        onClose={() => {
          setExportOpen(false);
          setExportError(null);
        }}
      >
        {exportError && (
          <div className="p-4 rounded-xl bg-slate-800/30 text-slate-300 text-sm mb-4 border border-slate-700/50">
            {exportError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 font-medium">Période</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 outline-none text-slate-200"
              value={exportQueue}
              onChange={(e) => setExportQueue(e.target.value as ExportQueue)}
            >
              <option value="today">Aujourd&apos;hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="all">Tous les événements</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 font-medium">Format</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 outline-none text-slate-200"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <option value="ical">iCal (Outlook, Google Calendar)</option>
              <option value="csv">CSV (Excel)</option>
              <option value="json">JSON (données structurées)</option>
              <option value="pdf">PDF (impression)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <FluentButton size="sm" variant="secondary" onClick={() => setExportOpen(false)}>
            Annuler
          </FluentButton>
          <FluentButton size="sm" variant="primary" onClick={handleExport} disabled={exporting}>
            <Download className="w-3.5 h-3.5 mr-1" />
            {exporting ? 'Export...' : 'Télécharger'}
          </FluentButton>
        </div>
      </FluentModal>

      {/* Aide - Help Modal */}
      <CalendarHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

// ================================
// Main Component with Provider
// ================================
export default function CalendrierPage() {
  return (
    <CalendarToastProvider>
      <CalendrierPageContent />
    </CalendarToastProvider>
  );
}
