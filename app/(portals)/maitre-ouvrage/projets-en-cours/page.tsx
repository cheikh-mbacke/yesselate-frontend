/**
 * ====================================================================
 * PAGE: Projets en Cours - BMO
 * ====================================================================
 * 
 * Refonte complète avec architecture workspace sophistiquée.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProjetsWorkspaceStore } from '@/lib/stores/projetsWorkspaceStore';
import { projetsApiService, type ProjetsStats } from '@/lib/services/projetsApiService';
import {
  ProjetsWorkspaceTabs,
  ProjetsWorkspaceContent,
  ProjetsLiveCounters,
  ProjetsCommandPalette,
} from '@/components/features/bmo/workspace/projets';
import { Building2, Search, MoreVertical, RefreshCw, BarChart3, Download, HelpCircle, ToggleLeft, ToggleRight, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjetsEnCoursPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen } = useProjetsWorkspaceStore();
  const [stats, setStats] = useState<ProjetsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const loadStats = useCallback(async (mode: 'auto' | 'manual' = 'auto') => {
    if (mode === 'manual') setStatsLoading(true);
    try {
      const data = await projetsApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats('manual'); }, [loadStats]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadStats('auto'), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); setStatsModalOpen(true); }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setHelpOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleOpenQueue = (queue: string, title: string, icon: string) => {
    openTab({ type: 'inbox', id: `inbox:${queue}`, title, icon, data: { queue } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Building2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100">Projets en cours</h1>
              {stats && (
                <span className="text-xs text-orange-500 font-medium">
                  {stats.active} actif(s) • {stats.blocked > 0 && <span className="text-red-500">{stats.blocked} bloqué(s)</span>}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">⌘K</kbd>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nouveau projet</span>
            </button>

            <button onClick={() => setStatsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <BarChart3 className="w-4 h-4 text-orange-500" /><span className="hidden sm:inline">Stats</span>
            </button>

            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button onClick={() => { loadStats('manual'); setMenuOpen(false); }} disabled={statsLoading} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", statsLoading && "animate-spin")} />Rafraîchir
                      </button>
                      <button onClick={() => { setAutoRefresh(!autoRefresh); setMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <span className="flex items-center gap-3">{autoRefresh ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}Auto-refresh</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded", autoRefresh ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>{autoRefresh ? 'ON' : 'OFF'}</span>
                      </button>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Download className="w-4 h-4 text-orange-500" />Exporter
                      </button>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                      <button onClick={() => { setHelpOpen(true); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <HelpCircle className="w-4 h-4 text-slate-400" />Aide<kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">?</kbd>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="mb-6"><ProjetsLiveCounters onOpenQueue={handleOpenQueue} /></div>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
          <div className="border-b border-slate-200/70 dark:border-slate-800 px-4 py-2"><ProjetsWorkspaceTabs /></div>
          <div className="p-6"><ProjetsWorkspaceContent /></div>
        </div>
      </main>

      {/* Command Palette */}
      <ProjetsCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={() => loadStats('manual')} />

      {/* Stats Modal */}
      {statsModalOpen && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Projets</h2>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-xs text-slate-500 mb-1">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
              <div className="p-4 rounded-xl bg-amber-500/10"><p className="text-xs text-slate-500 mb-1">En cours</p><p className="text-2xl font-bold text-amber-600">{stats.active}</p></div>
              <div className="p-4 rounded-xl bg-red-500/10"><p className="text-xs text-slate-500 mb-1">Bloqués</p><p className="text-2xl font-bold text-red-600">{stats.blocked}</p></div>
              <div className="p-4 rounded-xl bg-emerald-500/10"><p className="text-xs text-slate-500 mb-1">Terminés</p><p className="text-2xl font-bold text-emerald-600">{stats.completed}</p></div>
              <div className="p-4 rounded-xl bg-blue-500/10"><p className="text-xs text-slate-500 mb-1">Avancement moy.</p><p className="text-2xl font-bold text-blue-600">{stats.avgProgress}%</p></div>
              <div className="p-4 rounded-xl bg-orange-500/10"><p className="text-xs text-slate-500 mb-1">Budget total</p><p className="text-lg font-bold text-orange-600">{projetsApiService.formatMontant(stats.totalBudget)} FCFA</p></div>
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
              <button onClick={() => setHelpOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: '⌘K', action: 'Palette de commandes' },
                { key: '⌘I', action: 'Statistiques' },
                { key: '⌘1', action: 'Tous les projets' },
                { key: '⌘2', action: 'Projets bloqués' },
                { key: '?', action: 'Aide' },
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
