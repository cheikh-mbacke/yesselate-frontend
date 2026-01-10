/**
 * ====================================================================
 * PAGE: Projets en Cours - BMO
 * ====================================================================
 * 
 * Refonte complète avec architecture workspace sophistiquée
 * et niveau de détail aligné sur validation-bc.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useProjetsWorkspaceStore } from '@/lib/stores/projetsWorkspaceStore';
import { projetsApiService, type ProjetsStats } from '@/lib/services/projetsApiService';
import {
  ProjetsWorkspaceTabs,
  ProjetsWorkspaceContent,
  ProjetsLiveCounters,
  ProjetsCommandPalette,
} from '@/components/features/bmo/workspace/projets';

import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
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
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  Plus,
  Target,
  Briefcase,
  MapPin,
  Wallet,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react';

// ================================
// Types
// ================================
type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'services' | 'settings' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
}

const UI_PREF_KEY = 'bmo.projets.ui.v2';

// ================================
// Semantic colors
// ================================
const STATUS_ICON_COLORS = {
  blocked: 'text-rose-500',
  urgent: 'text-amber-500',
  pending: 'text-slate-400',
  active: 'text-emerald-500',
  completed: 'text-blue-500',
} as const;

const BG_STATUS = {
  blocked: 'bg-rose-500/10 border-rose-500/30',
  urgent: 'bg-amber-500/10 border-amber-500/30',
  pending: 'bg-slate-800/30 border-slate-700/50',
  active: 'bg-emerald-500/10 border-emerald-500/30',
  completed: 'bg-blue-500/10 border-blue-500/30',
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
      dashboardTab: ['services', 'settings', 'history', 'favorites'].includes(p.dashboardTab as string)
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
export default function ProjetsEnCoursPage() {
  const { tabs, openTab, commandPaletteOpen, setCommandPaletteOpen } = useProjetsWorkspaceStore();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Stats state
  const [statsData, setStatsData] = useState<ProjetsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state
  const [statsModalOpen, setStatsModalOpen] = useState(false);
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
    statsData && (statsData.blocked > 0),
    [statsData]
  );

  const statsLastUpdate = useMemo(() => {
    if (!statsData) return null;
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [statsData]);

  // ================================
  // Callbacks
  // ================================
  const openQueue = useCallback(
    (queue: string) => {
      const titles: Record<string, string> = {
        active: 'En cours',
        blocked: 'Bloqués',
        completed: 'Terminés',
        pending: 'En attente',
        infrastructure: 'Infrastructure',
        immobilier: 'Immobilier',
        it: 'IT & Digital',
        rh: 'RH & Formation',
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

  const openProject = useCallback(
    (id: string) => {
      openTab({
        type: 'project',
        id: `project:${id}`,
        title: id,
        icon: '📁',
        data: { projectId: id },
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
  }, [setCommandPaletteOpen]);

  // Load Stats
  const loadStats = useCallback(
    async (reason: LoadReason = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);

      try {
        const data = await projetsApiService.getStats();
        if (ac.signal.aborted) return;
        setStatsData(data);
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

      if (isMod && e.key === 'n') {
        e.preventDefault();
        openTab({
          type: 'wizard',
          id: `wizard:create:${Date.now()}`,
          title: 'Nouveau projet',
          icon: '➕',
          data: { action: 'create' },
        });
        setViewMode('workspace');
        return;
      }

      if (isMod && e.key === '1') { e.preventDefault(); openQueue('active'); }
      if (isMod && e.key === '2') { e.preventDefault(); openQueue('blocked'); }
      if (isMod && e.key === '3') { e.preventDefault(); openQueue('completed'); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays, openQueue, setCommandPaletteOpen, openTab]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'services' as DashboardTab, label: 'Par domaine', icon: FolderOpen },
    { id: 'settings' as DashboardTab, label: 'Paramètres', icon: Settings },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // Mock data for services
  const serviceStats = useMemo(() => [
    { id: 'infrastructure', name: 'Infrastructure', count: 23, color: 'blue', icon: Building2 },
    { id: 'immobilier', name: 'Immobilier', count: 18, color: 'emerald', icon: MapPin },
    { id: 'it', name: 'IT & Digital', count: 31, color: 'purple', icon: Briefcase },
    { id: 'rh', name: 'RH & Formation', count: 12, color: 'orange', icon: Users },
  ], []);

  // Mock data for project types
  const projectTypes = useMemo(() => [
    { type: 'Construction', count: 34 },
    { type: 'Rénovation', count: 28 },
    { type: 'Migration IT', count: 19 },
    { type: 'Formation', count: 12 },
    { type: 'Autres', count: 7 },
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
            <Building2 className="w-5 h-5 text-orange-400" />
            <h1 className="font-semibold text-slate-200">Projets en cours</h1>
            {statsData && (
              <span className="text-sm text-slate-400">
                {statsData.active} actif{statsData.active > 1 ? 's' : ''}
              </span>
            )}
            {hasUrgentItems && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {statsData?.blocked} bloqué{(statsData?.blocked ?? 0) > 1 ? 's' : ''}
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
                  title: 'Nouveau projet',
                  icon: '➕',
                  data: { action: 'create' },
                });
                setViewMode('workspace');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau projet</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Workspace tabs */}
        {(viewMode === 'workspace' || tabs.length > 0) && (
          <div className="mb-6">
            <ProjetsWorkspaceTabs />
          </div>
        )}

        {showDashboard ? (
          <div className="space-y-8">
            {/* Navigation dashboard */}
            <nav className="flex items-center gap-1 border-b border-slate-700/50 overflow-x-auto">
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
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
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
                {statsData && statsData.blocked > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.blocked)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_ICON_COLORS.blocked)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {statsData.blocked} projet{statsData.blocked > 1 ? 's' : ''} bloqué{statsData.blocked > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nécessitent une intervention urgente pour débloquer l'avancement
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openQueue('blocked')}
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
                    onClick={() => openQueue('active')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.active > 0 ? BG_STATUS.active : BG_STATUS.pending
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <PlayCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-500">En cours</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.active ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('blocked')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.blocked > 0 ? BG_STATUS.blocked : BG_STATUS.pending
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <PauseCircle className={cn('w-4 h-4', statsData && statsData.blocked > 0 ? 'text-rose-500' : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Bloqués</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.blocked ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('completed')}
                    className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-500">Terminés</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.completed ?? '—'}
                    </p>
                  </button>

                  <div className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-500">Avancement</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.avgProgress ?? '—'}%
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-500">Budget</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {statsData ? projetsApiService.formatMontant(statsData.totalBudget) : '—'}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-slate-800/30 border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-200">
                      {statsData?.total ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Par domaine/service */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Par domaine
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {serviceStats.map((service) => {
                      const Icon = service.icon;
                      return (
                        <button
                          key={service.id}
                          onClick={() => openQueue(service.id)}
                          className={cn(
                            'p-4 rounded-lg border text-left hover:shadow-sm transition-all',
                            `border-${service.color}-200/50 dark:border-${service.color}-800/30`,
                            `bg-${service.color}-50/30 dark:bg-${service.color}-950/20`
                          )}
                          type="button"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `bg-${service.color}-500/20`)}>
                              <Icon className={cn('w-5 h-5', `text-${service.color}-600`)} />
                            </div>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-xs text-slate-500">Projets actifs</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{service.count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Par type de projet */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Par type de projet
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {projectTypes.map((item) => (
                      <div
                        key={item.type}
                        className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left"
                      >
                        <p className="text-sm text-slate-500 mb-1">{item.type}</p>
                        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {item.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Outils avancés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Outils avancés
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <button
                      onClick={() => setWorkflowOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Workflow className="w-5 h-5 text-purple-500 mb-2" />
                      <p className="font-medium text-sm">Workflow</p>
                      <p className="text-xs text-slate-500">Suivi étapes</p>
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
                      onClick={() => setDelegationsOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Users className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-medium text-sm">Équipes</p>
                      <p className="text-xs text-slate-500">Affectations</p>
                    </button>
                    <button
                      onClick={() => setRemindersOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="font-medium text-sm">Jalons</p>
                      <p className="text-xs text-slate-500">Échéances</p>
                    </button>
                    <button
                      onClick={() => setStatsModalOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <BarChart3 className="w-5 h-5 text-orange-500 mb-2" />
                      <p className="font-medium text-sm">Statistiques</p>
                      <p className="text-xs text-slate-500">Tableaux de bord</p>
                    </button>
                    <button
                      onClick={() => setExportOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Download className="w-5 h-5 text-slate-500 mb-2" />
                      <p className="font-medium text-sm">Export</p>
                      <p className="text-xs text-slate-500">Rapports</p>
                    </button>
                  </div>
                </section>

                {/* Compteurs détaillés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Files de traitement
                  </h2>
                  <ProjetsLiveCounters onOpenQueue={(queue, title, icon) => openQueue(queue)} />
                </section>

                {/* Bloc gouvernance */}
                <div className={cn('p-4 rounded-lg border', BG_STATUS.completed)}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500 flex-none" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-700 dark:text-blue-300">
                        Gouvernance Projets
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Suivi budgétaire, jalons et risques pour chaque projet. Traçabilité complète des décisions et validations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === 'services' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {serviceStats.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div
                        key={service.id}
                        className="p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${service.color}-500/20`)}>
                            <Icon className={cn('w-6 h-6', `text-${service.color}-600`)} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <p className="text-sm text-slate-500">{service.count} projets</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openQueue(service.id)}
                          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          type="button"
                        >
                          Voir les projets
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardTab === 'settings' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Paramètres des projets</h3>
                <p className="text-slate-500">Configuration des workflows, notifications et règles métier.</p>
              </div>
            )}

            {dashboardTab === 'history' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Historique des actions</h3>
                <p className="text-slate-500">Journal des modifications et validations sur les projets.</p>
              </div>
            )}

            {dashboardTab === 'favorites' && (
              <div className="p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold mb-4">Projets suivis</h3>
                <p className="text-slate-500">Vos projets épinglés et favoris.</p>
              </div>
            )}
          </div>
        ) : (
          <ProjetsWorkspaceContent />
        )}
      </main>

      {/* Command Palette */}
      <ProjetsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={() => loadStats('manual')}
      />

      {/* Stats Modal */}
      {statsModalOpen && statsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Projets</h2>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 mb-1">Total</p>
                <p className="text-2xl font-bold">{statsData.total}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <p className="text-xs text-slate-500 mb-1">En cours</p>
                <p className="text-2xl font-bold text-emerald-600">{statsData.active}</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10">
                <p className="text-xs text-slate-500 mb-1">Bloqués</p>
                <p className="text-2xl font-bold text-rose-600">{statsData.blocked}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10">
                <p className="text-xs text-slate-500 mb-1">Terminés</p>
                <p className="text-2xl font-bold text-blue-600">{statsData.completed}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10">
                <p className="text-xs text-slate-500 mb-1">Avancement moy.</p>
                <p className="text-2xl font-bold text-purple-600">{statsData.avgProgress}%</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/10">
                <p className="text-xs text-slate-500 mb-1">Budget total</p>
                <p className="text-lg font-bold text-orange-600">{projetsApiService.formatMontant(statsData.totalBudget)} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                { key: '⌘N', action: 'Nouveau projet' },
                { key: '⌘1', action: 'Projets en cours' },
                { key: '⌘2', action: 'Projets bloqués' },
                { key: '⌘3', action: 'Projets terminés' },
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
