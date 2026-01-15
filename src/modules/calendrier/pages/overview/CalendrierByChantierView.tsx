/**
 * Vue Calendrier par Chantier
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { GanttChart } from '../../components/GanttChart';
import { CalendarGrid } from '../../components/CalendarGrid';
import { TimelineView } from '../../components/TimelineView';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';
import { useCalendrierData } from '../../hooks/useCalendrierData';

export function CalendrierByChantierView() {
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

  const renderView = () => {
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
            chantierId={chantierId}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            jalons={data?.jalons || []}
            evenements={data?.evenements || []}
            absences={data?.absences || []}
            chantierId={chantierId}
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
            chantierId={chantierId}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader breadcrumb={['Calendrier', 'Vue d\'ensemble', 'Vue par chantier']} />
      <div className="flex-1 overflow-auto p-6">
        {renderView()}
      </div>
    </div>
  );
}

