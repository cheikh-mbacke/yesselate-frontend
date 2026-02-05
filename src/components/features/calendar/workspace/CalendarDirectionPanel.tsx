'use client';

import { CalendarLiveCounters } from './CalendarLiveCounters';
import { FluentButton } from '@/components/ui/fluent-button';
import { Plus, BarChart2, Download, FileText } from 'lucide-react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';

/**
 * CalendarDirectionPanel
 * ======================
 * 
 * Dashboard "direction" affiché quand aucun onglet n'est ouvert.
 * Vue d'ensemble avec live counters + actions rapides.
 */

interface Props {
  onOpenStats?: () => void;
  onOpenExport?: () => void;
}

export function CalendarDirectionPanel({ onOpenStats, onOpenExport }: Props) {
  const { openTab } = useCalendarWorkspaceStore();

  return (
    <div className="space-y-6">
      {/* Live Counters */}
      <CalendarLiveCounters />

      {/* Actions rapides */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 dark:border-slate-700/50 dark:bg-[#1f1f1f]/60 backdrop-blur-sm">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <FluentButton
            variant="secondary"
            onClick={() =>
              openTab({
                id: `wizard:create:${Date.now()}`,
                type: 'wizard',
                title: 'Nouvel événement',
                icon: '➕',
                data: { action: 'create' },
              })
            }
          >
            <Plus className="w-4 h-4 text-blue-500" />
            Nouvel événement
          </FluentButton>

          <FluentButton variant="secondary" onClick={onOpenStats}>
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            Statistiques
          </FluentButton>

          <FluentButton variant="secondary" onClick={onOpenExport}>
            <Download className="w-4 h-4 text-amber-500" />
            Exporter
          </FluentButton>

          <FluentButton
            variant="secondary"
            onClick={() =>
              openTab({
                id: 'report:monthly',
                type: 'report',
                title: 'Rapport mensuel',
                icon: '📊',
                data: { reportId: 'monthly' },
              })
            }
          >
            <FileText className="w-4 h-4 text-purple-500" />
            Rapport
          </FluentButton>
        </div>
      </div>

      {/* Raccourcis clavier */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 dark:border-slate-700/50 dark:bg-[#1f1f1f]/60 backdrop-blur-sm">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Raccourcis clavier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Palette de commandes</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
              Ctrl+K
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Nouvel événement</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
              Ctrl+N
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Aujourd&apos;hui</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
              Ctrl+1
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Cette semaine</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
              Ctrl+2
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

