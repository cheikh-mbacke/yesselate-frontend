'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkspaceTabs } from '@/components/features/bmo/workspace/WorkspaceTabs';
import { WorkspaceContent } from '@/components/features/bmo/workspace/WorkspaceContent';
import { LiveCounters } from '@/components/features/bmo/workspace/LiveCounters';
import { CommandPalette } from '@/components/features/bmo/workspace/CommandPalette';
import { RecentActivity } from '@/components/features/bmo/workspace/RecentActivity';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { ThemeToggle } from '@/components/features/bmo/ThemeToggle';
import { QuickStatsModal } from '@/components/features/bmo/QuickStatsModal';
import { ExportModal } from '@/components/features/bmo/modals/ExportModal';
import { cn } from '@/lib/utils';
import { 
  Command, BarChart3, Download, Keyboard, HelpCircle, X,
  LayoutDashboard, Table2, Maximize2, Minimize2, PanelRightOpen, PanelRightClose
} from 'lucide-react';

// ============================================
// Types
// ============================================
type ViewMode = 'dashboard' | 'workspace';

// ============================================
// Page principale
// ============================================
export default function DemandesPage() {
  const { tabs, openTab } = useWorkspaceStore();
  
  // États UI
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Modales
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Ouvrir une file
  const handleOpenQueue = useCallback((queue: string) => {
    const configs: Record<string, { title: string; icon: string }> = {
      pending: { title: 'À traiter', icon: '📥' },
      urgent: { title: 'Urgentes', icon: '🔥' },
      overdue: { title: 'En retard', icon: '⏱️' },
      validated: { title: 'Validées', icon: '✅' },
      rejected: { title: 'Rejetées', icon: '❌' },
    };
    const config = configs[queue] ?? { title: queue, icon: '📄' };
    
    openTab({
      type: 'inbox',
      id: `inbox:${queue}`,
      title: config.title,
      icon: config.icon,
      data: { queue },
    });
    
    // Basculer en mode workspace si on ouvre un onglet
    if (viewMode === 'dashboard') {
      setViewMode('workspace');
    }
  }, [openTab, viewMode]);

  // Raccourcis clavier globaux
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const isModifier = e.metaKey || e.ctrlKey;

    // Cmd/Ctrl+K - Palette de commandes
    if (isModifier && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setCommandOpen(true);
      return;
    }

    // Cmd/Ctrl+1-5 pour les files
    if (isModifier && ['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      const queues = ['pending', 'urgent', 'overdue', 'validated', 'rejected'];
      handleOpenQueue(queues[parseInt(e.key) - 1]);
      return;
    }

    // Cmd/Ctrl+S pour stats
    if (isModifier && e.key.toLowerCase() === 's') {
      e.preventDefault();
      setStatsModalOpen(true);
      return;
    }

    // Cmd/Ctrl+E pour export
    if (isModifier && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      setExportModalOpen(true);
      return;
    }

    // Cmd/Ctrl+D pour thème (géré par ThemeToggle)

    // Cmd/Ctrl+B pour sidebar
    if (isModifier && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      setShowSidebar(prev => !prev);
      return;
    }

    // ? pour aide
    if (e.key === '?' && !isModifier) {
      setShowShortcuts(prev => !prev);
      return;
    }

    // F11 ou Cmd+Shift+F pour fullscreen
    if (e.key === 'F11' || (isModifier && e.shiftKey && e.key.toLowerCase() === 'f')) {
      e.preventDefault();
      setIsFullscreen(prev => !prev);
      return;
    }

    // Escape
    if (e.key === 'Escape') {
      setShowShortcuts(false);
      setCommandOpen(false);
      if (isFullscreen) setIsFullscreen(false);
      return;
    }
  }, [handleOpenQueue, isFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-switch to workspace when tabs are opened
  useEffect(() => {
    if (tabs.length > 0 && viewMode === 'dashboard') {
      // Keep dashboard if user prefers
    }
  }, [tabs.length, viewMode]);

  // ============================================
  // Render
  // ============================================
  return (
    <div className={cn(
      "w-full min-h-screen transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 bg-[rgb(var(--bg))]" : ""
    )}>
      <div className={cn(
        "px-4 sm:px-6 lg:px-8 py-4 space-y-4",
        isFullscreen ? "h-full flex flex-col" : ""
      )}>
        
        {/* ============================================ */}
        {/* Header */}
        {/* ============================================ */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Titre et sous-titre */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-orange-500" />
                Console métier
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Gestion et traitement des demandes de validation
              </p>
            </div>
            
            {/* Badge version */}
            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400">
              v2.0
            </span>
          </div>

          {/* Toolbar principal */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Compteurs live (compact) */}
            <div className="hidden xl:block">
              <LiveCounters onOpenQueue={handleOpenQueue} compact />
            </div>
            
            {/* Séparateur */}
            <div className="hidden xl:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
            
            {/* Bouton recherche */}
            <button
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
                         border-slate-200 bg-white hover:bg-slate-50
                         dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              title="Recherche (⌘K)"
            >
              <Command className="w-4 h-4" />
              <span className="hidden sm:inline text-slate-500">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-mono ml-2">
                ⌘K
              </kbd>
            </button>

            {/* Mode de vue */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('dashboard')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  viewMode === 'dashboard' 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                title="Vue Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('workspace')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  viewMode === 'workspace' 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                title="Vue Workspace"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Séparateur */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Stats */}
            <button
              onClick={() => setStatsModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50
                         dark:border-slate-700 dark:hover:bg-slate-800"
              title="Statistiques (⌘S)"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            
            {/* Export */}
            <button
              onClick={() => setExportModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50
                         dark:border-slate-700 dark:hover:bg-slate-800"
              title="Exporter (⌘E)"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {/* Sidebar toggle */}
            <button
              onClick={() => setShowSidebar(prev => !prev)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50
                         dark:border-slate-700 dark:hover:bg-slate-800"
              title={showSidebar ? "Masquer le panneau (⌘B)" : "Afficher le panneau (⌘B)"}
            >
              {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50
                         dark:border-slate-700 dark:hover:bg-slate-800"
              title={isFullscreen ? "Quitter plein écran (F11)" : "Plein écran (F11)"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            {/* Aide */}
            <button
              onClick={() => setShowShortcuts(prev => !prev)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50
                         dark:border-slate-700 dark:hover:bg-slate-800"
              title="Raccourcis clavier (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme */}
            <ThemeToggle />
          </div>
        </header>

        {/* ============================================ */}
        {/* Compteurs (mobile) */}
        {/* ============================================ */}
        <div className="xl:hidden">
          <LiveCounters onOpenQueue={handleOpenQueue} />
        </div>

        {/* ============================================ */}
        {/* Panneau d'aide raccourcis */}
        {/* ============================================ */}
        {showShortcuts && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 dark:bg-blue-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                Raccourcis clavier
              </h3>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded hover:bg-blue-500/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
              {[
                { key: '⌘K', label: 'Recherche' },
                { key: '⌘1', label: 'À traiter' },
                { key: '⌘2', label: 'Urgentes' },
                { key: '⌘3', label: 'En retard' },
                { key: '⌘4', label: 'Validées' },
                { key: '⌘5', label: 'Rejetées' },
                { key: '⌘S', label: 'Stats' },
                { key: '⌘E', label: 'Export' },
                { key: '⌘B', label: 'Panneau' },
                { key: 'F11', label: 'Plein écran' },
                { key: '?', label: 'Aide' },
                { key: 'Esc', label: 'Fermer' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs min-w-[40px] text-center">
                    {key}
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Contenu principal */}
        {/* ============================================ */}
        <div className={cn(
          "flex gap-4",
          isFullscreen ? "flex-1 min-h-0" : ""
        )}>
          {/* Zone de travail */}
          <div className={cn(
            "flex-1 min-w-0 space-y-4",
            isFullscreen ? "flex flex-col" : ""
          )}>
            {/* Onglets de travail */}
            {(viewMode === 'workspace' || tabs.length > 0) && (
              <WorkspaceTabs />
            )}
            
            {/* Contenu selon le mode */}
            <div className={cn(isFullscreen ? "flex-1 min-h-0 overflow-auto" : "")}>
              {viewMode === 'dashboard' && tabs.length === 0 ? (
                // Dashboard d'accueil
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Welcome card */}
                  <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-6 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold mb-2">Bienvenue dans la console métier</h2>
                        <p className="text-slate-500 max-w-2xl">
                          Gérez vos demandes de validation, suivez les indicateurs en temps réel et exportez vos données.
                          Utilisez <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">⌘K</kbd> pour
                          rechercher rapidement ou les boutons ci-dessus pour naviguer.
                        </p>
                      </div>
                      <LayoutDashboard className="w-12 h-12 text-orange-500/30" />
                    </div>
                  </div>
                  
                  {/* Stats détaillées */}
                  <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      Vue d&apos;ensemble
                    </h3>
                    <LiveCounters onOpenQueue={handleOpenQueue} />
                  </div>
                  
                  {/* Activité récente */}
                  <RecentActivity limit={8} />
                </div>
              ) : (
                // Workspace avec contenu
                <WorkspaceContent />
              )}
            </div>
          </div>

          {/* Sidebar latérale */}
          {showSidebar && viewMode === 'workspace' && tabs.length > 0 && (
            <aside className="hidden lg:block w-80 flex-none">
              <RecentActivity limit={10} />
            </aside>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* Modales */}
      {/* ============================================ */}
      <CommandPalette 
        open={commandOpen} 
        onClose={() => setCommandOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
      />
      <QuickStatsModal open={statsModalOpen} onOpenChange={setStatsModalOpen} />
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
    </div>
  );
}
