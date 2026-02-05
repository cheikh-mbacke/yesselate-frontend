'use client';

/**
 * Composant de ligne RACI mémorisé
 * PHASE 3 : Optimisation performance avec React.memo
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScreenReaderOnly } from '@/components/ui/screen-reader-only';
import { cn } from '@/lib/utils';

const RACI_COLORS: Record<string, string> = {
  'R': 'bg-emerald-400/80 text-white',
  'A': 'bg-blue-400/80 text-white',
  'C': 'bg-amber-400/80 text-white',
  'I': 'bg-slate-400/80 text-white',
  '-': 'bg-slate-700/30 text-slate-500',
};

interface RACITableRowProps {
  row: {
    activity: string;
    category: string;
    criticality: string;
    roles: Record<string, string>;
    locked?: boolean;
    decisionBMO?: string;
  };
  bureaux: string[];
  isSelected: boolean;
  darkMode: boolean;
  onSelect: (activity: string) => void;
  style?: React.CSSProperties;
}

export const RACITableRow = memo(function RACITableRow({
  row,
  bureaux,
  isSelected,
  darkMode,
  onSelect,
  style,
}: RACITableRowProps) {
  const isBMOPilot = row.decisionBMO !== undefined && row.decisionBMO !== null;

  const rowId = `raci-row-${row.activity.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <tr
      id={rowId}
      role="row"
      aria-selected={isSelected}
      aria-label={`Activité ${row.activity}, ${row.criticality}, ${isBMOPilot ? 'pilotée par BMO' : 'hors BMO'}`}
      tabIndex={0}
      className={cn(
        "border-b cursor-pointer transition-all",
        "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
        darkMode ? "border-slate-700/50 hover:bg-slate-800/50" : "border-gray-100 hover:bg-gray-50",
        isSelected && "ring-2 ring-blue-400/60",
        row.criticality === 'critical' && "bg-red-400/5",
      )}
      onClick={() => onSelect(row.activity)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(row.activity);
        }
      }}
      style={style}
    >
      <td className="p-2 sm:p-3" role="gridcell">
        <div>
          <p className="font-medium text-[10px] sm:text-xs lg:text-sm">{row.activity}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">
            {row.category}
            <ScreenReaderOnly>, catégorie</ScreenReaderOnly>
          </p>
        </div>
      </td>
      <td className="p-2 sm:p-3 text-center hidden sm:table-cell">
        <Badge
          variant={row.criticality === 'critical' ? 'urgent' : row.criticality === 'high' ? 'warning' : 'default'}
          className="text-[9px] sm:text-[10px]"
        >
          {row.criticality}
        </Badge>
      </td>
      {bureaux.map(bureau => {
        const role = row.roles[bureau] || '-';
        const roleLabel = role === 'R' ? 'Responsible' : role === 'A' ? 'Accountable' : role === 'C' ? 'Consulted' : role === 'I' ? 'Informed' : 'Non impliqué';
        return (
          <td 
            key={bureau} 
            className="p-2 sm:p-3 text-center hidden lg:table-cell" 
            role="gridcell"
            aria-label={`${bureau}: ${roleLabel}`}
          >
            <span 
              className={cn("inline-flex w-6 h-6 sm:w-7 sm:h-7 rounded items-center justify-center font-bold text-[10px] sm:text-xs", RACI_COLORS[role])}
              aria-label={roleLabel}
            >
              {role}
              <ScreenReaderOnly>: {roleLabel}</ScreenReaderOnly>
            </span>
          </td>
        );
      })}
      <td className="p-2 sm:p-3 text-center" role="gridcell" aria-label={isBMOPilot ? 'Pilotée par BMO' : 'Hors BMO'}>
        {isBMOPilot ? (
          <Badge variant="success" className="text-[9px] sm:text-[10px]" aria-label="Pilotée par BMO">
            🟢 BMO
            <ScreenReaderOnly>: Pilotée par BMO</ScreenReaderOnly>
          </Badge>
        ) : (
          <Badge variant="default" className="text-[9px] sm:text-[10px]" aria-label="Hors BMO">
            ⚪ Hors BMO
            <ScreenReaderOnly>: Hors BMO</ScreenReaderOnly>
          </Badge>
        )}
      </td>
      <td className="p-2 sm:p-3 text-center hidden sm:table-cell" role="gridcell" aria-label={row.locked ? 'Activité verrouillée' : 'Activité non verrouillée'}>
        {row.locked ? (
          <span className="text-amber-300/80" aria-label="Verrouillée">
            🔒
            <ScreenReaderOnly>: Verrouillée</ScreenReaderOnly>
          </span>
        ) : (
          <span className="text-slate-500" aria-label="Non verrouillée">
            🔓
            <ScreenReaderOnly>: Non verrouillée</ScreenReaderOnly>
          </span>
        )}
      </td>
    </tr>
  );
}, (prev, next) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prev.row.activity === next.row.activity &&
    prev.isSelected === next.isSelected &&
    prev.darkMode === next.darkMode &&
    JSON.stringify(prev.row.roles) === JSON.stringify(next.row.roles)
  );
});

