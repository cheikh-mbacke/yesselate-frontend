'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLitigesWorkspaceStore } from '@/lib/stores/litigesWorkspaceStore';
import { litigesApiService } from '@/lib/services/litigesApiService';
import { useBMOStore } from '@/lib/stores';
import { LitigesWorkspaceTabs, LitigesLiveCounters, LitigesCommandPalette, LitigesWorkspaceContent } from '@/components/features/bmo/workspace/litiges';
import { Scale, Search, RefreshCw, BarChart3, MoreHorizontal, Download, Keyboard, Command } from 'lucide-react';

export default function LitigesPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen, statsModalOpen, setStatsModalOpen } = useLitigesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    addToast('Données rafraîchies', 'success');
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'litiges',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des données litiges',
      bureau: 'BJ',
    });
  }, [addToast, addActionLog, currentUser]);

  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
  }, [openTab]);

  const handleExport = useCallback(async () => {
    addToast('Export des litiges en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); }
      if (e.key === 'Escape' && commandPaletteOpen) { setCommandPaletteOpen(false); }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="flex-none border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Contentieux & Litiges</h1>
                <p className="text-sm text-slate-500">Gestion des affaires juridiques</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Palette Button */}
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 hover:border-red-500/50 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher...</span>
                <kbd className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">⌘K</kbd>
              </button>

              {/* Refresh Button */}
              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Rafraîchir">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>

              {/* Stats Button */}
              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Statistiques">
                <BarChart3 className="w-4 h-4 text-slate-500" />
              </button>

              {/* More Menu */}
              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </button>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-20 py-2">
                      <button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Download className="w-4 h-4 text-slate-400" />Exporter les litiges
                      </button>
                      <button onClick={() => { setCommandPaletteOpen(true); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <Command className="w-4 h-4 text-slate-400" />Palette de commande
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-2">
          <LitigesWorkspaceTabs />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Live Counters */}
          <LitigesLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />

          {/* Workspace Content */}
          <LitigesWorkspaceContent />
        </div>
      </main>

      {/* Command Palette */}
      <LitigesCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />

      {/* Stats Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-3xl mx-4 rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-[#1f1f1f] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10"><BarChart3 className="w-5 h-5 text-red-500" /></div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Litiges</h2>
              </div>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-3xl font-bold text-red-600">12</p>
                  <p className="text-sm text-slate-500 mt-1">Litiges actifs</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-bold text-amber-600">4</p>
                  <p className="text-sm text-slate-500 mt-1">Audiences prévues</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-600">8</p>
                  <p className="text-sm text-slate-500 mt-1">Litiges clos</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Exposition totale</h4>
                <p className="text-2xl font-mono font-bold text-red-600">1.25 Md FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
