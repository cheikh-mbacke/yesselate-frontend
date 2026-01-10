'use client';

import { useState, useEffect, useCallback } from 'react';
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
  MoreHorizontal,
  Download,
  Keyboard,
  Command,
  PanelRight,
  PanelRightClose,
  LayoutDashboard,
  ClipboardList,
  Maximize,
  Minimize,
  RefreshCw,
  Gavel,
  GitBranch,
  Users,
} from 'lucide-react';

export default function ArbitragesVivantsPage() {
  const {
    openTab,
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    directionPanelOpen,
    setDirectionPanelOpen,
    viewMode,
    setViewMode,
  } = useArbitragesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
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

  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
    setViewMode('workspace');
  }, [openTab, setViewMode]);

  const handleExport = useCallback(async () => {
    addToast('Export des arbitrages en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); }
      if (e.key === 'Escape') { if (commandPaletteOpen) setCommandPaletteOpen(false); }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); }
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setStatsModalOpen(true); }
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleExport(); }
      if (e.key === 'F11') { e.preventDefault(); setFullscreen(f => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh, setStatsModalOpen, handleExport]);

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-orange-50/20 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-orange-950/10", fullscreen && "fixed inset-0 z-50")}>
      {/* Header */}
      <header className="flex-none border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Arbitrages & Goulots</h1>
                <p className="text-sm text-slate-500">Gestion des conflits et résolution des blocages</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button onClick={() => setViewMode('dashboard')} className={cn("p-2 rounded-md transition-colors", viewMode === 'dashboard' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700")} title="Dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('workspace')} className={cn("p-2 rounded-md transition-colors", viewMode === 'workspace' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700")} title="Workspace">
                  <ClipboardList className="w-4 h-4" />
                </button>
              </div>

              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 hover:border-orange-500/50 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher...</span>
                <kbd className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">⌘K</kbd>
              </button>

              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Rafraîchir (⌘R)">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>

              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Statistiques (⌘I)">
                <BarChart3 className="w-4 h-4 text-slate-500" />
              </button>

              <button onClick={() => setDirectionPanelOpen(!directionPanelOpen)} className={cn("p-2.5 rounded-xl border transition-colors", directionPanelOpen ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500")} title="Panneau de pilotage">
                {directionPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              </button>

              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Plein écran (F11)">
                {fullscreen ? <Minimize className="w-4 h-4 text-slate-500" /> : <Maximize className="w-4 h-4 text-slate-500" />}
              </button>

              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </button>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-20 py-2">
                      <button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Download className="w-4 h-4 text-slate-400" />Exporter (⌘E)
                      </button>
                      <button onClick={() => { setCommandPaletteOpen(true); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Command className="w-4 h-4 text-slate-400" />Palette de commande
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir • ⌘I stats</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'workspace' && (
          <div className="px-6 pb-2">
            <ArbitragesWorkspaceTabs />
          </div>
        )}
      </header>

      {/* Content */}
      <main className={cn("flex-1 overflow-auto", directionPanelOpen && "mr-80")}>
        <div className="p-6 space-y-6">
          <ArbitragesLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />

          {viewMode === 'workspace' ? (
            <ArbitragesWorkspaceContent />
          ) : (
            <DashboardView onOpenQueue={handleOpenQueue} />
          )}
        </div>
      </main>

      <ArbitragesDirectionPanel open={directionPanelOpen} onClose={() => setDirectionPanelOpen(false)} />
      <ArbitragesCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />
      <ArbitragesStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
    </div>
  );
}

function DashboardView({ onOpenQueue }: { onOpenQueue: (queue: string, title: string, icon: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onOpenQueue('critical', 'Critiques', '⚡')}>
        <Gavel className="w-8 h-8 text-red-500 mb-3" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Arbitrages Critiques</h3>
        <p className="text-sm text-slate-500">Décisions urgentes requises par la DG</p>
      </div>
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onOpenQueue('goulot', 'Goulots', '🔀')}>
        <GitBranch className="w-8 h-8 text-orange-500 mb-3" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Goulots d'Étranglement</h3>
        <p className="text-sm text-slate-500">Points de blocage identifiés dans les workflows</p>
      </div>
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onOpenQueue('conflit', 'Conflits', '👥')}>
        <Users className="w-8 h-8 text-rose-500 mb-3" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Conflits Inter-Bureaux</h3>
        <p className="text-sm text-slate-500">Désaccords nécessitant médiation</p>
      </div>
    </div>
  );
}
