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

import { WorkspaceShell, ShellAction, ShellBadge } from '@/components/features/workspace/WorkspaceShell';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

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
  ToggleLeft,
  ToggleRight,
  ListChecks,
  Star,
  StarOff,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================
// Types
// ================================
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

// ================================
// Helpers UI (anti-bugs affichage actions)
// ================================
const ActionLabel = ({
  icon,
  text,
  right,
}: {
  icon?: React.ReactNode;
  text: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
    {icon}
    <span className="leading-none">{text}</span>
    {right}
  </span>
);

const CountChip = ({ v }: { v: number }) => (
  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/10 dark:bg-black/20 border border-slate-200/20 dark:border-slate-700/40">
    {v}
  </span>
);

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
// Watchlist (pinned) : vues/queues
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
      .map((x: any) => ({
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

  // Stats
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<CalendarStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);

  // UX
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

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

  // ================================
  // Stats loader (robuste)
  // ================================
  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);
    setStatsError(null);

    try {
      // ✅ aujourd'hui tu calcules depuis data; demain tu peux décommenter l'API.
      // const res = await fetch('/api/calendar/stats', { cache: 'no-store', signal: ac.signal, headers: { 'x-bmo-reason': reason } });
      // if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // const data = (await res.json()) as CalendarStats;

      const { calculateStats, calendarEvents } = await import('@/lib/data/calendar');

      // petit délai optionnel pour lisser UX (évite flash)
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
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
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

  // Auto-refresh intelligent : seulement si utile (dashboard ou modales ouvertes)
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
  // Hotkeys (cohérence globale)
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

  // ✅ Ctrl+K doit réellement ouvrir la palette
  useHotkeys('ctrl+k', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    window.dispatchEvent(new CustomEvent('calendar:open-command-palette'));
  });

  // Centre de décision "Direction"
  useHotkeys('ctrl+d', (e?: KeyboardEvent) => {
    e?.preventDefault?.();
    setDecisionOpen(true);
  });

  // Vue calendrier mensuelle
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

  useHotkeys('escape', () => {
    setStatsOpen(false);
    setExportOpen(false);
    setHelpOpen(false);
    setDecisionOpen(false);
  });

  // ================================
  // Export (robuste, prêt pour API)
  // ================================
  const handleExport = useCallback(async () => {
    abortExportRef.current?.abort();
    const ac = new AbortController();
    abortExportRef.current = ac;

    setExporting(true);
    setExportError(null);

    try {
      const q = `queue=${encodeURIComponent(exportQueue)}`;

      // PDF: ouvrir une vue imprimable (HTML) si tu veux; sinon endpoint pdf direct
      if (exportFormat === 'pdf') {
        const url = `/api/calendar/export?format=html&${q}&print=true`;
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        w?.focus();
        setExportOpen(false);
        toast.success('Export PDF', 'Ouverture de la vue imprimable');
        return;
      }

      // Pour ical/csv/json → fetch blob + download
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
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      const errorMsg = "Erreur lors de l'export (réseau ou API).";
      setExportError(errorMsg);
      toast.error('Export échoué', errorMsg);
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportQueue, toast]);

  // ================================
  // Badges & Risk (préventif)
  // ================================
  const riskBadge = useMemo(() => {
    if (!statsData) return null;
    const riskScore = (statsData.overdueSLA || 0) * 3 + (statsData.conflicts || 0) * 2;

    if (riskScore >= 10) return { label: 'Risque élevé', color: 'rose' as const };
    if (riskScore >= 4) return { label: 'Risque modéré', color: 'amber' as const };
    return { label: 'Risque maîtrisé', color: 'emerald' as const };
  }, [statsData]);

  const badges = useMemo<ShellBadge[]>(() => {
    const b: ShellBadge[] = [];

    if (!statsData) {
      b.push({
        label: statsLoading ? 'Chargement…' : statsError ?? 'Stats indisponibles',
        color: statsError ? 'rose' : 'slate',
      });
      b.push({ label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF', color: autoRefresh ? 'emerald' : 'slate' });
      return b;
    }

    b.push({ label: `${statsData.today} aujourd'hui`, color: 'blue' });
    b.push({ label: `${statsData.thisWeek} semaine`, color: 'emerald' });

    if (statsData.overdueSLA > 0) b.push({ label: `${statsData.overdueSLA} retard SLA`, color: 'amber' });
    if (statsData.conflicts > 0) b.push({ label: `${statsData.conflicts} conflit${statsData.conflicts > 1 ? 's' : ''}`, color: 'rose' });

    if (riskBadge) b.push(riskBadge);

    b.push({ label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF', color: autoRefresh ? 'emerald' : 'slate' });
    if (lastUpdatedISO) b.push({ label: `MAJ ${safeFRTime(lastUpdatedISO)}`, color: 'slate' });

    return b;
  }, [statsData, statsLoading, statsError, autoRefresh, lastUpdatedISO, riskBadge]);

  // ================================
  // Actions (anti-bugs affichage + métier)
  // ================================
  const actions = useMemo<ShellAction[]>(() => {
    const n = statsData ?? { today: 0, thisWeek: 0, overdueSLA: 0, conflicts: 0, completed: 0 };

    return [
      {
        id: 'new',
        label: <ActionLabel icon={<Plus className="w-4 h-4" />} text="Nouveau" />,
        variant: 'primary',
        title: 'Créer un nouvel événement (Ctrl+N)',
        onClick: openCreateWizard,
      },

      {
        id: 'today',
        label: <ActionLabel icon={<CalendarIcon className="w-4 h-4 text-blue-500" />} text="Aujourd'hui" right={<CountChip v={n.today} />} />,
        title: "Événements d'aujourd'hui (Ctrl+1)",
        onClick: () => openInbox('today', "Aujourd'hui", '📅'),
        variant: 'secondary',
      },
      {
        id: 'week',
        label: <ActionLabel icon={<CalendarIcon className="w-4 h-4 text-emerald-500" />} text="Semaine" right={<CountChip v={n.thisWeek} />} />,
        title: 'Événements de la semaine (Ctrl+2)',
        onClick: () => openInbox('week', 'Cette semaine', '📆'),
        variant: 'secondary',
      },
      {
        id: 'overdue',
        label: <ActionLabel icon={<Clock className="w-4 h-4 text-amber-500" />} text="Retard SLA" right={<CountChip v={n.overdueSLA} />} />,
        title: 'Événements en retard SLA (Ctrl+3)',
        onClick: () => openInbox('overdue', 'En retard SLA', '⏰'),
        variant: n.overdueSLA > 0 ? 'warning' : 'secondary',
      },
      {
        id: 'conflicts',
        label: <ActionLabel icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} text="Conflits" right={<CountChip v={n.conflicts} />} />,
        title: 'Conflits de planification (Ctrl+4)',
        onClick: () => openInbox('conflicts', 'Conflits', '⚠️'),
        variant: n.conflicts > 0 ? 'destructive' : 'secondary',
      },
      {
        id: 'completed',
        label: <ActionLabel icon={<CheckCircle2 className="w-4 h-4 text-slate-500" />} text="Terminés" right={<CountChip v={n.completed} />} />,
        title: 'Événements terminés',
        onClick: () => openInbox('completed', 'Terminés', '✅'),
        variant: 'secondary',
      },

      // 📅 Vue calendrier mensuelle
      {
        id: 'month-view',
        label: <ActionLabel icon={<LayoutGrid className="w-4 h-4 text-indigo-500" />} text="Mensuel" />,
        title: 'Vue calendrier mensuelle (Ctrl+M)',
        onClick: () => openTab({
          id: 'calendar:month',
          type: 'calendar',
          title: 'Vue Mensuelle',
          icon: '📅',
          data: { view: 'month' },
        }),
        variant: 'secondary',
      },

      // 🔥 Centre de décision : direction (préventif)
      {
        id: 'decision',
        label: <ActionLabel icon={<ListChecks className="w-4 h-4" />} text="Décider" />,
        title: 'Centre de décision (Ctrl+D)',
        onClick: () => setDecisionOpen(true),
        variant: (n.overdueSLA + n.conflicts) > 0 ? 'warning' : 'secondary',
      },

      {
        id: 'stats',
        label: <ActionLabel icon={<BarChart2 className="w-4 h-4" />} text="Stats" />,
        title: 'Voir les statistiques (Ctrl+S)',
        onClick: () => setStatsOpen(true),
        variant: 'secondary',
      },
      {
        id: 'export',
        label: <ActionLabel icon={<Download className="w-4 h-4" />} text="Exporter" />,
        title: 'Exporter le calendrier (Ctrl+E)',
        onClick: () => setExportOpen(true),
        variant: 'secondary',
      },
      {
        id: 'auto',
        label: (
          <ActionLabel
            icon={autoRefresh ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            text="Auto"
          />
        ),
        title: 'Auto-refresh (60s)',
        onClick: () => setAutoRefresh((v) => !v),
        variant: autoRefresh ? 'success' : 'secondary',
      },
      {
        id: 'refresh',
        label: <ActionLabel icon={<RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} />} text="Rafraîchir" />,
        title: 'Rafraîchir les données',
        onClick: () => loadStats('manual'),
        disabled: statsLoading,
        variant: 'secondary',
      },
      {
        id: 'help',
        label: <ActionLabel icon={<HelpCircle className="w-4 h-4" />} text="Aide" />,
        title: 'Aide et raccourcis clavier (Shift+?)',
        onClick: () => setHelpOpen(true),
        variant: 'secondary',
      },
    ];
  }, [statsData, statsLoading, autoRefresh, openInbox, openCreateWizard, loadStats]);

  // ================================
  // Banner (alertes temps réel)
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
  // Dashboard (6 blocs lisibles)
  // ================================
  const dashboard = useMemo(() => {
    const overdue = statsData?.overdueSLA ?? 0;
    const conflicts = statsData?.conflicts ?? 0;
    const today = statsData?.today ?? 0;
    const week = statsData?.thisWeek ?? 0;

    return (
      <div className="space-y-4">
        {/* Bloc 1 — Alertes direction */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold">Poste de contrôle</h3>
            </div>
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => window.dispatchEvent(new CustomEvent('calendar:open-command-palette'))}
              title="Ctrl+K"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </FluentButton>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <div className="text-xs text-slate-500">Aujourd&apos;hui</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{today}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <div className="text-xs text-slate-500">Semaine</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{week}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <div className="text-xs text-slate-500">Retard SLA</div>
              <div className="text-2xl font-bold text-amber-800">{overdue}</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10">
              <div className="text-xs text-slate-500">Conflits</div>
              <div className="text-2xl font-bold text-rose-700">{conflicts}</div>
            </div>
          </div>

          {(overdue + conflicts) > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              <FluentButton size="sm" variant="ghost" onClick={() => openInbox('overdue', 'En retard SLA', '⏰')}>
                <Clock className="w-4 h-4 mr-2" />
                Traiter SLA
              </FluentButton>
              <FluentButton size="sm" variant="ghost" onClick={() => openInbox('conflicts', 'Conflits', '⚠️')}>
                Résoudre conflits
              </FluentButton>
              <FluentButton size="sm" variant="ghost" onClick={() => setDecisionOpen(true)} title="Ctrl+D">
                <ListChecks className="w-4 h-4 mr-2" />
                Centre de décision
              </FluentButton>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-500">
              Aucun point bloquant détecté. Tu peux rester en mode &quot;pilotage&quot;.
            </div>
          )}
        </div>

        {/* Bloc 2 — Watchlist (vues épinglées) */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold">Watchlist (vues épinglées)</h3>
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-[#141414]/50 hover:bg-white dark:hover:bg-[#141414]/80 transition-colors"
                  onClick={() => openInbox(v.queue, v.title, v.icon)}
                  title="Ouvrir"
                >
                  <span className="text-sm">{v.icon}</span>
                  <span className="text-sm">{v.title}</span>
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-amber-500/10"
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

        {/* Bloc 3 — Direction Panel (ton composant existant) */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <CalendarDirectionPanel onOpenStats={() => setStatsOpen(true)} onOpenExport={() => setExportOpen(true)} />
        </div>

        {/* Bloc 4 — Prévention (message gouvernance) */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
          <div className="font-semibold text-purple-700 dark:text-purple-300">Prévention — discipline de planification</div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Chaque conflit ou retard SLA doit déboucher sur une action : replanifier, escalader, ou documenter une dérogation.
            Objectif : zéro surprise, zéro &quot;agenda fantôme&quot;.
          </div>
        </div>

        {/* Bloc 5 — Erreur stats (si calcul/API down) */}
        {!statsData && statsError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center justify-between gap-3">
            <div className="text-sm text-rose-800 dark:text-rose-300">{statsError}</div>
            <FluentButton size="sm" variant="secondary" onClick={() => loadStats('manual')}>
              Réessayer
            </FluentButton>
          </div>
        )}

        {/* Bloc 6 — Bandeau technique (MAJ / auto) */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-[#141414]/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-500">
            Dernière MAJ : <span className="font-mono">{lastUpdatedISO ? safeFRTime(lastUpdatedISO) : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setAutoRefresh((v) => !v)}>
              {autoRefresh ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
              Auto-refresh
            </FluentButton>
            <FluentButton size="sm" variant="secondary" onClick={() => loadStats('manual')} disabled={statsLoading}>
              <RefreshCw className={cn('w-4 h-4 mr-2', statsLoading && 'animate-spin')} />
              Rafraîchir
            </FluentButton>
          </div>
        </div>
      </div>
    );
  }, [statsData, statsError, lastUpdatedISO, autoRefresh, statsLoading, pinnedViews, openInbox, loadStats, pinView, unpinView]);

  // ================================
  // Render
  // ================================
  return (
    <>
      <WorkspaceShell
        icon={<CalendarIcon className="w-6 h-6 text-blue-500" />}
        title="Console métier — Calendrier"
        subtitle="Planification, conflits, SLA : une vue direction pour organiser sans surprises."
        badges={badges}
        actions={actions}
        actionSeparators={[0, 5, 8]} // après Nouveau, après Terminés, après Export
        Banner={banner}
        Tabs={<CalendarWorkspaceTabs />}
        showDashboard={showDashboard}
        Dashboard={dashboard}
        Content={<CalendarWorkspaceContent />}
        FooterOverlays={<CalendarCommandPalette />}
      />

      {/* ============================= */}
      {/* MODALES */}
      {/* ============================= */}

      {/* Centre de décision */}
      <FluentModal open={decisionOpen} title="Centre de décision — Arbitrages" onClose={() => setDecisionOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <div className="font-semibold text-amber-900 dark:text-amber-200">
              Objectif : trancher vite (SLA / Conflits) et garder une traçabilité propre.
            </div>
            <div className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
              Raccourci : Ctrl+3 (SLA) • Ctrl+4 (Conflits)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              className="p-4 rounded-2xl border border-amber-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left"
              onClick={() => {
                openInbox('overdue', 'En retard SLA', '⏰');
                setDecisionOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <div className="font-semibold">Retards SLA</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">Priorité : replanifier / escalader / documenter.</div>
            </button>

            <button
              type="button"
              className="p-4 rounded-2xl border border-rose-500/20 bg-white/70 dark:bg-[#141414]/40 hover:bg-white dark:hover:bg-[#141414]/70 transition-colors text-left"
              onClick={() => {
                openInbox('conflicts', 'Conflits', '⚠️');
                setDecisionOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div className="font-semibold">Conflits</div>
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

      {/* Stats Modal - Composant professionnel complet */}
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
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm mb-4">
            {exportError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 font-medium">Période</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
            <label className="text-sm text-slate-500 font-medium">Format</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

      {/* Aide */}
      <FluentModal open={helpOpen} title="Raccourcis clavier" onClose={() => setHelpOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Palette de commandes</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Centre de décision</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Nouvel événement</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Aujourd&apos;hui</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+1</kbd>
            </div>
            <div className="flex justify-between">
              <span>Cette semaine</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+2</kbd>
            </div>
            <div className="flex justify-between">
              <span>Retard SLA</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+3</kbd>
            </div>
            <div className="flex justify-between">
              <span>Conflits</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+4</kbd>
            </div>
            <div className="flex justify-between">
              <span>Statistiques</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Exporter</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+E</kbd>
            </div>
            <div className="flex justify-between">
              <span>Vue mensuelle</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Ctrl+M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Fermer modales</span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Esc</kbd>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <FluentButton size="sm" variant="primary" onClick={() => setHelpOpen(false)}>
            Fermer
          </FluentButton>
        </div>
      </FluentModal>
    </>
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
