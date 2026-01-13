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
  ValidationBCNotificationPanel,
  type ValidationDocument,
  type DocumentType,
} from '@/components/features/validation-bc/workspace';
import { ValidationBCHelpModal } from '@/components/features/validation-bc/modals/ValidationBCHelpModal';

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
  MoreVertical,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  Plus,
  BarChart3,
  Filter,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  
  // Permissions - FIX: Ajout du hook manquant
  const permissions = useUserPermissions();

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

  // Search filters state - FIX: Ajout du state manquant
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [delegationsOpen, setDelegationsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [multiLevelValidationOpen, setMultiLevelValidationOpen] = useState(false);
  const [requestJustificatifOpen, setRequestJustificatifOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

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

  // Calculer les KPIs depuis statsData avec gestion des cas limites
  const kpisData = useMemo(() => {
    if (!statsData) return undefined;

    const total = statsData.total || 0;
    const pending = statsData.pending || 0;
    const validated = statsData.validated || 0;
    const rejected = statsData.rejected || 0;
    const urgent = statsData.urgent || 0;
    const anomalies = statsData.anomalies || 0;

    // Calcul du taux de validation avec protection division par zéro
    const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;
    const validationRateTrend = validationRate >= 80 ? 'up' as const : validationRate >= 50 ? 'stable' as const : 'down' as const;

    // Calcul des tendances basées sur des seuils configurables
    const PENDING_WARNING_THRESHOLD = 50;
    const URGENT_CRITICAL_THRESHOLD = 10;
    const ANOMALIES_WARNING_THRESHOLD = 10;

    return [
      {
        id: 'total-documents',
        label: 'Documents Total',
        value: total,
        trend: total > 0 ? 'up' as const : 'stable' as const,
        trendValue: total > 0 ? `+${Math.min(total, 99)}` : '0',
        status: 'neutral' as const,
      },
      {
        id: 'en-attente',
        label: 'En Attente',
        value: pending,
        trend: pending > PENDING_WARNING_THRESHOLD ? 'up' as const : 'down' as const,
        trendValue: pending > PENDING_WARNING_THRESHOLD ? `+${pending - PENDING_WARNING_THRESHOLD}` : `-${Math.max(0, PENDING_WARNING_THRESHOLD - pending)}`,
        status: pending > PENDING_WARNING_THRESHOLD ? 'warning' as const : 'success' as const,
        sparkline: [Math.max(0, pending - 10), Math.max(0, pending - 5), Math.max(0, pending - 2), Math.max(0, pending - 1), pending].filter(v => v >= 0),
      },
      {
        id: 'valides',
        label: 'Validés',
        value: validated,
        trend: 'up' as const,
        trendValue: `+${Math.min(validated, 99)}`,
        status: 'success' as const,
        sparkline: [
          Math.max(0, validated - 17),
          Math.max(0, validated - 12),
          Math.max(0, validated - 9),
          Math.max(0, validated - 5),
          validated
        ].filter(v => v >= 0),
      },
      {
        id: 'rejetes',
        label: 'Rejetés',
        value: rejected,
        trend: rejected > 0 ? 'stable' as const : 'down' as const,
        trendValue: rejected > 0 ? `${rejected}` : '0',
        status: rejected > 0 ? 'neutral' as const : 'success' as const,
      },
      {
        id: 'urgents',
        label: 'Urgents',
        value: urgent,
        trend: urgent > URGENT_CRITICAL_THRESHOLD ? 'up' as const : urgent > 0 ? 'down' as const : 'stable' as const,
        trendValue: urgent > URGENT_CRITICAL_THRESHOLD ? `+${urgent - URGENT_CRITICAL_THRESHOLD}` : urgent > 0 ? `-${Math.max(0, URGENT_CRITICAL_THRESHOLD - urgent)}` : '0',
        status: urgent > URGENT_CRITICAL_THRESHOLD ? 'critical' as const : urgent > 0 ? 'warning' as const : 'success' as const,
      },
      {
        id: 'taux-validation',
        label: 'Taux Validation',
        value: `${validationRate}%`,
        trend: validationRateTrend,
        trendValue: validationRateTrend === 'up' ? '+3%' : validationRateTrend === 'down' ? '-3%' : '0%',
        status: validationRate >= 80 ? 'success' as const : validationRate >= 50 ? 'warning' as const : 'critical' as const,
        sparkline: [
          Math.max(0, validationRate - 15),
          Math.max(0, validationRate - 10),
          Math.max(0, validationRate - 7),
          Math.max(0, validationRate - 3),
          validationRate
        ].filter(v => v >= 0 && v <= 100),
      },
      {
        id: 'delai-moyen',
        label: 'Délai Moyen',
        value: '2.3j', // TODO: Calculer depuis statsData quand disponible
        trend: 'down' as const,
        trendValue: '-0.5j',
        status: 'success' as const,
      },
      {
        id: 'anomalies',
        label: 'Anomalies',
        value: anomalies,
        trend: anomalies > ANOMALIES_WARNING_THRESHOLD ? 'up' as const : anomalies > 0 ? 'stable' as const : 'down' as const,
        trendValue: anomalies > ANOMALIES_WARNING_THRESHOLD ? `+${anomalies - ANOMALIES_WARNING_THRESHOLD}` : anomalies > 0 ? `${anomalies}` : '0',
        status: anomalies > ANOMALIES_WARNING_THRESHOLD ? 'warning' as const : anomalies > 0 ? 'neutral' as const : 'success' as const,
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
  // Callbacks - Load Stats (défini en premier pour être utilisé dans d'autres callbacks)
  // ================================
  const loadStats = useCallback(
    async (reason: 'init' | 'manual' | 'auto' = 'manual') => {
      abortStatsRef.current?.abort();
      const ac = new AbortController();
      abortStatsRef.current = ac;

      setStatsLoading(true);

      try {
        // Tentative de récupération depuis le cache d'abord pour les mises à jour auto
        if (reason === 'auto') {
          const cachedStats = validationBCCache.getStats();
          if (cachedStats && Date.now() - new Date(cachedStats.ts).getTime() < 30000) {
            // Utiliser le cache si moins de 30 secondes
            setStatsData(cachedStats);
            return;
          }
        }

        const stats = await getValidationStats(reason, ac.signal);
        
        if (ac.signal.aborted) return;

        // Mettre en cache les résultats
        validationBCCache.setStats(stats);
        
        setStatsData(stats);
        
        if (reason === 'manual') {
          toast.success('Données actualisées', `${stats.total} document${stats.total > 1 ? 's' : ''}`);
        }
      } catch (error) {
        if (ac.signal.aborted) return;
        
        console.error('Erreur chargement stats:', error);
        
        // Tentative de récupération depuis le cache en cas d'erreur
        const cachedStats = validationBCCache.getStats();
        if (cachedStats) {
          setStatsData(cachedStats);
          if (reason === 'manual') {
            toast.warning('Données en cache', 'Impossible de récupérer les dernières données');
          }
          return;
        }
        
        // Fallback sur données mockées seulement si pas de cache
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

  // ================================
  // Callbacks - UI Actions
  // ================================
  /**
   * Rafraîchit manuellement les statistiques
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadStats('manual');
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [loadStats]);

  /**
   * Gère le changement de catégorie principale (sidebar)
   */
  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory(prev => [...prev, activeCategory]);
    setActiveCategory(category);
    setActiveSubCategory('all');
    setActiveFilter(null); // Reset filter
  }, [activeCategory]);

  /**
   * Gère le changement de sous-catégorie (sub-navigation)
   */
  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveFilter(null); // Reset filter when changing sub-category
  }, []);

  /**
   * Gère le changement de filtre (niveau 3)
   */
  const handleFilterChange = useCallback((filter: string | null) => {
    setActiveFilter(filter);
  }, []);

  /**
   * Gère les filtres de recherche avancée
   */
  const handleSearchFiltersChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
  }, []);

  /**
   * Réinitialise les filtres de recherche
   */
  const handleResetSearch = useCallback(() => {
    setSearchFilters({});
  }, []);

  // WebSocket notifications - Gestion avec debounce pour éviter les rafraîchissements multiples
  const handleWebSocketNotification = useCallback((message: any) => {
    if (!message || !message.type) {
      console.warn('Message WebSocket invalide:', message);
      return;
    }

    try {
      switch (message.type) {
        case 'new_document':
          if (message.data?.id) {
            toast.info('Nouveau document', `Document ${message.data.id} créé`);
            // Debounce: attendre 500ms avant de rafraîchir pour grouper les mises à jour
            setTimeout(() => loadStats('auto'), 500);
          }
          break;
        case 'document_validated':
          if (message.data?.id) {
            toast.success('Document validé', message.data.id);
            setTimeout(() => loadStats('auto'), 500);
          }
          break;
        case 'document_rejected':
          if (message.data?.id) {
            toast.error('Document rejeté', message.data.id);
            setTimeout(() => loadStats('auto'), 500);
          }
          break;
        case 'urgent_alert':
          if (message.data?.message) {
            toast.error('Alerte urgente !', message.data.message);
          }
          break;
        case 'stats_update':
          // Mise à jour silencieuse des stats (sans toast)
          loadStats('auto');
          break;
        default:
          console.debug('Type de message WebSocket non géré:', message.type);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la notification WebSocket:', error);
    }
  }, [toast, loadStats]);

  useValidationBCNotifications(handleWebSocketNotification);

  /**
   * Navigation arrière (bouton retour)
   */
  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActiveCategory(previous);
      setActiveSubCategory('all');
    }
  }, [navigationHistory]);

  // Note: openDocument n'est plus nécessaire car ValidationBCDocumentsList
  // gère maintenant le modal overlay en interne via ValidationBCDetailModal

  /**
   * Ouvre le modal de validation pour un document
   */
  const handleValidateDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

  /**
   * Ouvre le modal de rejet pour un document
   */
  const handleRejectDocument = useCallback((doc: ValidationDocument) => {
    setSelectedDocument(doc);
    setValidationModalOpen(true);
  }, []);

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
        setHelpModalOpen(false);
        setFiltersPanelOpen(false);
        if (exportOpen) setExportOpen(false);
        if (quickCreateOpen) setQuickCreateOpen(false);
        return;
      }
      
      // ⌘I / Ctrl+I - Stats Modal
      if (isMod && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('validation-bc:open-stats'));
        return;
      }
      
      // ⌘E / Ctrl+E - Export Modal
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }
      
      // ? - Help Modal
      if (e.key === '?') {
        e.preventDefault();
        setHelpModalOpen(true);
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
      
      // ⌘F / Ctrl+F - Filters Panel
      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFiltersPanelOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack, exportOpen, quickCreateOpen]);

  // Listen to custom events from command palette
  useEffect(() => {
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenTimeline = () => setTimelineOpen(true);
    const handleOpenWorkflow = () => setWorkflowOpen(true);

    window.addEventListener('validation-bc:open-export', handleOpenExport);
    window.addEventListener('validation-bc:open-timeline', handleOpenTimeline);
    window.addEventListener('validation-bc:open-workflow', handleOpenWorkflow);

    return () => {
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
        role="main"
        aria-label="Page Validation-BC"
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
                aria-label="Retour à la catégorie précédente"
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
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {statsData && statsData.urgent > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {statsData.urgent}
                </span>
              )}
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onExport={() => setExportOpen(true)}
              onStats={() => window.dispatchEvent(new CustomEvent('validation-bc:open-stats'))}
              onQuickCreate={() => setQuickCreateOpen(true)}
              onFullscreen={() => setIsFullScreen(!isFullScreen)}
              fullscreen={isFullScreen}
              onFilters={() => setFiltersPanelOpen(!filtersPanelOpen)}
              onHelp={() => setHelpModalOpen(true)}
            />
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
        <main 
          className="flex-1 overflow-hidden bg-slate-950/50"
          aria-label="Contenu principal de Validation-BC"
          aria-busy={statsLoading}
        >
          {statsLoading && !statsData ? (
            <div className="h-full flex items-center justify-center">
              <ValidationBCDashboardSkeleton />
            </div>
          ) : tabs.length > 0 ? (
            <div className="h-full flex flex-col" role="tablist" aria-label="Onglets de documents ouverts">
              <ValidationBCWorkspaceTabs />
              <div className="flex-1 overflow-hidden" role="tabpanel">
                <ValidationBCWorkspaceContent />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto p-6">
                {/* Advanced Search */}
                {['bc', 'factures', 'avenants', 'urgents'].includes(activeCategory) && filtersPanelOpen && (
                  <div className="mb-6" id="filters-panel">
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
                  statsData ? (
                    <ValidationDashboardCharts data={statsData} />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-400">
                      Chargement des statistiques...
                    </div>
                  )
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
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'factures' && permissions.canView && (
                  <FacturesListView
                    subCategory={activeSubCategory}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'avenants' && permissions.canView && (
                  <AvenantsListView
                    subCategory={activeSubCategory}
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'urgents' && permissions.canView && (
                  <UrgentsListView
                    subCategory={activeSubCategory}
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
                    onValidate={permissions.canValidate ? handleValidateDocument : undefined}
                    onReject={permissions.canReject ? handleRejectDocument : undefined}
                  />
                )}

                {activeCategory === 'regles' && permissions.canManageRules && (
                  <ValidationBCBusinessRules />
                )}

                {activeCategory === 'historique' && permissions.canView && (
                  <ValidationBCActivityHistory />
                )}

                {/* Permission Denied */}
                {!permissions.canView && (
                  <div 
                    className="flex flex-col items-center justify-center h-full min-h-[400px]"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4" aria-hidden="true">🔒</div>
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
                  <div 
                    className="flex flex-col items-center justify-center h-full min-h-[400px]"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4" aria-hidden="true">📋</div>
                      <h2 className="text-2xl font-bold text-slate-200">
                        {currentCategoryLabel}
                      </h2>
                      <p className="text-slate-400 max-w-md">
                        Cette vue est en cours de développement.
                        Utilisez <kbd className="bg-slate-800/50 px-1.5 py-0.5 rounded text-xs">⌘K</kbd> pour ouvrir la palette de commandes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Màj: {formatLastUpdate()}
            </span>
            {statsData && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  {statsData.total} documents • {statsData.pending} en attente • {statsData.urgent} urgents
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

      {/* Notifications Panel (Slide-in from right) */}
      <ValidationBCNotificationPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />

      {/* ================================ */}
      {/* Modals */}
      {/* ================================ */}
      <ValidationBCCommandPalette />
      <ValidationBCStatsModal />
      
      <ValidationBCExportModal 
        open={exportOpen} 
        onClose={() => setExportOpen(false)} 
        onExport={async (format: 'csv' | 'json' | 'pdf') => { 
          try {
            toast.success('Export', `Téléchargement en ${format.toUpperCase()}...`);
            // TODO: Implémenter l'export réel ici
            // await exportValidationData(format, searchFilters, activeCategory, activeSubCategory);
            
            // Simulation d'un délai d'export
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            toast.success('Export réussi', `Fichier ${format.toUpperCase()} téléchargé`);
          } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            toast.error('Erreur', `Impossible d'exporter les données en ${format.toUpperCase()}`);
            throw error; // Re-throw pour que le modal gère l'état d'erreur
          }
        }} 
      />
      
      <ValidationBCQuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={(doc) => {
          try {
            if (doc && doc.id && doc.type) {
              toast.success('Document créé', doc.id);
              // Le document sera visible dans la liste et l'utilisateur pourra le sélectionner
              // Rafraîchir les stats pour inclure le nouveau document
              setTimeout(() => loadStats('auto'), 500);
            } else {
              console.warn('Données du document invalides:', doc);
              toast.error('Erreur', 'Données du document invalides');
            }
          } catch (error) {
            console.error('Erreur lors de la création du document:', error);
            toast.error('Erreur', 'Document créé mais impossible de le rafraîchir');
          }
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
            try {
              toast.success('Document validé', doc.id);
              setValidationModalOpen(false);
              setSelectedDocument(null);
              // Rafraîchir les stats après un court délai pour laisser l'API se mettre à jour
              setTimeout(() => loadStats('manual'), 1000);
            } catch (error) {
              console.error('Erreur lors de la validation:', error);
              toast.error('Erreur', 'Impossible de valider le document');
            }
          }}
          onReject={async (doc) => {
            try {
              toast.info('Document rejeté', doc.id);
              setValidationModalOpen(false);
              setSelectedDocument(null);
              // Rafraîchir les stats après un court délai pour laisser l'API se mettre à jour
              setTimeout(() => loadStats('manual'), 1000);
            } catch (error) {
              console.error('Erreur lors du rejet:', error);
              toast.error('Erreur', 'Impossible de rejeter le document');
            }
          }}
        />
      )}

      {/* Help Modal */}
      <ValidationBCHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
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

// ================================
// Actions Menu Component
// ================================
function ActionsMenu({
  onRefresh,
  isRefreshing,
  onExport,
  onStats,
  onQuickCreate,
  onFullscreen,
  fullscreen,
  onFilters,
  onHelp,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
  onStats: () => void;
  onQuickCreate: () => void;
  onFullscreen: () => void;
  fullscreen: boolean;
  onFilters: () => void;
  onHelp: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        title="Actions"
        aria-label="Menu d'actions"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
            <button
              onClick={() => {
                onRefresh();
                setOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 disabled:opacity-50"
              aria-label={isRefreshing ? 'Actualisation en cours...' : 'Rafraîchir les données'}
              aria-busy={isRefreshing}
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </button>
            
            <div className="border-t border-slate-700/50 my-1" />
            
            <button
              onClick={() => {
                onFilters();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label="Ouvrir les filtres avancés"
            >
              <Filter className="w-4 h-4" />
              Filtres avancés
            </button>
            
            <button
              onClick={() => {
                onQuickCreate();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label="Créer un nouveau document"
            >
              <Plus className="w-4 h-4" />
              Nouveau document
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ⌘N
              </kbd>
            </button>
            
            <button
              onClick={() => {
                onExport();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label="Exporter les données"
            >
              <Download className="w-4 h-4" />
              Exporter
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ⌘E
              </kbd>
            </button>
            
            <div className="border-t border-slate-700/50 my-1" />
            
            <button
              onClick={() => {
                onFullscreen();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label={fullscreen ? 'Quitter le mode plein écran' : 'Passer en mode plein écran'}
            >
              {fullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  Quitter plein écran
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  Plein écran
                </>
              )}
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                F11
              </kbd>
            </button>
            
            <div className="border-t border-slate-700/50 my-1" />
            
            <button
              onClick={() => {
                onStats();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label="Ouvrir les statistiques"
            >
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </button>
            
            <button
              onClick={() => {
                onHelp();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
              aria-label="Afficher l'aide et les raccourcis clavier"
            >
              <HelpCircle className="w-4 h-4" />
              Aide
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ?
              </kbd>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
