'use client';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useEmployesWorkspaceStore } from '@/lib/stores/employesWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import { 
  EmployesWorkspaceTabs, 
  EmployesLiveCounters, 
  EmployesCommandPalette, 
  EmployesWorkspaceContent, 
  EmployesStatsModal, 
  EmployesDirectionPanel,
  EmployesModals,
  type EmployeModalType,
  EmployesNotificationPanel,
} from '@/components/features/bmo/workspace/employes';
import { EmployeesHelpModal } from '@/components/features/bmo/workspace/employes/modals/EmployeesHelpModal';
import {
  EmployeesHeadcountTrendChart,
  EmployeesDepartmentChart,
  EmployeesSkillsChart,
  EmployeesPerformanceChart,
  EmployeesRetentionChart,
  EmployeesContractTypesChart,
  EmployeesSeniorityChart,
} from '@/components/features/bmo/workspace/employes/analytics/EmployeesAnalyticsCharts';
import { Users, Search, BarChart3, MoreHorizontal, Download, Keyboard, PanelRight, PanelRightClose, LayoutDashboard, ClipboardList, Maximize, Minimize, RefreshCw, Shield, AlertTriangle, Star, Bell } from 'lucide-react';

export default function EmployesPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen, statsModalOpen, setStatsModalOpen, directionPanelOpen, setDirectionPanelOpen, viewMode, setViewMode } = useEmployesWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [moreMenuOpen, setMoreMenuOpen] = useState(false); 
  const [fullscreen, setFullscreen] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: EmployeModalType | null;
    data?: any;
  }>({
    isOpen: false,
    type: null,
  });
  
  // Notification panel state
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  
  // Help modal state
  const [helpOpen, setHelpOpen] = useState(false);

  const handleRefresh = useCallback(() => { setRefreshKey(k => k + 1); addToast('Données rafraîchies', 'success'); addActionLog({ userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, action: 'audit', module: 'employes', targetId: 'REFRESH', targetType: 'system', targetLabel: 'Rafraîchissement', details: 'Rafraîchissement manuel des employés', bureau: 'BMO' }); }, [addToast, addActionLog, currentUser]);
  const handleOpenQueue = useCallback((queue: string, title: string, icon: string) => { const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`; openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } }); setViewMode('workspace'); }, [openTab, setViewMode]);
  const handleExport = useCallback(async () => { addToast('Export des employés en cours...', 'info'); setTimeout(() => addToast('Export généré avec succès', 'success'), 1500); }, [addToast]);

  useEffect(() => { 
    const h = (e: KeyboardEvent) => { 
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); } 
      if (e.key === 'Escape') {
        if (modal.isOpen) {
          setModal({ isOpen: false, type: null });
        } else if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (notificationPanelOpen) {
          setNotificationPanelOpen(false);
        } else if (helpOpen) {
          setHelpOpen(false);
        }
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefresh(); } 
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setStatsModalOpen(true); } 
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setModal({ isOpen: true, type: 'export' }); }
      if (e.key === '?') { e.preventDefault(); setModal({ isOpen: true, type: 'shortcuts' }); }
      if (e.key === 'F1') { e.preventDefault(); setHelpOpen(true); }
      if (e.key === 'F11') { e.preventDefault(); setFullscreen(f => !f); } 
    }; 
    window.addEventListener('keydown', h); 
    return () => window.removeEventListener('keydown', h); 
  }, [commandPaletteOpen, setCommandPaletteOpen, handleRefresh, setStatsModalOpen, modal.isOpen, notificationPanelOpen, helpOpen]);

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", fullscreen && "fixed inset-0 z-50")}>
      <header className="flex-none border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-teal-500/20"><Users className="w-5 h-5 text-teal-400" /></div>
              <div><h1 className="text-xl font-bold text-slate-200">Gestion des Employés</h1><p className="text-sm text-slate-400">Effectifs, compétences et évaluations</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-800/50">
                <button onClick={() => setViewMode('dashboard')} className={cn("p-2 rounded-md transition-colors", viewMode === 'dashboard' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Dashboard"><LayoutDashboard className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('workspace')} className={cn("p-2 rounded-md transition-colors", viewMode === 'workspace' ? "bg-slate-700 shadow-sm text-slate-200" : "text-slate-400 hover:bg-slate-700/50")} title="Workspace"><ClipboardList className="w-4 h-4" /></button>
              </div>
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-teal-500/50 hover:bg-slate-800 transition-colors"><Search className="w-4 h-4" /><span className="hidden md:inline">Rechercher...</span><kbd className="ml-2 px-2 py-0.5 rounded bg-slate-700 text-xs font-mono text-slate-500">⌘K</kbd></button>
              <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors" title="Rafraîchir (⌘R)"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setStatsModalOpen(true)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors" title="Statistiques (⌘I)"><BarChart3 className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => setNotificationPanelOpen(!notificationPanelOpen)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors relative" title="Notifications"><Bell className="w-4 h-4 text-slate-400" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
              <button onClick={() => setDirectionPanelOpen(!directionPanelOpen)} className={cn("p-2.5 rounded-xl border transition-colors", directionPanelOpen ? "border-teal-500/50 bg-teal-500/10 text-teal-400" : "border-slate-700/50 hover:bg-slate-800/50 text-slate-400")} title="Direction Panel">{directionPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}</button>
              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors" title="Plein écran (F11)">{fullscreen ? <Minimize className="w-4 h-4 text-slate-400" /> : <Maximize className="w-4 h-4 text-slate-400" />}</button>
              <div className="relative">
                <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                {moreMenuOpen && <><div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} /><div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700/50 bg-slate-900 shadow-xl z-20 py-2"><button onClick={() => { setModal({ isOpen: true, type: 'export' }); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3"><Download className="w-4 h-4 text-slate-400" />Exporter</button><button onClick={() => { setModal({ isOpen: true, type: 'settings' }); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 flex items-center gap-3"><Download className="w-4 h-4 text-slate-400" />Paramètres</button><div className="border-t border-slate-700/50 my-2" /><div className="px-4 py-2 text-xs text-slate-500"><Keyboard className="w-3 h-3 inline mr-1" /> ⌘K recherche • ⌘R rafraîchir • ⌘I stats • ⌘E export</div></div></>}
              </div>
            </div>
          </div>
        </div>
        {viewMode === 'workspace' && <div className="px-6 pb-2"><EmployesWorkspaceTabs /></div>}
      </header>
      <main className={cn("flex-1 overflow-auto", directionPanelOpen && "mr-80")}><div className="p-6 space-y-6"><EmployesLiveCounters key={refreshKey} onOpenQueue={handleOpenQueue} />{viewMode === 'workspace' ? <EmployesWorkspaceContent /> : <DashboardView onOpenQueue={handleOpenQueue} />}</div></main>
      <EmployesDirectionPanel open={directionPanelOpen} onClose={() => setDirectionPanelOpen(false)} />
      <EmployesCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenStats={() => setStatsModalOpen(true)} onRefresh={handleRefresh} />
      <EmployesStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
      
      {/* Modals */}
      <EmployesModals
        modal={modal}
        onClose={() => setModal({ isOpen: false, type: null })}
      />
      
      {/* Notification Panel */}
      <EmployesNotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
      
      {/* Help Modal */}
      <EmployeesHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}

function DashboardView({ onOpenQueue }: { onOpenQueue: (queue: string, title: string, icon: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('spof', 'SPOF', '🛡️')}>
          <Shield className="w-8 h-8 text-rose-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">Employés SPOF</h3>
          <p className="text-sm text-slate-400">Compétences critiques uniques à sécuriser</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('risk', 'À risque', '⚠️')}>
          <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">À Risque</h3>
          <p className="text-sm text-slate-400">Employés nécessitant une attention particulière</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => onOpenQueue('all', 'Évaluations', '⭐')}>
          <Star className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">Évaluations</h3>
          <p className="text-sm text-slate-400">Suivi des performances et objectifs</p>
        </div>
      </div>

      {/* Analytics & Tendances */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Analytics & Tendances RH
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Headcount Trend */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Évolution des effectifs</h3>
            <EmployeesHeadcountTrendChart />
          </div>

          {/* Department Distribution */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition par département</h3>
            <EmployeesDepartmentChart />
          </div>

          {/* Skills Matrix */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Compétences disponibles</h3>
            <EmployeesSkillsChart />
          </div>

          {/* Performance Distribution */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition des performances</h3>
            <EmployeesPerformanceChart />
          </div>

          {/* Retention Rate */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Taux de rétention</h3>
            <EmployeesRetentionChart />
          </div>

          {/* Contract Types */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Types de contrats</h3>
            <EmployeesContractTypesChart />
          </div>

          {/* Seniority Distribution */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 lg:col-span-2">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Ancienneté</h3>
            <EmployeesSeniorityChart />
          </div>
        </div>
      </div>
    </div>
  );
}
