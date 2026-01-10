'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

import {
  BarChart3,
  Command,
  Maximize,
  Minimize,
  PanelRightClose,
  PanelRight,
  MoreHorizontal,
  TrendingUp,
  Activity,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-200 dark:border-slate-700">
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
    <div className={cn('min-h-screen bg-slate-50 dark:bg-[#0f0f0f]', fullscreen && 'fixed inset-0 z-50')}>
      {/* Header minimal */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616]">
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">Analytics</h1>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline">Rechercher...</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">⌘K</kbd>
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => setShowSideRail((p) => !p)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showSideRail ? 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title="Panneau latéral"
              >
                {showSideRail ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setFullscreen((p) => !p)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Plein écran"
              >
                {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main + Side Rail */}
      <div className="flex">
        <main className={cn('flex-1 transition-all duration-200', showSideRail && 'xl:mr-72')}>
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            {showDashboard ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Tableau de bord</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Vue synthétique des indicateurs clés</p>
                  </div>
                  <FluentButton variant="secondary" size="sm" onClick={() => setMode('workspace')}>
                    <LayoutDashboard className="w-4 h-4" />
                    Workspace
                  </FluentButton>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <NavCard
                    icon={<BarChart3 className="w-5 h-5" />}
                    title="Vue d'ensemble"
                    subtitle="Synthèse globale"
                    onClick={() => openAndFocus({ id: 'dashboard:overview', type: 'dashboard', title: "Vue d'ensemble", icon: '📊', data: { view: 'overview' } })}
                  />
                  <NavCard
                    icon={<Activity className="w-5 h-5" />}
                    title="Performance"
                    subtitle="KPIs opérationnels"
                    onClick={() => openAndFocus({ id: 'inbox:performance', type: 'inbox', title: 'Performance', icon: '⚡', data: { queue: 'performance' } })}
                  />
                  <NavCard
                    icon={<DollarSign className="w-5 h-5" />}
                    title="Financier"
                    subtitle="Budget & dépenses"
                    onClick={() => openAndFocus({ id: 'inbox:financial', type: 'inbox', title: 'Financier', icon: '💰', data: { queue: 'financial' } })}
                  />
                  <NavCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Tendances"
                    subtitle="Évolutions"
                    onClick={() => openAndFocus({ id: 'inbox:trends', type: 'inbox', title: 'Tendances', icon: '📈', data: { queue: 'trends' } })}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                  <AnalyticsWorkspaceContent />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hasTabs && <AnalyticsWorkspaceTabs />}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] overflow-hidden">
                  <AnalyticsWorkspaceContent />
                </div>
              </div>
            )}
          </div>
        </main>

        {showSideRail && (
          <aside className="hidden xl:block fixed right-0 top-14 bottom-0 w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616] overflow-y-auto">
            <AnalyticsSideRailClean onOpenView={openAndFocus} />
          </aside>
        )}
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
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Navigation</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="⌘K" label="Rechercher / Commandes" />
              <ShortcutRow shortcut="⌘1-5" label="Accès rapide aux vues" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Actions</h3>
            <div className="space-y-1">
              <ShortcutRow shortcut="⌘S" label="Statistiques" />
              <ShortcutRow shortcut="⌘E" label="Export" />
              <ShortcutRow shortcut="⌘⇧R" label="Rapport" />
              <ShortcutRow shortcut="F11" label="Plein écran" />
              <ShortcutRow shortcut="Esc" label="Fermer" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Outils</h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setShowHelp(false); setStatsModalOpen(true); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Statistiques</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setExportModalOpen(true); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setReportModalOpen(true); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rapports</span>
              </button>
              <button type="button" onClick={() => { setShowHelp(false); setAlertConfigModalOpen(true); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Alertes</span>
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
      className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-left group"
    >
      <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{icon}</div>
      <div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</div>
        <div className="text-xs text-slate-400">{subtitle}</div>
      </div>
    </button>
  );
}
