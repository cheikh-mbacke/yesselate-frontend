'use client';

/**
 * Centre de Commandement Analytics - Version 2.0 (ERP Hardened)
 * - Navigation robuste (id/label/accents/aliases)
 * - Session restore + URL sync
 * - Scroll restoration par vue
 * - Refresh timer safe
 * - Error boundary
 * - Raccourcis clavier
 *
 * ⚠️ Design inchangé
 */

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

// ================================
// Types
// ================================
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

type SessionState = {
  cat: string;
  sub: string;
  fs?: boolean;
  sc?: boolean;
  kv?: boolean;
  kc?: boolean;
  np?: boolean;
};

// ================================
// Sous-catégories
// ================================
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
// Notifications mock
// ================================
const INITIAL_NOTIFICATIONS = [
  { id: '1', type: 'critical', title: 'KPI Performance critique', time: 'il y a 15 min', read: false },
  { id: '2', type: 'warning', title: 'Tendance négative détectée', time: 'il y a 1h', read: false },
  { id: '3', type: 'info', title: 'Rapport hebdomadaire disponible', time: 'il y a 3h', read: true },
  { id: '4', type: 'warning', title: 'Seuil budget atteint à 80%', time: 'il y a 5h', read: true },
  { id: '5', type: 'info', title: 'Nouvelle analyse disponible', time: 'hier', read: true },
] as const;

// ================================
// Utils ERP
// ================================
const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const normalizeKey = (s: string) =>
  (s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-');

function useUiAudit(scope: string) {
  const bufferRef = useRef<Array<{ ts: string; scope: string; event: string; payload?: unknown }>>([]);
  const log = useCallback(
    (event: string, payload?: unknown) => {
      const entry = { ts: new Date().toISOString(), scope, event, payload };
      bufferRef.current.push(entry);
      if (bufferRef.current.length > 200) bufferRef.current.shift();
      console.debug(`[AUDIT:${scope}]`, event, payload ?? '');
    },
    [scope]
  );

  return { log };
}

function useScrollRestoration(ref: React.RefObject<HTMLElement>, key: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const storageKey = `bmo.analytics.scroll:${key}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const n = Number(saved);
      if (Number.isFinite(n)) el.scrollTop = n;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, key]);
}

class ClientErrorBoundary extends React.Component<
  { title?: string; children: React.ReactNode; className?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error('Analytics content crashed:', error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={cn('p-6', this.props.className)}>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-sm font-semibold text-red-300">
            {this.props.title ?? "Erreur d'affichage"}
          </div>
          <div className="mt-2 text-xs text-red-200/80">
            Un composant a rencontré une erreur. Vous pouvez rafraîchir.
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-200 hover:bg-red-500/10"
              onClick={() => window.location.reload()}
            >
              Rafraîchir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-200 hover:bg-red-500/10"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

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
    resetFilters,
  } = useAnalyticsCommandCenterStore();

  const { isConnected, subscriptionsCount } = useRealtimeAnalytics({
    autoConnect: true,
    showToasts: true,
    autoInvalidateQueries: true,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const refreshTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [notifications, setNotifications] = useState(() => INITIAL_NOTIFICATIONS.map(n => ({ ...n })));

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  const currentCategoryLabel = useMemo(() => {
    return analyticsCategories.find((c) => c.id === activeCategory)?.label || 'Analytics';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Navigation resolution
  // ================================
  const resolveMainCategoryId = useCallback(
    (value: string) => {
      const raw = (value ?? '').trim();
      if (!raw) return activeCategory;

      const v = normalizeKey(raw);

      const byId = analyticsCategories.find((c) => normalizeKey(c.id) === v);
      if (byId) return byId.id as AnalyticsMainCategory;

      const byLabel = analyticsCategories.find((c) => normalizeKey(c.label) === v);
      if (byLabel) return byLabel.id as AnalyticsMainCategory;

      const aliases: Record<string, AnalyticsMainCategory> = {
        'vue-densemble': 'overview',
        'vue-ensemble': 'overview',
        'performance': 'performance',
        'financier': 'financial',
        'finances': 'financial',
        'tendances': 'trends',
        'alertes': 'alerts',
        'rapports': 'reports',
        'kpis': 'kpis',
        'comparaison': 'comparison',
        'bureaux': 'bureaux',
      };

      return aliases[v] ?? (activeCategory as AnalyticsMainCategory);
    },
    [activeCategory]
  );

  const resolveSubCategoryId = useCallback(
    (value: string) => {
      const raw = (value ?? '').trim();
      if (!raw) return 'all';

      const v = normalizeKey(raw);

      const aliasesByCategory: Record<string, Record<string, string>> = {
        performance: { ok: 'success' },
        financial: {
          depense: 'expenses',
          depenses: 'expenses',
          prevision: 'forecasts',
          previsions: 'forecasts',
        },
        alerts: {
          avertissement: 'warning',
          avertissements: 'warning',
          critique: 'critical',
          critiques: 'critical',
          resolue: 'resolved',
          resolues: 'resolved',
        },
        trends: {
          positives: 'positive',
          negative: 'negative',
          negatives: 'negative',
          stable: 'stable',
          stables: 'stable',
        },
        reports: {
          recents: 'recent',
          planifie: 'scheduled',
          planifies: 'scheduled',
          favoris: 'favorites',
        },
      };

      const alias = aliasesByCategory[activeCategory]?.[v];
      const candidate = alias ?? raw;

      const byId = currentSubCategories.find((s) => normalizeKey(s.id) === normalizeKey(candidate));
      if (byId) return byId.id;

      const byLabel = currentSubCategories.find((s) => normalizeKey(s.label) === v);
      if (byLabel) return byLabel.id;

      if (alias) {
        const byAlias = currentSubCategories.find((s) => normalizeKey(s.id) === normalizeKey(alias));
        if (byAlias) return byAlias.id;
      }

      return 'all';
    },
    [activeCategory, currentSubCategories]
  );

  useEffect(() => {
    const has = currentSubCategories.some((s) => s.id === activeSubCategory);
    if (!has && currentSubCategories.length > 0) {
      audit.log('NAV_SUB_INVALID_RESET', { cat: activeCategory, sub: activeSubCategory });
      navigate(activeCategory, 'all', null);
    }
  }, [activeCategory, activeSubCategory, currentSubCategories, navigate, audit]);

  useScrollRestoration(scrollRef, `${activeCategory}:${activeSubCategory}`);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // ================================
  // URL sync + Session
  // ================================
  const hydratedRef = useRef(false);
  const SESSION_KEY = 'bmo.analytics.session.v1';

  const applyState = useCallback(
    (st: SessionState, origin: 'url' | 'session') => {
      const nextCat = resolveMainCategoryId(st.cat || activeCategory);
      const nextSub = st.sub ? resolveSubCategoryId(st.sub) : 'all';

      if (nextCat !== activeCategory) {
        navigate(nextCat, 'all', null);
      }
      if (nextCat === activeCategory && nextSub !== activeSubCategory) {
        navigate(activeCategory, nextSub, null);
      }

      if (typeof st.fs === 'boolean' && st.fs !== fullscreen) toggleFullscreen();
      if (typeof st.sc === 'boolean' && st.sc !== sidebarCollapsed) toggleSidebar();
      if (typeof st.np === 'boolean' && st.np !== notificationsPanelOpen) toggleNotificationsPanel();

      if (typeof st.kv === 'boolean' && st.kv !== kpiConfig.visible) setKPIConfig({ visible: st.kv });
      if (typeof st.kc === 'boolean' && st.kc !== kpiConfig.collapsed) setKPIConfig({ collapsed: st.kc });

      audit.log('STATE_APPLY', { origin, st });
    },
    [
      resolveMainCategoryId,
      resolveSubCategoryId,
      activeCategory,
      activeSubCategory,
      fullscreen,
      sidebarCollapsed,
      notificationsPanelOpen,
      kpiConfig.visible,
      kpiConfig.collapsed,
      navigate,
      toggleFullscreen,
      toggleSidebar,
      toggleNotificationsPanel,
      setKPIConfig,
      audit,
    ]
  );

  useEffect(() => {
    if (hydratedRef.current) return;

    const url = new URL(window.location.href);
    const cat = url.searchParams.get('cat') ?? '';
    const sub = url.searchParams.get('sub') ?? '';
    const fs = url.searchParams.get('fs');
    const sc = url.searchParams.get('sc');
    const kv = url.searchParams.get('kv');
    const kc = url.searchParams.get('kc');
    const np = url.searchParams.get('np');

    const hasAnyParam = !!(cat || sub || fs || sc || kv || kc || np);

    if (hasAnyParam) {
      applyState(
        {
          cat: cat || activeCategory,
          sub: sub || activeSubCategory,
          fs: fs === '1',
          sc: sc === '1',
          kv: kv ? kv === '1' : undefined,
          kc: kc ? kc === '1' : undefined,
          np: np === '1',
        },
        'url'
      );
    } else {
      const stored = readJson<SessionState>(SESSION_KEY);
      if (stored?.cat) applyState(stored, 'session');
    }

    hydratedRef.current = true;
  }, [applyState, activeCategory, activeSubCategory]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const st: SessionState = {
      cat: activeCategory,
      sub: activeSubCategory,
      fs: fullscreen,
      sc: sidebarCollapsed,
      kv: kpiConfig.visible,
      kc: kpiConfig.collapsed,
      np: notificationsPanelOpen,
    };

    writeJson(SESSION_KEY, st);

    const url = new URL(window.location.href);
    url.searchParams.set('cat', activeCategory);
    url.searchParams.set('sub', activeSubCategory);

    fullscreen ? url.searchParams.set('fs', '1') : url.searchParams.delete('fs');
    sidebarCollapsed ? url.searchParams.set('sc', '1') : url.searchParams.delete('sc');
    notificationsPanelOpen ? url.searchParams.set('np', '1') : url.searchParams.delete('np');

    kpiConfig.visible ? url.searchParams.delete('kv') : url.searchParams.set('kv', '0');
    kpiConfig.collapsed ? url.searchParams.set('kc', '1') : url.searchParams.delete('kc');

    window.history.replaceState(null, '', url.toString());
  }, [
    activeCategory,
    activeSubCategory,
    fullscreen,
    sidebarCollapsed,
    notificationsPanelOpen,
    kpiConfig.visible,
    kpiConfig.collapsed,
  ]);

  // ================================
  // Actions
  // ================================
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    audit.log('REFRESH');
    setIsRefreshing(true);

    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setIsRefreshing(false);
      setLastUpdate(new Date());
      toast.dataRefreshed();
      audit.log('REFRESH_DONE');
    }, 1500);
  }, [audit, toast, isRefreshing]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      const cat = resolveMainCategoryId(value);
      audit.log('NAV_CATEGORY', { value, cat });
      navigate(cat, 'all', null);
    },
    [audit, navigate, resolveMainCategoryId]
  );

  const handleSubCategoryChange = useCallback(
    (value: string) => {
      const subId = resolveSubCategoryId(value);
      audit.log('NAV_SUBCATEGORY', { cat: activeCategory, value, subId });
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

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (t.isContentEditable) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        if (modal?.isOpen) {
          e.preventDefault();
          closeModal();
          return;
        }
        if (notificationsPanelOpen) {
          e.preventDefault();
          toggleNotificationsPanel();
          return;
        }
        if (commandPaletteOpen) {
          e.preventDefault();
          toggleCommandPalette();
          return;
        }
      }

      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        audit.log('COMMAND_PALETTE_TOGGLE');
        toggleCommandPalette();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        audit.log('MODAL_OPEN', { type: 'filters' });
          openModal('filters');
        return;
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        audit.log('FILTERS_RESET');
        resetFilters();
        toast.info('Filtres réinitialisés', 'Tous les filtres ont été supprimés');
        return;
      }

      if (isMod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        audit.log('MODAL_OPEN', { type: 'export' });
        openModal('export');
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        audit.log('FULLSCREEN_TOGGLE');
        toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        audit.log('NAV_BACK');
        goBack();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        audit.log('SIDEBAR_TOGGLE');
        toggleSidebar();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        audit.log('NOTIFICATIONS_TOGGLE');
        toggleNotificationsPanel();
        return;
      }

      if (e.key === '?' && !isMod && !e.altKey) {
        e.preventDefault();
        audit.log('MODAL_OPEN', { type: 'shortcuts' });
        openModal('shortcuts');
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    audit,
    commandPaletteOpen,
    notificationsPanelOpen,
    modal?.isOpen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleFullscreen,
    toggleSidebar,
    goBack,
    openModal,
    closeModal,
    resetFilters,
    toast,
  ]);

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
              title="Notifications (Ctrl+N)"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {Math.min(unreadCount, 99)}
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
            <ClientErrorBoundary title="Erreur d'affichage du contenu Analytics" className="p-0">
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
              <span className="text-slate-500">{isRefreshing ? 'Synchronisation...' : 'Connecté'}</span>
            </div>
          </div>
        </footer>
      </div>

      {commandPaletteOpen && <AnalyticsCommandPalette />}
      <AnalyticsModals />
      <AnalyticsDetailPanel />
      <AnalyticsBatchActionsBar onAction={handleBatchAction} />

      {notificationsPanelOpen && (
        <NotificationsPanel
          notifications={notifications}
          onClose={toggleNotificationsPanel}
          onMarkRead={(id) => {
            audit.log('NOTIFICATION_READ', { id });
            markNotificationRead(id);
          }}
        />
      )}

      {modal.type === 'filters' && modal.isOpen && (
        <AnalyticsFiltersPanel
          isOpen={modal.isOpen}
          onClose={() => {
            audit.log('MODAL_CLOSE', { type: 'filters' });
            closeModal();
          }}
          onApplyFilters={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (Array.isArray(value)) setFilter(key as keyof typeof filters, value);
            });
            audit.log('FILTERS_APPLIED', { count: Object.keys(newFilters).length });
            closeModal();
            toast.info('Filtres appliqués', `${Object.keys(newFilters).length} filtre(s) actif(s)`);
          }}
        />
      )}
    </div>
  );
}

function NotificationsPanel({
  onClose,
  notifications,
  onMarkRead,
}: {
  onClose: () => void;
  notifications: Array<{ id: string; type: 'critical' | 'warning' | 'info'; title: string; time: string; read: boolean }>;
  onMarkRead: (id: string) => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800/50 z-50 flex flex-col">
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
              {unread > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {unread} nouvelle{unread > 1 ? 's' : ''}
            </Badge>
              )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              aria-label="Fermer les notifications"
              title="Fermer (Esc)"
          >
            ×
          </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
              role="button"
              tabIndex={0}
              onClick={() => onMarkRead(notif.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMarkRead(notif.id);
                }
              }}
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
