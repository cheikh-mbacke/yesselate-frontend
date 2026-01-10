'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import {
  TicketsWorkspaceTabs,
  TicketsLiveCounters,
  TicketsCommandPalette,
  TicketsWorkspaceContent,
  TicketsStatsModal,
  TicketsDirectionPanel,
} from '@/components/features/bmo/workspace/tickets';
import {
  Ticket,
  Search,
  BarChart3,
  MoreHorizontal,
  Download,
  Keyboard,
  PanelRight,
  PanelRightClose,
  LayoutDashboard,
  ClipboardList,
  Maximize,
  Minimize,
  RefreshCw,
  Zap,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function TicketsClientsPage() {
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
  } = useTicketsWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    addToast('Données rafraîchies', 'success');
    addActionLog({ userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, action: 'audit', module: 'tickets', targetId: 'REFRESH', targetType: 'system', targetLabel: 'Rafraîchissement', details: 'Rafraîchissement manuel des tickets', bureau: 'BMO' });
  }, [addToast, addActionLog, currentUser]);

  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
    setViewMode('workspace');
  }, [openTab, setViewMode]);

  const handleExport = useCallback(async () => {
    addToast('Export des tickets en cours...', 'info');
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
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", fullscreen && "fixed inset-0 z-50")}>
      <header className="flex-none border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/20"><Ticket className="w-5 h-5 text-purple-400" /></div>
              <div><h1 className="text-xl font-bold text-slate-200">Tickets Clients</h1><p className="text-sm text-slate-400">Support et réclamations clients</p></div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-800/50">
                <button onClick={() => setViewMode('dashboard')} className={cn("p-2 rounded-md transition-colors", viewMode === 'dashboard' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Dashboard"><LayoutDashboard className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('workspace')} className={cn("p-2 rounded-md transition-colors", viewMode === 'workspace' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Workspace"><ClipboardList className="w-4 h-4" /></button>
              </div>

              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-purple-500/50 hover:bg-slate-800 transition-colors">
                <Search className="w-4 h-4" /><span className="hidden md:inline">Rechercher...</span><kbd className="ml-2 px-2 py-0.5 rounded bg-slate-700 text-xs font-mono text-slate-500">⌘K</kbd>
              </button>

              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><BarChart3 className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setDirectionPanelOpen(!directionPanelOpen)} className={cn("p-2.5 rounded-xl border transition-colors", directionPanelOpen ? "border-purple-500/50 bg-purple-500/10 text-purple-400" : "border-slate-700/50 hover:bg-slate-800/50 text-slate-400")}>{directionPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}</button>
              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">{fullscreen ? <Minimize className="w-4 h-4 text-slate-400" /> : <Maximize className="w-4 h-4 text-slate-400" />}</button>

              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                {moreMenuOpen && (<><div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} /><div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700/50 bg-slate-900 shadow-xl z-20 py-2"><button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3"><Download className="w-4 h-4 text-slate-400" />Exporter</button><div className="border-t border-slate-700/50 my-2" /><div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir</div></div></>)}
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'workspace' && <div className="px-6 pb-2"><TicketsWorkspaceTabs /></div>}
      </header>

      <main className={cn("flex-1 overflow-auto", directionPanelOpen && "mr-80")}>
        <div className="p-6 space-y-6">
          <TicketsLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />
          {viewMode === 'workspace' ? <TicketsWorkspaceContent /> : <DashboardView onOpenQueue={handleOpenQueue} />}
        </div>
      </main>

      <TicketsDirectionPanel open={directionPanelOpen} onClose={() => setDirectionPanelOpen(false)} />
      <TicketsCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />
      <TicketsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
    </div>
  );
}

function DashboardView({ onOpenQueue }: { onOpenQueue: (queue: string, title: string, icon: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('critical', 'Critiques', '⚡')}>
        <Zap className="w-8 h-8 text-rose-400 mb-3" />
        <h3 className="font-semibold text-slate-200 mb-2">Tickets Critiques</h3>
        <p className="text-sm text-slate-400">Réclamations urgentes nécessitant action immédiate</p>
      </div>
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('open', 'Ouverts', '📬')}>
        <AlertTriangle className="w-8 h-8 text-blue-400 mb-3" />
        <h3 className="font-semibold text-slate-200 mb-2">Tickets Ouverts</h3>
        <p className="text-sm text-slate-400">Nouvelles demandes en attente de traitement</p>
      </div>
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('pending', 'En attente', '⏳')}>
        <Clock className="w-8 h-8 text-amber-400 mb-3" />
        <h3 className="font-semibold text-slate-200 mb-2">En Attente</h3>
        <p className="text-sm text-slate-400">Tickets en attente d'informations client</p>
      </div>
    </div>
  );
}
