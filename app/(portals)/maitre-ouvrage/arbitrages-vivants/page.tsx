'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import {
  ArbitragesWorkspaceTabs,
  ArbitragesLiveCounters,
  ArbitragesCommandPalette,
  ArbitragesWorkspaceContent,
  ArbitragesStatsModal,
  ArbitragesDirectionPanel,
} from '@/components/features/bmo/workspace/arbitrages';
import {
  Scale,
  Search,
  BarChart3,
  Download,
  LayoutDashboard,
  FolderOpen,
  Settings,
  History,
  Star,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Users,
  Calendar,
  Brain,
  Workflow,
  Gavel,
  GitBranch,
  AlertTriangle,
  Plus,
  RefreshCw,
  Target,
  Zap,
  MessageSquare,
} from 'lucide-react';

// ================================
// Types
// ================================
type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'categories' | 'rules' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface ArbitrageStats {
  total: number;
  critical: number;
  pending: number;
  resolved: number;
  escalated: number;
  avgResolutionTime: number;
  byCategory: { category: string; count: number }[];
  byBureau: { bureau: string; count: number }[];
  ts: string;
}

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
}

const UI_PREF_KEY = 'bmo.arbitrages.ui.v2';

// ================================
// Semantic colors
// ================================
const STATUS_ICON_COLORS = {
  critical: 'text-rose-500',
  pending: 'text-amber-500',
  resolved: 'text-emerald-500',
  escalated: 'text-purple-500',
  info: 'text-blue-500',
} as const;

const BG_STATUS = {
  critical: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30',
  pending: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30',
  resolved: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30',
  escalated: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/30',
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
      dashboardTab: ['categories', 'rules', 'history', 'favorites'].includes(p.dashboardTab as string)
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
export default function ArbitragesVivantsPage() {
  const { tabs, openTab } = useArbitragesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // Local modal states (not in store)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [directionPanelOpen, setDirectionPanelOpen] = useState(false);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Stats state
  const [statsData, setStatsData] = useState<ArbitrageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state
  const [exportOpen, setExportOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [delegationsOpen, setDelegationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const abortStatsRef = useRef<AbortController | null>(null);

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
    statsData && (statsData.critical > 0 || statsData.escalated > 0),
    [statsData]
  );

  const statsLastUpdate = useMemo(() => {
    if (!statsData?.ts) return null;
    return new Date(statsData.ts).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [statsData?.ts]);

  // ================================
  // Callbacks
  // ================================
  const openQueue = useCallback(
    (queue: string) => {
      const titles: Record<string, string> = {
        critical: 'Critiques',
        pending: 'En attente',
        resolved: 'Résolus',
        escalated: 'Escaladés',
        goulot: 'Goulots',
        conflit: 'Conflits',
        budget: 'Budgétaires',
        ressources: 'Ressources',
        planning: 'Planning',
      };
      openTab({
        type: 'inbox',
        id: `inbox:${queue}`,
        title: titles[queue] || queue,
        icon: '📋',
        data: { queue },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const openArbitrage = useCallback(
    (id: string) => {
      openTab({
        type: 'arbitrage',
        id: `arbitrage:${id}`,
        title: id,
        icon: '⚖️',
        data: { arbitrageId: id },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const closeAllOverlays = useCallback(() => {
    setCommandPaletteOpen(false);
    setStatsModalOpen(false);
    setExportOpen(false);
    setWorkflowOpen(false);
    setAnalyticsOpen(false);
    setDelegationsOpen(false);
    setRemindersOpen(false);
    setHelpOpen(false);
  }, [setCommandPaletteOpen, setStatsModalOpen]);

  const handleRefresh = useCallback(() => {
    loadStats('manual');
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'arbitrages',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des arbitrages',
      bureau: 'BMO',
    });
  }, [addToast, addActionLog, currentUser]);

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

        const mockStats: ArbitrageStats = {
          total: 89,
          critical: 7,
          pending: 23,
          resolved: 52,
          escalated: 7,
          avgResolutionTime: 4.2,
          byCategory: [
            { category: 'Budgétaire', count: 28 },
            { category: 'Ressources', count: 24 },
            { category: 'Planning', count: 19 },
            { category: 'Technique', count: 12 },
            { category: 'Juridique', count: 6 },
          ],
          byBureau: [
            { bureau: 'DAF', count: 32 },
            { bureau: 'DRH', count: 21 },
            { bureau: 'DSI', count: 18 },
            { bureau: 'Direction', count: 18 },
          ],
          ts: new Date().toISOString(),
        };

        setStatsData(mockStats);
      } catch (error) {
        if (ac.signal.aborted) return;
        console.error('Erreur chargement stats:', error);
      } finally {
        setStatsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStats('init');
    return () => { abortStatsRef.current?.abort(); };
  }, [loadStats]);

  useInterval(
    () => { if (autoRefresh && showDashboard) loadStats('auto'); },
    autoRefresh ? 60_000 : null
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
        setCommandPaletteOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllOverlays();
        return;
      }

      if (isMod && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }

      if (isMod && e.key === '1') { e.preventDefault(); openQueue('critical'); }
      if (isMod && e.key === '2') { e.preventDefault(); openQueue('pending'); }
      if (isMod && e.key === '3') { e.preventDefault(); openQueue('resolved'); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays, openQueue, setCommandPaletteOpen, handleRefresh]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'categories' as DashboardTab, label: 'Par catégorie', icon: FolderOpen },
    { id: 'rules' as DashboardTab, label: 'Règles', icon: Settings },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // Categories data
  const categoryStats = useMemo(() => [
    { id: 'budget', name: 'Budgétaire', icon: Target, color: 'amber', description: 'Arbitrages liés aux budgets' },
    { id: 'ressources', name: 'Ressources', icon: Users, color: 'blue', description: 'Conflits RH et allocations' },
    { id: 'planning', name: 'Planning', icon: Calendar, color: 'emerald', description: 'Conflits de calendrier' },
    { id: 'technique', name: 'Technique', icon: Workflow, color: 'purple', description: 'Décisions techniques' },
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
            <Scale className="w-5 h-5 text-orange-400" />
            <h1 className="font-semibold text-slate-200">Arbitrages & Goulots</h1>
            {statsData && (
              <span className="text-sm text-slate-400">
                {statsData.pending} en attente
              </span>
            )}
            {hasUrgentItems && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {statsData?.critical} critique{(statsData?.critical ?? 0) > 1 ? 's' : ''}
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
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-slate-600 hover:bg-slate-800 transition-colors"
              type="button"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-700 text-xs text-slate-400">⌘K</kbd>
            </button>

            <button
              onClick={() => {
                openTab({
                  type: 'wizard',
                  id: `wizard:create:${Date.now()}`,
                  title: 'Nouvel arbitrage',
                  icon: '➕',
                  data: { action: 'create' },
                });
                setViewMode('workspace');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvel arbitrage</span>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
              type="button"
              title="Rafraîchir (⌘R)"
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
            <ArbitragesWorkspaceTabs />
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
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
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
                {statsData && statsData.critical > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.critical)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_ICON_COLORS.critical)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {statsData.critical} arbitrage{statsData.critical > 1 ? 's' : ''} critique{statsData.critical > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Décisions urgentes requises par la Direction Générale
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
                      statsData && statsData.critical > 0 ? BG_STATUS.critical : BG_STATUS.info
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Gavel className={cn('w-4 h-4', statsData && statsData.critical > 0 ? 'text-rose-500' : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Critiques</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.critical ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('pending')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.pending > 0 ? BG_STATUS.pending : BG_STATUS.info
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-500">En attente</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.pending ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('resolved')}
                    className="p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-500">Résolus</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.resolved ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('escalated')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.escalated > 0 ? BG_STATUS.escalated : BG_STATUS.info
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-500">Escaladés</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.escalated ?? '—'}
                    </p>
                  </button>

                  <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-500">Délai moy.</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.avgResolutionTime ?? '—'}j
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.total ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Par catégorie */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par catégorie d'arbitrage
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryStats.map((cat) => {
                        const Icon = cat.icon;
                        const count = statsData.byCategory.find(c => c.category.toLowerCase().includes(cat.id))?.count || 0;
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
                )}

                {/* Par bureau source */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par bureau source
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {statsData.byBureau.map((b) => (
                        <div
                          key={b.bureau}
                          className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left"
                        >
                          <p className="text-sm text-slate-500 mb-1">{b.bureau}</p>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {b.count}
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
                      onClick={() => openQueue('goulot')}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <GitBranch className="w-5 h-5 text-orange-500 mb-2" />
                      <p className="font-medium text-sm">Goulots</p>
                      <p className="text-xs text-slate-500">Points de blocage</p>
                    </button>
                    <button
                      onClick={() => openQueue('conflit')}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Users className="w-5 h-5 text-rose-500 mb-2" />
                      <p className="font-medium text-sm">Conflits</p>
                      <p className="text-xs text-slate-500">Inter-bureaux</p>
                    </button>
                    <button
                      onClick={() => setWorkflowOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Workflow className="w-5 h-5 text-purple-500 mb-2" />
                      <p className="font-medium text-sm">Workflow</p>
                      <p className="text-xs text-slate-500">Processus</p>
                    </button>
                    <button
                      onClick={() => setAnalyticsOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Brain className="w-5 h-5 text-pink-500 mb-2" />
                      <p className="font-medium text-sm">Analytics IA</p>
                      <p className="text-xs text-slate-500">Prédictions</p>
                    </button>
                    <button
                      onClick={() => setStatsModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-medium text-sm">Statistiques</p>
                      <p className="text-xs text-slate-500">Tableaux de bord</p>
                    </button>
                    <button
                      onClick={() => setDirectionPanelOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <MessageSquare className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="font-medium text-sm">Pilotage</p>
                      <p className="text-xs text-slate-500">Vue Direction</p>
                    </button>
                  </div>
                </section>

                {/* Compteurs détaillés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Files de traitement
                  </h2>
                  <ArbitragesLiveCounters onOpenQueue={(queue, title, icon) => openQueue(queue)} />
                </section>

                {/* Bloc gouvernance */}
                <div className={cn('p-4 rounded-lg border', BG_STATUS.escalated)}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-500 flex-none" />
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-700 dark:text-purple-300">
                        Gouvernance des Arbitrages
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Chaque décision est tracée avec motifs, parties prenantes et impacts. Escalade automatique vers la DG selon les seuils définis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === 'categories' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryStats.map((cat) => {
                    const Icon = cat.icon;
                    const count = statsData?.byCategory.find(c => c.category.toLowerCase().includes(cat.id))?.count || 0;
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
                            <p className="text-sm text-slate-500">{count} arbitrages</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{cat.description}</p>
                        <button
                          onClick={() => openQueue(cat.id)}
                          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          type="button"
                        >
                          Voir les arbitrages
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardTab === 'rules' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Règles d'arbitrage</h3>
                <p className="text-slate-500">Configuration des règles d'escalade, seuils et délégations.</p>
              </div>
            )}

            {dashboardTab === 'history' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Historique des décisions</h3>
                <p className="text-slate-500">Journal des arbitrages et décisions prises.</p>
              </div>
            )}

            {dashboardTab === 'favorites' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Arbitrages suivis</h3>
                <p className="text-slate-500">Vos arbitrages épinglés et favoris.</p>
              </div>
            )}
          </div>
        ) : (
          <ArbitragesWorkspaceContent />
        )}
      </main>

      {/* Command Palette */}
      <ArbitragesCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Direction Panel */}
      <ArbitragesDirectionPanel
        open={directionPanelOpen}
        onClose={() => setDirectionPanelOpen(false)}
      />

      {/* Stats Modal */}
      <ArbitragesStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">Raccourcis clavier</h2>
              <button onClick={() => setHelpOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: '⌘K', action: 'Palette de commandes' },
                { key: '⌘R', action: 'Rafraîchir' },
                { key: '⌘1', action: 'Arbitrages critiques' },
                { key: '⌘2', action: 'En attente' },
                { key: '⌘3', action: 'Résolus' },
                { key: 'Esc', action: 'Fermer' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{action}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
