'use client';

/**
 * Centre de Commandement Alertes & Risques - Version 2.0
 * Plateforme de surveillance et gestion des alertes
 * Architecture identique à Gouvernance/Analytics avec sidebar collapsible
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Nouvelle navigation hiérarchique
import { AlertesSidebar } from '@/modules/centre-alertes/navigation/AlertesSidebar';
import { AlertesSubNavigation, AlertesContentRouter } from '@/modules/centre-alertes/components';
import { findNavNodeById } from '@/modules/centre-alertes/navigation/alertesNavigationConfig';
import {
  useAlertesCommandCenterStore,
  type AlertesMainCategory,
} from '@/lib/stores/alertesCommandCenterStore';
import { useAlertesStats } from '@/modules/centre-alertes/hooks';

// Anciens composants conservés pour compatibilité
import { AlertsKPIBar } from '@/components/features/bmo/alerts/command-center';

import { AlertWorkspaceTabs } from '@/components/features/alerts/workspace/AlertWorkspaceTabs';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';
import { AlertLiveCounters } from '@/components/features/alerts/workspace/AlertLiveCounters';
import { AlertCommandPalette } from '@/components/features/alerts/workspace/AlertCommandPalette';
import { AlertDirectionPanel } from '@/components/features/alerts/workspace/AlertDirectionPanel';
import { AlertAlertsBanner } from '@/components/features/alerts/workspace/AlertAlertsBanner';
import { AlertExportModal } from '@/components/features/alerts/workspace/AlertExportModal';
import { AlertStatsModal } from '@/components/features/alerts/workspace/AlertStatsModal';
import { ToastProvider, useAlertToast } from '@/components/ui/toast';
import {
  AlertDetailModal,
  AcknowledgeModal,
  ResolveModal,
  EscalateModal,
} from '@/components/features/alerts/workspace/AlertWorkflowModals';
import { CommentModal } from '@/components/features/alerts/workspace/CommentModal';
import { AssignModal } from '@/components/features/alerts/workspace/AssignModal';
import { AlertsHelpModal } from '@/components/features/alerts/modals/AlertsHelpModal';
import {
  AlertsTrendChart,
  AlertsSeverityChart,
  AlertsResponseTimeChart,
  AlertsCategoryChart,
  AlertsResolutionRateChart,
  AlertsStatusChart,
  AlertsTeamPerformanceChart,
} from '@/components/features/alerts/analytics/AlertsAnalyticsCharts';

import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import {
  AlertTriangle,
  AlertCircle,
  Activity,
  RefreshCw,
  BarChart3,
  Download,
  Clock,
  Search,
  Keyboard,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Brain,
  Workflow,
  Bell,
  MoreHorizontal,
  Plus,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { alertsAPI } from '@/lib/api/pilotage/alertsClient';
import {
  useAlertTimeline,
  useAlertStats,
  useAcknowledgeAlert,
  useResolveAlert,
  useEscalateAlert,
} from '@/lib/api/hooks';
import { useAlertsWebSocket } from '@/lib/api/websocket/useAlertsWebSocket';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import { BatchActionsBar } from '@/components/features/bmo/alerts/BatchActionsBar';
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
interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

// ================================
// Helpers
// ================================
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
function AlertsPageContent() {
  const { tabs, openTab, selectedIds, clearSelection } = useAlertWorkspaceStore();
  const toast = useAlertToast();
  
  // Obtenir l'utilisateur courant
  const { user, can } = useCurrentUser();

  // Nouvelle navigation avec store Zustand
  const {
    navigation,
    sidebarCollapsed,
    toggleSidebar,
    navigate,
    goBack,
  } = useAlertesCommandCenterStore();

  // Mapping pour compatibilité avec anciennes catégories
  const mapOldCategoryToNew = (oldCategory: string): AlertesMainCategory => {
    const mapping: Record<string, AlertesMainCategory> = {
      'overview': 'overview',
      'critical': 'en-cours',
      'warning': 'en-cours',
      'sla': 'en-cours',
      'blocked': 'en-cours',
      'acknowledged': 'traitements',
      'resolved': 'traitements',
      'rules': 'governance',
      'history': 'governance',
      'favorites': 'governance',
    };
    return mapping[oldCategory] || 'overview';
  };

  const mapOldCategoryToSub = (oldCategory: string): string | null => {
    const mapping: Record<string, string> = {
      'critical': 'critiques',
      'warning': 'avertissements',
      'sla': 'sla-depasses',
      'blocked': 'blocages',
      'acknowledged': 'acquittees',
      'resolved': 'resolues',
    };
    return mapping[oldCategory] || null;
  };

  // Initialiser la navigation si nécessaire
  useEffect(() => {
    if (navigation.mainCategory === 'overview' && !navigation.subCategory) {
      // Navigation déjà initialisée par le store
    }
  }, [navigation]);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory;
  const activeSubSubCategory = navigation.subSubCategory;

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  // Dismissed banners
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Modals
  const [showDirectionPanel, setShowDirectionPanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Workflow modals
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  // Navigation entre alertes (J/K keys)
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [visibleAlerts, setVisibleAlerts] = useState<any[]>([]);

  // React Query hooks - TOUS les hooks doivent être appelés dans le même ordre à chaque render
  const {
    data: timelineData,
    isLoading: timelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useAlertTimeline({ days: 7 });

  const {
    data: statsQueryData,
    isLoading: statsQueryLoading,
    refetch: refetchStatsQuery,
  } = useAlertStats();

  // Stats depuis le nouveau hook - DOIT être appelé ici, pas plus tard
  const { data: statsData } = useAlertesStats();

  // Mutations
  const acknowledgeAlertMutation = useAcknowledgeAlert();
  const resolveAlertMutation = useResolveAlert();
  const escalateAlertMutation = useEscalateAlert();

  // WebSocket pour notifications en temps réel
  const { isConnected: wsConnected, lastNotification } = useAlertsWebSocket({
    enableBrowserNotifications: user?.preferences?.notifications?.browser ?? true,
    enableSound: user?.preferences?.notifications?.sound ?? true,
    criticalOnly: false,
  });

  // Gérer les notifications WebSocket
  useEffect(() => {
    if (lastNotification) {
      const { alert, type } = lastNotification;
      
      // Toast pour toutes les nouvelles alertes
      if (type === 'alert.created' || type === 'alert.critical') {
        toast.info(
          'Nouvelle alerte',
          `${alert.title} (${alert.severity})`
        );
      }
      
      // Rafraîchir les stats automatiquement
      refetchStatsQuery();
    }
  }, [lastNotification, toast, refetchStatsQuery]);

  // ================================
  // Computed values
  // ================================
  // statsData est déjà défini plus haut (tous les hooks doivent être en haut)
  const stats = useMemo(() => {
    if (!statsData) {
      return {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
        success: 0,
        acknowledged: 0,
        resolved: 0,
        escalated: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
      };
    }
    // Accès sécurisé aux propriétés avec fallback
    // Le type AlerteStats du module centre-alertes a une structure différente
    const parTypologie = statsData.parTypologie || {};
    const parStatut = statsData.parStatut || {};
    return {
      total: statsData.total || 0,
      critical: statsData.critiques || parTypologie.CRITIQUE || 0,
      warning: parTypologie.SLA || 0,
      info: parTypologie.PROJET || 0,
      success: parTypologie.RH || 0,
      acknowledged: parStatut.ACQUITTEE || 0,
      resolved: parStatut.RESOLUE || 0,
      escalated: 0, // Non disponible dans ce type
      avgResponseTime: 0, // Non disponible dans ce type
      avgResolutionTime: 0, // Non disponible dans ce type
    };
  }, [statsData]);

  const currentCategoryLabel = useMemo(() => {
    const node = findNavNodeById(activeCategory);
    return node?.label || 'Alertes & Risques';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    const mainNode = findNavNodeById(activeCategory);
    return mainNode?.children || [];
  }, [activeCategory]);

  const hasUrgentItems = useMemo(() => stats && (stats.critical > 0 || stats.escalated > 0), [stats]);

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
    // Rafraîchir les stats via React Query
    refetchStatsQuery();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 500);
  }, [refetchStatsQuery]);

  const handleCategoryChange = useCallback((category: string) => {
    // Si c'est déjà une nouvelle catégorie (overview, en-cours, traitements, governance), l'utiliser directement
    const newCategories: AlertesMainCategory[] = ['overview', 'en-cours', 'traitements', 'governance'];
    if (newCategories.includes(category as AlertesMainCategory)) {
      navigate(category as AlertesMainCategory, null, null);
    } else {
      // Sinon, mapper depuis l'ancienne catégorie
      const newCategory = mapOldCategoryToNew(category);
      const subCategory = mapOldCategoryToSub(category);
      navigate(newCategory, subCategory, null);
    }
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    navigate(activeCategory, activeSubCategory, subSubCategory);
  }, [activeCategory, activeSubCategory, navigate]);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const openQueue = useCallback(
    (queue: string) => {
      const queueConfig: Record<string, { title: string; icon: string }> = {
        critical: { title: 'Critiques', icon: '🔴' },
        warning: { title: 'Avertissements', icon: '⚠️' },
        blocked: { title: 'Bloqués', icon: '🚫' },
        sla: { title: 'SLA', icon: '⏱️' },
        resolved: { title: 'Résolues', icon: '✅' },
        info: { title: 'Info', icon: 'ℹ️' },
        acknowledged: { title: 'Acquittées', icon: '💜' },
        payment: { title: 'Paiements', icon: '💰' },
        contract: { title: 'Contrats', icon: '📄' },
        budget: { title: 'Budgets', icon: '📊' },
        system: { title: 'Système', icon: '⚙️' },
      };

      const config = queueConfig[queue] ?? { title: queue, icon: '📋' };

      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title: config.title,
        icon: config.icon,
        data: { queue },
      });
    },
    [openTab]
  );

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent('alert:open-command-palette'));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Les stats sont maintenant gérées par useAlertesStats() via React Query
  // Plus besoin de loadStats, setStats, etc.

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Palette de commandes
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Escape - Fermer les modales
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDirectionPanel(false);
        setShowExport(false);
        setShowStats(false);
        setHelpOpen(false);
        setDetailOpen(false);
        setAckOpen(false);
        setResolveOpen(false);
        setEscalateOpen(false);
        return;
      }

      // Navigation catégories (⌘1-5)
      if (isMod && e.key === '1') { e.preventDefault(); handleCategoryChange('critical'); }
      if (isMod && e.key === '2') { e.preventDefault(); handleCategoryChange('warning'); }
      if (isMod && e.key === '3') { e.preventDefault(); handleCategoryChange('sla'); }
      if (isMod && e.key === '4') { e.preventDefault(); handleCategoryChange('blocked'); }
      if (isMod && e.key === '5') { e.preventDefault(); handleCategoryChange('resolved'); }

      // ⌘E - Export
      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExport(true);
        return;
      }

      // ⌘B - Toggle sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((p) => !p);
        return;
      }

      // ? - Aide
      if (e.key === '?' && !isMod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // F1 - Aide
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // F11 - Plein écran
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Alt+← - Retour
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
        return;
      }

      // === NOUVEAUX RACCOURCIS AVANCÉS ===

      // / - Focus recherche
      if (e.key === '/' && !isMod) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // A - Acquitter (si une alerte est sélectionnée)
      if (e.key.toLowerCase() === 'a' && !isMod && selectedAlert) {
        e.preventDefault();
        setAckOpen(true);
        return;
      }

      // R - Résoudre (si une alerte est sélectionnée)
      if (e.key.toLowerCase() === 'r' && !isMod && selectedAlert) {
        e.preventDefault();
        setResolveOpen(true);
        return;
      }

      // E - Escalader (sans Ctrl/Cmd, si une alerte est sélectionnée)
      if (e.key.toLowerCase() === 'e' && !isMod && selectedAlert) {
        e.preventDefault();
        setEscalateOpen(true);
        return;
      }

      // N - Nouvelle note / commentaire
      if (e.key.toLowerCase() === 'n' && !isMod && selectedAlert) {
        e.preventDefault();
        setCommentOpen(true);
        return;
      }

      // I - Assigner (si une alerte est sélectionnée)
      if (e.key.toLowerCase() === 'i' && !isMod && selectedAlert && can('alerts.assign')) {
        e.preventDefault();
        setAssignOpen(true);
        return;
      }

      // J - Alerte suivante (navigation vim-style)
      if (e.key.toLowerCase() === 'j' && !isMod) {
        e.preventDefault();
        if (visibleAlerts.length === 0) {
          toast.warning('Navigation', 'Aucune alerte disponible');
          return;
        }
        const nextIndex = Math.min(currentAlertIndex + 1, visibleAlerts.length - 1);
        setCurrentAlertIndex(nextIndex);
        setSelectedAlert(visibleAlerts[nextIndex]);
        setDetailOpen(true);
        toast.success('Navigation', `Alerte ${nextIndex + 1}/${visibleAlerts.length}`);
        return;
      }

      // K - Alerte précédente (navigation vim-style)
      if (e.key.toLowerCase() === 'k' && !isMod) {
        e.preventDefault();
        if (visibleAlerts.length === 0) {
          toast.warning('Navigation', 'Aucune alerte disponible');
          return;
        }
        const prevIndex = Math.max(currentAlertIndex - 1, 0);
        setCurrentAlertIndex(prevIndex);
        setSelectedAlert(visibleAlerts[prevIndex]);
        setDetailOpen(true);
        toast.success('Navigation', `Alerte ${prevIndex + 1}/${visibleAlerts.length}`);
        return;
      }

      // G+A - Go to Active alerts
      if (e.key.toLowerCase() === 'g' && !isMod) {
        // Attendre le prochain keystroke
        const handleSecondKey = (e2: KeyboardEvent) => {
          if (e2.key.toLowerCase() === 'a') {
            e2.preventDefault();
            handleCategoryChange('overview');
          } else if (e2.key.toLowerCase() === 'c') {
            e2.preventDefault();
            handleCategoryChange('critical');
          } else if (e2.key.toLowerCase() === 'r') {
            e2.preventDefault();
            handleCategoryChange('resolved');
          }
          window.removeEventListener('keydown', handleSecondKey);
        };
        window.addEventListener('keydown', handleSecondKey);
        setTimeout(() => window.removeEventListener('keydown', handleSecondKey), 2000);
        return;
      }

      // ⌘R - Rafraîchir
      if (isMod && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }

      // ⌘S - Statistiques
      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowStats(true);
        return;
      }

      // ⌘D - Direction panel
      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDirectionPanel(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette, toggleFullscreen, handleGoBack, handleCategoryChange, selectedAlert, toast, handleRefresh]);

  // ================================
  // Render Content based on category
  // ================================
  const renderContent = () => {
    // Si des onglets workspace sont ouverts, afficher le workspace
    if (tabs.length > 0) {
      return (
        <div className="space-y-4 p-4">
          <AlertWorkspaceTabs />
          <AlertWorkspaceContent />
        </div>
      );
    }

    // Utiliser le nouveau router hiérarchique
    return (
      <AlertesContentRouter
        mainCategory={activeCategory}
        subCategory={activeSubCategory}
        subSubCategory={activeSubSubCategory}
      />
    );
  };

  // Ancien switch case conservé pour référence (non utilisé)
  const _oldRenderContent = () => {
    switch (activeCategory) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Bannière alertes critiques */}
            <AlertAlertsBanner
              dismissedIds={dismissedAlerts}
              onDismiss={(id) => setDismissedAlerts((prev) => new Set(prev).add(id))}
            />

            {/* Alertes critiques */}
            {stats && stats.critical > 0 && (
              <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium text-slate-100">
                        {stats.critical} alerte{stats.critical > 1 ? 's' : ''} critique{stats.critical > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-slate-400">
                        Action immédiate requise pour éviter un impact opérationnel ou financier
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleCategoryChange('critical')}
                    className="text-slate-300 hover:text-white"
                  >
                    Traiter
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Categories cards */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Par catégorie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'critical', name: 'Critiques', icon: AlertCircle, color: 'red', count: stats?.critical ?? 0 },
                  { id: 'warning', name: 'Avertissements', icon: AlertTriangle, color: 'amber', count: stats?.warning ?? 0 },
                  { id: 'sla', name: 'SLA dépassés', icon: Clock, color: 'purple', count: stats?.escalated ?? 0 },
                  { id: 'blocked', name: 'Bloqués', icon: Shield, color: 'orange', count: 0 },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          `bg-${cat.color}-500/20`
                        )}>
                          <Icon className={cn('w-5 h-5', `text-${cat.color}-400`)} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{cat.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-2xl font-bold',
                          cat.count > 0 ? `text-${cat.color}-400` : 'text-slate-500'
                        )}>
                          {cat.count}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Analytics & Tendances */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Analytics & Tendances
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Trend Chart */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Évolution des alertes</h3>
                  <AlertsTrendChart />
                </div>

                {/* Severity Distribution */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition par sévérité</h3>
                  <AlertsSeverityChart />
                </div>

                {/* Response Time */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Temps de réponse</h3>
                  <AlertsResponseTimeChart />
                </div>

                {/* Category Distribution */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition par catégorie</h3>
                  <AlertsCategoryChart />
                </div>

                {/* Resolution Rate */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Taux de résolution</h3>
                  <AlertsResolutionRateChart />
                </div>

                {/* Status Distribution */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Statut des alertes</h3>
                  <AlertsStatusChart />
                </div>

                {/* Team Performance */}
                <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 lg:col-span-2">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Performance des équipes</h3>
                  <AlertsTeamPerformanceChart />
                </div>
              </div>
            </section>

            {/* Outils avancés */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Outils avancés
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setShowDirectionPanel(true)}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <Activity className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Pilotage</p>
                  <p className="text-xs text-slate-500">Vue Direction</p>
                </button>
                <button
                  onClick={() => handleCategoryChange('blocked')}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <Shield className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Bloqués</p>
                  <p className="text-xs text-slate-500">Dossiers en attente</p>
                </button>
                <button
                  onClick={() => handleCategoryChange('rules')}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <Workflow className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Règles</p>
                  <p className="text-xs text-slate-500">Configuration</p>
                </button>
                <button
                  onClick={() => {}}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <Brain className="w-5 h-5 text-pink-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Analytics IA</p>
                  <p className="text-xs text-slate-500">Prédictions</p>
                </button>
                <button
                  onClick={() => setShowStats(true)}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Statistiques</p>
                  <p className="text-xs text-slate-500">Tableaux de bord</p>
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <Download className="w-5 h-5 text-slate-400 mb-2" />
                  <p className="font-medium text-sm text-slate-200">Export</p>
                  <p className="text-xs text-slate-500">Télécharger</p>
                </button>
              </div>
            </section>

            {/* Compteurs détaillés */}
            <section>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                Files de traitement
              </h2>
              <AlertLiveCounters onQueueClick={openQueue} compact={false} />
            </section>

            {/* Bloc gouvernance */}
            <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/30">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-400 flex-none" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-300">
                    Gouvernance d'exploitation
                  </h3>
                  <p className="text-sm text-slate-400">
                    Objectif : détecter tôt, prioriser juste, tracer tout. Chaque alerte nécessite une action documentée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'critical':
      case 'warning':
      case 'sla':
      case 'blocked':
      case 'acknowledged':
      case 'resolved':
        // Ouvrir automatiquement un onglet workspace pour ces catégories
        if (tabs.length === 0) {
          openQueue(activeCategory);
        }
        return <AlertWorkspaceContent />;

      case 'rules':
        return (
          <div className="p-8 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Règles d'alerte</h3>
            <p className="text-slate-400 mb-6">Configuration des seuils, escalades et notifications automatiques.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50">
                <Settings className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="font-medium text-slate-200 mb-1">Seuils</h4>
                <p className="text-sm text-slate-500">Définir les niveaux d'alerte</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50">
                <Workflow className="w-6 h-6 text-purple-400 mb-3" />
                <h4 className="font-medium text-slate-200 mb-1">Escalades</h4>
                <p className="text-sm text-slate-500">Chaîne de responsabilité</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50">
                <Bell className="w-6 h-6 text-amber-400 mb-3" />
                <h4 className="font-medium text-slate-200 mb-1">Notifications</h4>
                <p className="text-sm text-slate-500">Canaux et fréquence</p>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="p-8 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Historique des alertes</h3>
            <p className="text-slate-400">Journal des alertes et actions prises.</p>
          </div>
        );

      case 'favorites':
        return (
          <div className="p-8 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Alertes suivies</h3>
            <p className="text-slate-400">Vos alertes épinglées et favoris.</p>
          </div>
        );

      default:
        return null;
    }
  };

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Nouvelle Sidebar Navigation hiérarchique */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      <AlertesSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        stats={{
          critical: stats?.critical,
          warning: stats?.warning,
          sla: stats?.escalated,
          blocked: 0,
          acknowledged: stats?.acknowledged,
          resolved: stats?.resolved,
        }}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => toggleSidebar()}
        onOpenCommandPalette={openCommandPalette}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {useAlertesCommandCenterStore.getState().navigationHistory.length > 0 && (
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
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h1 className="text-base font-semibold text-slate-200">Alertes & Risques</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>

            {/* Urgent indicator */}
            {hasUrgentItems && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {stats?.critical} critique{(stats?.critical ?? 0) > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openCommandPalette}
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
              {hasUrgentItems && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats?.critical}
                </span>
              )}
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
                <DropdownMenuItem onClick={() => setShowDirectionPanel(true)}>
                  <Activity className="h-4 w-4 mr-2" />
                  Vue Direction
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowExport(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowStats(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Quitter plein écran
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Plein écran
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Raccourcis (?)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Nouvelle Sub Navigation hiérarchique */}
        <AlertesSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={{
            critical: stats?.critical,
            warning: stats?.warning,
            sla: stats?.escalated,
            blocked: 0,
            acknowledged: stats?.acknowledged,
            resolved: stats?.resolved,
          }}
        />

        {/* KPI Bar */}
        <AlertsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          stats={{
            critical: stats?.critical,
            warning: stats?.warning,
            sla: stats?.escalated,
            blocked: 0,
            acknowledged: stats?.acknowledged,
            resolved: stats?.resolved,
            avgResponseTime: stats?.avgResponseTime,
            avgResolutionTime: stats?.avgResolutionTime,
            total: stats?.total,
          }}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
          onKPIClick={(kpiId) => {
            if (['critical', 'warning', 'sla', 'blocked', 'acknowledged', 'resolved'].includes(kpiId)) {
              handleCategoryChange(kpiId);
            }
          }}
          isRefreshing={isRefreshing}
        />

        {/* Main Content avec nouveau router hiérarchique */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <AlertesContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats?.total ?? 0} alertes • {stats?.critical ?? 0} critiques • {stats?.resolved ?? 0} résolues
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  wsConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                )}
              />
              <span className="text-slate-500">
                {wsConnected ? 'Temps réel actif' : 'Hors ligne'}
              </span>
            </div>
            <span className="text-slate-700">•</span>
            {/* Sync Status */}
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

      {/* Workflow modals */}
      <AlertDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        alert={selectedAlert}
        onAcknowledge={() => setAckOpen(true)}
        onResolve={() => setResolveOpen(true)}
        onEscalate={() => setEscalateOpen(true)}
      />
      <AcknowledgeModal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        alert={selectedAlert}
        onConfirm={async (note) => {
          if (!selectedAlert?.id) return;
          try {
            await acknowledgeAlertMutation.mutateAsync({
              id: String(selectedAlert.id),
              note,
              userId: user.id,
            });
            toast.success('Alerte acquittée', 'Traçabilité enregistrée');
            setAckOpen(false);
            setDetailOpen(false);
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d\'acquitter');
          }
        }}
      />
      <ResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        alert={selectedAlert}
        onConfirm={async (resolution) => {
          if (!selectedAlert?.id) return;
          try {
            await resolveAlertMutation.mutateAsync({
              id: String(selectedAlert.id),
              resolutionType: resolution.type,
              note: resolution.note,
              proof: resolution.proof,
              userId: user.id,
            });
            toast.success('Alerte résolue', 'Résolution tracée');
            setResolveOpen(false);
            setDetailOpen(false);
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible de résoudre');
          }
        }}
      />
      <EscalateModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        alert={selectedAlert}
        onConfirm={async (escalation) => {
          if (!selectedAlert?.id) return;
          try {
            await escalateAlertMutation.mutateAsync({
              id: String(selectedAlert.id),
              escalateTo: escalation.to,
              reason: escalation.reason,
              priority: escalation.priority,
              userId: user.id,
            });
            toast.success('Escalade envoyée', 'Notification envoyée');
            setEscalateOpen(false);
            setDetailOpen(false);
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d\'escalader');
          }
        }}
      />

      {/* Comment Modal */}
      <CommentModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        alert={selectedAlert}
        onConfirm={async (comment) => {
          if (!selectedAlert?.id) return;
          try {
            console.log('Commentaire ajouté:', comment);
            toast.success('Commentaire ajouté', 'Votre commentaire a été publié');
            setCommentOpen(false);
          } catch (error) {
            toast.error('Erreur', 'Échec de l\'ajout du commentaire');
          }
        }}
      />

      {/* Assign Modal */}
      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        alert={selectedAlert}
        onConfirm={async (userId, note) => {
          if (!selectedAlert?.id) return;
          try {
            console.log('Alerte assignée à:', userId, 'Note:', note);
            toast.success('Alerte assignée', `Alerte assignée avec succès`);
            setAssignOpen(false);
            setSelectedAlert(null);
          } catch (error) {
            toast.error('Erreur', 'Échec de l\'assignation');
          }
        }}
      />

      {/* Command Palette */}
      <AlertCommandPalette />

      {/* Direction Panel */}
      <AlertDirectionPanel isOpen={showDirectionPanel} onClose={() => setShowDirectionPanel(false)} />

      {/* Export Modal */}
      <AlertExportModal open={showExport} onClose={() => setShowExport(false)} />

      {/* Stats Modal */}
      <AlertStatsModal open={showStats} onClose={() => setShowStats(false)} />

      {/* Help Modal */}
      {/* Help Modal */}
      <AlertsHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={() => setNotificationsPanelOpen(false)} />
      )}

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedIds.size}
        onAcknowledge={can('alerts.acknowledge') ? async () => {
          try {
            // Bulk acknowledge logic here
            const selectedArray = Array.from(selectedIds);
            for (const id of selectedArray) {
              await acknowledgeAlertMutation.mutateAsync({
                id: String(id),
                userId: user.id,
              });
            }
            toast.success('Alertes acquittées', `${selectedIds.size} alertes ont été acquittées`);
            clearSelection();
          } catch (e) {
            toast.error('Erreur', 'Impossible d\'acquitter les alertes');
          }
        } : undefined}
        onResolve={can('alerts.resolve') ? async () => {
          try {
            const selectedArray = Array.from(selectedIds);
            for (const id of selectedArray) {
              await resolveAlertMutation.mutateAsync({
                id: String(id),
                resolutionType: 'fixed',
                note: 'Résolution en masse',
                userId: user.id,
              });
            }
            toast.success('Alertes résolues', `${selectedIds.size} alertes ont été résolues`);
            clearSelection();
          } catch (e) {
            toast.error('Erreur', 'Impossible de résoudre les alertes');
          }
        } : undefined}
        onEscalate={can('alerts.escalate') ? async () => {
          try{
            const selectedArray = Array.from(selectedIds);
            for (const id of selectedArray) {
              await escalateAlertMutation.mutateAsync({
                id: String(id),
                escalateTo: 'direction',
                reason: 'Escalade en masse',
                userId: user.id,
              });
            }
            toast.success('Alertes escaladées', `${selectedIds.size} alertes ont été escaladées`);
            clearSelection();
          } catch (e) {
            toast.error('Erreur', 'Impossible d\'escalader les alertes');
          }
        } : undefined}
        onAssign={can('alerts.assign') ? async () => {
          toast.info('Fonction à venir', 'Sélection de l\'utilisateur en cours de développement');
        } : undefined}
        onDelete={can('alerts.delete') ? async () => {
          toast.warning('Suppression', 'Confirmation requise avant suppression');
        } : undefined}
        onClear={clearSelection}
      />
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    { id: '1', type: 'critical', title: 'Alerte critique: Dépassement budget', time: 'il y a 15 min', read: false },
    { id: '2', type: 'warning', title: 'SLA proche du dépassement', time: 'il y a 1h', read: false },
    { id: '3', type: 'info', title: 'Alerte résolue: Facture validée', time: 'il y a 3h', read: true },
    { id: '4', type: 'warning', title: 'Nouveau blocage détecté', time: 'il y a 5h', read: true },
    { id: '5', type: 'info', title: 'Escalade effectuée', time: 'hier', read: true },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
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

// Wrapper with ToastProvider
export default function AlertsPage() {
  return (
    <ToastProvider>
      <AlertsPageContent />
    </ToastProvider>
  );
}
