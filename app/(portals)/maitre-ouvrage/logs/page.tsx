'use client';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLogsWorkspaceStore } from '@/lib/stores/logsWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import { LogsWorkspaceTabs, LogsLiveCounters, LogsCommandPalette, LogsWorkspaceContent, LogsStatsModal, LogsDirectionPanel } from '@/components/features/bmo/workspace/logs';
import { Terminal, Search, BarChart3, MoreHorizontal, Download, Keyboard, PanelRight, PanelRightClose, LayoutDashboard, ClipboardList, Maximize, Minimize, RefreshCw, AlertCircle, Server, Globe } from 'lucide-react';

export default function LogsPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen, statsModalOpen, setStatsModalOpen, directionPanelOpen, setDirectionPanelOpen, viewMode, setViewMode } = useLogsWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0); const [moreMenuOpen, setMoreMenuOpen] = useState(false); const [fullscreen, setFullscreen] = useState(false);

  const handleRefresh = useCallback(() => { setRefreshKey(k => k + 1); addToast('Logs rafraîchis', 'success'); addActionLog({ userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, action: 'audit', module: 'logs', targetId: 'REFRESH', targetType: 'system', targetLabel: 'Rafraîchissement', details: 'Rafraîchissement manuel des logs', bureau: 'BMO' }); }, [addToast, addActionLog, currentUser]);
  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => { const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`; openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } }); setViewMode('workspace'); }, [openTab, setViewMode]);
  const handleExport = useCallback(async () => { addToast('Export des logs en cours...', 'info'); setTimeout(() => addToast('Export généré avec succès', 'success'), 1500); }, [addToast]);

  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); } if (e.key === 'Escape' && commandPaletteOpen) setCommandPaletteOpen(false); if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); } if (e.key === 'i' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setStatsModalOpen(true); } if (e.key === 'F11') { e.preventDefault(); setFullscreen(f => !f); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh, setStatsModalOpen]);

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", fullscreen && "fixed inset-0 z-50")}>
      <header className="flex-none border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-slate-600/20"><Terminal className="w-5 h-5 text-slate-400" /></div>
              <div><h1 className="text-xl font-bold text-slate-200">Journaux Système</h1><p className="text-sm text-slate-400">Logs applicatifs et système</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-800/50">
                <button onClick={() => setViewMode('dashboard')} className={cn("p-2 rounded-md transition-colors", viewMode === 'dashboard' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Dashboard"><LayoutDashboard className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('workspace')} className={cn("p-2 rounded-md transition-colors", viewMode === 'workspace' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Workspace"><ClipboardList className="w-4 h-4" /></button>
              </div>
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-slate-600 hover:bg-slate-800 transition-colors"><Search className="w-4 h-4" /><span className="hidden md:inline">Rechercher...</span><kbd className="ml-2 px-2 py-0.5 rounded bg-slate-700 text-xs font-mono text-slate-500">⌘K</kbd></button>
              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><BarChart3 className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setDirectionPanelOpen(!directionPanelOpen)} className={cn("p-2.5 rounded-xl border transition-colors", directionPanelOpen ? "border-slate-500/50 bg-slate-500/10 text-slate-300" : "border-slate-700/50 hover:bg-slate-800/50 text-slate-400")}>{directionPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}</button>
              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">{fullscreen ? <Minimize className="w-4 h-4 text-slate-400" /> : <Maximize className="w-4 h-4 text-slate-400" />}</button>
              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                {moreMenuOpen && <><div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} /><div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700/50 bg-slate-900 shadow-xl z-20 py-2"><button onClick={() => { handleExport(); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3"><Download className="w-4 h-4 text-slate-400" />Exporter</button><div className="border-t border-slate-700/50 my-2" /><div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir</div></div></>}
              </div>
            </div>
          </div>
        </div>
        {viewMode === 'workspace' && <div className="px-6 pb-2"><LogsWorkspaceTabs /></div>}
      </header>
      <main className={cn("flex-1 overflow-auto", directionPanelOpen && "mr-80")}><div className="p-6 space-y-6"><LogsLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />{viewMode === 'workspace' ? <LogsWorkspaceContent /> : <DashboardView onOpenQueue={handleOpenQueue} />}</div></main>
      <LogsDirectionPanel open={directionPanelOpen} onClose={() => setDirectionPanelOpen(false)} />
      <LogsCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />
      <LogsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
    </div>
  );
}

function DashboardView({ onOpenQueue }: { onOpenQueue: (queue: string, title: string, icon: string) => void }) {
  return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('error', 'Erreurs', '❌')}><AlertCircle className="w-8 h-8 text-rose-400 mb-3" /><h3 className="font-semibold text-slate-200 mb-2">Erreurs</h3><p className="text-sm text-slate-400">Logs niveau erreur nécessitant attention</p></div>
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('system', 'Système', '🖥️')}><Server className="w-8 h-8 text-indigo-400 mb-3" /><h3 className="font-semibold text-slate-200 mb-2">Système</h3><p className="text-sm text-slate-400">Logs des processus système</p></div>
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('api', 'API', '🌐')}><Globe className="w-8 h-8 text-emerald-400 mb-3" /><h3 className="font-semibold text-slate-200 mb-2">API</h3><p className="text-sm text-slate-400">Logs des appels API</p></div>
  </div>);
}
