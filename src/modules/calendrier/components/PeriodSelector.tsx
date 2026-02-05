/**
 * Sélecteur de période : Semaine / Mois / Trimestre
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { useCalendrierFilters } from '../hooks/useCalendrierFilters';
import type { PeriodeVue } from '../types/calendrierTypes';

const periods: { value: PeriodeVue; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'semaine', label: 'Semaine', icon: Calendar },
  { value: 'mois', label: 'Mois', icon: CalendarDays },
  { value: 'trimestre', label: 'Trimestre', icon: CalendarRange },
];

export function PeriodSelector() {
  const { periode, setPeriode } = useCalendrierFilters();

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
      {periods.map((period) => {
        const Icon = period.icon;
        const isActive = periode === period.value;

        return (
          <Button
            key={period.value}
            variant="ghost"
            size="sm"
            onClick={() => setPeriode(period.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 h-8 text-xs font-medium transition-all',
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{period.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

