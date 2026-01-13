/**
 * Dashboard Maître d'Ouvrage - Command Center v3.0
 * Architecture identique à Gouvernance
 * Pilotage stratégique et opérationnel du BMO
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Bell,
  Search,
  LayoutDashboard,
  MoreVertical,
  RefreshCw,
  Download,
  Settings,
  Maximize2,
  Keyboard,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import {
  DashboardSidebar,
  DashboardKPIBar,
  DashboardSubNavigation,
  DashboardContentRouter,
  DashboardCommandPalette,
  DashboardModals,
} from '@/components/features/bmo/dashboard/command-center';

export default function DashboardPage() {
  const {
    fullscreen,
    notificationsPanelOpen,
    liveStats,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    goBack,
    navigationHistory,
    openModal,
    startRefresh,
    endRefresh,
  } = useDashboardCommandCenterStore();

  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    startRefresh();
    setTimeout(() => {
      endRefresh();
      setLastUpdate(new Date());
    }, 1500);
  };

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K : Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl/Cmd + E : Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        openModal('export');
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Alt + Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // ? : Help (when not in input)
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          openModal('shortcuts');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, goBack, openModal]);

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <DashboardSidebar />

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
              <LayoutDashboard className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Dashboard BMO
              </h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v3.0
              </Badge>
            </div>
          </div>

          {/* Actions - Consolidated */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotificationsPanel}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-blue-400 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Actions Menu */}
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={liveStats.isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation */}
        <DashboardSubNavigation />

        {/* KPI Bar */}
        <DashboardKPIBar onRefresh={handleRefresh} isRefreshing={liveStats.isRefreshing} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <DashboardContentRouter />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Màj: {formatLastUpdate()}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              247 demandes • 5 blocages • 8 décisions
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  liveStats.isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {liveStats.isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <DashboardModals />

      {/* Command Palette */}
      <DashboardCommandPalette />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}
    </div>
  );
}

// Actions Menu Component
function ActionsMenu({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { toggleFullscreen, openModal, toggleCommandPalette } = useDashboardCommandCenterStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
            {/* Recherche */}
            <button
              onClick={() => {
                toggleCommandPalette();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher</span>
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
            
            <div className="border-t border-slate-700/50 my-1" />
            
            {/* Rafraîchir */}
            <button
              onClick={() => {
                onRefresh();
                setOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </button>
            
            {/* Exporter */}
            <button
              onClick={() => {
                openModal('export');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="w-4 h-4" />
              Exporter
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ⌘E
              </kbd>
            </button>
            
            <div className="border-t border-slate-700/50 my-1" />
            
            {/* Plein écran */}
            <button
              onClick={() => {
                toggleFullscreen();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Maximize2 className="w-4 h-4" />
              Plein écran
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                F11
              </kbd>
            </button>
            
            {/* Raccourcis */}
            <button
              onClick={() => {
                openModal('shortcuts');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Keyboard className="w-4 h-4" />
              Raccourcis
              <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                ?
              </kbd>
            </button>
            
            {/* Paramètres */}
            <button
              onClick={() => {
                openModal('settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Notifications Panel
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'BC bloqué depuis 5 jours',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Paiement en retard',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Validation BC-2024-0852 terminée',
      time: 'il y a 2h',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" />
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
