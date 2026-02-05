/**
 * Composant TrendsChart pour afficher les tendances avec Chart.js ou Recharts
 */

'use client';

import React from 'react';
import type { TendancesContrats } from '../types/contratsTypes';

interface TrendsChartProps {
  trends: TendancesContrats;
}

export function TrendsChart({ trends }: TrendsChartProps) {
  // Pour l'instant, affichage simple
  // TODO: Intégrer Chart.js ou Recharts pour un graphique réel
  return (
    <div className="h-64 flex items-end justify-between gap-2">
      {trends.dates.map((date, index) => {
        const maxValue = Math.max(...trends.total, ...trends.valides, ...trends.enAttente);
        const totalHeight = (trends.total[index] / maxValue) * 100;
        const validesHeight = (trends.valides[index] / maxValue) * 100;
        const enAttenteHeight = (trends.enAttente[index] / maxValue) * 100;

        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '200px' }}>
              <div
                className="bg-green-500 rounded-t"
                style={{ height: `${validesHeight}%` }}
                title={`Validés: ${trends.valides[index]}`}
              />
              <div
                className="bg-yellow-500"
                style={{ height: `${enAttenteHeight}%` }}
                title={`En attente: ${trends.enAttente[index]}`}
              />
              <div
                className="bg-purple-500 rounded-t"
                style={{ height: `${totalHeight}%` }}
                title={`Total: ${trends.total[index]}`}
              />
            </div>
            <div className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-left">
              {new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

