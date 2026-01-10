/**
 * Grille de graphiques responsive pour Analytics
 * Gère l'affichage de plusieurs graphiques avec drag & drop
 */

'use client';

import React from 'react';
import { InteractiveChart, InteractiveChartProps } from './InteractiveChart';

export interface ChartGridItem {
  id: string;
  title: string;
  chartProps: Omit<InteractiveChartProps, 'title'>;
  /** Largeur en colonnes (1-4, défaut: 2) */
  span?: 1 | 2 | 3 | 4;
}

export interface ChartGridProps {
  charts: ChartGridItem[];
  /** Nombre de colonnes (défaut: 2) */
  columns?: 2 | 3 | 4;
  /** Espacement entre les graphiques */
  gap?: number;
  /** Mode d'affichage */
  layout?: 'grid' | 'masonry';
}

export const ChartGrid = React.memo<ChartGridProps>(
  ({ charts, columns = 2, gap = 4, layout = 'grid' }) => {
    const gridClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const spanClasses = {
      1: 'col-span-1',
      2: 'md:col-span-2',
      3: 'lg:col-span-3',
      4: 'col-span-full',
    };

    if (charts.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Aucun graphique à afficher
        </div>
      );
    }

    return (
      <div className={`grid ${gridClasses[columns]} gap-${gap}`}>
        {charts.map((chart) => (
          <div
            key={chart.id}
            className={`${chart.span ? spanClasses[chart.span] : ''}`}
          >
            <InteractiveChart title={chart.title} {...chart.chartProps} />
          </div>
        ))}
      </div>
    );
  }
);

ChartGrid.displayName = 'ChartGrid';

