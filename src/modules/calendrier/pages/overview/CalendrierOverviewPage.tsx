/**
 * Page Vue d'ensemble du Calendrier
 * Affiche les panneaux d'alertes, actions rapides, poste de contrôle et la vue principale
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { AlertsSummaryPanel } from '../../components/AlertsSummaryPanel';
import { QuickActionsPanel } from '../../components/QuickActionsPanel';
import { ControlStationPanel } from '../../components/ControlStationPanel';
import { GanttChart } from '../../components/GanttChart';
import { CalendarGrid } from '../../components/CalendarGrid';
import { TimelineView } from '../../components/TimelineView';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';
import { useCalendrierData } from '../../hooks/useCalendrierData';
import { useCalendrierFiltersStore } from '../../stores/calendrierFiltersStore';

export function CalendrierOverviewPage() {
  const { periode, vue, chantierId, equipeId, dateDebut, dateFin } = useCalendrierFilters();
  // Mémoriser les filtres pour éviter les re-renders infinis
  const filters = React.useMemo(() => ({
    periode,
    vue,
    chantier_id: chantierId || undefined,
    equipe_id: equipeId || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
  }), [periode, vue, chantierId, equipeId, dateDebut, dateFin]);
  const { data, loading, error } = useCalendrierData(filters);

  // Mettre à jour les stats dans le store
  React.useEffect(() => {
    if (data?.stats) {
      const { setStats } = useCalendrierFiltersStore.getState();
      setStats(data.stats);
    }
  }, [data?.stats]);

  const renderMainView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96 text-slate-400">
          Chargement...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 text-red-400">
          Erreur: {error.message}
        </div>
      );
    }

    switch (vue) {
      case 'gantt':
        return (
          <GanttChart
            jalons={data?.jalons || []}
            evenements={data?.evenements || []}
            chantiers={data?.chantiers || []}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            jalons={data?.jalons || []}
            evenements={data?.evenements || []}
            absences={data?.absences || []}
          />
        );
      case 'calendrier':
      default:
        return (
          <CalendarGrid
            jalons={data?.jalons || []}
            evenements={data?.evenements || []}
            absences={data?.absences || []}
            periode={periode}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Panneaux d'information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertsSummaryPanel />
            </div>
            <div className="space-y-6">
              <QuickActionsPanel />
              <ControlStationPanel />
            </div>
          </div>

          {/* Vue principale */}
          <div className="mt-6">
            {renderMainView()}
          </div>
        </div>
      </div>
    </div>
  );
}

