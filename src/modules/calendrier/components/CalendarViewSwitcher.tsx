/**
 * Switcher de vues : Gantt / Calendrier / Timeline
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GanttChart, Calendar, History } from 'lucide-react';
import { useCalendrierFilters } from '../hooks/useCalendrierFilters';
import type { ModeVue } from '../types/calendrierTypes';

const views: { value: ModeVue; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'gantt', label: 'Gantt', icon: GanttChart },
  { value: 'calendrier', label: 'Calendrier', icon: Calendar },
  { value: 'timeline', label: 'Timeline', icon: History },
];

export function CalendarViewSwitcher() {
  const { vue, setVue } = useCalendrierFilters();

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = vue === view.value;

        return (
          <Button
            key={view.value}
            variant="ghost"
            size="sm"
            onClick={() => setVue(view.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 h-8 text-xs font-medium transition-all',
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

