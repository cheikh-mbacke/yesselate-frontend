'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface ValidationBCActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ValidationBCActiveFilters({ filters, onRemove, onClearAll }: ValidationBCActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="rounded-xl border border-purple-200/50 bg-purple-50/30 p-3 dark:border-purple-800/30 dark:bg-purple-900/10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 flex-none">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtres actifs:</span>
          </div>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onRemove(filter.key)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 dark:bg-[#141414] dark:border-purple-800 dark:hover:bg-purple-900/20 transition-colors text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">
                {filter.label}: <span className="font-medium text-slate-900 dark:text-white">{filter.value}</span>
              </span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
        
        <FluentButton size="sm" variant="secondary" onClick={onClearAll}>
          Tout effacer
        </FluentButton>
      </div>
    </div>
  );
}

