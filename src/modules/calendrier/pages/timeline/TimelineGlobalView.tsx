/**
 * Vue Timeline Global
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { TimelineView } from '../../components/TimelineView';
import { useCalendrierData } from '../../hooks/useCalendrierData';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';

export function TimelineGlobalView() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Erreur: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader breadcrumb={['Calendrier', 'Timeline', 'Global']} showViewSwitcher={false} />
      <div className="flex-1 overflow-auto p-6">
        <TimelineView
          jalons={data?.jalons || []}
          evenements={data?.evenements || []}
          absences={data?.absences || []}
        />
      </div>
    </div>
  );
}

