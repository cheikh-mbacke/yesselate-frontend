/**
 * Composant Gantt Chart
 * Wrapper pour une librairie Gantt (placeholder pour l'instant)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Jalon, EvenementCalendrier, Chantier } from '../types/calendrierTypes';

interface GanttChartProps {
  jalons?: Jalon[];
  evenements?: EvenementCalendrier[];
  chantiers?: Chantier[];
  chantierId?: number | null;
  dateDebut?: string;
  dateFin?: string;
  className?: string;
}

export function GanttChart({
  jalons = [],
  evenements = [],
  chantiers = [],
  chantierId,
  dateDebut,
  dateFin,
  className,
}: GanttChartProps) {
  // TODO: Intégrer une vraie librairie Gantt (ex: dhtmlx-gantt, react-gantt-chart, etc.)
  // Pour l'instant, affichage placeholder

  const filteredJalons = chantierId
    ? jalons.filter((j) => j.chantier_id === chantierId)
    : jalons;

  return (
    <div className={cn('w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Vue Gantt</h3>
          <div className="text-sm text-slate-400">
            {filteredJalons.length} jalons • {evenements.length} événements
          </div>
        </div>

        {/* Placeholder pour le graphique Gantt */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-slate-400 text-sm">
              Graphique Gantt à implémenter
            </div>
            <div className="text-slate-500 text-xs">
              Intégrer une librairie Gantt (dhtmlx-gantt, react-gantt-chart, etc.)
            </div>
          </div>
        </div>

        {/* Liste des jalons pour référence */}
        {filteredJalons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Jalons ({filteredJalons.length})</h4>
            <div className="space-y-1">
              {filteredJalons.slice(0, 5).map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-xs text-slate-400"
                >
                  <span className="font-medium">{jalon.libelle}</span>
                  {jalon.date_debut && jalon.date_fin && (
                    <span className="text-slate-500">
                      {new Date(jalon.date_debut).toLocaleDateString()} -{' '}
                      {new Date(jalon.date_fin).toLocaleDateString()}
                    </span>
                  )}
                  {jalon.est_retard && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                      Retard
                    </span>
                  )}
                  {jalon.est_sla_risque && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                      À risque
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

