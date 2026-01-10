'use client';

/**
 * Centre de Commandement Analytics - Version 2.0
 * Plateforme de pilotage et analyse des KPIs
 * Architecture cohérente avec la page Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';
import {
  AnalyticsCommandSidebar,
  AnalyticsSubNavigation,
  AnalyticsKPIBar,
  AnalyticsContentRouter,
  AnalyticsFiltersPanel,
  analyticsCategories,
} from '@/components/features/bmo/analytics/command-center';
import { AnalyticsCommandPalette } from '@/components/features/bmo/analytics/workspace/AnalyticsCommandPalette';
import { AnalyticsStatsModal } from '@/components/features/bmo/analytics/workspace/AnalyticsStatsModal';
import { AnalyticsExportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsExportModal';
import { AnalyticsAlertConfigModal } from '@/components/features/bmo/analytics/workspace/AnalyticsAlertConfigModal';
import { AnalyticsReportModal } from '@/components/features/bmo/analytics/workspace/AnalyticsReportModal';
import { AnalyticsToastProvider, useAnalyticsToast } from '@/components/features/bmo/analytics/workspace/AnalyticsToast';
import { KPIDetailModal } from '@/components/features/bmo/analytics/workspace/KPIDetailModal';
import { AlertDetailModal } from '@/components/features/bmo/analytics/workspace/AlertDetailModal';
import { GlobalSearch } from '@/components/features/bmo/analytics/search';
import { useRealtimeAnalytics } from '@/components/features/bmo/analytics/hooks/useRealtimeAnalytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  performance: [
    { id: 'all', label: 'Tous les KPIs' },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'warning', label: 'Attention', badge: 5, badgeType: 'warning' },
    { id: 'success', label: 'OK' },
  ],
  financial: [
    { id: 'budget', label: 'Budget' },
    { id: 'expenses', label: 'Dépenses' },
    { id: 'forecasts', label: 'Prévisions' },
  ],
  trends: [
    { id: 'all', label: 'Toutes' },
    { id: 'positive', label: 'Positives' },
    { id: 'negative', label: 'Négatives', badge: 4, badgeType: 'warning' },
    { id: 'stable', label: 'Stables' },
  ],
  alerts: [
    { id: 'all', label: 'Toutes', badge: 8 },
    { id: 'critical', label: 'Critiques', badge: 2, badgeType: 'critical' },
    { id: 'warning', label: 'Avertissements', badge: 6, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolues' },
  ],
  reports: [
    { id: 'all', label: 'Tous' },
    { id: 'recent', label: 'Récents' },
    { id: 'scheduled', label: 'Planifiés' },
    { id: 'favorites', label: 'Favoris' },
  ],
  kpis: [
    { id: 'all', label: 'Tous' },
    { id: 'operational', label: 'Opérationnels' },
    { id: 'strategic', label: 'Stratégiques' },
    { id: 'custom', label: 'Personnalisés' },
  ],
  comparison: [
    { id: 'bureaux', label: 'Par bureau' },
    { id: 'period', label: 'Par période' },
    { id: 'category', label: 'Par catégorie' },
  ],
  bureaux: [
    { id: 'all', label: 'Tous' },
    { id: 'btp', label: 'BTP' },
    { id: 'bj', label: 'BJ' },
    { id: 'bs', label: 'BS' },
  ],
};

// ================================
// Main Component
// ================================
export default function AnalyticsPage() {
  return (
    <AnalyticsToastProvider>
      <AnalyticsPageContent />
    </AnalyticsToastProvider>
  );
}

function AnalyticsPageContent() {
  const toast = useAnalyticsToast();
  const {
    openTab,
    tabs,
    isFullScreen,
    toggleFullScreen,
    openCommandPalette,
  } = useAnalyticsWorkspaceStore();

  // Activer les notifications temps réel
  const { isConnected, subscriptionsCount } = useRealtimeAnalytics({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  // Navigation state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Modals state
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [alertConfigModalOpen, setAlertConfigModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [kpiDetailModalOpen, setKpiDetailModalOpen] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [alertDetailModalOpen, setAlertDetailModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Navigation history for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return analyticsCategories.find((c) => c.id === activeCategory)?.label || 'Analytics';
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
      toast.dataRefreshed();
    }, 1500);
  }, [toast]);

  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory((prev) => [...prev, activeCategory]);
    setActiveCategory(category);
    setActiveSubCategory('all');
  }, [activeCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousCategory = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previousCategory);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    const totalFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);
    if (totalFilters > 0) {
      toast.info('Filtres appliqués', `${totalFilters} filtre(s) actif(s)`);
    }
    console.log('Filtres appliqués:', filters);
    // Ici, vous pouvez ajouter la logique pour filtrer les données
  }, [toast]);

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
        openCommandPalette();
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette, toggleFullScreen, handleGoBack]);

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

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullScreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <AnalyticsCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onOpenCommandPalette={openCommandPalette}
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
                onClick={handleGoBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Analytics</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Global Search */}
            <div className="w-64 hidden lg:block">
              <GlobalSearch
                placeholder="Rechercher..."
                onSearch={async (query, filters) => {
                  // Ici, vous pouvez implémenter la recherche via API
                  console.log('Recherche:', query, filters);
                  return [];
                }}
                showFilters={false}
                maxResults={5}
              />
            </div>

            <div className="w-px h-4 bg-slate-700/50 mx-1 hidden lg:block" />

            {/* New Report Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Nouveau</span>
            </Button>

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
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
                8
              </span>
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                  Rafraîchir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltersPanelOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Filtres avancés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAlertConfigModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer alertes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation */}
        <AnalyticsSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        <AnalyticsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <AnalyticsContentRouter
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
              24 KPIs • 8 alertes • 45 rapports
            </span>
            {isConnected && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  🔴 Temps réel ({subscriptionsCount} abonnements)
                </span>
              </>
            )}
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
      <AnalyticsCommandPalette />

      {/* Modals */}
      <AnalyticsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />
      <AnalyticsExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <AnalyticsAlertConfigModal
        open={alertConfigModalOpen}
        onClose={() => setAlertConfigModalOpen(false)}
      />
      <AnalyticsReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <KPIDetailModal
        open={kpiDetailModalOpen}
        onClose={() => {
          setKpiDetailModalOpen(false);
          setSelectedKpiId(null);
        }}
        kpiId={selectedKpiId}
      />
      <AlertDetailModal
        open={alertDetailModalOpen}
        onClose={() => {
          setAlertDetailModalOpen(false);
          setSelectedAlertId(null);
        }}
        alertId={selectedAlertId}
      />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={() => setNotificationsPanelOpen(false)} />
      )}

      {/* Filters Panel */}
      <AnalyticsFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'KPI Performance critique',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Tendance négative détectée',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Rapport hebdomadaire disponible',
      time: 'il y a 3h',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Seuil budget atteint à 80%',
      time: 'il y a 5h',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Nouvelle analyse disponible',
      time: 'hier',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              2 nouvelles
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            ×
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    notif.type === 'critical'
                      ? 'bg-red-500'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm',
                      !notif.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400">
            Voir toutes les notifications
          </Button>
        </div>
      </div>
    </>
  );
}
