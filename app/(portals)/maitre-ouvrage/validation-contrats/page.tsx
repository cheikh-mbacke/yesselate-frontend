/**
 * ====================================================================
 * PAGE: Validation des Contrats - BMO
 * ====================================================================
 * 
 * Interface de validation des contrats pour le Maître d'Ouvrage.
 * Niveau de sophistication identique à la page "blocked".
 * 
 * FONCTIONNALITÉS:
 * - Workspace multi-onglets
 * - Command Palette (⌘K)
 * - Live counters avec stats temps réel
 * - Vues: Inbox, Détail, Timeline, Audit
 * - Actions: Valider, Rejeter, Négocier, Escalader
 * - Actions en lot
 * - Export multi-format
 * - Audit trail SHA-256
 * - Raccourcis clavier
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import { contratsApiService, type ContratsStats } from '@/lib/services/contratsApiService';
import {
  ContratsWorkspaceTabs,
  ContratsWorkspaceContent,
  ContratsLiveCounters,
  ContratsCommandPalette,
} from '@/components/features/bmo/workspace/contrats';
import {
  FileText, Search, Zap, MoreVertical, RefreshCw, BarChart3,
  Download, HelpCircle, ToggleLeft, ToggleRight, X, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ValidationContratsPage() {
  // Store
  const { openTab, commandPaletteOpen, setCommandPaletteOpen } = useContratsWorkspaceStore();

  // Local state
  const [stats, setStats] = useState<ContratsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Load stats
  const loadStats = useCallback(async (mode: 'auto' | 'manual' = 'auto') => {
    if (mode === 'manual') setStatsLoading(true);
    try {
      const data = await contratsApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats('manual');
  }, [loadStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadStats('auto'), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K - Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // ⌘I - Stats
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setStatsModalOpen(true);
      }
      // ? - Help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  // Handle opening queue
  const handleOpenQueue = (queue: string, title: string, icon: string) => {
    openTab({
      type: 'inbox',
      id: `inbox:${queue}`,
      title,
      icon,
      data: { queue },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-200">Validation Contrats</h1>
              {stats && stats.pending > 0 && (
                <span className="text-xs text-purple-500 font-medium">
                  {stats.pending} en attente
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">⌘K</kbd>
            </button>

            {/* Stats button */}
            <button
              onClick={() => setStatsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => { loadStats('manual'); setMenuOpen(false); }}
                        disabled={statsLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", statsLoading && "animate-spin")} />
                        Rafraîchir
                      </button>
                      
                      <button
                        onClick={() => { setAutoRefresh(!autoRefresh); setMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-3">
                          {autoRefresh ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          Auto-refresh
                        </span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded", autoRefresh ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                          {autoRefresh ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                      <button
                        onClick={() => { setExportModalOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Download className="w-4 h-4 text-purple-500" />
                        Exporter
                      </button>

                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                      <button
                        onClick={() => { setHelpOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        Aide
                        <kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">?</kbd>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Live counters */}
        <div className="mb-6">
          <ContratsLiveCounters onOpenQueue={handleOpenQueue} />
        </div>

        {/* Workspace */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200/70 dark:border-slate-800 px-4 py-2">
            <ContratsWorkspaceTabs />
          </div>

          {/* Content */}
          <div className="p-6">
            <ContratsWorkspaceContent />
          </div>
        </div>
      </main>

      {/* Command Palette */}
      <ContratsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        onRefresh={() => loadStats('manual')}
      />

      {/* Stats Modal */}
      {statsModalOpen && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setStatsModalOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques</h2>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10">
                <p className="text-xs text-slate-500 mb-1">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <p className="text-xs text-slate-500 mb-1">Validés</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.validated}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10">
                <p className="text-xs text-slate-500 mb-1">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10">
                <p className="text-xs text-slate-500 mb-1">En négociation</p>
                <p className="text-2xl font-bold text-blue-600">{stats.negotiation}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10">
                <p className="text-xs text-slate-500 mb-1">Montant total</p>
                <p className="text-lg font-bold text-purple-600">{contratsApiService.formatMontant(stats.totalMontant)} FCFA</p>
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Raccourcis clavier</h2>
              <button onClick={() => setHelpOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { key: '⌘K', action: 'Ouvrir la palette de commandes' },
                { key: '⌘I', action: 'Ouvrir les statistiques' },
                { key: '⌘1', action: 'Contrats à valider' },
                { key: '⌘2', action: 'Contrats urgents' },
                { key: '?', action: 'Afficher cette aide' },
                { key: 'ESC', action: 'Fermer la modale' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{action}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono text-slate-600 dark:text-slate-400">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
