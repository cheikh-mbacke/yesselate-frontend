'use client';

/**
 * Centre de Commandement Employés - Version 2.0
 * Architecture cohérente avec la page Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  EmployesCommandSidebar,
  EmployesSubNavigation,
  EmployesKPIBar,
  EmployesContentRouter,
  ActionsMenu,
  employesCategories,
} from '@/components/features/bmo/workspace/employes/command-center';
import { EmployesCommandPalette } from '@/components/features/bmo/workspace/employes/EmployesCommandPalette';
import { EmployesStatsModal } from '@/components/features/bmo/workspace/employes/EmployesStatsModal';
import { EmployesNotificationPanel } from '@/components/features/bmo/workspace/employes/EmployesNotificationPanel';
import { EmployesModals, type EmployeModalType } from '@/components/features/bmo/workspace/employes/EmployesModals';
import { EmployeesHelpModal } from '@/components/features/bmo/workspace/employes/modals/EmployeesHelpModal';

// ================================
// Types
// ================================
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  all: [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs', badge: 118 },
    { id: 'on-leave', label: 'En congés', badge: 6 },
    { id: 'on-mission', label: 'En mission', badge: 12 },
  ],
  departments: [
    { id: 'all', label: 'Tous' },
    { id: 'btp', label: 'BTP', badge: 45 },
    { id: 'finance', label: 'Finance', badge: 18 },
    { id: 'rh', label: 'RH', badge: 12 },
    { id: 'it', label: 'IT', badge: 8 },
  ],
  skills: [
    { id: 'all', label: 'Toutes' },
    { id: 'technical', label: 'Techniques' },
    { id: 'management', label: 'Management' },
    { id: 'languages', label: 'Langues' },
  ],
  performance: [
    { id: 'all', label: 'Tous' },
    { id: 'excellent', label: 'Excellent', badge: 24 },
    { id: 'good', label: 'Bon', badge: 68 },
    { id: 'needs-improvement', label: 'À améliorer', badge: 12, badgeType: 'warning' },
  ],
  evaluations: [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente', badge: 12, badgeType: 'warning' },
    { id: 'in-progress', label: 'En cours', badge: 8 },
    { id: 'completed', label: 'Terminées', badge: 45 },
  ],
  contracts: [
    { id: 'all', label: 'Tous' },
    { id: 'permanent', label: 'CDI', badge: 98 },
    { id: 'fixed-term', label: 'CDD', badge: 18 },
    { id: 'expiring', label: 'Expirant', badge: 8, badgeType: 'warning' },
  ],
  absences: [
    { id: 'all', label: 'Toutes' },
    { id: 'planned', label: 'Planifiées' },
    { id: 'unplanned', label: 'Non planifiées', badge: 3, badgeType: 'critical' },
    { id: 'sick-leave', label: 'Arrêts maladie', badge: 5 },
  ],
  spof: [
    { id: 'all', label: 'Tous' },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'high-risk', label: 'Haut risque', badge: 5, badgeType: 'warning' },
  ],
};

// ================================
// Main Component
// ================================
export default function EmployesPage() {
  return <EmployesPageContent />;
}

function EmployesPageContent() {
  // Navigation state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('all');
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: string; subCategory: string | null }>>([]);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [kpiBarVisible, setKpiBarVisible] = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: EmployeModalType | null;
    data?: any;
  }>({
    isOpen: false,
    type: null,
  });

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Help modal state
  const [helpOpen, setHelpOpen] = useState(false);

  // Stats modal state (handled separately)
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return employesCategories.find((c) => c.id === activeCategory)?.label || 'Employés';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Callbacks
  // ================================
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory((prev) => [...prev, { category: activeCategory, subCategory: activeSubCategory }].slice(-20));
    setActiveCategory(category);
    setActiveSubCategory('all');
  }, [activeCategory, activeSubCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length === 0) return;
    const previous = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory((prev) => prev.slice(0, -1));
    setActiveCategory(previous.category);
    setActiveSubCategory(previous.subCategory);
  }, [navigationHistory]);

  const openModal = useCallback((type: EmployeModalType, data?: any) => {
    setModal({ isOpen: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, type: null });
  }, []);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl+K : Command Palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        openModal('export');
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setFullscreen((prev) => !prev);
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // Ctrl+I : Stats
      if (isMod && e.key === 'i') {
        e.preventDefault();
        setStatsModalOpen(true);
        return;
      }

      // ? : Shortcuts
      if (e.key === '?' && !isMod && !e.altKey) {
        e.preventDefault();
        openModal('shortcuts');
        return;
      }

      // Escape : Close modals/panels
      if (e.key === 'Escape') {
        if (modal.isOpen) {
          closeModal();
        } else if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (notificationsPanelOpen) {
          setNotificationsPanelOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, modal.isOpen, notificationsPanelOpen, goBack, openModal, closeModal]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <EmployesCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Employés</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions - Consolidated */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen((prev) => !prev)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onSearch={() => setCommandPaletteOpen(true)}
              onExport={() => openModal('export')}
              onStats={() => setStatsModalOpen(true)}
              onSettings={() => openModal('settings')}
              onShortcuts={() => openModal('shortcuts')}
              onHelp={() => setHelpOpen(true)}
              onToggleFullscreen={() => setFullscreen((prev) => !prev)}
              fullscreen={fullscreen}
              onToggleKPIs={() => setKpiBarVisible((prev) => !prev)}
              kpisVisible={kpiBarVisible}
            />
          </div>
        </header>

        {/* Sub Navigation */}
        <EmployesSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        {kpiBarVisible && (
          <EmployesKPIBar
            visible={true}
            collapsed={kpiBarCollapsed}
            onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <EmployesContentRouter
              category={activeCategory}
              subCategory={activeSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              124 employés • 8 départements • 12 évaluations en attente
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <EmployesCommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onOpenStats={() => setStatsModalOpen(true)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modals */}
      <EmployesModals modal={modal} onClose={closeModal} />

      {/* Stats Modal */}
      <EmployesStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Notification Panel */}
      <EmployesNotificationPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />

      {/* Help Modal */}
      <EmployeesHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

