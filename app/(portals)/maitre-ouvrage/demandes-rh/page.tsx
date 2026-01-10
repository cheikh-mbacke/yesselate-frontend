'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRHWorkspaceStore } from '@/lib/stores/rhWorkspaceStore';

import { RHWorkspaceTabs } from '@/components/features/bmo/workspace/rh/RHWorkspaceTabs';
import { RHWorkspaceContent } from '@/components/features/bmo/workspace/rh/RHWorkspaceContent';
import { RHLiveCounters } from '@/components/features/bmo/workspace/rh/RHLiveCounters';
import { RHCommandPalette } from '@/components/features/bmo/workspace/rh/RHCommandPalette';
import { RHStatsModal } from '@/components/features/bmo/workspace/rh/RHStatsModal';
import { RHExportModal } from '@/components/features/bmo/workspace/rh/RHExportModal';
import { RHMetricsDashboard } from '@/components/features/bmo/workspace/rh/RHMetricsDashboard';
import { RHAbsenceCalendar } from '@/components/features/bmo/workspace/rh/RHAbsenceCalendar';
import { RHActivityHistory } from '@/components/features/bmo/workspace/rh/RHActivityHistory';
import { RHFavoritesProvider, RHFavoritesPanel } from '@/components/features/bmo/workspace/rh/RHFavorites';
import { RHWorkflowEngine } from '@/components/features/bmo/workspace/rh/RHWorkflowEngine';
import { RHPredictiveAnalytics } from '@/components/features/bmo/workspace/rh/RHPredictiveAnalytics';
import { RHDelegationManager } from '@/components/features/bmo/workspace/rh/RHDelegationManager';
import { RHRemindersSystem } from '@/components/features/bmo/workspace/rh/RHRemindersSystem';
import { RHMultiLevelValidation } from '@/components/features/bmo/workspace/rh/RHMultiLevelValidation';
import { RHQuickCreateModal } from '@/components/features/bmo/workspace/rh/RHQuickCreateModal';
import { RHAgentsManagerModal } from '@/components/features/bmo/workspace/rh/RHAgentsManagerModal';
import { RHHelpModal } from '@/components/features/bmo/workspace/rh/RHHelpModal';
import { RHBudgetManagerModal } from '@/components/features/bmo/workspace/rh/RHBudgetManagerModal';
import { RHReportsModal } from '@/components/features/bmo/workspace/rh/RHReportsModal';
import { RHToastProvider, useRHToast } from '@/components/features/bmo/workspace/rh/RHToast';

import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  LayoutDashboard,
  Calendar,
  History,
  Star,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ================================
// Types
// ================================
interface RHStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  overdueSLA: number;
  byType: { type: string; count: number }[];
  ts: string;
}

type ViewMode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'calendar' | 'history' | 'favorites';
type LoadReason = 'init' | 'manual' | 'auto';

interface UIState {
  viewMode: ViewMode;
  dashboardTab: DashboardTab;
  autoRefresh: boolean;
}

const UI_PREF_KEY = 'bmo.rh.ui.v3';

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
      dashboardTab: ['calendar', 'history', 'favorites'].includes(p.dashboardTab as string) ? p.dashboardTab as DashboardTab : 'overview',
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
// Semantic colors (business logic)
// ================================
// Rouge/Rose : Bloqué, rejeté, critique, hors délai
// Orange/Ambre : Attention, urgent, action requise
// Vert : Validé, conforme, terminé
// Bleu : Information, en cours, neutre
// Gris : Inactif, archivé, secondaire

const STATUS_COLORS = {
  blocked: 'text-red-600 dark:text-red-400',
  urgent: 'text-amber-600 dark:text-amber-400',
  pending: 'text-slate-600 dark:text-slate-400',
  validated: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-blue-600 dark:text-blue-400',
} as const;

const BG_STATUS = {
  blocked: 'bg-red-50 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/30',
  urgent: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30',
  pending: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50',
  validated: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30',
} as const;

// ================================
// Main Component
// ================================
function DemandesRHPageContent() {
  const { tabs, openTab } = useRHWorkspaceStore();
  const toast = useRHToast();
  const searchParams = useSearchParams();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [initialTabHandled, setInitialTabHandled] = useState(false);

  // Stats state
  const [statsData, setStatsData] = useState<RHStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state (accessibles via ⌘K uniquement)
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [aiAnalyticsOpen, setAiAnalyticsOpen] = useState(false);
  const [delegationOpen, setDelegationOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [multiLevelOpen, setMultiLevelOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const showDashboard = viewMode === 'dashboard' && tabs.length === 0;

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

  // Handle URL tab parameter (from redirects like /depenses, /deplacements, /paie-avances)
  useEffect(() => {
    if (initialTabHandled) return;
    
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabMapping: Record<string, { queue: string; title: string }> = {
        'depenses': { queue: 'Dépense', title: 'Dépenses' },
        'deplacements': { queue: 'Déplacement', title: 'Déplacements' },
        'paie-avances': { queue: 'Avance', title: 'Avances & Paie' },
        'conges': { queue: 'Congé', title: 'Congés' },
        'maladies': { queue: 'Maladie', title: 'Maladies' },
      };

      const mapping = tabMapping[tabParam];
      if (mapping) {
        openTab({
          id: `inbox:${mapping.queue}`,
          type: 'inbox',
          title: mapping.title,
          icon: '📋',
          data: { queue: mapping.queue },
        });
        setViewMode('workspace');
      }
      setInitialTabHandled(true);
    }
  }, [searchParams, openTab, initialTabHandled]);

  useEffect(() => {
    writeUIState({ viewMode, dashboardTab, autoRefresh });
  }, [viewMode, dashboardTab, autoRefresh]);

  // ================================
  // Callbacks
  // ================================
  const openQueue = useCallback(
    (queue: string) => {
      const titles: Record<string, string> = {
        pending: 'À traiter',
        urgent: 'Urgentes',
        validated: 'Validées',
        rejected: 'Rejetées',
        Congé: 'Congés',
        Dépense: 'Dépenses',
        Déplacement: 'Déplacements',
      };
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title: titles[queue] || queue,
        icon: '📋',
        data: { queue },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const openDemand = useCallback(
    (id: string) => {
      openTab({
        type: 'demande-rh',
        id: `demand:${id}`,
        title: id,
        icon: '📄',
        data: { demandeId: id },
      });
      if (viewMode === 'dashboard') setViewMode('workspace');
    },
    [openTab, viewMode]
  );

  const closeAllOverlays = useCallback(() => {
    setCommandOpen(false);
    setHelpOpen(false);
    setStatsModalOpen(false);
    setExportOpen(false);
    setWorkflowOpen(false);
    setAiAnalyticsOpen(false);
    setDelegationOpen(false);
    setRemindersOpen(false);
    setMultiLevelOpen(false);
    setQuickCreateOpen(false);
    setAgentsOpen(false);
    setBudgetOpen(false);
    setReportsOpen(false);
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

        const mockStats: RHStats = {
          total: 234,
          pending: 23,
          validated: 178,
          rejected: 12,
          urgent: 5,
          overdueSLA: 3,
          byType: [
            { type: 'Congés', count: 89 },
            { type: 'Dépenses', count: 67 },
            { type: 'Déplacements', count: 45 },
            { type: 'Maladies', count: 23 },
            { type: 'Avances', count: 10 },
          ],
          ts: new Date().toISOString(),
        };

        setStatsData(mockStats);
        if (reason === 'manual') {
          toast.success('Données actualisées', `${mockStats.total} demandes`);
        }
      } catch {
        if (reason === 'manual') {
          toast.error('Erreur', 'Impossible de charger les données');
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

  // Keyboard shortcuts (tout passe par ⌘K sauf navigation de base)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Palette (point d'entrée principal)
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      // Escape - Fermer
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllOverlays();
        return;
      }

      // ? - Aide
      if (e.key === '?' && !isMod) {
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllOverlays]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'calendar' as DashboardTab, label: 'Calendrier', icon: Calendar },
    { id: 'history' as DashboardTab, label: 'Historique', icon: History },
    { id: 'favorites' as DashboardTab, label: 'Suivis', icon: Star },
  ], []);

  // ================================
  // Render
  // ================================
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header minimaliste */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <h1 className="font-semibold text-slate-900 dark:text-slate-100">Demandes RH</h1>
            {statsData && (
              <span className="text-sm text-slate-500">
                {statsData.pending} en attente
              </span>
            )}
          </div>

          {/* Barre de recherche (ouvre ⌘K) */}
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
        {/* Tabs workspace si onglets ouverts */}
        {(viewMode === 'workspace' || tabs.length > 0) && (
          <div className="mb-6">
            <RHWorkspaceTabs />
          </div>
        )}

        {showDashboard ? (
          <div className="space-y-8">
            {/* Navigation dashboard */}
            <nav className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
              {dashboardTabs.map((t) => {
                const Icon = t.icon;
                const isActive = dashboardTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDashboardTab(t.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                      isActive
                        ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100'
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

            {/* Contenu dashboard */}
            {dashboardTab === 'overview' && (
              <div className="space-y-8">
                {/* Alertes critiques (si présentes) */}
                {statsData && statsData.overdueSLA > 0 && (
                  <div className={cn('p-4 rounded-lg border', BG_STATUS.blocked)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={cn('w-5 h-5', STATUS_COLORS.blocked)} />
                        <div>
                          <p className={cn('font-medium', STATUS_COLORS.blocked)}>
                            {statsData.overdueSLA} demande{statsData.overdueSLA > 1 ? 's' : ''} hors délai
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Dépassement du délai de traitement standard
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openQueue('pending')}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* À traiter */}
                  <button
                    onClick={() => openQueue('pending')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.pending > 0 ? BG_STATUS.pending : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50'
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">À traiter</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.pending ?? '—'}
                    </p>
                  </button>

                  {/* Urgentes */}
                  <button
                    onClick={() => openQueue('urgent')}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                      statsData && statsData.urgent > 0 ? BG_STATUS.urgent : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50'
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={cn('w-4 h-4', statsData && statsData.urgent > 0 ? STATUS_COLORS.urgent : 'text-slate-400')} />
                      <span className="text-sm text-slate-500">Urgentes</span>
                    </div>
                    <p className={cn(
                      'text-2xl font-semibold',
                      statsData && statsData.urgent > 0 ? STATUS_COLORS.urgent : 'text-slate-900 dark:text-slate-100'
                    )}>
                      {statsData?.urgent ?? '—'}
                    </p>
                  </button>

                  {/* Validées */}
                  <button
                    onClick={() => openQueue('validated')}
                    className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Validées</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.validated ?? '—'}
                    </p>
                  </button>

                  {/* Rejetées */}
                  <button
                    onClick={() => openQueue('rejected')}
                    className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-left transition-all hover:shadow-sm"
                    type="button"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Rejetées</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {statsData?.rejected ?? '—'}
                    </p>
                  </button>
                </div>

                {/* Répartition par type */}
                {statsData && (
                  <section>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                      Par type de demande
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {statsData.byType.map((item) => (
                        <button
                          key={item.type}
                          onClick={() => openQueue(item.type)}
                          className="p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                          type="button"
                        >
                          <p className="text-sm text-slate-500 mb-1">{item.type}</p>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {item.count}
                          </p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Indicateurs de performance */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Indicateurs
                  </h2>
                  <RHMetricsDashboard />
                </section>

                {/* Compteurs détaillés */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Files de traitement
                  </h2>
                  <RHLiveCounters onOpenQueue={openQueue} />
                </section>
              </div>
            )}

            {dashboardTab === 'calendar' && (
              <RHAbsenceCalendar />
            )}

            {dashboardTab === 'history' && (
              <RHActivityHistory />
            )}

            {dashboardTab === 'favorites' && (
              <RHFavoritesPanel onOpenDemand={openDemand} />
            )}
          </div>
        ) : (
          <RHWorkspaceContent />
        )}
      </main>

      {/* ================================ */}
      {/* Palette de commandes (⌘K) */}
      {/* Point d'accès unique à toutes les fonctionnalités */}
      {/* ================================ */}
      <RHCommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      {/* Modales (accessibles via ⌘K) */}
      <RHStatsModal open={statsModalOpen} onOpenChange={setStatsModalOpen} />
      <RHExportModal open={exportOpen} onOpenChange={setExportOpen} />
      <RHHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <RHWorkflowEngine open={workflowOpen} onClose={() => setWorkflowOpen(false)} />
      <RHPredictiveAnalytics open={aiAnalyticsOpen} onClose={() => setAiAnalyticsOpen(false)} />
      <RHDelegationManager open={delegationOpen} onClose={() => setDelegationOpen(false)} />
      <RHRemindersSystem open={remindersOpen} onClose={() => setRemindersOpen(false)} />
      <RHMultiLevelValidation open={multiLevelOpen} onClose={() => setMultiLevelOpen(false)} />
      <RHQuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={(demande) => toast.success('Demande créée', `Numéro: ${demande.numero}`)}
      />
      <RHAgentsManagerModal open={agentsOpen} onClose={() => setAgentsOpen(false)} />
      <RHBudgetManagerModal open={budgetOpen} onClose={() => setBudgetOpen(false)} />
      <RHReportsModal open={reportsOpen} onClose={() => setReportsOpen(false)} />
    </div>
  );
}

// ================================
// Export
// ================================
export default function DemandesRHPage() {
  return (
    <RHToastProvider>
      <RHFavoritesProvider>
        <DemandesRHPageContent />
      </RHFavoritesProvider>
    </RHToastProvider>
  );
}
