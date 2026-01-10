'use client';

/**
 * Centre de Commandement Validation-BC - Version 2.0
 * Architecture cohérente avec Analytics et Gouvernance
 * Navigation à 3 niveaux: Sidebar + SubNavigation + KPIBar
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useValidationBCWorkspaceStore, type ValidationTabType } from '@/lib/stores/validationBCWorkspaceStore';
import { getValidationStats } from '@/lib/services/validation-bc-api';
import { validationBCCache } from '@/lib/cache/validation-bc-cache';

// Command Center Components
import {
  ValidationBCCommandSidebar,
  ValidationBCSubNavigation,
  ValidationBCKPIBar,
  validationBCCategories,
} from '@/components/features/validation-bc/command-center';

// Workspace Components
import {
  ValidationBCWorkspaceTabs,
  ValidationBCWorkspaceContent,
  ValidationBCCommandPalette,
  ValidationBCDirectionPanel,
  ValidationBCAlertsBanner,
  ValidationBCNotifications,
  ValidationBCToastProvider,
  useValidationBCToast,
  ValidationBCDashboardSkeleton,
  ValidationBCExportModal,
  ValidationBCStatsModal,
  ValidationBCTimeline,
  ValidationBCQuickCreateModal,
  ValidationBCFavoritesProvider,
  ValidationBCFavoritesPanel,
  ValidationBCWorkflowEngine,
  ValidationBCPredictiveAnalytics,
  ValidationBCDelegationManager,
  ValidationBCRemindersSystem,
  ValidationBCActivityHistory,
  ValidationBCBusinessRules,
  ValidationBCServiceQueues,
  ValidationBCValidationModal,
  ValidationBCMultiLevelValidation,
  ValidationBCRequestJustificatif,
  ValidationBCDocumentView,
  ValidationBC360Panel,
  type ValidationDocument,
  type DocumentType,
} from '@/components/features/validation-bc/workspace';

// Graphiques
import {
  ValidationDashboardCharts,
  ValidationStatsBarChart,
} from '@/components/features/validation-bc/charts';

// Composants de contenu
import {
  BCListView,
  FacturesListView,
  AvenantsListView,
  UrgentsListView,
  TrendsView,
  ValidatorsView,
  AdvancedSearchPanel,
  type SearchFilters,
} from '@/components/features/validation-bc/content';

// Vues avancées
import {
  Dashboard360,
  KanbanView,
  CalendarView,
  BudgetsView,
} from '@/components/features/validation-bc/views';

// Composants communs
import {
  ValidationBCErrorBoundary,
  ValidationBCKPIBarSkeleton,
} from '@/components/features/validation-bc/common';

// Hooks
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useValidationBCNotifications } from '@/hooks/useWebSocket';

import { cn } from '@/lib/utils';
import {
  FileCheck,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import type { ValidationStats as APIValidationStats } from '@/lib/services/validation-bc-api';

type ValidationStats = APIValidationStats;

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tous' },
    { id: 'dashboard', label: 'Dashboard 360°' },
    { id: 'kanban', label: 'Vue Kanban' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'kpis', label: 'Indicateurs' },
  ],
  bc: [
    { id: 'all', label: 'Tous', badge: 23 },
    { id: 'pending', label: 'En attente', badge: 15, badgeType: 'warning' },
    { id: 'validated', label: 'Validés', badge: 8 },
  ],
  factures: [
    { id: 'all', label: 'Toutes', badge: 15 },
    { id: 'pending', label: 'En attente', badge: 9, badgeType: 'warning' },
    { id: 'validated', label: 'Validées', badge: 6 },
  ],
  avenants: [
    { id: 'all', label: 'Tous', badge: 8 },
    { id: 'pending', label: 'En attente', badge: 5, badgeType: 'warning' },
    { id: 'validated', label: 'Validés', badge: 3 },
  ],
  urgents: [
    { id: 'all', label: 'Tous', badge: 12, badgeType: 'critical' },
    { id: 'sla', label: 'Dépassement SLA', badge: 5, badgeType: 'critical' },
    { id: 'montant', label: 'Montant élevé', badge: 7, badgeType: 'warning' },
  ],
  historique: [
    { id: 'all', label: 'Tout l\'historique' },
    { id: 'recent', label: 'Récent (7j)' },
    { id: 'month', label: 'Ce mois' },
  ],
  tendances: [
    { id: 'performance', label: 'Performance' },
    { id: 'volumes', label: 'Volumes' },
    { id: 'delais', label: 'Délais' },
  ],
  validateurs: [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs' },
    { id: 'performance', label: 'Performance' },
  ],
  services: [
    { id: 'all', label: 'Tous' },
    { id: 'achats', label: 'Achats' },
    { id: 'finance', label: 'Finance' },
    { id: 'juridique', label: 'Juridique' },
  ],
  regles: [
    { id: 'all', label: 'Toutes' },
    { id: 'validation', label: 'Validation' },
    { id: 'escalade', label: 'Escalade' },
  ],
};

// Helper pour l'interval
function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Main Component
// ================================
function ValidationBCPageContent() {
  const { tabs, openTab } = useValidationBCWorkspaceStore();
  const toast = useValidationBCToast();

  // Navigation state
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Stats state
  const [statsData, setStatsData] = useState<ValidationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [delegationsOpen, setDelegationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [multiLevelValidationOpen, setMultiLevelValidationOpen] = useState(false);
  const [requestJustificatifOpen, setRequestJustificatifOpen] = useState(false);

  // Validation modal
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ValidationDocument | null>(null);

  // Navigation history for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const abortStatsRef = useRef<AbortController | null>(null);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return validationBCCategories.find((c) => c.id === activeCategory)?.label || 'Validation-BC';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  // Calculer les catégories avec badges dynamiques
  const categoriesWithBadges = useMemo(() => {
    if (!statsData) return validationBCCategories;

    return validationBCCategories.map((cat) => {
      switch (cat.id) {
        case 'bc':
          const bcCount = statsData.byType.find(t => t.type === 'Bons de commande')?.count || 0;
          return { ...cat, badge: bcCount, badgeType: bcCount > 20 ? 'warning' as const : 'default' as const };
        case 'factures':
          const facturesCount = statsData.byType.find(t => t.type === 'Factures')?.count || 0;
          return { ...cat, badge: facturesCount, badgeType: facturesCount > 15 ? 'warning' as const : 'default' as const };
        case 'avenants':
          const avenantsCount = statsData.byType.find(t => t.type === 'Avenants')?.count || 0;
          return { ...cat, badge: avenantsCount };
        case 'urgents':
          return { ...cat, badge: statsData.urgent, badgeType: statsData.urgent > 5 ? 'critical' as const : 'warning' as const };
        default:
          return cat;
      }
    });
  }, [statsData]);

  // Calculer les KPIs depuis statsData
  const kpisData = useMemo(() => {
    if (!statsData) return undefined;

    return [
      {
        id: 'total-documents',
        label: 'Documents Total',
        value: statsData.total,
        trend: 'up' as const,
        trendValue: '+8',
        status: 'neutral' as const,
      },
      {
        id: 'en-attente',
        label: 'En Attente',
        value: statsData.pending,
        trend: statsData.pending > 50 ? 'up' as const : 'down' as const,
        trendValue: statsData.pending > 50 ? `+${statsData.pending - 50}` : `${statsData.pending - 50}`,
        status: statsData.pending > 50 ? 'warning' as const : 'success' as const,
        sparkline: [52, 50, 48, statsData.pending + 1, statsData.pending],
      },
      {
        id: 'valides',
        label: 'Validés',
        value: statsData.validated,
        trend: 'up' as const,
        trendValue: '+12',
        status: 'success' as const,
        sparkline: [Math.max(0, statsData.validated - 17), Math.max(0, statsData.validated - 12), Math.max(0, statsData.validated - 9), Math.max(0, statsData.validated - 5), statsData.validated],
      },
      {
        id: 'rejetes',
        label: 'Rejetés',
        value: statsData.rejected,
        trend: 'stable' as const,
        status: 'neutral' as const,
      },
      {
        id: 'urgents',
        label: 'Urgents',
        value: statsData.urgent,
        trend: statsData.urgent > 10 ? 'up' as const : 'down' as const,
        trendValue: statsData.urgent > 10 ? `+${statsData.urgent - 10}` : `${statsData.urgent - 10}`,
        status: statsData.urgent > 10 ? 'critical' as const : 'warning' as const,
      },
      {
        id: 'taux-validation',
        label: 'Taux Validation',
        value: statsData.total > 0 ? `${Math.round((statsData.validated / statsData.total) * 100)}%` : '0%',
        trend: statsData.total > 0 && (statsData.validated / statsData.total) > 0.8 ? 'up' as const : 'down' as const,
        trendValue: '+3%',
        status: statsData.total > 0 && (statsData.validated / statsData.total) > 0.8 ? 'success' as const : 'warning' as const,
        sparkline: [85, 87, 89, 91, Math.round((statsData.validated / statsData.total) * 100)],
      },
      {
        id: 'delai-moyen',
        label: 'Délai Moyen',
        value: '2.3j',
        trend: 'down' as const,
        trendValue: '-0.5j',
        status: 'success' as const,
      },
      {
        id: 'anomalies',
        label: 'Anomalies',
        value: statsData.anomalies,
        trend: statsData.anomalies > 10 ? 'up' as const : 'stable' as const,
        status: statsData.anomalies > 10 ? 'warning' as const : 'neutral' as const,
      },
    ];
  }, [statsData]);

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
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadStats('manual');
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory(prev => [...prev, activeCategory]);
    setActiveCategory(category);
    setActiveSubCategory('all');
    setActiveFilter(null); // Reset filter
  }, [activeCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveFilter(null); // Reset filter when changing sub-category
  }, []);

  const handleFilterChange = useCallback((filter: string | null) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchFiltersChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchFilters({});
  }, []);

  // WebSocket notifications
  useValidationBCNotifications(useCallback((message) => {
    switch (message.type) {
      case 'new_document':
        toast.info('Nouveau document', `Document ${message.data.id} créé`);
        loadStats('auto');
        break;
      case 'document_validated':
        toast.success('Document validé', `${message.data.id}`);
        loadStats('auto');
        break;
      case 'document_rejected':
        toast.error('Document rejeté', `${message.data.id}`);
        loadStats('auto');
        break;
      case 'urgent_alert':
        toast.error('Alerte urgente !', message.data.message);
        break;
      case 'stats_update':
        // Mise à jour silencieuse des stats
        loadStats('auto');
        break;
    }
  }, [toast]));

  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActiveCategory(previous);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  const openDocument = useCallback(
    (id: string, type: DocumentType) => {
      openTab({
        type: type as ValidationTabType,
        id: `document:${type}:${id}`,
        title: id,
        icon: type === 'bc' ? '📄' : type === 'facture' ? '🧾' : '📝',
        data: { documentId: id, type },
      });
    },
    [openTab]
  );

  const handleValidateDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

  const handleRejectDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

  // Load Stats
  const loadStats = useCallback(
    async (reason: 'init' | 'manual' | 'auto' = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);

      try {
        const stats = await getValidationStats(reason, ac.signal);
        
        if (ac.signal.aborted) return;

        setStatsData(stats);
        if (reason === 'manual') {
          toast.success('Données actualisées', `${stats.total} documents`);
        }
      } catch (error) {
        if (ac.signal.aborted) return;
        
        console.error('Erreur chargement stats:', error);
        
        // Fallback sur données mockées
        const mockStats: ValidationStats = {
          total: 156,
          pending: 46,
          validated: 87,
          rejected: 8,
          anomalies: 15,
          urgent: 12,
          byBureau: [
            { bureau: 'Achats', count: 65 },
            { bureau: 'Finance', count: 72 },
            { bureau: 'Juridique', count: 19 },
          ],
          byType: [
            { type: 'Bons de commande', count: 89 },
            { type: 'Factures', count: 54 },
            { type: 'Avenants', count: 13 },
          ],
          recentActivity: [],
          ts: new Date().toISOString(),
        };
        
        setStatsData(mockStats);
        
        if (reason === 'manual') {
          toast.error('Erreur réseau', 'Données en mode hors ligne');
        }
      } finally {
        setStatsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadStats('init');
    return () => { abortStatsRef.current?.abort(); };
  }, [loadStats]);

  useInterval(
    () => { loadStats('auto'); },
    60_000 // Refresh toutes les 60 secondes
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Command Palette
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Escape - Close all overlays
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
        setNotificationsPanelOpen(false);
        return;
      }

      // ⌘B - Toggle Sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
        return;
      }

      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen(prev => !prev);
        return;
      }

      // Alt+← - Go Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // ⌘N - Quick Create
      if (isMod && e.key === 'n') {
        e.preventDefault();
        setQuickCreateOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack]);

  // Listen to custom events from command palette
  useEffect(() => {
    const handleOpenStats = () => setStatsModalOpen(true);
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenTimeline = () => setTimelineOpen(true);
    const handleOpenWorkflow = () => setWorkflowOpen(true);

    window.addEventListener('validation-bc:open-stats', handleOpenStats);
    window.addEventListener('validation-bc:open-export', handleOpenExport);
    window.addEventListener('validation-bc:open-timeline', handleOpenTimeline);
    window.addEventListener('validation-bc:open-workflow', handleOpenWorkflow);

    return () => {
      window.removeEventListener('validation-bc:open-stats', handleOpenStats);
      window.removeEventListener('validation-bc:open-export', handleOpenExport);
      window.removeEventListener('validation-bc:open-timeline', handleOpenTimeline);
      window.removeEventListener('validation-bc:open-workflow', handleOpenWorkflow);
    };
  }, []);

  // ================================
  // Render
  // ================================
  return (
    <ValidationBCErrorBoundary>
      <div
        className={cn(
          'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
          isFullScreen && 'fixed inset-0 z-50'
        )}
      >
      {/* Sidebar Navigation */}
      <ValidationBCCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        categories={categoriesWithBadges}
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
                onClick={handleGoBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Validation-BC</h1>
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
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-400 hover:text-slate-200"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">Rechercher...</span>
              <kbd className="ml-2 text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* Quick Create */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickCreateOpen(true)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Créer (⌘N)"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {statsData && statsData.urgent > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {statsData.urgent}
                </span>
              )}
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  📊 Statistiques
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTimelineOpen(true)}>
                  📅 Timeline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWorkflowOpen(true)}>
                  🔄 Workflow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAnalyticsOpen(true)}>
                  📈 Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsFullScreen(!isFullScreen)}>
                  {isFullScreen ? '⊗' : '⊕'} Plein écran
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation */}
        <ValidationBCSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* KPI Bar */}
        <ValidationBCKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed(!kpiBarCollapsed)}
          onRefresh={handleRefresh}
          kpisData={kpisData}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-slate-950/50">
          {tabs.length > 0 ? (
            <div className="h-full flex flex-col">
              <ValidationBCWorkspaceTabs />
              <div className="flex-1 overflow-hidden">
                <ValidationBCWorkspaceContent />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto p-6">
                {/* Advanced Search */}
                {['bc', 'factures', 'avenants', 'urgents'].includes(activeCategory) && (
                  <div className="mb-6">
                    <AdvancedSearchPanel
                      onSearch={handleSearchFiltersChange}
                      onReset={handleResetSearch}
                    />
                  </div>
                )}

                {/* Content based on category */}
                {activeCategory === 'overview' && activeSubCategory === 'dashboard' && (
                  <Dashboard360 />
                )}
                
                {activeCategory === 'overview' && activeSubCategory === 'all' && (
                  <ValidationDashboardCharts stats={statsData} />
                )}
                
                {activeCategory === 'overview' && activeSubCategory === 'kanban' && (
                  <KanbanView />
                )}
                
                {activeCategory === 'overview' && activeSubCategory === 'calendar' && (
                  <CalendarView />
                )}
                
                {activeCategory === 'overview' && activeSubCategory === 'budgets' && (
                  <BudgetsView />
                )}
                
                {activeCategory === 'bc' && permissions.canView && (
                  <BCListView
                    subCategory={activeSubCategory}
                    onDocumentClick={(doc) => openDocument(doc.id, 'bc')}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'factures' && permissions.canView && (
                  <FacturesListView
                    subCategory={activeSubCategory}
                    onDocumentClick={(doc) => openDocument(doc.id, 'facture')}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'avenants' && permissions.canView && (
                  <AvenantsListView
                    subCategory={activeSubCategory}
                    onDocumentClick={(doc) => openDocument(doc.id, 'avenant')}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'urgents' && permissions.canView && (
                  <UrgentsListView
                    subCategory={activeSubCategory}
                    onDocumentClick={(doc) => openDocument(doc.id, doc.type)}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'tendances' && permissions.canViewAnalytics && (
                  <TrendsView subCategory={activeSubCategory} />
                )}

                {activeCategory === 'validateurs' && permissions.canViewAnalytics && (
                  <ValidatorsView subCategory={activeSubCategory} />
                )}
                
                {activeCategory === 'services' && (
                  <ValidationBCServiceQueues
                    onOpenDocument={openDocument}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'regles' && permissions.canManageRules && (
                  <ValidationBCBusinessRules />
                )}

                {activeCategory === 'historique' && permissions.canView && (
                  <ValidationBCActivityHistory onViewDocument={(id) => openDocument(id, 'bc')} />
                )}

                {/* Permission Denied */}
                {!permissions.canView && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">🔒</div>
                      <h2 className="text-2xl font-bold text-slate-200">
                        Accès Restreint
                      </h2>
                      <p className="text-slate-400 max-w-md">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
                      </p>
                    </div>
                  </div>
                )}

                {/* Default message for other categories */}
                {!['overview', 'bc', 'factures', 'avenants', 'urgents', 'tendances', 'validateurs', 'services', 'regles', 'historique'].includes(activeCategory) && permissions.canView && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">📋</div>
                      <h2 className="text-2xl font-bold text-slate-200">
                        {currentCategoryLabel}
                      </h2>
                      <p className="text-slate-400 max-w-md">
                        Cette vue est en cours de développement.
                        Utilisez ⌘K pour ouvrir la palette de commandes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-700/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4 text-slate-500">
            <span>Dernière MAJ: {formatLastUpdate()}</span>
            {statsData && (
              <>
                <span>•</span>
                <span>{statsData.total} documents</span>
                <span>•</span>
                <span className="text-amber-400">{statsData.pending} en attente</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Connecté</span>
          </div>
        </footer>
      </div>

      {/* Notifications Panel (Slide-in from right) */}
      {notificationsPanelOpen && (
        <div className="w-80 border-l border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <ValidationBCNotifications />
        </div>
      )}

      {/* ================================ */}
      {/* Modals */}
      {/* ================================ */}
      <ValidationBCCommandPalette />
      <ValidationBCStatsModal />
      
      <ValidationBCExportModal 
        open={exportOpen} 
        onClose={() => setExportOpen(false)} 
        onExport={async () => { 
          toast.success('Export', 'Téléchargement...'); 
        }} 
      />
      
      <ValidationBCQuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={(doc) => {
          toast.success('Document créé', doc.id);
          openDocument(doc.id, doc.type);
        }}
      />
      
      <ValidationBCTimeline 
        open={timelineOpen} 
        onClose={() => setTimelineOpen(false)} 
      />
      
      <ValidationBCWorkflowEngine 
        open={workflowOpen} 
        onClose={() => setWorkflowOpen(false)} 
      />
      
      <ValidationBCPredictiveAnalytics 
        open={analyticsOpen} 
        onClose={() => setAnalyticsOpen(false)} 
      />
      
      <ValidationBCDelegationManager 
        open={delegationsOpen} 
        onClose={() => setDelegationsOpen(false)} 
      />
      
      <ValidationBCRemindersSystem 
        open={remindersOpen} 
        onClose={() => setRemindersOpen(false)} 
      />
      
      <ValidationBCMultiLevelValidation
        open={multiLevelValidationOpen}
        onClose={() => setMultiLevelValidationOpen(false)}
        document={selectedDocument}
      />
      
      <ValidationBCRequestJustificatif
        open={requestJustificatifOpen}
        onClose={() => setRequestJustificatifOpen(false)}
        document={selectedDocument}
      />
      
      {selectedDocument && (
        <ValidationBCValidationModal
          open={validationModalOpen}
          document={selectedDocument}
          onClose={() => {
            setValidationModalOpen(false);
            setSelectedDocument(null);
          }}
          onValidate={async (doc) => {
            toast.success('Document validé', doc.id);
            setValidationModalOpen(false);
            setSelectedDocument(null);
            await loadStats('manual');
          }}
          onReject={async (doc) => {
            toast.info('Document rejeté', doc.id);
            setValidationModalOpen(false);
            setSelectedDocument(null);
            await loadStats('manual');
          }}
        />
      )}
    </div>
    </ValidationBCErrorBoundary>
  );
}

export default function ValidationBCPage() {
  return (
    <ValidationBCToastProvider>
      <ValidationBCPageContent />
    </ValidationBCToastProvider>
  );
}
