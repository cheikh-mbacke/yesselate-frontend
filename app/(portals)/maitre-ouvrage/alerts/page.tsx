'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';

import { AlertWorkspaceTabs } from '@/components/features/alerts/workspace/AlertWorkspaceTabs';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';
import { AlertLiveCounters } from '@/components/features/alerts/workspace/AlertLiveCounters';
import { AlertCommandPalette } from '@/components/features/alerts/workspace/AlertCommandPalette';
import { AlertDirectionPanel } from '@/components/features/alerts/workspace/AlertDirectionPanel';
import { AlertAlertsBanner } from '@/components/features/alerts/workspace/AlertAlertsBanner';
import { AlertExportModal } from '@/components/features/alerts/workspace/AlertExportModal';
import { AlertStatsModal } from '@/components/features/alerts/workspace/AlertStatsModal';
import { ToastProvider, useAlertToast } from '@/components/ui/toast';
import {
  AlertDetailModal,
  AcknowledgeModal,
  ResolveModal,
  EscalateModal,
} from '@/components/features/alerts/workspace/AlertWorkflowModals';

import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Button } from '@/components/ui/button';

import {
  AlertTriangle,
  AlertCircle,
  Activity,
  RefreshCw,
  BarChart3,
  Download,
  Clock,
  Search,
  Keyboard,
  Shield,
  CheckCircle,
  LayoutDashboard,
  FolderOpen,
  Settings,
  History,
  Star,
  ChevronRight,
  Users,
  Calendar,
  Brain,
  Workflow,
  Plus,
  Target,
  XCircle,
  Bell,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { alertsAPI } from '@/lib/api/pilotage/alertsClient';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';

// ================================
// Types
// ================================
interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'categories' | 'rules' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
  refreshInterval: number;
}

const UI_PREF_KEY = 'bmo.alerts.ui.v2';
const DISMISSED_KEY = 'bmo.alerts.dismissed.v1';

// ================================
// Semantic colors
// ================================
const STATUS_ICON_COLORS = {
  critical: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-emerald-500',
  neutral: 'text-slate-400',
} as const;

const BG_STATUS = {
  critical: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30',
  neutral: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50',
} as const;

// ================================
// Helpers
// ================================
function readUIState(): UIState | null {
  try {
    const raw = localStorage.getItem(UI_PREF_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<UIState>;
    return {
      viewMode: p.viewMode === 'workspace' ? 'workspace' : 'dashboard',
      dashboardTab: ['categories', 'rules', 'history', 'favorites'].includes(p.dashboardTab as string)
        ? p.dashboardTab as DashboardTab
        : 'overview',
      autoRefresh: typeof p.autoRefresh === 'boolean' ? p.autoRefresh : true,
      refreshInterval: typeof p.refreshInterval === 'number' && p.refreshInterval >= 5000 ? p.refreshInterval : 30000,
    };
  } catch {
    return null;
  }
}

function writeUIState(s: UIState) {
  try {
    localStorage.setItem(UI_PREF_KEY, JSON.stringify(s));
  } catch {
    // no-op
  }
}

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}

function writeDismissed(set: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // no-op
  }
}

function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Main Component
// ================================
function AlertsPageContent() {
  const { tabs, openTab } = useAlertWorkspaceStore();
  const toast = useAlertToast();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Dismissed banners
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Stats
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  // Modals
  const [showDirectionPanel, setShowDirectionPanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Workflow modals
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  const abortStatsRef = useRef<AbortController | null>(null);

  // API data
  const {
    data: timelineData,
    isLoading: timelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useApiQuery(async (_signal: AbortSignal) => alertsAPI.getTimeline({ days: 7 }), []);

  // ================================
  // Computed values
  // ================================
  const showDashboard = useMemo(() => viewMode === 'dashboard' || tabs.length === 0, [viewMode, tabs.length]);

  const hasUrgentItems = useMemo(() =>
    stats && (stats.critical > 0 || stats.escalated > 0),
    [stats]
  );

  const refreshLabel = useMemo(() => {
    if (!lastRefreshAt) return 'Jamais rafraîchi';
    const s = Math.floor((Date.now() - lastRefreshAt) / 1000);
    if (s < 60) return `il y a ${s}s`;
    const m = Math.floor(s / 60);
    return `il y a ${m} min`;
  }, [lastRefreshAt]);

  // Load UI State
  useEffect(() => {
    const st = readUIState();
    if (st) {
      setViewMode(st.viewMode);
      setDashboardTab(st.dashboardTab);
      setAutoRefresh(st.autoRefresh);
      setRefreshInterval(st.refreshInterval);
    }
    setDismissedAlerts(readDismissed());
  }, []);

  useEffect(() => {
    writeUIState({ viewMode, dashboardTab, autoRefresh, refreshInterval });
  }, [viewMode, dashboardTab, autoRefresh, refreshInterval]);

  useEffect(() => {
    writeDismissed(dismissedAlerts);
  }, [dismissedAlerts]);

  // ================================
  // Callbacks
  // ================================
  const openQueue = useCallback(
    (queue: string) => {
      const queueConfig: Record<string, { title: string; icon: string }> = {
        critical: { title: 'Critiques', icon: '🔴' },
        warning: { title: 'Avertissements', icon: '⚠️' },
        blocked: { title: 'Bloqués', icon: '🚫' },
        sla: { title: 'SLA', icon: '⏱️' },
        resolved: { title: 'Résolues', icon: '✅' },
        info: { title: 'Info', icon: 'ℹ️' },
        acknowledged: { title: 'Acquittées', icon: '💜' },
        payment: { title: 'Paiements', icon: '💰' },
        contract: { title: 'Contrats', icon: '📄' },
        budget: { title: 'Budgets', icon: '📊' },
        system: { title: 'Système', icon: '⚙️' },
      };

      const config = queueConfig[queue] ?? { title: queue, icon: '📋' };

      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title: config.title,
        icon: config.icon,
        data: { queue },
      });

      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent('alert:open-command-palette'));
  }, []);

  const closeAllOverlays = useCallback(() => {
    setShowDirectionPanel(false);
    setShowExport(false);
    setShowStats(false);
    setHelpOpen(false);
  }, []);

  // Load Stats
  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const { calculateAlertStats } = await import('@/lib/data/alerts');
      const calculatedStats = calculateAlertStats();
      setStats(calculatedStats);
      setLastRefreshAt(Date.now());
    } catch (e) {
      console.error('Erreur chargement stats:', e);
      toast.error('Erreur de chargement', 'Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats('init');
    return () => { abortStatsRef.current?.abort(); };
  }, [loadStats]);

  useInterval(
    () => { if (autoRefresh && showDashboard) loadStats('auto'); },
    autoRefresh ? refreshInterval : null
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllOverlays();
        return;
      }

      if (isMod && e.key === '1') { e.preventDefault(); openQueue('critical'); }
      if (isMod && e.key === '2') { e.preventDefault(); openQueue('warning'); }
      if (isMod && e.key === '3') { e.preventDefault(); openQueue('blocked'); }
      if (isMod && e.key === '4') { e.preventDefault(); openQueue('sla'); }
      if (isMod && e.key === '5') { e.preventDefault(); openQueue('resolved'); }

      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExport(true);
        return;
      }

      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowStats(true);
        return;
      }

      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowDirectionPanel((p) => !p);
        return;
      }

      if (e.key === '?' && !isMod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays, openQueue, openCommandPalette]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'categories' as DashboardTab, label: 'Par catégorie', icon: FolderOpen },
    { id: 'rules' as DashboardTab, label: 'Règles', icon: Settings },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // Alert categories
  const categoryStats = useMemo(() => [
    { id: 'critical', name: 'Critiques', icon: AlertCircle, color: 'rose', description: 'Action immédiate requise' },
    { id: 'warning', name: 'Avertissements', icon: AlertTriangle, color: 'amber', description: 'Attention requise' },
    { id: 'blocked', name: 'Bloqués', icon: Shield, color: 'orange', description: 'Dossiers en attente' },
    { id: 'sla', name: 'SLA dépassés', icon: Clock, color: 'purple', description: 'Délais non respectés' },
  ], []);

  // ================================
  // Render
  // ================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="font-semibold text-slate-200">Alertes & Risques</h1>
            {stats && (
              <span className="text-sm text-slate-400">
                {stats.critical + stats.warning} actives
              </span>
            )}
            {hasUrgentItems && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {stats?.critical} critique{(stats?.critical ?? 0) > 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs text-slate-500">{refreshLabel}</span>
        </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCommandPalette}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-slate-600 hover:bg-slate-800 transition-colors"
              type="button"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-700 text-xs text-slate-400">⌘K</kbd>
            </button>

            <button
              onClick={() => loadStats('manual')}
              className="p-2 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
              type="button"
              title="Rafraîchir"
            >
              <RefreshCw className={cn('w-4 h-4 text-slate-400', statsLoading && 'animate-spin')} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Workspace tabs */}
        {(viewMode === 'workspace' || tabs.length > 0) && (
          <div className="mb-6">
            <AlertWorkspaceTabs />
          </div>
        )}

        {showDashboard ? (
          <div className="space-y-8">
            {/* Navigation dashboard */}
            <nav className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {dashboardTabs.map((t) => {
                const Icon = t.icon;
                const isActive = dashboardTab === t.id;
                return (
              <button
                    key={t.id}
                    onClick={() => setDashboardTab(t.id)}
                className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
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

            {/* Dashboard content */}
            {dashboardTab === 'overview' && (
              <div className="space-y-8">
                {/* Bannière alertes critiques */}
                <AlertAlertsBanner
                  dismissedIds={dismissedAlerts}
                  onDismiss={(id) => setDismissedAlerts((prev) => new Set(prev).add(id))}
                />

                {/* Alertes critiques */}
                {stats && stats.critical > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.critical)}>
                    <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_ICON_COLORS.critical)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {stats.critical} alerte{stats.critical > 1 ? 's' : ''} critique{stats.critical > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Action immédiate requise pour éviter un impact opérationnel ou financier
                          </p>
                        </div>
                      </div>
            <button
                        onClick={() => openQueue('critical')}
                        className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        type="button"
            >
                        Traiter
                        <ChevronRight className="w-4 h-4" />
            </button>
          </div>
                  </div>
                )}

                {/* KPIs principaux */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
                    onClick={() => openQueue('critical')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      stats && stats.critical > 0 ? BG_STATUS.critical : BG_STATUS.neutral
                    )}
              type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={cn('w-4 h-4', stats && stats.critical > 0 ? 'text-rose-500' : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Critiques</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.critical ?? '—'}
                    </p>
            </button>

              <button
                    onClick={() => openQueue('warning')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      stats && stats.warning > 0 ? BG_STATUS.warning : BG_STATUS.neutral
                    )}
                type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-500">Warnings</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.warning ?? '—'}
                    </p>
              </button>

                    <button
                    onClick={() => openQueue('sla')}
                    className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-500">SLA</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.escalated ?? '—'}
                    </p>
                    </button>

                    <button
                    onClick={() => openQueue('resolved')}
                    className={cn('p-4 rounded-lg border text-left transition-all hover:shadow-sm', BG_STATUS.success)}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-500">Résolues</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.resolved ?? '—'}
                    </p>
                    </button>

                    <button
                    onClick={() => openQueue('acknowledged')}
                    className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-500">Acquittées</span>
                  </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.acknowledged ?? '—'}
                    </p>
                  </button>

                  <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Total</span>
            </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {stats?.total ?? '—'}
                    </p>
            </div>
          </div>

                {/* Par catégorie */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Par catégorie
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryStats.map((cat) => {
                      const Icon = cat.icon;
                      const count = cat.id === 'critical' ? stats?.critical :
                                   cat.id === 'warning' ? stats?.warning :
                                   cat.id === 'sla' ? stats?.escalated : 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => openQueue(cat.id)}
                          className={cn(
                            'p-4 rounded-lg border text-left hover:shadow-sm transition-all',
                            `border-${cat.color}-200/50 dark:border-${cat.color}-800/30`,
                            `bg-${cat.color}-50/30 dark:bg-${cat.color}-950/20`
                          )}
                          type="button"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `bg-${cat.color}-500/20`)}>
                              <Icon className={cn('w-5 h-5', `text-${cat.color}-600`)} />
        </div>
                    <div>
                              <p className="font-medium">{cat.name}</p>
                              <p className="text-xs text-slate-500">{cat.description}</p>
                    </div>
                  </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{count ?? 0}</span>
                </div>
                        </button>
                      );
                    })}
                </div>
                </section>

                {/* Outils avancés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Outils avancés
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                      onClick={() => setShowDirectionPanel(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                    type="button"
                    >
                      <Activity className="w-5 h-5 text-indigo-500 mb-2" />
                      <p className="font-medium text-sm">Pilotage</p>
                      <p className="text-xs text-slate-500">Vue Direction</p>
                  </button>
                  <button
                    onClick={() => openQueue('blocked')}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Shield className="w-5 h-5 text-orange-500 mb-2" />
                      <p className="font-medium text-sm">Bloqués</p>
                      <p className="text-xs text-slate-500">Dossiers en attente</p>
                  </button>
                  <button
                      onClick={() => {}}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                    type="button"
                    >
                      <Workflow className="w-5 h-5 text-purple-500 mb-2" />
                      <p className="font-medium text-sm">Workflow</p>
                      <p className="text-xs text-slate-500">Processus</p>
                  </button>
                  <button
                      onClick={() => {}}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                    type="button"
                    >
                      <Brain className="w-5 h-5 text-pink-500 mb-2" />
                      <p className="font-medium text-sm">Analytics IA</p>
                      <p className="text-xs text-slate-500">Prédictions</p>
                  </button>
                  <button
                      onClick={() => setShowStats(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                    type="button"
                    >
                      <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-medium text-sm">Statistiques</p>
                      <p className="text-xs text-slate-500">Tableaux de bord</p>
                  </button>
                  <button
                      onClick={() => setShowExport(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                    type="button"
                    >
                      <Download className="w-5 h-5 text-slate-500 mb-2" />
                      <p className="font-medium text-sm">Export</p>
                      <p className="text-xs text-slate-500">Télécharger</p>
                  </button>
                </div>
                </section>

                {/* Compteurs détaillés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Files de traitement
                  </h2>
                  <AlertLiveCounters onQueueClick={openQueue} compact={false} />
                </section>

                {/* Bloc gouvernance */}
                <div className={cn('p-4 rounded-lg border', BG_STATUS.info)}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500 flex-none" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-700 dark:text-blue-300">
                        Gouvernance d'exploitation
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Objectif : détecter tôt, prioriser juste, tracer tout. Chaque alerte nécessite une action documentée.
                      </p>
                    </div>
                        </div>
                      </div>

                {/* Astuce raccourcis */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      <strong className="text-slate-300">Astuce :</strong> utilise{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘1-5</kbd>{' '}
                      pour les files,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘K</kbd>{' '}
                      pour la palette, et{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">?</kbd>{' '}
                      pour l'aide.
                    </p>
                        </div>
                                    </div>
                                  </div>
            )}

            {dashboardTab === 'categories' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryStats.map((cat) => {
                    const Icon = cat.icon;
                    const count = cat.id === 'critical' ? stats?.critical :
                                 cat.id === 'warning' ? stats?.warning :
                                 cat.id === 'sla' ? stats?.escalated : 0;
                    return (
                      <div
                        key={cat.id}
                        className="p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${cat.color}-500/20`)}>
                            <Icon className={cn('w-6 h-6', `text-${cat.color}-600`)} />
                                  </div>
                          <div>
                            <h3 className="font-semibold text-lg">{cat.name}</h3>
                            <p className="text-sm text-slate-500">{count ?? 0} alertes</p>
                                </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{cat.description}</p>
                        <button
                          onClick={() => openQueue(cat.id)}
                          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          type="button"
                        >
                          Voir les alertes
                        </button>
                      </div>
                    );
                  })}
                    </div>
              </div>
            )}

            {dashboardTab === 'rules' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Règles d'alerte</h3>
                <p className="text-slate-500">Configuration des seuils, escalades et notifications automatiques.</p>
                      </div>
            )}

            {dashboardTab === 'history' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Historique des alertes</h3>
                <p className="text-slate-500">Journal des alertes et actions prises.</p>
                        </div>
            )}

            {dashboardTab === 'favorites' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Alertes suivies</h3>
                <p className="text-slate-500">Vos alertes épinglées et favoris.</p>
                  </div>
            )}
              </div>
            ) : (
              <div className="space-y-4">
                {tabs.length > 0 && <AlertWorkspaceTabs />}
                <AlertWorkspaceContent />
              </div>
            )}
        </main>

      {/* Workflow modals */}
      <AlertDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        alert={selectedAlert}
        onAcknowledge={() => setAckOpen(true)}
        onResolve={() => setResolveOpen(true)}
        onEscalate={() => setEscalateOpen(true)}
      />
      <AcknowledgeModal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        alert={selectedAlert}
        onConfirm={async (note) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.acknowledge(String(selectedAlert.id), { note, userId: 'user-001' });
            toast.success('Alerte acquittée', 'Traçabilité enregistrée');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d'acquitter');
          }
        }}
      />
      <ResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        alert={selectedAlert}
        onConfirm={async (resolution) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.resolve(String(selectedAlert.id), {
              resolutionType: resolution.type,
              note: resolution.note,
              proof: resolution.proof,
              userId: 'user-001',
            });
            toast.success('Alerte résolue', 'Résolution tracée');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible de résoudre');
          }
        }}
      />
      <EscalateModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        alert={selectedAlert}
        onConfirm={async (escalation) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.escalate(String(selectedAlert.id), {
              escalateTo: escalation.to,
              reason: escalation.reason,
              priority: escalation.priority,
              userId: 'user-001',
            });
            toast.success('Escalade envoyée', 'Notification envoyée');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d'escalader');
          }
        }}
      />

      {/* Command Palette */}
      <AlertCommandPalette />

      {/* Direction Panel */}
      <AlertDirectionPanel isOpen={showDirectionPanel} onClose={() => setShowDirectionPanel(false)} />

      {/* Export Modal */}
      <AlertExportModal open={showExport} onClose={() => setShowExport(false)} />

      {/* Stats Modal */}
      <AlertStatsModal open={showStats} onClose={() => setShowStats(false)} />

      {/* Help Modal */}
      <FluentModal open={helpOpen} onClose={() => setHelpOpen(false)} title="Raccourcis clavier" maxWidth="2xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Navigation</h3>
            <div className="space-y-2">
              {[
                { key: '⌘1', action: 'Alertes critiques' },
                { key: '⌘2', action: 'Avertissements' },
                { key: '⌘3', action: 'Dossiers bloqués' },
                { key: '⌘4', action: 'SLA dépassés' },
                { key: '⌘5', action: 'Alertes résolues' },
                { key: '⌘K', action: 'Palette de commandes' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-400">{action}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">{key}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Actions</h3>
            <div className="space-y-2">
              {[
                { key: '⌘E', action: 'Exporter' },
                { key: '⌘S', action: 'Statistiques' },
                { key: '⌘B', action: 'Toggle panneau pilotage' },
                { key: '?', action: 'Aide' },
                { key: 'Esc', action: 'Fermer modales' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-400">{action}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">{key}</kbd>
            </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <FluentButton variant="primary" onClick={() => setHelpOpen(false)}>
              Fermer
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

// Wrapper with ToastProvider
export default function AlertsPage() {
  return (
    <ToastProvider>
      <AlertsPageContent />
    </ToastProvider>
  );
}
