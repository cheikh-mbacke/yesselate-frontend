'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';

import { AnalyticsWorkspaceTabs } from '@/components/features/bmo/analytics/workspace/AnalyticsWorkspaceTabs';
import { AnalyticsWorkspaceContent } from '@/components/features/bmo/analytics/workspace/AnalyticsWorkspaceContent';
import { AnalyticsCommandPalette } from '@/components/features/bmo/analytics/workspace/AnalyticsCommandPalette';
import { AnalyticsStatsModal } from '@/components/features/bmo/analytics/workspace/AnalyticsStatsModal';
import { AnalyticsExportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsExportModal';
import { AnalyticsAlertConfigModal } from '@/components/features/bmo/analytics/workspace/AnalyticsAlertConfigModal';
import { AnalyticsReportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsReportModal';
import { AnalyticsSideRailClean } from '@/components/features/bmo/analytics/workspace/AnalyticsSideRailClean';

import { FluentButton } from '@/components/ui/fluent-button';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';

import {
  BarChart3,
  Command,
  Maximize,
  Minimize,
  PanelRightClose,
  PanelRight,
  ChevronLeft,
  TrendingUp,
  Activity,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MoreHorizontal,
  Keyboard,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsAPI } from '@/lib/api/pilotage/analyticsClient';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';

type Mode = 'dashboard' | 'workspace';

const UI_PREF_KEY = 'bmo.analytics.ui.v2';

function readUIPrefs() {
  try {
    const raw = localStorage.getItem(UI_PREF_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeUIPrefs(p: Record<string, unknown>) {
  try {
    localStorage.setItem(UI_PREF_KEY, JSON.stringify(p));
  } catch {
    // no-op
  }
}

function ShortcutRow({ shortcut, label }: { shortcut: string; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">
        {shortcut}
      </kbd>
    </div>
  );
}

function ignoreIfTyping(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName?.toLowerCase();
  if (target?.isContentEditable) return true;
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  return false;
}

type KpiCard = {
  id: string;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
};

export default function AnalyticsPage() {
  const { openTab, tabs, activeTabId, openCommandPalette } = useAnalyticsWorkspaceStore();

  const [mode, setMode] = useState<Mode>('dashboard');
  const [fullscreen, setFullscreen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [alertConfigModalOpen, setAlertConfigModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSideRail, setShowSideRail] = useState(false);
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: kpiData,
    isLoading: kpisLoading,
    error: kpisError,
    refetch: refetchKpis,
  } = useApiQuery(async (_signal: AbortSignal) => analyticsAPI.getKpis(), []);

  const kpiCards: KpiCard[] = useMemo(() => {
    const kpis = kpiData?.kpis ?? [];
    return kpis.slice(0, 6).map((k) => ({
      id: k.id,
      label: k.name,
      value: `${k.value}${k.unit ?? ''}`,
      status: (k.status as any) || 'neutral',
    }));
  }, [kpiData]);

  // Init prefs
  useEffect(() => {
    const p = readUIPrefs();
    if (p) {
      if (p.mode) setMode(p.mode);
      if (typeof p.fullscreen === 'boolean') setFullscreen(p.fullscreen);
      if (typeof p.showSideRail === 'boolean') setShowSideRail(p.showSideRail);
    }
  }, []);

  // Persist prefs
  useEffect(() => {
    writeUIPrefs({ mode, fullscreen, showSideRail });
  }, [mode, fullscreen, showSideRail]);

  // Fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

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

  const hasTabs = tabs.length > 0 && !!activeTabId;
  const showDashboard = mode === 'dashboard' && !hasTabs;

  const openAndFocus = useCallback(
    (tab: Parameters<typeof openTab>[0]) => {
      openTab(tab);
      if (mode === 'dashboard') setMode('workspace');
    },
    [openTab, mode]
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.resolve(refetchKpis?.()).finally(() => {
      setTimeout(() => setIsRefreshing(false), 350);
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (ignoreIfTyping(e)) return;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setStatsModalOpen(true);
        return;
      }

      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setReportModalOpen(true);
        return;
      }

      if (mod && !e.shiftKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const views = [
          { id: 'dashboard:overview', type: 'dashboard' as const, title: "Vue d'ensemble", icon: '📊', data: { view: 'overview' } },
          { id: 'inbox:performance', type: 'inbox' as const, title: 'Performance', icon: '⚡', data: { queue: 'performance' } },
          { id: 'inbox:financial', type: 'inbox' as const, title: 'Financier', icon: '💰', data: { queue: 'financial' } },
          { id: 'inbox:trends', type: 'inbox' as const, title: 'Tendances', icon: '📈', data: { queue: 'trends' } },
          { id: 'inbox:alerts', type: 'inbox' as const, title: 'Alertes', icon: '⚠️', data: { queue: 'alerts' } },
        ];
        const idx = parseInt(e.key) - 1;
        if (views[idx]) openAndFocus(views[idx]);
        return;
      }

      if (e.key === 'F11' || (mod && e.shiftKey && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setFullscreen((p) => !p);
        return;
      }

      if (e.key === '?' && !mod) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setStatsModalOpen(false);
        setExportModalOpen(false);
        setAlertConfigModalOpen(false);
        setReportModalOpen(false);
        setShowHelp(false);
        if (fullscreen) setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openCommandPalette, openAndFocus, fullscreen]);

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Collapsible */}
      <aside
        className={cn(
          'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
          showSideRail ? 'w-64' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          {showSideRail && (
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-slate-200 text-sm">Analytics</span>
            </div>
          )}
          {!showSideRail && (
            <BarChart3 className="h-5 w-5 text-blue-400 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSideRail(!showSideRail)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            {showSideRail ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Trigger */}
        {showSideRail && (
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
              { id: 'overview', icon: BarChart3, label: "Vue d'ensemble", color: 'text-blue-400' },
              { id: 'performance', icon: Activity, label: 'Performance', color: 'text-emerald-400' },
              { id: 'financial', icon: DollarSign, label: 'Financier', color: 'text-amber-400' },
              { id: 'trends', icon: TrendingUp, label: 'Tendances', color: 'text-purple-400' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => openAndFocus({
                  id: `inbox:${item.id}`,
                  type: 'inbox',
                  title: item.label,
                  icon: '📊',
                  data: { queue: item.id },
                })}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {showSideRail && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3">
          {showSideRail && (
            <div className="text-xs text-slate-500 text-center">
              Analytics v2.0
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
            <h1 className="text-base font-semibold text-slate-200">Analytics & Rapports</h1>
            <span className="px-2 py-0.5 text-xs rounded bg-slate-800/50 text-slate-300 border border-slate-700/50">
              v2.0
            </span>
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

            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* KPI Bar */}
        <div className="bg-slate-900/40 border-b border-slate-700/40">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Indicateurs temps réel
              </span>
              <span className="text-xs text-slate-600">
                Mise à jour: il y a 2 min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
              >
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
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

          {!kpiCollapsed && (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-slate-800/30 p-px">
              {kpisLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-900/60 px-3 py-2 animate-pulse">
                    <div className="h-3 w-20 bg-slate-700/60 rounded mb-2" />
                    <div className="h-5 w-14 bg-slate-700/60 rounded" />
                  </div>
                ))
              ) : kpisError ? (
                <div className="col-span-3 lg:col-span-6 bg-slate-900/60 px-3 py-2">
                  <p className="text-xs text-slate-500">KPIs indisponibles</p>
                  <p className="text-sm text-slate-300 mt-1">{kpisError.message}</p>
                </div>
              ) : (
                kpiCards.map((kpi) => {
                  const dot =
                    kpi.status === 'critical'
                      ? 'bg-rose-400'
                      : kpi.status === 'warning'
                      ? 'bg-amber-400'
                      : kpi.status === 'good'
                      ? 'bg-emerald-400'
                      : 'bg-slate-500';

                  return (
                    <button
                      key={kpi.id}
                      type="button"
                      onClick={openCommandPalette}
                      className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer text-left"
                      title="Ouvrir la palette (⌘K) pour drill-down"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
                        <p className="text-xs text-slate-500 truncate">{kpi.label}</p>
                      </div>
                      <span className="text-lg font-bold text-slate-200">{kpi.value}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            {showDashboard ? (
              <div className="space-y-6">
                {/* Poste de contrôle */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">
                        Poste de contrôle Analytics
                      </h2>
                      <p className="text-slate-400 max-w-2xl">
                        Surveillez les KPIs clés, analysez les tendances et générez des rapports détaillés
                        pour piloter l&apos;activité avec précision.
                      </p>
                    </div>
                    <FluentButton variant="primary" onClick={() => setMode('workspace')}>
                      Ouvrir Workspace
                    </FluentButton>
                  </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <NavCard
                    icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
                    title="Vue d'ensemble"
                    subtitle="Synthèse globale"
                    onClick={() => openAndFocus({ id: 'dashboard:overview', type: 'dashboard', title: "Vue d'ensemble", icon: '📊', data: { view: 'overview' } })}
                  />
                  <NavCard
                    icon={<Activity className="w-5 h-5 text-emerald-400" />}
                    title="Performance"
                    subtitle="KPIs opérationnels"
                    onClick={() => openAndFocus({ id: 'inbox:performance', type: 'inbox', title: 'Performance', icon: '⚡', data: { queue: 'performance' } })}
                  />
                  <NavCard
                    icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                    title="Financier"
                    subtitle="Budget & dépenses"
                    onClick={() => openAndFocus({ id: 'inbox:financial', type: 'inbox', title: 'Financier', icon: '💰', data: { queue: 'financial' } })}
                  />
                  <NavCard
                    icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                    title="Tendances"
                    subtitle="Évolutions"
                    onClick={() => openAndFocus({ id: 'inbox:trends', type: 'inbox', title: 'Tendances', icon: '📈', data: { queue: 'trends' } })}
                  />
                </div>

                {/* Content */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
                  <AnalyticsWorkspaceContent />
                </div>

                {/* Astuce raccourcis */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      <strong className="text-slate-300">Astuce :</strong> utilise{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘1-5</kbd>{' '}
                      pour les vues,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘K</kbd>{' '}
                      pour la palette, et{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">?</kbd>{' '}
                      pour l&apos;aide.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hasTabs && <AnalyticsWorkspaceTabs />}
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
                  <AnalyticsWorkspaceContent />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Màj: à l&apos;instant</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">Performance • Financier • Tendances • Alertes</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Connecté</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AnalyticsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
      <AnalyticsExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <AnalyticsAlertConfigModal open={alertConfigModalOpen} onClose={() => setAlertConfigModalOpen(false)} />
      <AnalyticsReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <AnalyticsCommandPalette />

      {/* Help Modal */}
      <FluentModal open={showHelp} onClose={() => setShowHelp(false)} title="Raccourcis & Actions">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Navigation</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="⌘K" label="Rechercher / Commandes" />
              <ShortcutRow shortcut="⌘1-5" label="Accès rapide aux vues" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Actions</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="⌘S" label="Statistiques" />
              <ShortcutRow shortcut="⌘E" label="Export" />
              <ShortcutRow shortcut="⌘⇧R" label="Rapport" />
              <ShortcutRow shortcut="F11" label="Plein écran" />
              <ShortcutRow shortcut="Esc" label="Fermer" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Outils</h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setShowHelp(false); setStatsModalOpen(true); }} className="p-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-300">Statistiques</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setExportModalOpen(true); }} className="p-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-300">Export</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setReportModalOpen(true); }} className="p-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-300">Rapports</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setAlertConfigModalOpen(true); }} className="p-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-300">Alertes</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <FluentButton variant="secondary" onClick={() => setShowHelp(false)} className="w-full">Fermer</FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

function NavCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50 transition-all text-left group"
    >
      <div className="text-slate-500 group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <div className="text-sm font-medium text-slate-200">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </button>
  );
}
