'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Search, Bell, ChevronLeft } from 'lucide-react';

import {
  useAnalyticsCommandCenterStore,
  type AnalyticsMainCategory,
} from '@/lib/stores/analyticsCommandCenterStore';

import {
  AnalyticsCommandSidebar,
  AnalyticsSubNavigation,
  AnalyticsKPIBar,
  AnalyticsContentRouter,
  AnalyticsFiltersPanel,
  AnalyticsModals,
  AnalyticsDetailPanel,
  AnalyticsBatchActionsBar,
  ActionsMenu,
  analyticsCategories,
} from '@/components/features/bmo/analytics/command-center';

import { AnalyticsCommandPalette } from '@/components/features/bmo/analytics/workspace/AnalyticsCommandPalette';
import { AnalyticsToastProvider, useAnalyticsToast } from '@/components/features/bmo/analytics/workspace/AnalyticsToast';
import { useRealtimeAnalytics } from '@/components/features/bmo/analytics/hooks/useRealtimeAnalytics';

// ERP foundation
import { useUiAudit } from '@/lib/bmo/erp/audit';
import { readJson, writeJson, debounce } from '@/lib/bmo/erp/session';
import { useScrollRestoration } from '@/lib/bmo/erp/scroll';
import { useCommandCenterUrlSync } from '@/lib/bmo/erp/url';
import { useCommandCenterShortcuts } from '@/lib/bmo/erp/shortcuts';
import { ClientErrorBoundary } from '@/lib/bmo/erp/errorBoundary';

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

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

const NOTIFICATIONS = [
  { id: '1', type: 'critical' as const, title: 'KPI Performance critique', time: 'il y a 15 min', read: false },
  { id: '2', type: 'warning' as const, title: 'Tendance négative détectée', time: 'il y a 1h', read: false },
  { id: '3', type: 'info' as const, title: 'Rapport hebdomadaire disponible', time: 'il y a 3h', read: true },
  { id: '4', type: 'warning' as const, title: 'Seuil budget atteint à 80%', time: 'il y a 5h', read: true },
  { id: '5', type: 'info' as const, title: 'Nouvelle analyse disponible', time: 'hier', read: true },
];

type SessionState = {
  cat: string;
  sub: string;
  fs?: boolean;
  sc?: boolean;
  kv?: boolean;
  kc?: boolean;
  np?: boolean;
};

const SESSION_KEY = 'bmo.analytics.session.v1';

const normalizeSub = (cat: string, sub: string | undefined) => {
  const wanted = sub ?? 'all';
  const allowed = subCategoriesMap[cat]?.some((s) => s.id === wanted);
  return allowed ? wanted : 'all';
};

export default function AnalyticsPage() {
  return (
    <AnalyticsToastProvider>
      <AnalyticsPageContent />
    </AnalyticsToastProvider>
  );
}

function AnalyticsPageContent() {
  const toast = useAnalyticsToast();
  const audit = useUiAudit('analytics');

  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    modal,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    navigate,
    setKPIConfig,
    filters,
    setFilter,
  } = useAnalyticsCommandCenterStore();

  const { isConnected, subscriptionsCount } = useRealtimeAnalytics({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const refreshTimerRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  const notifications = NOTIFICATIONS;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, []);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const resolveSubCategoryId = useCallback(
    (value: string, category?: string) => {
      const v = (value ?? '').trim();
      if (!v) return 'all';

      // Utiliser la catégorie fournie ou la catégorie active
      const cat = category || activeCategory;
      const subCats = subCategoriesMap[cat] || [];

      // 1) cas normal : on reçoit un id (summary/highlights/...)
      const byId = subCats.find((s) => s.id === v);
      if (byId) return byId.id;

      // 2) cas fréquent : on reçoit un label ("Résumé", "Points clés", "Budget", "Dépenses")
      const lower = v.toLowerCase();
      const byLabel = subCats.find((s) => s.label.toLowerCase() === lower);
      if (byLabel) return byLabel.id;

      // 3) fallback ERP : ne jamais casser la navigation
      return 'all';
    },
    [activeCategory]
  );

  // URL sync + Session restore
  useCommandCenterUrlSync({
    namespace: 'analytics',
    state: {
      cat: activeCategory,
      sub: activeSubCategory,
      fs: fullscreen,
      sc: sidebarCollapsed,
      kv: kpiConfig.visible,
      kc: kpiConfig.collapsed,
      np: notificationsPanelOpen,
    },
    onHydrate: (next, meta) => {
      const apply = (st: SessionState) => {
        const cat = (st.cat as AnalyticsMainCategory) || activeCategory;
        // Utiliser resolveSubCategoryId pour gérer à la fois IDs et labels
        const sub = resolveSubCategoryId(st.sub || 'all', cat);

        // ✅ IMPORTANT: 1 seul navigate pour restaurer le contexte (cat+sub)
        if (cat !== activeCategory || sub !== activeSubCategory) {
          navigate(cat, sub, null);
        }

        if (typeof st.fs === 'boolean' && st.fs !== fullscreen) toggleFullscreen();
        if (typeof st.sc === 'boolean' && st.sc !== sidebarCollapsed) toggleSidebar();
        if (typeof st.np === 'boolean' && st.np !== notificationsPanelOpen) toggleNotificationsPanel();

        if (typeof st.kv === 'boolean' && st.kv !== kpiConfig.visible) {
          setKPIConfig({ visible: st.kv });
        }
        if (typeof st.kc === 'boolean' && st.kc !== kpiConfig.collapsed) {
          setKPIConfig({ collapsed: st.kc });
        }
      };

      if (meta.hasAnyParam) {
        const st: SessionState = {
          cat: next.cat ?? activeCategory,
          sub: next.sub ?? activeSubCategory,
          fs: next.fs,
          sc: next.sc,
          kv: next.kv,
          kc: next.kc,
          np: next.np,
        };
        apply(st);
        audit.log('STATE_HYDRATE_URL', st);
        return;
      }

      const stored = readJson<SessionState>(SESSION_KEY);
      if (stored?.cat) {
        apply(stored);
        audit.log('STATE_HYDRATE_SESSION', stored);
      }
    },
  });

  // Persist session (debounced)
  const persistSession = useMemo(
    () =>
      debounce((st: SessionState) => {
        writeJson(SESSION_KEY, st);
      }, 200),
    []
  );

  useEffect(() => {
    const st: SessionState = {
      cat: activeCategory,
      sub: activeSubCategory,
      fs: fullscreen,
      sc: sidebarCollapsed,
      kv: kpiConfig.visible,
      kc: kpiConfig.collapsed,
      np: notificationsPanelOpen,
    };
    persistSession(st);
  }, [
    activeCategory,
    activeSubCategory,
    fullscreen,
    sidebarCollapsed,
    kpiConfig.visible,
    kpiConfig.collapsed,
    notificationsPanelOpen,
    persistSession,
  ]);

  useScrollRestoration(scrollRef, `analytics:${activeCategory}:${activeSubCategory}`);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const currentCategoryLabel = useMemo(() => {
    return analyticsCategories.find((c) => c.id === activeCategory)?.label || 'Analytics';
  }, [activeCategory]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  const handleRefresh = useCallback(() => {
    audit.log('REFRESH');
    setIsRefreshing(true);

    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      toast.dataRefreshed();
      audit.log('REFRESH_DONE');
    }, 1500);
  }, [audit, toast]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      const cat = category as AnalyticsMainCategory;
      audit.log('NAV_CATEGORY', { category: cat });
      navigate(cat, 'all', null);
    },
    [audit, navigate]
  );

  const handleSubCategoryChange = useCallback(
    (value: string) => {
      const subId = resolveSubCategoryId(value);

      audit.log('NAV_SUBCATEGORY', { category: activeCategory, value, subId });

      // ✅ navigation fiable
      navigate(activeCategory, subId, null);
    },
    [audit, activeCategory, navigate, resolveSubCategoryId]
  );

  const handleBatchAction = useCallback(
    (actionId: string, ids: string[]) => {
      audit.log('BATCH_ACTION', { actionId, count: ids.length });

      switch (actionId) {
        case 'export':
          openModal('export', { selectedIds: ids });
          break;
        case 'view':
          if (ids.length > 0) openModal('kpi-detail', { kpiId: ids[0] });
          break;
        case 'delete':
          toast.warning('Suppression batch', `${ids.length} item(s) à supprimer`);
          break;
        case 'archive':
          toast.info('Archivage batch', `${ids.length} item(s) à archiver`);
          break;
        default:
          break;
      }
    },
    [audit, openModal, toast]
  );

  useCommandCenterShortcuts({
    onCommandPalette: () => {
      audit.log('COMMAND_PALETTE_TOGGLE');
      toggleCommandPalette();
    },
    onFilters: () => {
      audit.log('MODAL_OPEN', { type: 'filters' });
      openModal('filters');
    },
    onExport: () => {
      audit.log('MODAL_OPEN', { type: 'export' });
      openModal('export');
    },
    onFullscreen: () => {
      audit.log('FULLSCREEN_TOGGLE');
      toggleFullscreen();
    },
    onBack: () => {
      audit.log('NAV_BACK');
      goBack();
    },
    onToggleSidebar: () => {
      audit.log('SIDEBAR_TOGGLE');
      toggleSidebar();
    },
    onStats: () => {
      audit.log('MODAL_OPEN', { type: 'stats' });
      openModal('stats');
    },
    onShortcutsHelp: () => {
      audit.log('MODAL_OPEN', { type: 'shortcuts' });
      openModal('shortcuts');
    },
  });

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      <AnalyticsCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => {
          audit.log('SIDEBAR_TOGGLE');
          toggleSidebar();
        }}
        onOpenCommandPalette={() => {
          audit.log('COMMAND_PALETTE_TOGGLE');
          toggleCommandPalette();
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {navigationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  audit.log('NAV_BACK');
                  goBack();
                }}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
                aria-label="Retour"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

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

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audit.log('COMMAND_PALETTE_TOGGLE');
                toggleCommandPalette();
              }}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                audit.log('NOTIFICATIONS_TOGGLE');
                toggleNotificationsPanel();
              }}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            <ActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        <AnalyticsSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {kpiConfig.visible && (
          <AnalyticsKPIBar
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => {
              audit.log('KPI_COLLAPSE_TOGGLE', { next: !kpiConfig.collapsed });
              setKPIConfig({ collapsed: !kpiConfig.collapsed });
            }}
            onRefresh={handleRefresh}
          />
        )}

        <main className="flex-1 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto">
            <ClientErrorBoundary className="p-0" title="Erreur d'affichage du contenu Analytics">
              <AnalyticsContentRouter category={activeCategory} subCategory={activeSubCategory} />
            </ClientErrorBoundary>
          </div>
        </main>

        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">24 KPIs • 8 alertes • 45 rapports</span>
            {isConnected && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">🔴 Temps réel ({subscriptionsCount} abonnements)</span>
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

      {commandPaletteOpen && <AnalyticsCommandPalette />}
      <AnalyticsModals />
      <AnalyticsDetailPanel />
      <AnalyticsBatchActionsBar onAction={handleBatchAction} />

      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} unreadCount={unreadCount} />
      )}

      {modal.type === 'filters' && modal.isOpen && (
        <AnalyticsFiltersPanel
          isOpen={modal.isOpen}
          onClose={closeModal}
          onApplyFilters={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                setFilter(key as keyof typeof filters, value);
              }
            });
            closeModal();
            toast.info('Filtres appliqués', `${Object.keys(newFilters).length} filtre(s) actif(s)`);
            audit.log('FILTERS_APPLIED', { count: Object.keys(newFilters).length });
          }}
        />
      )}
    </div>
  );
}

function NotificationsPanel({
  onClose,
  unreadCount,
}: {
  onClose: () => void;
  unreadCount: number;
}) {
  const notifications = NOTIFICATIONS;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800/50 z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Panneau de notifications"
      >
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              aria-label="Fermer les notifications"
              title="Fermer"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {notifications.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">Aucune notification.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                  !notif.read && 'bg-slate-800/20'
                )}
                role="button"
                tabIndex={0}
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
            ))
          )}
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
