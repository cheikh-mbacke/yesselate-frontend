'use client';

/**
 * Page de Gouvernance unifiée
 * Fusionne :
 * - Matrice RACI (anciennement /raci)
 * - Alertes & Incidents (anciennement /alerts)
 * 
 * WHY: Les deux concepts sont liés (RACI définit les responsabilités,
 * Alertes les utilisent pour assigner l'ownership). Une page unifiée
 * améliore l'UX et évite la duplication.
 */

import type React from 'react';
import { useState, useReducer, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Logger } from '@/lib/services/logger';
import { handleApiError, requiresRedirect } from '@/lib/utils/error-handling';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  AlertDetailsPanel,
  AlertFilters,
  AlertPerformanceIndicators,
  EscalateToBMOModal,
  ResolveAlertModal,
} from '@/components/features/bmo/alerts';
import { lazy, Suspense } from 'react';
import {
  GovernanceHeader,
} from '@/components/features/bmo/governance';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Lazy load des onglets (PHASE 3 : Code splitting)
const RACITab = lazy(() => import('@/components/features/bmo/governance').then(m => ({ default: m.RACITab })));
const AlertsTab = lazy(() => import('@/components/features/bmo/governance').then(m => ({ default: m.AlertsTab })));
import { raciEnriched } from '@/lib/data';
import {
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  bureaux,
} from '@/lib/data';
import { ActionLogType, type ActionLog } from '@/lib/types/bmo.types';
import type { ToastFunction, ActionLogFunction } from '@/lib/types/governance.types';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { useGovernanceFilters } from '@/hooks/useGovernanceFilters';
import { useGovernanceRACI } from '@/hooks/useGovernanceRACI';
import { useGovernanceAlerts } from '@/hooks/useGovernanceAlerts';
import { useGovernanceKeyboardShortcuts } from '@/hooks/useGovernanceKeyboardShortcuts';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOptimisticAlerts } from '@/hooks/useOptimisticAlerts';
import { useListKeyboardNavigation } from '@/hooks/useListKeyboardNavigation';
import { SkipLink } from '@/components/ui/skip-link';
import { AriaLiveRegion } from '@/components/ui/aria-live-region';
import { ScreenReaderOnly } from '@/components/ui/screen-reader-only';
import { RACITableSkeleton, AlertsListSkeleton } from '@/components/ui/skeletons';
import { useFocusManagement } from '@/hooks/useFocusManagement';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useBulkOperationProgress } from '@/hooks/useBulkOperationProgress';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { usePrintMode } from '@/hooks/usePrintMode';
import { BulkProgressModal } from '@/components/ui/bulk-progress-modal';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

/* =========================================================
   TYPES & CONFIGURATION
   ========================================================= */

type TabValue = 'raci' | 'alerts';

type AlertType = 'system' | 'blocked' | 'payment' | 'contract';

interface Ownership {
  bureau?: string;
  userId?: string;
  userName?: string;
  role?: 'A' | 'R'; // Accountable / Responsible
}

// Types importés depuis useGovernanceFilters
type SavedView = import('@/hooks/useGovernanceFilters').SavedView;
type GovernanceFilters = import('@/hooks/useGovernanceFilters').GovernanceFilters;

const RACI_COLORS: Record<string, string> = {
  'R': 'bg-emerald-400/80 text-white',
  'A': 'bg-blue-400/80 text-white',
  'C': 'bg-amber-400/80 text-white',
  'I': 'bg-slate-400/80 text-white',
  '-': 'bg-slate-700/30 text-slate-500',
};

const RACI_LABELS: Record<string, string> = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '-': 'Non impliqué',
};

// Types importés depuis governance.types.ts

/* =========================================================
   REDUCER POUR L'ÉTAT UI
   ========================================================= */

type GovernanceUIAction =
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_SHORTCUTS' }
  | { type: 'CLOSE_MODALS' }
  | { type: 'SET_EXPORTING'; payload: boolean };

interface GovernanceUIState {
  focusMode: boolean;
  showShortcuts: boolean;
  isExporting: boolean;
}

function governanceUIReducer(
  state: GovernanceUIState,
  action: GovernanceUIAction
): GovernanceUIState {
  switch (action.type) {
    case 'TOGGLE_FOCUS_MODE':
      return { ...state, focusMode: !state.focusMode };
    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts };
    case 'CLOSE_MODALS':
      return { ...state, showShortcuts: false };
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
    default:
      return state;
  }
}

/* =========================================================
   PAGE PRINCIPALE
   ========================================================= */

export default function GovernancePage() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, openSubstitutionModal } = useBMOStore();
  
  // 📊 Performance Monitoring
  usePerformanceMonitoring('governance');
  
  // 📈 Analytics
  const { trackEvent } = useAnalytics();
  
  // 📄 Export PDF
  const { exportToPDF } = usePDFExport();
  
  // 📊 Progression des opérations groupées
  const bulkProgress = useBulkOperationProgress();
  
  // 📡 Support mode hors ligne
  const offlineSupport = useOfflineSupport({
    onOnline: () => {
      addToast('Connexion rétablie - Synchronisation en cours...', 'info');
    },
    onOffline: () => {
      addToast('Mode hors ligne activé - Les modifications seront synchronisées au retour en ligne', 'warning');
    },
  });
  
  // 🖨️ Mode impression
  const { print } = usePrintMode(true);
  
  // 🎯 PHASE 1 : Utilisation du hook centralisé pour les filtres
  const {
    activeTab,
    search,
    filters,
    activeViewId,
    views,
    activeView,
    updateTab,
    updateSearch,
    updateFilters,
    updateViewId,
    saveView,
  } = useGovernanceFilters();

  // 🎯 État UI avec useReducer
  const [uiState, dispatchUI] = useReducer(governanceUIReducer, {
    focusMode: false,
    showShortcuts: false,
    isExporting: false,
  });
  
  // 🎯 PHASE 2 : Utilisation des hooks métier
  const raciHook = useGovernanceRACI();
  const alertsHook = useGovernanceAlerts(search, filters, activeView, uiState.focusMode);
  
  // ⚡ Optimistic Updates pour les alertes
  const { optimisticAlerts, applyOptimisticUpdate } = useOptimisticAlerts(
    alertsHook.alerts,
    async (alertId: string, updates: Partial<typeof alertsHook.alerts[0]>) => {
      // Simuler l'appel API (à remplacer par un vrai appel)
      await new Promise((resolve) => setTimeout(resolve, 500));
      trackEvent('alert_updated', { alertId, updates });
    }
  );
  
  // 🔄 Référence pour la recherche
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-sync sidebar
  useAutoSyncCounts('governance', () => alertsHook.alertsStats.critical, { interval: 30000, immediate: true });
  
  // ⌨️ Navigation clavier dans les alertes
  useListKeyboardNavigation(
    alertsHook.filteredAlerts,
    alertsHook.selectedAlert,
    (id) => {
      alertsHook.setSelectedAlert(id);
      trackEvent('alert_selected', { alertId: id });
    },
    activeTab === 'alerts'
  );
  
  // 🎯 Gestion du focus (après alertsHook)
  const focusManagement = useFocusManagement({
    currentId: alertsHook.selectedAlert,
    items: alertsHook.filteredAlerts,
    onFocus: (id) => {
      alertsHook.setSelectedAlert(id);
    },
  });

  // Handlers pour les actions
  const handleCloseModals = useCallback(() => {
    raciHook.setSelectedActivity(null);
    alertsHook.setSelectedAlert(null);
    alertsHook.setEscalateModalOpen(false);
    alertsHook.setResolveModalOpen(false);
  }, [raciHook, alertsHook]);

  const handleFocusModeToggle = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_FOCUS_MODE' });
    addToast(`Mode Focus ${uiState.focusMode ? 'désactivé' : 'activé'}`, 'info');
  }, [uiState.focusMode, addToast]);

  const handleShortcutsToggle = useCallback(() => {
    dispatchUI({ type: 'TOGGLE_SHORTCUTS' });
  }, []);

  // ⌨️ Raccourcis clavier
  useGovernanceKeyboardShortcuts({
    activeTab,
    searchInputRef,
    onTabChange: updateTab,
    onFocusModeToggle: handleFocusModeToggle,
    onShortcutsToggle: handleShortcutsToggle,
    onCloseModals: handleCloseModals,
    onToggleComparator: () => raciHook.setShowComparator(!raciHook.showComparator),
    onToggleHeatmap: () => raciHook.setShowHeatmap(!raciHook.showHeatmap),
    onToggleAISuggestions: () => raciHook.setShowAISuggestions(!raciHook.showAISuggestions),
    onBulkAcknowledge: () => handleBulkAction('acknowledge'),
    onBulkResolve: () => handleBulkAction('resolve'),
    canBulkAction: alertsHook.selectedAlertIds.size > 0,
    addToast,
  });

  // ✅ PHASE 2 : Toute la logique RACI et Alerts est maintenant dans les hooks

  // Handlers
  const handleRACIExport = useCallback(async () => {
    try {
      dispatchUI({ type: 'SET_EXPORTING', payload: true });
      
      // Export CSV (existant)
      raciHook.handleExport(addToast, (log) => {
        addActionLog({
          ...log,
          action: log.action as ActionLogType,
        });
      });
      
      // Option d'export PDF
      const exportPDF = window.confirm('Exporter également en PDF ?');
      if (exportPDF) {
        await exportToPDF({
          title: 'Matrice RACI',
          content: document.getElementById('raci-table') || '',
          filename: `matrice_raci_${new Date().toISOString().slice(0, 10)}.pdf`,
        });
        addToast('Export PDF généré', 'success');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de l\'export RACI', errorObj, { type: 'raci' });
      const userMessage = handleApiError(error);
      addToast(userMessage, 'error');
    } finally {
      dispatchUI({ type: 'SET_EXPORTING', payload: false });
    }
  }, [raciHook, addToast, addActionLog, exportToPDF]);

  const handleAlertsExport = useCallback(() => {
    alertsHook.handleExport(
      alertsHook.filteredAlerts,
      activeView,
      filters,
      addToast,
      addActionLog
    );
  }, [alertsHook, activeView, filters, addToast, addActionLog]);

  const handleAlertAction = useCallback((action: string, alertId: string) => {
    try {
      const alert = alertsHook.alerts.find(a => a.id === alertId);
      if (!alert) {
        addToast('Alerte introuvable', 'warning');
        return;
      }

      // 📈 Analytics
      trackEvent('alert_action', {
        action,
        alertId,
        alertType: alert.type,
        severity: alert.severity,
      });

      switch (action) {
        case 'substitute':
          if (alert.type === 'blocked' && alert.entity) {
            const dossier = blockedDossiers.find(d => d.id === alert.entity?.id);
            if (dossier) {
              openSubstitutionModal(dossier);
              addToast('Modal de substitution ouverte', 'info');
            } else {
              addToast('Dossier introuvable', 'warning');
            }
          }
          break;

        case 'escalate':
          alertsHook.setAlertToAction(alert);
          alertsHook.setEscalateModalOpen(true);
          break;

        case 'acknowledge':
          // ⚡ Optimistic update
          applyOptimisticUpdate(alertId, { status: 'ack' as const }).catch(() => {
            addToast('Erreur lors de l\'acquittement', 'error');
          });
          
          addActionLog({
            userId: 'USR-001',
            userName: 'A. DIALLO',
            userRole: 'Directeur Général',
            module: 'governance',
            action: 'modification' as ActionLogType,
            targetId: alertId,
            targetType: 'Alerte',
            details: `Alerte acquittée: ${alert.title}`,
          });
          addToast('Alerte acquittée', 'success');
          
          // 🎯 Gérer le focus sur l'élément suivant
          focusManagement.moveFocusToNext(alertId);
          break;

        case 'resolve':
          alertsHook.setAlertToAction(alert);
          alertsHook.setResolveModalOpen(true);
          break;

        default:
          Logger.warn(`Action inconnue: ${action}`, { action, alertId });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de l\'action sur l\'alerte', errorObj, { action, alertId });
      const userMessage = handleApiError(error);
      addToast(userMessage, 'error');
      if (requiresRedirect(error)) {
        router.push('/login');
      }
      trackEvent('alert_action_error', { action, alertId, error: String(error) });
    }
  }, [alertsHook, addToast, addActionLog, openSubstitutionModal, trackEvent, applyOptimisticUpdate]);

  const handleEscalate = useCallback((message: string) => {
    try {
      if (!alertsHook.alertToAction) {
        addToast('Aucune alerte sélectionnée', 'warning');
        return;
      }
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'governance',
        action: 'modification' as ActionLogType,
        targetId: alertsHook.alertToAction.id,
        targetType: 'Alerte',
        details: `Escaladée au BMO: ${message.substring(0, 100)}`,
      });
      addToast('Alerte escaladée au BMO', 'success');
      alertsHook.setEscalateModalOpen(false);
      alertsHook.setAlertToAction(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de l\'escalade', errorObj, { alertId: alertsHook.alertToAction?.id });
      const userMessage = handleApiError(error);
      addToast(userMessage, 'error');
      if (requiresRedirect(error)) {
        router.push('/login');
      }
      addToast('Erreur lors de l\'escalade', 'error');
    }
  }, [alertsHook, addToast, addActionLog]);

  const handleResolve = useCallback((action: string, data: { note?: string } | null) => {
    try {
      if (!alertsHook.alertToAction) {
        addToast('Aucune alerte sélectionnée', 'warning');
        return;
      }
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'governance',
        action: 'validation' as ActionLogType,
        targetId: alertsHook.alertToAction.id,
        targetType: 'Alerte',
        details: `Résolue: ${data?.note || action}`,
      });
      addToast('Alerte résolue', 'success');
      alertsHook.setResolveModalOpen(false);
      alertsHook.setAlertToAction(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de la résolution', errorObj, { alertId: alertsHook.alertToAction?.id });
      const userMessage = handleApiError(error);
      addToast(userMessage, 'error');
      if (requiresRedirect(error)) {
        router.push('/login');
      }
    }
  }, [alertsHook, addToast, addActionLog]);

  const handleSaveView = useCallback(() => {
    try {
      const newView = saveView({
        name: `Vue personnalisée ${views.length}`,
        filters: { ...filters },
        search: search || undefined,
      });
      addToast('Vue sauvegardée', 'success');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error('Erreur lors de la sauvegarde de la vue:', error);
      addToast('Erreur lors de la sauvegarde de la vue', 'error');
    }
  }, [filters, search, views.length, addToast, saveView]);

  const handleBulkAction = useCallback(async (action: string) => {
    const selectedIds = Array.from(alertsHook.selectedAlertIds);
    
    try {
      if (alertsHook.selectedAlertIds.size === 0) {
        addToast('Aucune alerte sélectionnée', 'warning');
        return;
      }
      
      // Exécuter avec progression
      await bulkProgress.executeBulkOperation(
        selectedIds,
        async (alertId) => {
          await handleAlertAction(action, alertId);
        },
        (current, total) => {
          trackEvent('bulk_action_progress', { action, current, total });
        }
      );

      alertsHook.setSelectedAlertIds(new Set());
      
      if (bulkProgress.progress.errors.length === 0) {
        addToast(`${selectedIds.length} alerte(s) traitées`, 'success');
      } else {
        addToast(
          `${selectedIds.length - bulkProgress.progress.errors.length} traitées, ${bulkProgress.progress.errors.length} erreur(s)`,
          'warning'
        );
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de l\'action groupée', errorObj, { action, count: selectedIds.length });
      const userMessage = handleApiError(error);
      addToast(userMessage, 'error');
    }
  }, [alertsHook, handleAlertAction, addToast, bulkProgress, trackEvent]);

  // Message pour lecteur d'écran
  const [liveMessage, setLiveMessage] = useState<string | null>(null);

  // Mettre à jour le message live quand les filtres changent
  useEffect(() => {
    const alertCount = alertsHook.filteredAlerts.length;
    const raciCount = raciHook.raciData.length;
    if (activeTab === 'alerts') {
      setLiveMessage(`${alertCount} ${alertCount === 1 ? 'alerte affichée' : 'alertes affichées'}`);
    } else {
      setLiveMessage(`${raciCount} ${raciCount === 1 ? 'activité affichée' : 'activités affichées'}`);
    }
  }, [alertsHook.filteredAlerts.length, raciHook.raciData.length, activeTab]);

  return (
    <>
      {/* PHASE 4 : Skip Link pour navigation rapide */}
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>

      {/* PHASE 4 : Annonces pour lecteur d'écran */}
      <AriaLiveRegion message={liveMessage} priority="polite" />

      <main 
        id="main-content" 
        role="main" 
        aria-label="Page de gouvernance"
        className="space-y-3 sm:space-y-4"
      >
        {/* Header responsive - Error Boundary */}
        <ErrorBoundary
          fallback={
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6">
                <p className="text-red-300">Erreur dans le header de gouvernance</p>
              </CardContent>
            </Card>
          }
          onError={(error, errorInfo) => {
            Logger.error('Governance header error', error, { component: 'GovernanceHeader', errorInfo });
            trackEvent('error_boundary', { component: 'GovernanceHeader', error: error.message });
          }}
        >
          <GovernanceHeader
            activeTab={activeTab}
            raciStats={raciHook.stats}
            alertsStats={alertsHook.alertsStats}
            onExport={activeTab === 'raci' ? handleRACIExport : handleAlertsExport}
            onShowComparator={() => raciHook.setShowComparator(!raciHook.showComparator)}
            showComparatorButton={activeTab === 'raci'}
          />
        </ErrorBoundary>

      {/* Tabs responsive - PHASE 4 : ARIA labels */}
      <nav aria-label="Navigation principale de gouvernance">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => updateTab(v as TabValue)}
        >
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger 
              value="raci" 
              className="text-xs sm:text-sm"
            >
              📐 Matrice RACI
              {raciHook.stats.critical > 0 && (
                <Badge variant="urgent" className="ml-2 text-[9px]" aria-label={`${raciHook.stats.critical} activités critiques`}>
                  {raciHook.stats.critical}
                  <ScreenReaderOnly> activités critiques</ScreenReaderOnly>
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="text-xs sm:text-sm"
            >
              ⚠️ Alertes
              {alertsHook.alertsStats.critical > 0 && (
                <Badge variant="urgent" className="ml-2 text-[9px]" aria-label={`${alertsHook.alertsStats.critical} alertes critiques`}>
                  {alertsHook.alertsStats.critical}
                  <ScreenReaderOnly> alertes critiques</ScreenReaderOnly>
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

        {/* Onglet RACI - Error Boundary + ARIA */}
        <TabsContent 
          value="raci" 
          className="mt-3 sm:mt-4"
        >
          <div role="tabpanel" tabIndex={0} aria-label="Onglet Matrice RACI">
            <ErrorBoundary
              fallback={
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-6">
                    <p className="text-red-300">Erreur dans l'onglet RACI</p>
                  </CardContent>
                </Card>
              }
                  onError={(error, errorInfo) => {
                    Logger.error('RACI tab error', error, { component: 'RACITab', errorInfo });
                    trackEvent('error_boundary', { component: 'RACITab', error: error.message });
                  }}
            >
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <RACITab
                  raciHook={raciHook}
                  alerts={optimisticAlerts}
                  onApplySuggestion={(id) => {
                    addToast(`Suggestion ${id} appliquée`, 'success');
                    trackEvent('raci_suggestion_applied', { suggestionId: id });
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </TabsContent>

        {/* Onglet Alertes - Error Boundary + ARIA */}
        <TabsContent 
          value="alerts" 
          className="mt-3 sm:mt-4"
        >
          <div role="tabpanel" tabIndex={0} aria-labelledby="tab-alerts">
            <ErrorBoundary
              fallback={
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-6">
                    <p className="text-red-300">Erreur dans l'onglet Alertes</p>
                  </CardContent>
                </Card>
              }
                  onError={(error, errorInfo) => {
                    Logger.error('Alerts tab error', error, { component: 'AlertsTab', errorInfo });
                    trackEvent('error_boundary', { component: 'AlertsTab', error: error.message });
                  }}
            >
                  <Suspense fallback={<AlertsListSkeleton />}>
                <AlertsTab
                  alertsHook={{
                    ...alertsHook,
                    alerts: optimisticAlerts,
                    filteredAlerts: alertsHook.filteredAlerts.map(a => {
                      const optimistic = optimisticAlerts.find(oa => oa.id === a.id);
                      return optimistic || a;
                    }),
                  }}
                  filtersHook={{
                    activeTab,
                    search,
                    filters,
                    activeViewId,
                    views,
                    activeView,
                    updateTab,
                    updateSearch,
                    updateFilters,
                    updateViewId,
                    saveView,
                    deleteView: () => {},
                    state: {
                      activeTab,
                      search,
                      filters,
                      activeViewId,
                      views,
                    },
                  }}
                  focusMode={uiState.focusMode}
                  setFocusMode={() => dispatchUI({ type: 'TOGGLE_FOCUS_MODE' })}
                  onAlertAction={handleAlertAction}
                  onBulkAction={handleBulkAction}
                  onEscalate={handleEscalate}
                  onResolve={handleResolve}
                  onSaveView={handleSaveView}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </TabsContent>
      </Tabs>
      </nav>

      {/* ✅ PHASE 2 : Le code RACI et les modals sont maintenant dans RACITab et AlertsTab */}

      {/* ⌨️ Modal Raccourcis Clavier */}
      {uiState.showShortcuts && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={() => dispatchUI({ type: 'TOGGLE_SHORTCUTS' })}
          />
          <div
            className={cn(
              'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101]',
              'w-full max-w-2xl max-h-[80vh] overflow-y-auto',
              darkMode ? 'bg-slate-900' : 'bg-white',
              'rounded-xl shadow-2xl border p-4 sm:p-6'
            )}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                ⌨️ Raccourcis Clavier
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatchUI({ type: 'TOGGLE_SHORTCUTS' })}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-amber-300/80">Navigation</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Basculer vers RACI</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+1</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Basculer vers Alertes</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+2</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Focus recherche</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">/</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-blue-300/80">RACI</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Ouvrir comparateur</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Toggle Heatmap</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+H</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-purple-300/80">Actions</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Toggle Suggestions IA</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+I</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Mode Focus</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+F</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Afficher raccourcis</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">Ctrl+?</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-emerald-300/80">Alertes</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Acquitter sélection</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">A</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Résoudre sélection</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">R</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-slate-400">Général</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-300">Fermer modales/panels</span>
                    <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-200 font-mono text-[9px] sm:text-[10px]">ESC</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de progression pour opérations groupées */}
      <BulkProgressModal
        progress={bulkProgress.progress}
        onCancel={() => bulkProgress.cancelOperation()}
        title="Traitement des alertes en cours..."
      />

      {/* Indicateur mode hors ligne */}
      <OfflineIndicator
        isOnline={offlineSupport.isOnline}
        pendingActionsCount={offlineSupport.pendingActionsCount}
      />
      </main>
    </>
  );
}
