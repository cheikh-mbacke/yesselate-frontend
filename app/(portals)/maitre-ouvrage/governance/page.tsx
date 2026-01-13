'use client';

/**
 * Centre de Commandement Gouvernance - Version 3.0
 * Plateforme de pilotage stratégique et opérationnel
 * Architecture multi-niveaux: Onglets → Sous-onglets → Sous-sous-onglets
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import {
  useGovernanceCommandCenterStore,
} from '@/lib/stores/governanceCommandCenterStore';
import {
  CommandCenterSidebar,
  SubNavigation,
  KPIBar,
  ContentRouter,
  DetailModal,
  DetailPanel,
  CommandPalette,
  DecisionModal,
  EscalationModal,
  FiltersModal,
  ExportModal,
  ActionsMenu,
  BatchActionsBar,
} from '@/components/features/bmo/governance/command-center';

export default function GovernancePage() {
  const {
    fullscreen,
    notificationsPanelOpen,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    goBack,
    navigationHistory,
    openModal,
  } = useGovernanceCommandCenterStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K : Command Palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl+E : Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        openModal('export-config', {});
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // ? : Help (when not in input)
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          // Show help modal
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
      <CommandCenterSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar - Simplified */}
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
              <Activity className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Gouvernance
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
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCommandPalette}
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
              onClick={toggleNotificationsPanel}
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
                5
              </span>
            </Button>

            {/* Actions Menu (consolidated) */}
            <ActionsMenu onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          </div>
        </header>

        {/* Sub Navigation */}
        <SubNavigation />

        {/* KPI Bar */}
        <KPIBar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ContentRouter />
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
              24 projets • 8 alertes • 12 validations
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              )} />
              <span className="text-slate-500">
                {isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <DetailModal />
      <DecisionModal />
      <EscalationModal />
      <FiltersModal />
      <ExportModal />

      {/* Detail Panel (Side Panel) */}
      <DetailPanel />

      {/* Batch Actions Bar */}
      <BatchActionsBar />

      {/* Command Palette */}
      <CommandPalette />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={toggleNotificationsPanel} />
      )}
    </div>
  );
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    { id: '1', type: 'critical', title: 'Dépassement budget lot 4', time: 'il y a 15 min', read: false },
    { id: '2', type: 'warning', title: 'Retard validation BC', time: 'il y a 1h', read: false },
    { id: '3', type: 'info', title: 'Jalon J5 atteint', time: 'il y a 3h', read: true },
    { id: '4', type: 'warning', title: 'Ressource non disponible', time: 'il y a 5h', read: true },
    { id: '5', type: 'info', title: 'Nouveau document ajouté', time: 'hier', read: true },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
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
