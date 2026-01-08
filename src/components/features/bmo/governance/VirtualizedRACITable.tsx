'use client';

/**
 * Table RACI virtualisée
 * PHASE 3 : Optimisation performance avec @tanstack/react-virtual
 */

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RACITableRow } from './RACITableRow';

interface VirtualizedRACITableProps {
  raciData: Array<{
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    locked?: boolean;
  }>;
  bureaux: string[];
  selectedActivity: string | null;
  darkMode: boolean;
  onSelectActivity: (activity: string) => void;
}

export function VirtualizedRACITable({
  raciData,
  bureaux,
  selectedActivity,
  darkMode,
  onSelectActivity,
}: VirtualizedRACITableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: raciData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const row = raciData[index];
      // Calculer hauteur basée sur contenu
      let height = 60; // Base
      
      // Ajuster selon la longueur de l'activité
      if (row.activity.length > 50) height += 15;
      
      // Ajuster selon le nombre de bureaux
      const bureauCount = Object.keys(row.roles).length;
      if (bureauCount > 5) height += 5;
      
      return height;
    }, [raciData]),
    overscan: 5, // Nombre de lignes à rendre en dehors de la vue
    // Mesurer la hauteur réelle après rendu pour améliorer la précision
    measureElement: (element) => element?.getBoundingClientRect().height ?? 60,
  });

  return (
    <Card role="region" aria-label="Matrice RACI" id="raci-table">
      <CardContent className="p-0">
        {/* Header fixe */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700" role="rowgroup">
          <table 
            className="w-full text-[10px] sm:text-xs lg:text-sm"
            role="grid"
            aria-label="Tableau des activités RACI"
            aria-rowcount={raciData.length}
          >
            <thead>
              <tr role="row">
                <th className="p-2 sm:p-3 text-left font-bold" role="columnheader" scope="col">Activité</th>
                <th className="p-2 sm:p-3 text-center font-bold hidden sm:table-cell" role="columnheader" scope="col">Criticité</th>
                {bureaux.map(b => (
                  <th key={b} className="p-2 sm:p-3 text-center font-bold hidden lg:table-cell" role="columnheader" scope="col" aria-label={`Rôle ${b}`}>{b}</th>
                ))}
                <th className="p-2 sm:p-3 text-center font-bold" role="columnheader" scope="col" aria-label="Pilotage BMO">BMO</th>
                <th className="p-2 sm:p-3 text-center font-bold hidden sm:table-cell" role="columnheader" scope="col" aria-label="Statut de verrouillage">🔒</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Corps virtualisé */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: '600px' }} // Hauteur fixe pour le conteneur de scroll
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <table 
              className="w-full text-[10px] sm:text-xs lg:text-sm"
              role="grid"
              aria-label="Corps du tableau RACI"
            >
              <tbody role="rowgroup">
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = raciData[virtualRow.index];
                  return (
                    <RACITableRow
                      key={virtualRow.key}
                      row={row}
                      bureaux={bureaux}
                      isSelected={selectedActivity === row.activity}
                      darkMode={darkMode}
                      onSelect={onSelectActivity}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

