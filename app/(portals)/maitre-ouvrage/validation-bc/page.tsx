'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useValidationBCWorkspaceStore, type ValidationTabType } from '@/lib/stores/validationBCWorkspaceStore';
import { getValidationStats } from '@/lib/services/validation-bc-api';
import { validationBCCache } from '@/lib/cache/validation-bc-cache';

// Components workspace
import {
  ValidationBCWorkspaceTabs,
  ValidationBCWorkspaceContent,
  ValidationBCCommandPalette,
  ValidationBCDirectionPanel,
  ValidationBCAlertsBanner,
  ValidationBCNotifications,
  ValidationBCToastProvider,
  useValidationBCToast,
  ValidationBCDashboardSkeleton,
  ValidationBCExportModal,
  ValidationBCStatsModal,
  ValidationBCTimeline,
  ValidationBCQuickCreateModal,
  ValidationBCFavoritesProvider,
  ValidationBCFavoritesPanel,
  ValidationBCWorkflowEngine,
  ValidationBCPredictiveAnalytics,
  ValidationBCDelegationManager,
  ValidationBCRemindersSystem,
  ValidationBCActivityHistory,
  ValidationBCBusinessRules,
  ValidationBCServiceQueues,
  ValidationBCValidationModal,
  ValidationBCMultiLevelValidation,
  ValidationBCRequestJustificatif,
  ValidationBCDocumentView,
  ValidationBC360Panel,
  type ValidationDocument,
  type DocumentType,
} from '@/components/features/validation-bc/workspace';

// Graphiques
import {
  ValidationDashboardCharts,
  ValidationStatsBarChart,
} from '@/components/features/validation-bc/charts';

import { cn } from '@/lib/utils';
import {
  FileCheck,
  Search,
  LayoutDashboard,
  FolderOpen,
  Scale,
  History,
  Star,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Building2,
  Receipt,
  FileEdit,
  FileText,
  TrendingUp,
  Shield,
  Users,
  Calendar,
  Brain,
  Workflow,
} from 'lucide-react';

// ================================
// Types
// ================================
import type { ValidationStats as APIValidationStats } from '@/lib/services/validation-bc-api';

type ValidationStats = APIValidationStats;

type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'services' | 'rules' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
}

const UI_PREF_KEY = 'bmo.validation-bc.ui.v4';

// ================================
// Semantic colors - UNIQUEMENT pour les icônes et graphiques
// ================================
const STATUS_ICON_COLORS = {
  blocked: 'text-rose-500',
  urgent: 'text-amber-500',
  pending: 'text-slate-400',
  validated: 'text-emerald-500',
  info: 'text-blue-500',
} as const;

const BG_STATUS = {
  blocked: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30',
  urgent: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30',
  pending: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50',
  validated: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30',
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
      dashboardTab: ['services', 'rules', 'history', 'favorites'].includes(p.dashboardTab as string) 
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
function ValidationBCPageContent() {
  const { tabs, openTab } = useValidationBCWorkspaceStore();
  const toast = useValidationBCToast();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Stats state
  const [statsData, setStatsData] = useState<ValidationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state (accessibles via ⌘K)
  const [commandOpen, setCommandOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [delegationsOpen, setDelegationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  
  // Advanced modals (inspired by demandes page)
  const [multiLevelValidationOpen, setMultiLevelValidationOpen] = useState(false);
  const [requestJustificatifOpen, setRequestJustificatifOpen] = useState(false);

  // Validation modal
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ValidationDocument | null>(null);

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
  // Computed values (memoized)
  // ================================
  const showDashboard = useMemo(() => viewMode === 'dashboard' || tabs.length === 0, [viewMode, tabs.length]);
  
  const hasUrgentItems = useMemo(() => 
    statsData && (statsData.urgent > 0 || statsData.anomalies > 0),
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
        pending: 'En attente',
        validated: 'Validés',
        rejected: 'Rejetés',
        anomalies: 'Anomalies',
        urgent: 'Urgents',
        achats: 'Service Achats',
        finance: 'Service Finance',
        juridique: 'Service Juridique',
        bc: 'Bons de commande',
        facture: 'Factures',
        avenant: 'Avenants',
      };
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox' as ValidationTabType,
        title: titles[queue] || queue,
        icon: '📋',
        data: { queue },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const openDocument = useCallback(
    (id: string, type: DocumentType) => {
      openTab({
        type: type as ValidationTabType,
        id: `document:${type}:${id}`,
        title: id,
        icon: type === 'bc' ? '📄' : type === 'facture' ? '🧾' : '📝',
        data: { documentId: id, type },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const handleValidateDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

  const handleRejectDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

  const closeAllOverlays = useCallback(() => {
    setCommandOpen(false);
    setStatsModalOpen(false);
    setExportOpen(false);
    setQuickCreateOpen(false);
    setTimelineOpen(false);
    setWorkflowOpen(false);
    setAnalyticsOpen(false);
    setDelegationsOpen(false);
    setRemindersOpen(false);
    setValidationModalOpen(false);
    setMultiLevelValidationOpen(false);
    setRequestJustificatifOpen(false);
  }, []);

  // Load Stats
  // Load Stats avec API réelle
  const loadStats = useCallback(
    async (reason: LoadReason = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);

      try {
        // Appel API réel
        const stats = await getValidationStats(reason, ac.signal);
        
        if (ac.signal.aborted) return;

        setStatsData(stats);
        if (reason === 'manual') {
          toast.success('Données actualisées', `${stats.total} documents`);
        }
      } catch (error) {
        if (ac.signal.aborted) return;
        
        console.error('Erreur chargement stats:', error);
        
        // Fallback sur données mockées si l'API échoue
        const mockStats: ValidationStats = {
          total: 453,
          pending: 45,
          validated: 378,
          rejected: 15,
          anomalies: 8,
          urgent: 12,
          byBureau: [
            { bureau: 'Achats', count: 187 },
            { bureau: 'Finance', count: 223 },
            { bureau: 'Juridique', count: 43 },
          ],
          byType: [
            { type: 'Bons de commande', count: 234 },
            { type: 'Factures', count: 189 },
            { type: 'Avenants', count: 30 },
          ],
          recentActivity: [],
          ts: new Date().toISOString(),
        };
        
        setStatsData(mockStats);
        
        if (reason === 'manual') {
          toast.error('Erreur réseau', 'Données en mode hors ligne');
        }
      } finally {
        setStatsLoading(false);
      }
    },
    [toast]
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
        setCommandOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllOverlays();
        return;
      }

      if (isMod && e.key === 'n') {
        e.preventDefault();
        setQuickCreateOpen(true);
        return;
      }

      // Quick navigation
      if (isMod && e.key === '1') { e.preventDefault(); openQueue('pending'); }
      if (isMod && e.key === '2') { e.preventDefault(); openQueue('validated'); }
      if (isMod && e.key === '3') { e.preventDefault(); openQueue('rejected'); }

      // Alt+Left ou Backspace - Retour au dashboard si en mode workspace
      if ((e.altKey && e.key === 'ArrowLeft') || (e.key === 'Backspace' && !isMod)) {
        if (viewMode === 'workspace' && tabs.length > 0) {
          e.preventDefault();
          setViewMode('dashboard');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays, openQueue, viewMode, tabs.length]);

  // Dashboard tabs (optimized with memoization)
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'services' as DashboardTab, label: 'Par service', icon: FolderOpen },
    { id: 'rules' as DashboardTab, label: 'Règles métier', icon: Scale },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // ================================
  // Render
  // ================================

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-purple-500" />
            <h1 className="font-semibold text-slate-900 dark:text-slate-100">Validation BC</h1>
            {statsData && (
              <span className="text-sm text-slate-500">
                {statsData.pending} en attente
              </span>
            )}
            {hasUrgentItems && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/20 text-slate-900 dark:text-slate-100 border border-rose-200 dark:border-rose-800">
                {statsData?.anomalies} anomalies
              </span>
            )}
            {statsLastUpdate && (
              <span className="text-xs text-slate-400">
                MAJ: {statsLastUpdate}
              </span>
            )}
          </div>

          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            type="button"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Rechercher...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">⌘K</kbd>
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Workspace tabs */}
        {(viewMode === 'workspace' || tabs.length > 0) && (
          <div className="mb-6">
            <ValidationBCWorkspaceTabs 
              onBackToDashboard={tabs.length > 0 ? () => {
                setViewMode('dashboard');
              } : undefined}
            />
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
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
                {statsData && statsData.anomalies > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.blocked)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_ICON_COLORS.blocked)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {statsData.anomalies} anomalie{statsData.anomalies > 1 ? 's' : ''} détectée{statsData.anomalies > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Écarts 3-way match, doublons ou fournisseurs non référencés
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openQueue('anomalies')}
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
                    onClick={() => openQueue('pending')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.pending > 0 ? BG_STATUS.urgent : BG_STATUS.pending
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
                    onClick={() => openQueue('urgent')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.urgent > 0 ? BG_STATUS.blocked : BG_STATUS.pending
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={cn('w-4 h-4', statsData && statsData.urgent > 0 ? 'text-rose-500' : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Urgents</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.urgent ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('validated')}
                    className="p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-500">Validés</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.validated ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('rejected')}
                    className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Rejetés</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.rejected ?? '—'}
                    </p>
                  </button>

                  <button
                    onClick={() => openQueue('anomalies')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.anomalies > 0 ? BG_STATUS.blocked : BG_STATUS.pending
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-rose-500" />
                      <span className="text-sm text-slate-500">Anomalies</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.anomalies ?? '—'}
                    </p>
                  </button>

                  <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.total ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Graphiques de visualisation */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      📊 Visualisation des données
                    </h2>
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-slate-500">Chargement des graphiques...</p>
                        </div>
                      </div>
                    }>
                      <ValidationDashboardCharts data={statsData} />
                    </Suspense>
                  </section>
                )}

                {/* Par service source */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par service source
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => openQueue('achats')}
                        className="p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/30 dark:bg-blue-950/20 text-left hover:shadow-sm transition-all"
                        type="button"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Service Achats</p>
                            <p className="text-xs text-slate-500">Bons de commande</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{statsData.byBureau[0]?.count || 0}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => openQueue('finance')}
                        className="p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/20 text-left hover:shadow-sm transition-all"
                        type="button"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Service Finance</p>
                            <p className="text-xs text-slate-500">Factures</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{statsData.byBureau[1]?.count || 0}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => openQueue('juridique')}
                        className="p-4 rounded-lg border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-950/20 text-left hover:shadow-sm transition-all"
                        type="button"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">Service Juridique</p>
                            <p className="text-xs text-slate-500">Avenants</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{statsData.byBureau[2]?.count || 0}</span>
                        </div>
                      </button>
                    </div>
                  </section>
                )}

                {/* Par type de document */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par type de document
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { type: 'bc', label: 'Bons de commande', icon: FileText, color: 'blue' },
                        { type: 'facture', label: 'Factures', icon: Receipt, color: 'emerald' },
                        { type: 'avenant', label: 'Avenants', icon: FileEdit, color: 'purple' },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            onClick={() => openQueue(item.type)}
                            className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            type="button"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={cn('w-5 h-5', `text-${item.color}-500`)} />
                              <div>
                                <p className="text-sm text-slate-500">{item.label}</p>
                                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                  {statsData.byType[i]?.count || 0}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
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
                      onClick={() => setMultiLevelValidationOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Shield className="w-5 h-5 text-blue-500 mb-2" />
                      <p className="font-medium text-sm">Multi-niveaux</p>
                      <p className="text-xs text-slate-500">Chaîne validation</p>
                    </button>
                    <button
                      onClick={() => setRequestJustificatifOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <FileText className="w-5 h-5 text-orange-500 mb-2" />
                      <p className="font-medium text-sm">Justificatifs</p>
                      <p className="text-xs text-slate-500">Demandes pièces</p>
                    </button>
                    <button
                      onClick={() => setWorkflowOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Workflow className="w-5 h-5 text-purple-500 mb-2" />
                      <p className="font-medium text-sm">Workflow</p>
                      <p className="text-xs text-slate-500">Moteur validation</p>
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
                      <p className="font-medium text-sm">Délégations</p>
                      <p className="text-xs text-slate-500">Pouvoirs</p>
                    </button>
                    <button
                      onClick={() => setRemindersOpen(true)}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                      type="button"
                    >
                      <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="font-medium text-sm">Rappels</p>
                      <p className="text-xs text-slate-500">Échéances</p>
                    </button>
                  </div>
                </section>

                {/* Direction Panel */}
                <ValidationBCDirectionPanel />
              </div>
            )}

            {dashboardTab === 'services' && (
              <ValidationBCServiceQueues
                onOpenDocument={openDocument}
                onValidate={handleValidateDocument}
                onReject={handleRejectDocument}
              />
            )}

            {dashboardTab === 'rules' && (
              <ValidationBCBusinessRules />
            )}

            {dashboardTab === 'history' && (
              <ValidationBCActivityHistory onViewDocument={(id) => openDocument(id, 'bc')} />
            )}

            {dashboardTab === 'favorites' && (
              <ValidationBCFavoritesPanel onOpenDocument={(id) => openDocument(id, 'bc')} />
            )}
          </div>
        ) : (
          <ValidationBCWorkspaceContent />
        )}
      </main>

      {/* ================================ */}
      {/* Command Palette (⌘K) */}
      {/* ================================ */}
      <ValidationBCCommandPalette />

      {/* Modals */}
      <ValidationBCStatsModal />
      <ValidationBCExportModal open={exportOpen} onClose={() => setExportOpen(false)} onExport={async () => { toast.success('Export', 'Téléchargement...'); }} />
      <ValidationBCQuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={(doc) => {
          toast.success('Document créé', doc.id);
          openDocument(doc.id, doc.type);
        }}
      />
      <ValidationBCTimeline open={timelineOpen} onClose={() => setTimelineOpen(false)} />
      <ValidationBCWorkflowEngine open={workflowOpen} onClose={() => setWorkflowOpen(false)} />
      <ValidationBCPredictiveAnalytics open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <ValidationBCDelegationManager open={delegationsOpen} onClose={() => setDelegationsOpen(false)} />
      <ValidationBCRemindersSystem open={remindersOpen} onClose={() => setRemindersOpen(false)} />
      <ValidationBCNotifications />
      
      {/* Advanced modals (inspired by demandes page) */}
      <ValidationBCMultiLevelValidation 
        open={multiLevelValidationOpen} 
        onClose={() => setMultiLevelValidationOpen(false)}
        onOpenDocument={openDocument}
      />
      <ValidationBCRequestJustificatif 
        open={requestJustificatifOpen} 
        onClose={() => setRequestJustificatifOpen(false)} 
      />

      {/* Validation Modal */}
      <ValidationBCValidationModal
        open={validationModalOpen}
        document={selectedDocument}
        onClose={() => { setValidationModalOpen(false); setSelectedDocument(null); }}
        onValidate={(comment) => {
          toast.success('Validation effectuée', selectedDocument?.reference || '');
          loadStats('manual');
        }}
        onReject={(reason) => {
          toast.info('Document rejeté', selectedDocument?.reference || '');
          loadStats('manual');
        }}
      />
    </div>
  );
}

// ================================
// Export
// ================================
export default function ValidationBCPage() {
  return (
    <ValidationBCToastProvider>
      <ValidationBCFavoritesProvider>
        <ValidationBCPageContent />
      </ValidationBCFavoritesProvider>
    </ValidationBCToastProvider>
  );
}
