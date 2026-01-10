'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Search, Filter, X, Calendar, DollarSign, Building2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  status: string[];
  phase: string[];
  kind: string[];
  bureau: string;
  riskMin: number;
  riskMax: number;
  complexityMin: number;
  complexityMax: number;
  budgetMin: number;
  budgetMax: number;
  hasDecisionBMO: boolean | null;
  informal: boolean | null;
  dateStart: string;
  dateEnd: string;
}

interface ProjectSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

export function ProjectSearchPanel({ isOpen, onClose, onSearch }: ProjectSearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    phase: [],
    kind: [],
    bureau: '',
    riskMin: 0,
    riskMax: 100,
    complexityMin: 0,
    complexityMax: 100,
    budgetMin: 0,
    budgetMax: 0,
    hasDecisionBMO: null,
    informal: null,
    dateStart: '',
    dateEnd: '',
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'status' | 'phase' | 'kind', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      status: [],
      phase: [],
      kind: [],
      bureau: '',
      riskMin: 0,
      riskMax: 100,
      complexityMin: 0,
      complexityMax: 100,
      budgetMin: 0,
      budgetMax: 0,
      hasDecisionBMO: null,
      informal: null,
      dateStart: '',
      dateEnd: '',
    });
    setActiveFiltersCount(0);
  };

  const handleSearch = () => {
    // Compter les filtres actifs
    let count = 0;
    if (filters.query) count++;
    if (filters.status.length > 0) count++;
    if (filters.phase.length > 0) count++;
    if (filters.kind.length > 0) count++;
    if (filters.bureau) count++;
    if (filters.riskMin > 0 || filters.riskMax < 100) count++;
    if (filters.complexityMin > 0 || filters.complexityMax < 100) count++;
    if (filters.budgetMin > 0 || filters.budgetMax > 0) count++;
    if (filters.hasDecisionBMO !== null) count++;
    if (filters.informal !== null) count++;
    if (filters.dateStart || filters.dateEnd) count++;
    
    setActiveFiltersCount(count);
    onSearch(filters);
    onClose();
  };

  return (
    <FluentModal 
      open={isOpen} 
      title="Recherche avancée" 
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Recherche textuelle */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Recherche</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              placeholder="ID, nom, secteur, CIRIL..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/70 bg-white/90 outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
            />
          </div>
        </div>

        {/* Statuts */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Statuts</label>
          <div className="flex flex-wrap gap-2">
            {['planned', 'active', 'blocked', 'late', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                className={cn(
                  'px-3 py-1.5 rounded-lg border transition-colors text-sm',
                  filters.status.includes(status)
                    ? 'border-purple-500/50 bg-purple-500/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
                )}
                onClick={() => toggleArrayFilter('status', status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Phases</label>
          <div className="flex flex-wrap gap-2">
            {['idee', 'diagnostic', 'conception', 'consultation', 'execution', 'reception', 'exploitation', 'clos'].map(phase => (
              <button
                key={phase}
                className={cn(
                  'px-3 py-1.5 rounded-lg border transition-colors text-sm',
                  filters.phase.includes(phase)
                    ? 'border-purple-500/50 bg-purple-500/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
                )}
                onClick={() => toggleArrayFilter('phase', phase)}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Types */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Types</label>
          <div className="flex flex-wrap gap-2">
            {['travaux', 'fournitures', 'services', 'mixte'].map(kind => (
              <button
                key={kind}
                className={cn(
                  'px-3 py-1.5 rounded-lg border transition-colors text-sm',
                  filters.kind.includes(kind)
                    ? 'border-purple-500/50 bg-purple-500/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
                )}
                onClick={() => toggleArrayFilter('kind', kind)}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Risque
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.riskMin}
                onChange={(e) => updateFilter('riskMin', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Min: {filters.riskMin}</span>
                <span>Max: {filters.riskMax}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.riskMax}
                onChange={(e) => updateFilter('riskMax', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Complexité
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.complexityMin}
                onChange={(e) => updateFilter('complexityMin', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Min: {filters.complexityMin}</span>
                <span>Max: {filters.complexityMax}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.complexityMax}
                onChange={(e) => updateFilter('complexityMax', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Filtres spéciaux */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Filtres spéciaux</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:bg-slate-800/50">
              <input
                type="checkbox"
                checked={filters.hasDecisionBMO === true}
                onChange={(e) => updateFilter('hasDecisionBMO', e.target.checked ? true : null)}
                className="rounded"
              />
              <span className="text-sm">Avec décision BMO</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:bg-slate-800/50">
              <input
                type="checkbox"
                checked={filters.informal === true}
                onChange={(e) => updateFilter('informal', e.target.checked ? true : null)}
                className="rounded"
              />
              <span className="text-sm">Contexte informel/hybride</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton 
            size="sm" 
            variant="secondary" 
            onClick={resetFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Réinitialiser
          </FluentButton>
          <FluentButton 
            size="sm" 
            variant="primary" 
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 mr-2" />
            Rechercher
            {activeFiltersCount > 0 && (
              <Badge variant="success" className="ml-2 text-[9px]">
                {activeFiltersCount}
              </Badge>
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

