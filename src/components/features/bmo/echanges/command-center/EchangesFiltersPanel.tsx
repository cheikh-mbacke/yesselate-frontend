/**
 * Panneau de filtres avancés pour Échanges Inter-Bureaux
 * Permet de filtrer les échanges par date, bureaux, statuts, priorités, etc.
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  ArrowUp,
  Search,
} from 'lucide-react';
import { useEchangesBureauxCommandCenterStore } from '@/lib/stores/echangesBureauxCommandCenterStore';

interface EchangesFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: Record<string, any>) => void;
}

const bureauxOptions = [
  { id: 'BMO', name: 'Bureau Maître d\'Ouvrage' },
  { id: 'BT', name: 'Bureau Technique' },
  { id: 'DAF', name: 'Direction Administrative et Financière' },
  { id: 'BJ', name: 'Bureau Juridique' },
  { id: 'BAP', name: 'Bureau Achats et Partenariats' },
  { id: 'BL', name: 'Bureau Logistique' },
  { id: 'RH', name: 'Ressources Humaines' },
];

const statusOptions = [
  { id: 'pending', label: 'En attente', icon: Clock, color: 'amber' },
  { id: 'resolved', label: 'Résolu', icon: CheckCircle, color: 'emerald' },
  { id: 'escalated', label: 'Escaladé', icon: AlertTriangle, color: 'red' },
];

const priorityOptions = [
  { id: 'urgent', label: 'Urgent', icon: Zap, color: 'red' },
  { id: 'high', label: 'Haute', icon: ArrowUp, color: 'amber' },
  { id: 'normal', label: 'Normale', icon: Clock, color: 'slate' },
];

export function EchangesFiltersPanel({ isOpen, onClose, onApplyFilters }: EchangesFiltersPanelProps) {
  const { filters, setFilter, resetFilters } = useEchangesBureauxCommandCenterStore();
  const [localFilters, setLocalFilters] = useState({
    bureaux: filters.bureaux || [],
    statuses: filters.statuses || [],
    priorities: filters.priorities || [],
    search: '',
  });

  if (!isOpen) return null;

  const handleToggleBureau = (bureauId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      bureaux: prev.bureaux.includes(bureauId)
        ? prev.bureaux.filter((id) => id !== bureauId)
        : [...prev.bureaux, bureauId],
    }));
  };

  const handleToggleStatus = (status: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleTogglePriority = (priority: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const handleApply = () => {
    // Appliquer les filtres au store
    setFilter('bureaux', localFilters.bureaux);
    setFilter('statuses', localFilters.statuses);
    setFilter('priorities', localFilters.priorities);
    onApplyFilters?.(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      bureaux: [],
      statuses: [],
      priorities: [],
      search: '',
    });
    resetFilters();
  };

  const activeFiltersCount =
    localFilters.bureaux.length +
    localFilters.statuses.length +
    localFilters.priorities.length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtres avancés</h3>
            {activeFiltersCount > 0 && (
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Bureaux */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-300">Bureaux</h4>
            </div>
            <div className="space-y-2">
              {bureauxOptions.map((bureau) => {
                const isSelected = localFilters.bureaux.includes(bureau.id);
                return (
                  <button
                    key={bureau.id}
                    onClick={() => handleToggleBureau(bureau.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-violet-500/10 border-violet-500/30 text-slate-200'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    )}
                  >
                    <span className="text-sm">{bureau.name}</span>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statuts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-300">Statuts</h4>
            </div>
            <div className="space-y-2">
              {statusOptions.map((status) => {
                const isSelected = localFilters.statuses.includes(status.id);
                const Icon = status.icon;
                const statusColorClasses = {
                  amber: isSelected
                    ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                  emerald: isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                  red: isSelected
                    ? 'bg-red-500/10 border-red-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                };
                const iconColorClasses = {
                  amber: 'text-amber-400',
                  emerald: 'text-emerald-400',
                  red: 'text-red-400',
                };
                const dotColorClasses = {
                  amber: 'bg-amber-400',
                  emerald: 'bg-emerald-400',
                  red: 'bg-red-400',
                };
                return (
                  <button
                    key={status.id}
                    onClick={() => handleToggleStatus(status.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg border transition-colors',
                      statusColorClasses[status.color as keyof typeof statusColorClasses]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', iconColorClasses[status.color as keyof typeof iconColorClasses])} />
                      <span className="text-sm">{status.label}</span>
                    </div>
                    {isSelected && (
                      <div className={cn('w-2 h-2 rounded-full', dotColorClasses[status.color as keyof typeof dotColorClasses])} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priorités */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-300">Priorités</h4>
            </div>
            <div className="space-y-2">
              {priorityOptions.map((priority) => {
                const isSelected = localFilters.priorities.includes(priority.id);
                const Icon = priority.icon;
                const priorityColorClasses = {
                  red: isSelected
                    ? 'bg-red-500/10 border-red-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                  amber: isSelected
                    ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                  slate: isSelected
                    ? 'bg-slate-500/10 border-slate-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50',
                };
                const iconColorClasses = {
                  red: 'text-red-400',
                  amber: 'text-amber-400',
                  slate: 'text-slate-400',
                };
                const dotColorClasses = {
                  red: 'bg-red-400',
                  amber: 'bg-amber-400',
                  slate: 'bg-slate-400',
                };
                return (
                  <button
                    key={priority.id}
                    onClick={() => handleTogglePriority(priority.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg border transition-colors',
                      priorityColorClasses[priority.color as keyof typeof priorityColorClasses]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', iconColorClasses[priority.color as keyof typeof iconColorClasses])} />
                      <span className="text-sm">{priority.label}</span>
                    </div>
                    {isSelected && (
                      <div className={cn('w-2 h-2 rounded-full', dotColorClasses[priority.color as keyof typeof dotColorClasses])} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

