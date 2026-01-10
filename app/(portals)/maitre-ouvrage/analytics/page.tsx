'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';

import { AnalyticsWorkspaceTabs } from '@/components/features/bmo/analytics/workspace/AnalyticsWorkspaceTabs';
import { AnalyticsWorkspaceContent } from '@/components/features/bmo/analytics/workspace/AnalyticsWorkspaceContent';
import { AnalyticsCommandPalette } from '@/components/features/bmo/analytics/workspace/AnalyticsCommandPalette';
import { AnalyticsStatsModal } from '@/components/features/bmo/analytics/workspace/AnalyticsStatsModal';
import { AnalyticsExportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsExportModal';
import { AnalyticsAlertConfigModal } from '@/components/features/bmo/analytics/workspace/AnalyticsAlertConfigModal';
import { AnalyticsReportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsReportModal';

import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import {
  BarChart3,
  Search,
  LayoutDashboard,
  FolderOpen,
  Settings,
  History,
  Star,
  ChevronRight,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Users,
  Calendar,
  Brain,
  Workflow,
  Download,
  RefreshCw,
  Plus,
  Target,
  PieChart,
  LineChart,
  Zap,
  AlertTriangle,
  XCircle,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsAPI } from '@/lib/api/pilotage/analyticsClient';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';

// ================================
// Types
// ================================
type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'performance' | 'financial' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface AnalyticsStats {
  total: number;
  kpis: number;
  reports: number;
  alerts: number;
  trends: number;
  avgPerformance: number;
  byCategory: { category: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  ts: string;
}

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
}

const UI_PREF_KEY = 'bmo.analytics.ui.v3';

// ================================
// Semantic colors
// ================================
const STATUS_ICON_COLORS = {
  good: 'text-emerald-500',
  warning: 'text-amber-500',
  critical: 'text-rose-500',
  neutral: 'text-slate-400',
  info: 'text-blue-500',
} as const;

const BG_STATUS = {
  good: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30',
  critical: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30',
  neutral: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30',
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
      dashboardTab: ['performance', 'financial', 'history', 'favorites'].includes(p.dashboardTab as string)
        ? p.dashboardTab as DashboardTab
        : 'overview',
      autoRefresh: typeof p.autoRefresh === 'boolean' ? p.autoRefresh : true,
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
export default function AnalyticsPage() {
  const { openTab, tabs, activeTabId, openCommandPalette } = useAnalyticsWorkspaceStore();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Stats state
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [alertConfigModalOpen, setAlertConfigModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const abortStatsRef = useRef<AbortController | null>(null);

  // KPIs from API
  const {
    data: kpiData,
    isLoading: kpisLoading,
    error: kpisError,
    refetch: refetchKpis,
  } = useApiQuery(async (_signal: AbortSignal) => analyticsAPI.getKpis(), []);

  // Load UI State
  useEffect(() => {
    const st = readUIState();
    if (st) {
      setViewMode(st.viewMode);
      setDashboardTab(st.dashboardTab);
      setAutoRefresh(st.autoRefresh);
    }
  }, []);

  useEffect(() => {
    writeUIState({ viewMode, dashboardTab, autoRefresh });
  }, [viewMode, dashboardTab, autoRefresh]);

  // ================================
  // Computed values
  // ================================
  const showDashboard = useMemo(() => viewMode === 'dashboard' || tabs.length === 0, [viewMode, tabs.length]);

  const hasUrgentItems = useMemo(() =>
    statsData && (statsData.alerts > 0),
    [statsData]
  );

  const statsLastUpdate = useMemo(() => {
    if (!statsData?.ts) return null;
    return new Date(statsData.ts).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [statsData?.ts]);

  const kpiCards = useMemo(() => {
    const kpis = kpiData?.kpis ?? [];
    return kpis.slice(0, 6).map((k) => ({
      id: k.id,
      label: k.name,
      value: `${k.value}${k.unit ?? ''}`,
      status: (k.status as 'good' | 'warning' | 'critical' | 'neutral') || 'neutral',
    }));
  }, [kpiData]);

  // ================================
  // Callbacks
  // ================================
  const openQueue = useCallback(
    (queue: string) => {
      const titles: Record<string, string> = {
        overview: "Vue d'ensemble",
        performance: 'Performance',
        financial: 'Financier',
        trends: 'Tendances',
        alerts: 'Alertes',
        reports: 'Rapports',
      };
      openTab({
        type: 'inbox',
        id: `inbox:${queue}`,
        title: titles[queue] || queue,
        icon: '📊',
        data: { queue },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const closeAllOverlays = useCallback(() => {
    setStatsModalOpen(false);
    setExportModalOpen(false);
    setAlertConfigModalOpen(false);
    setReportModalOpen(false);
    setHelpOpen(false);
  }, []);

  // Load Stats
  const loadStats = useCallback(
    async (reason: LoadReason = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);

      try {
        await new Promise((r) => setTimeout(r, reason === 'init' ? 300 : 150));
        if (ac.signal.aborted) return;

        const mockStats: AnalyticsStats = {
          total: 156,
          kpis: 24,
          reports: 45,
          alerts: 8,
          trends: 12,
          avgPerformance: 87,
          byCategory: [
            { category: 'Performance', count: 42 },
            { category: 'Financier', count: 38 },
            { category: 'RH', count: 28 },
            { category: 'Opérationnel', count: 48 },
          ],
          byDepartment: [
            { department: 'DAF', count: 45 },
            { department: 'DRH', count: 32 },
            { department: 'DSI', count: 28 },
            { department: 'Direction', count: 51 },
          ],
          ts: new Date().toISOString(),
        };

        setStatsData(mockStats);
        
        if (reason === 'manual') {
          refetchKpis?.();
        }
      } catch (error) {
        if (ac.signal.aborted) return;
        console.error('Erreur chargement stats:', error);
      } finally {
        setStatsLoading(false);
      }
    },
    [refetchKpis]
  );

  useEffect(() => {
    loadStats('init');
    return () => { abortStatsRef.current?.abort(); };
  }, [loadStats]);

  useInterval(
    () => { if (autoRefresh && showDashboard) loadStats('auto'); },
    autoRefresh ? 60_000 : null
  );

  // Custom events
  useEffect(() => {
    const handleOpenStats = () => setStatsModalOpen(true);
    const handleOpenExport = () => setExportModalOpen(true);
    const handleOpenAlerts = () => setAlertConfigModalOpen(true);
    const handleOpenReport = () => setReportModalOpen(true);

    window.addEventListener('analytics:open-stats', handleOpenStats);
    window.addEventListener('analytics:open-export', handleOpenExport);
    window.addEventListener('analytics:open-alerts', handleOpenAlerts);
    window.addEventListener('analytics:open-report', handleOpenReport);

    return () => {
      window.removeEventListener('analytics:open-stats', handleOpenStats);
      window.removeEventListener('analytics:open-export', handleOpenExport);
      window.removeEventListener('analytics:open-alerts', handleOpenAlerts);
      window.removeEventListener('analytics:open-report', handleOpenReport);
    };
  }, []);

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

      if (isMod && e.key === 's') {
        e.preventDefault();
        setStatsModalOpen(true);
        return;
      }

      if (isMod && e.key === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      if (e.key === '?' && !isMod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (isMod && e.key === '1') { e.preventDefault(); openQueue('overview'); }
      if (isMod && e.key === '2') { e.preventDefault(); openQueue('performance'); }
      if (isMod && e.key === '3') { e.preventDefault(); openQueue('financial'); }
      if (isMod && e.key === '4') { e.preventDefault(); openQueue('trends'); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays, openQueue, openCommandPalette]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'performance' as DashboardTab, label: 'Performance', icon: Activity },
    { id: 'financial' as DashboardTab, label: 'Financier', icon: DollarSign },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // Analytics categories
  const categoryStats = useMemo(() => [
    { id: 'performance', name: 'Performance', icon: Activity, color: 'emerald', description: 'KPIs opérationnels' },
    { id: 'financial', name: 'Financier', icon: DollarSign, color: 'amber', description: 'Budget & dépenses' },
    { id: 'trends', name: 'Tendances', icon: TrendingUp, color: 'purple', description: 'Évolutions et prédictions' },
    { id: 'alerts', name: 'Alertes', icon: AlertTriangle, color: 'rose', description: 'Seuils et notifications' },
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
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h1 className="font-semibold text-slate-200">Analytics & Rapports</h1>
            {statsData && (
              <span className="text-sm text-slate-400">
                {statsData.kpis} KPIs actifs
              </span>
            )}
            {hasUrgentItems && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {statsData?.alerts} alerte{(statsData?.alerts ?? 0) > 1 ? 's' : ''}
              </span>
            )}
            {statsLastUpdate && (
              <span className="text-xs text-slate-500">
                MAJ: {statsLastUpdate}
              </span>
            )}
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
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau rapport</span>
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
            <AnalyticsWorkspaceTabs />
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

            {/* Dashboard content */}
            {dashboardTab === 'overview' && (
              <div className="space-y-8">
                {/* Alertes critiques */}
                {statsData && statsData.alerts > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.warning)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_ICON_COLORS.warning)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {statsData.alerts} alerte{statsData.alerts > 1 ? 's' : ''} active{statsData.alerts > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Des KPIs ont dépassé leurs seuils d'alerte
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openQueue('alerts')}
                        className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        type="button"
                      >
                        Voir
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* KPIs temps réel */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Indicateurs temps réel
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpisLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 animate-pulse">
                          <div className="h-3 w-20 bg-slate-700/60 rounded mb-2" />
                          <div className="h-6 w-14 bg-slate-700/60 rounded" />
                        </div>
                      ))
                    ) : kpisError ? (
                      <div className="col-span-6 p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-sm text-slate-500">KPIs indisponibles: {kpisError.message}</p>
                      </div>
                    ) : (
                      kpiCards.map((kpi) => {
                        const dotColor =
                          kpi.status === 'critical' ? 'bg-rose-400' :
                          kpi.status === 'warning' ? 'bg-amber-400' :
                          kpi.status === 'good' ? 'bg-emerald-400' : 'bg-slate-500';
                        return (
                          <button
                            key={kpi.id}
                            onClick={openCommandPalette}
                            className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left hover:shadow-sm transition-all"
                            type="button"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn('w-2 h-2 rounded-full', dotColor)} />
                              <p className="text-xs text-slate-500 truncate">{kpi.label}</p>
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{kpi.value}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* KPIs principaux */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => openQueue('performance')}
                    className={cn('p-4 rounded-lg border text-left transition-all hover:shadow-sm', BG_STATUS.good)}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-500">Performance</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.avgPerformance ?? '—'}%
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('trends')}
                    className={cn('p-4 rounded-lg border text-left transition-all hover:shadow-sm', BG_STATUS.info)}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-500">Tendances</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.trends ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('reports')}
                    className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-500">Rapports</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.reports ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('alerts')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.alerts > 0 ? BG_STATUS.warning : BG_STATUS.neutral
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={cn('w-4 h-4', statsData && statsData.alerts > 0 ? 'text-amber-500' : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Alertes</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.alerts ?? '—'}
                    </p>
                  </button>

                  <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-500">KPIs</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.kpis ?? '—'}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.total ?? '—'}
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
                      const count = statsData?.byCategory.find(c => c.category.toLowerCase().includes(cat.id))?.count || 0;
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
                            <span className="text-lg font-semibold">{count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Par département */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par département
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {statsData.byDepartment.map((d) => (
                        <div
                          key={d.department}
                          className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left"
                        >
                          <p className="text-sm text-slate-500 mb-1">{d.department}</p>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {d.count}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Outils avancés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Outils avancés
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <PieChart className="w-5 h-5 text-purple-500 mb-2" />
                      <p className="font-medium text-sm">Rapports</p>
                      <p className="text-xs text-slate-500">Génération</p>
                    </button>
                    <button
                      onClick={() => setAlertConfigModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
                      <p className="font-medium text-sm">Alertes</p>
                      <p className="text-xs text-slate-500">Configuration</p>
                    </button>
                    <button
                      onClick={() => openQueue('trends')}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <LineChart className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-medium text-sm">Tendances</p>
                      <p className="text-xs text-slate-500">Évolutions</p>
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Brain className="w-5 h-5 text-pink-500 mb-2" />
                      <p className="font-medium text-sm">IA Prédictive</p>
                      <p className="text-xs text-slate-500">Prévisions</p>
                    </button>
                    <button
                      onClick={() => setStatsModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <BarChart3 className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="font-medium text-sm">Statistiques</p>
                      <p className="text-xs text-slate-500">Vue détaillée</p>
                    </button>
                    <button
                      onClick={() => setExportModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Download className="w-5 h-5 text-slate-500 mb-2" />
                      <p className="font-medium text-sm">Export</p>
                      <p className="text-xs text-slate-500">Télécharger</p>
                    </button>
                  </div>
                </section>

                {/* Bloc gouvernance */}
                <div className={cn('p-4 rounded-lg border', BG_STATUS.info)}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500 flex-none" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-700 dark:text-blue-300">
                        Pilotage par les données
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Surveillez les KPIs clés, analysez les tendances et générez des rapports détaillés pour piloter l'activité avec précision.
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
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘1-4</kbd>{' '}
                      pour les vues,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘K</kbd>{' '}
                      pour la palette, et{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">?</kbd>{' '}
                      pour l'aide.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === 'performance' && (
              <div className="space-y-6">
                <AnalyticsWorkspaceContent />
              </div>
            )}

            {dashboardTab === 'financial' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Données financières</h3>
                <p className="text-slate-500">Budget, dépenses et analyses financières.</p>
              </div>
            )}

            {dashboardTab === 'history' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Historique des rapports</h3>
                <p className="text-slate-500">Journal des rapports générés et consultations.</p>
              </div>
            )}

            {dashboardTab === 'favorites' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">KPIs et rapports suivis</h3>
                <p className="text-slate-500">Vos indicateurs et rapports épinglés.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tabs.length > 0 && <AnalyticsWorkspaceTabs />}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
              <AnalyticsWorkspaceContent />
            </div>
          </div>
        )}
      </main>

      {/* Command Palette */}
      <AnalyticsCommandPalette />

      {/* Modals */}
      <AnalyticsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
      <AnalyticsExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <AnalyticsAlertConfigModal open={alertConfigModalOpen} onClose={() => setAlertConfigModalOpen(false)} />
      <AnalyticsReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />

      {/* Help Modal */}
      <FluentModal open={helpOpen} onClose={() => setHelpOpen(false)} title="Raccourcis & Actions">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Navigation</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Rechercher / Commandes</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Vue d'ensemble</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘1</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Performance</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘2</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Financier</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘3</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Tendances</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘4</kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Actions</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Statistiques</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘S</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Export</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">⌘E</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-400">Fermer</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">Esc</kbd>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <FluentButton variant="secondary" onClick={() => setHelpOpen(false)} className="w-full">Fermer</FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}
