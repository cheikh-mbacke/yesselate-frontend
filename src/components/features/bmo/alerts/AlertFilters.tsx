'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface AlertFiltersProps {
  filters: {
    severity?: string;
    type?: string;
    bureau?: string;
    period?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  onReset: () => void;
  alertCounts: {
    critical: number;
    warning: number;
    success: number;
    total: number;
  };
}

export function AlertFilters({
  filters,
  onFilterChange,
  onReset,
  alertCounts,
}: AlertFiltersProps) {
  const { darkMode } = useAppStore();
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold">Filtres</span>
          {hasActiveFilters && (
            <Badge variant="default" className="text-[9px]">
              {Object.values(filters).filter((v) => v !== undefined).length}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onReset}
            className="text-[10px] h-5"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Filtre Sévérité */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Sévérité</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() =>
                onFilterChange('severity', filters.severity === 'critical' ? undefined : 'critical')
              }
              className={cn(
                'px-2 py-1 rounded text-[9px] font-medium transition-colors',
                filters.severity === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100',
                'border'
              )}
            >
              🚨 {alertCounts.critical}
            </button>
            <button
              onClick={() =>
                onFilterChange('severity', filters.severity === 'warning' ? undefined : 'warning')
              }
              className={cn(
                'px-2 py-1 rounded text-[9px] font-medium transition-colors',
                filters.severity === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100',
                'border'
              )}
            >
              ⚠️ {alertCounts.warning}
            </button>
          </div>
        </div>

        {/* Filtre Type */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange('type', e.target.value || undefined)}
            className={cn(
              'w-full px-2 py-1 rounded text-[9px] border',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}
          >
            <option value="">Tous</option>
            <option value="system">Système</option>
            <option value="blocked">Bloqués</option>
            <option value="payment">Paiements</option>
            <option value="contract">Contrats</option>
          </select>
        </div>

        {/* Filtre Bureau */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Bureau</label>
          <select
            value={filters.bureau || ''}
            onChange={(e) => onFilterChange('bureau', e.target.value || undefined)}
            className={cn(
              'w-full px-2 py-1 rounded text-[9px] border',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}
          >
            <option value="">Tous</option>
            <option value="BMO">BMO</option>
            <option value="BF">BF</option>
            <option value="BM">BM</option>
            <option value="BCT">BCT</option>
          </select>
        </div>

        {/* Filtre Période */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Période</label>
          <select
            value={filters.period || ''}
            onChange={(e) => onFilterChange('period', e.target.value || undefined)}
            className={cn(
              'w-full px-2 py-1 rounded text-[9px] border',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}
          >
            <option value="">Toutes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
          </select>
        </div>
      </div>
    </div>
  );
}

