'use client';

/**
 * Centre de Commandement Alertes & Risques - Version 1.0
 * Module complet avec navigation hiérarchique à 3 niveaux
 * Architecture identique à Analytics BTP
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Filter,
  MoreVertical,
} from 'lucide-react';

import {
  useAlertesCommandCenterStore,
  type AlertesMainCategory,
} from '@/lib/stores/alertesCommandCenterStore';

import { AlertesSidebar } from '@/modules/alertes/navigation/AlertesSidebar';
import { AlertesSubNavigation } from '@/modules/alertes/navigation/AlertesSubNavigation';
import { AlertesContentRouter } from '@/modules/alertes/components/AlertesContentRouter';
import { alertesNavigationConfig, findNavNodeById } from '@/modules/alertes/navigation/alertesNavigationConfig';
import { useAlertesStats } from '@/modules/alertes/hooks';

// ================================
// Types
// ================================

type SessionState = {
  cat: string;
  sub: string;
  subSub?: string;
  fs?: boolean;
  sc?: boolean;
};

const SESSION_KEY = 'bmo.alertes.session.v1';

// ================================
// Utils
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

// ================================
// Main Component
// ================================

export default function AlertesPage() {
  return <AlertesPageContent />;
}

function AlertesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    navigate,
  } = useAlertesCommandCenterStore();

  const { data: statsData, isLoading: statsLoading } = useAlertesStats();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory;
  const activeSubSubCategory = navigation.subSubCategory;

  const currentCategoryLabel = useMemo(() => {
    const node = findNavNodeById(activeCategory);
    return node?.label || 'Alertes & Risques';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    const mainNode = findNavNodeById(activeCategory);
    return mainNode?.children || [];
  }, [activeCategory]);

  const stats = useMemo(() => {
    if (!statsData) {
      return {
        critical: 0,
        warning: 0,
        sla: 0,
        blocked: 0,
        acknowledged: 0,
        resolved: 0,
      };
    }
    return {
      critical: statsData.parSeverite.critical || 0,
      warning: statsData.parSeverite.warning || 0,
      sla: statsData.slaDepasses || 0,
      blocked: 0,
      acknowledged: statsData.parStatut.acknowledged || 0,
      resolved: statsData.parStatut.resolved || 0,
    };
  }, [statsData]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // URL sync + Session
  // ================================

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;

    const cat = searchParams.get('cat') ?? '';
    const sub = searchParams.get('sub') ?? '';
    const subSub = searchParams.get('subSub') ?? '';
    const fs = searchParams.get('fs');
    const sc = searchParams.get('sc');

    const hasAnyParam = !!(cat || sub || subSub || fs || sc);

    if (hasAnyParam) {
      if (cat) navigate(cat as AlertesMainCategory, sub || null, subSub || null);
      if (fs === '1') toggleFullscreen();
      if (sc === '1') toggleSidebar();
    } else {
      const stored = readJson<SessionState>(SESSION_KEY);
      if (stored?.cat) {
        navigate(stored.cat as AlertesMainCategory, stored.sub || null, stored.subSub || null);
        if (stored.fs) toggleFullscreen();
        if (stored.sc) toggleSidebar();
      }
    }

    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const st: SessionState = {
      cat: activeCategory,
      sub: activeSubCategory || '',
      subSub: activeSubSubCategory || '',
      fs: fullscreen,
      sc: sidebarCollapsed,
    };

    writeJson(SESSION_KEY, st);

    const url = new URL(window.location.href);
    url.searchParams.set('cat', activeCategory);
    if (activeSubCategory) url.searchParams.set('sub', activeSubCategory);
    if (activeSubSubCategory) url.searchParams.set('subSub', activeSubSubCategory);
    else url.searchParams.delete('subSub');
    if (!activeSubCategory) url.searchParams.delete('sub');

    fullscreen ? url.searchParams.set('fs', '1') : url.searchParams.delete('fs');
    sidebarCollapsed ? url.searchParams.set('sc', '1') : url.searchParams.delete('sc');

    window.history.replaceState(null, '', url.toString());
  }, [activeCategory, activeSubCategory, activeSubSubCategory, fullscreen, sidebarCollapsed]);

  // ================================
  // Actions
  // ================================

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  }, [isRefreshing]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      navigate(value as AlertesMainCategory, null, null);
    },
    [navigate]
  );

  const handleSubCategoryChange = useCallback(
    (value: string) => {
      navigate(activeCategory, value, null);
    },
    [activeCategory, navigate]
  );

  const handleSubSubCategoryChange = useCallback(
    (value: string) => {
      navigate(activeCategory, activeSubCategory, value);
    },
    [activeCategory, activeSubCategory, navigate]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
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
        if (commandPaletteOpen) {
          e.preventDefault();
          toggleCommandPalette();
          return;
        }
        if (notificationsPanelOpen) {
          e.preventDefault();
          toggleNotificationsPanel();
          return;
        }
      }

      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        toggleNotificationsPanel();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    commandPaletteOpen,
    notificationsPanelOpen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    toggleFullscreen,
    goBack,
    handleRefresh,
  ]);

  // ================================
  // Render Content
  // ================================

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
      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      <AlertesSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => toggleSidebar()}
        onOpenCommandPalette={() => toggleCommandPalette()}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {useAlertesCommandCenterStore.getState().navigationHistory.length > 0 && (
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

            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h1 className="text-base font-semibold text-slate-200">Alertes & Risques</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v1.0
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCommandPalette()}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                <KeyboardShortcut shortcut="⌘K" />
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNotificationsPanel()}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications (⌘N)"
            >
              <Bell className="h-4 w-4" />
              {stats.critical > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {Math.min(stats.critical, 99)}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Rafraîchir (⌘R)"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <AlertesSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subSubCategory={activeSubSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={stats}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <AlertesContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeSubSubCategory}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between px-2 sm:px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-slate-600 text-xs">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-600 text-xs">
              {stats.critical} critiques • {stats.warning} avertissements • {stats.resolved} résolues
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
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
    </div>
  );
}

