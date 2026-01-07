'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar } from 'lucide-react';
import { bureaux } from '@/lib/data';

interface AdvancedFiltersProps {
  filters: {
    period?: 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    bureaux?: string[];
    type?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const { darkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.period,
    filters.startDate,
    filters.endDate,
    filters.bureaux?.length,
    filters.type,
  ].filter(Boolean).length;

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'gap-2',
          activeFiltersCount > 0 && 'bg-orange-500/10 border-orange-500/50'
        )}
      >
        <Filter className="w-4 h-4" />
        Filtres avancés
        {activeFiltersCount > 0 && (
          <Badge variant="default" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={cn(
          'absolute top-full left-0 mt-2 w-[500px] z-50 shadow-xl',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres avancés
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Période */}
            <div>
              <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Période
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['month', 'quarter', 'year', 'custom'].map(period => (
                  <Button
                    key={period}
                    size="sm"
                    variant={filters.period === period ? 'default' : 'ghost'}
                    onClick={() => updateFilter('period', period)}
                    className="text-xs"
                  >
                    {period === 'month' ? 'Mois' : 
                     period === 'quarter' ? 'Trimestre' :
                     period === 'year' ? 'Année' : 'Personnalisée'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dates personnalisées */}
            {filters.period === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Date de début</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className={cn(
                      'w-full p-2 rounded text-xs',
                      darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                    )}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Date de fin</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className={cn(
                      'w-full p-2 rounded text-xs',
                      darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Bureaux */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Bureaux</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                {bureaux.map(bureau => (
                  <Badge
                    key={bureau.code}
                    variant={filters.bureaux?.includes(bureau.code) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = filters.bureaux || [];
                      if (current.includes(bureau.code)) {
                        updateFilter('bureaux', current.filter(b => b !== bureau.code));
                      } else {
                        updateFilter('bureaux', [...current, bureau.code]);
                      }
                    }}
                  >
                    {bureau.code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
              <Badge variant="info">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

