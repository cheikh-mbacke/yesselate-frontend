'use client';

/**
 * Centre d'Alertes - Maître d'Ouvrage
 * Supervision transversale des alertes, risques, anomalies
 * Route : maitre-ouvrage/centre-alertes
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ChevronLeft,
  RefreshCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  useCentreAlertesCommandCenterStore,
} from '@/lib/stores/centreAlertesCommandCenterStore';
import {
  CommandCenterSidebar,
  KPIBar,
  ContentRouter,
  AlertDetailModal,
  TreatModal,
  EscalateModal,
  AssignModal,
  AcknowledgeModal,
  FiltersModal,
} from '@/components/features/bmo/centre-alertes/command-center';
import { useCentreAlertesWebSocket } from '@/lib/api/websocket/useCentreAlertesWebSocket';
import { useCentreAlertesKPIs } from '@/lib/api/hooks/useCentreAlertes';

export default function CentreAlertesPage() {
  const {
    fullscreen,
    toggleFullscreen,
    goBack,
    navigationHistory,
    setKPIs,
    setKPIsLoading,
    filters,
  } = useCentreAlertesCommandCenterStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // WebSocket pour les alertes en temps réel
  const { isConnected: wsConnected } = useCentreAlertesWebSocket({
    enableBrowserNotifications: true,
    enableSound: true,
    criticalOnly: false,
  });

  // Charger les KPIs avec React Query
  const { data: kpisData, isLoading: kpisLoading } = useCentreAlertesKPIs(filters);

  useEffect(() => {
    if (kpisData) {
      setKPIs(kpisData);
    }
    setKPIsLoading(kpisLoading);
  }, [kpisData, kpisLoading, setKPIs, setKPIsLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      // TODO: Recharger les données
    }, 1500);
  };

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  };

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, goBack]);

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
              <Bell className="h-5 w-5 text-amber-400" />
              <h1 className="text-base font-semibold text-slate-200">
                Centre d'Alertes
              </h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                MOA
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Last Update & WebSocket Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Mis à jour {formatLastUpdate()}
              </span>
              {wsConnected && (
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="WebSocket connecté" />
              )}
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Actualiser"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  isRefreshing && 'animate-spin'
                )}
              />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              title="Plein écran (F11)"
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        {/* KPIs Bar */}
        <KPIBar />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ContentRouter />
        </div>
      </div>

      {/* Modals */}
      <AlertDetailModal />
      <TreatModal />
      <EscalateModal />
      <AssignModal />
      <AcknowledgeModal />
      <FiltersModal />
    </div>
  );
}

