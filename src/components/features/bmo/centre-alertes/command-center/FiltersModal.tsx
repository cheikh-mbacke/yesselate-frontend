/**
 * Modale de filtres avancés
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { alertModules, severityLabels, statusLabels } from './config';
import type { AlertSource, AlertSeverity, AlertStatus } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function FiltersModal() {
  const { modal, closeModal, filters, setFilters, clearFilters } = useCentreAlertesCommandCenterStore();
  const isOpen = modal.isOpen && modal.type === 'filters';

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    setFilters(localFilters);
    closeModal();
  };

  const handleReset = () => {
    clearFilters();
    setLocalFilters({
      dateRange: { start: null, end: null },
      sources: [],
      severities: [],
      statuses: [],
      modules: [],
      assignees: [],
      search: '',
    });
  };

  return (
    <FluentModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Filtres avancés"
      size="lg"
    >
      <div className="space-y-6">
        {/* Recherche */}
        <div className="space-y-2">
          <Label htmlFor="search">Recherche</Label>
          <Input
            id="search"
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            placeholder="Rechercher dans les alertes..."
            className="bg-slate-800/50 border-slate-700/50"
          />
        </div>

        {/* Période */}
        <div className="space-y-2">
          <Label>Période</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date-start" className="text-xs text-slate-400">
                Du
              </Label>
              <Input
                id="date-start"
                type="date"
                value={localFilters.dateRange.start ? format(localFilters.dateRange.start, 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateRange: {
                      ...localFilters.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null,
                    },
                  })
                }
                className="bg-slate-800/50 border-slate-700/50"
              />
            </div>
            <div>
              <Label htmlFor="date-end" className="text-xs text-slate-400">
                Au
              </Label>
              <Input
                id="date-end"
                type="date"
                value={localFilters.dateRange.end ? format(localFilters.dateRange.end, 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateRange: {
                      ...localFilters.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null,
                    },
                  })
                }
                className="bg-slate-800/50 border-slate-700/50"
              />
            </div>
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-2">
          <Label>Modules sources</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(alertModules).map((module) => (
              <div key={module.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${module.id}`}
                  checked={localFilters.sources?.includes(module.id as AlertSource) || false}
                  onCheckedChange={(checked) => {
                    const sources = localFilters.sources || [];
                    if (checked) {
                      setLocalFilters({
                        ...localFilters,
                        sources: [...sources, module.id as AlertSource],
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        sources: sources.filter((s) => s !== module.id),
                      });
                    }
                  }}
                />
                <Label
                  htmlFor={`source-${module.id}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <span>{module.icon}</span>
                  <span>{module.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Criticité */}
        <div className="space-y-2">
          <Label>Criticité</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['critical', 'urgent', 'warning', 'info'] as AlertSeverity[]).map((severity) => (
              <div key={severity} className="flex items-center space-x-2">
                <Checkbox
                  id={`severity-${severity}`}
                  checked={localFilters.severities?.includes(severity) || false}
                  onCheckedChange={(checked) => {
                    const severities = localFilters.severities || [];
                    if (checked) {
                      setLocalFilters({
                        ...localFilters,
                        severities: [...severities, severity],
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        severities: severities.filter((s) => s !== severity),
                      });
                    }
                  }}
                />
                <Label htmlFor={`severity-${severity}`} className="text-sm font-normal cursor-pointer">
                  {severityLabels[severity]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Statut */}
        <div className="space-y-2">
          <Label>Statut</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['active', 'acknowledged', 'resolved', 'escalated', 'archived'] as AlertStatus[]).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={localFilters.statuses?.includes(status) || false}
                  onCheckedChange={(checked) => {
                    const statuses = localFilters.statuses || [];
                    if (checked) {
                      setLocalFilters({
                        ...localFilters,
                        statuses: [...statuses, status],
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        statuses: statuses.filter((s) => s !== status),
                      });
                    }
                  }}
                />
                <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                  {statusLabels[status]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={closeModal}>
              Annuler
            </Button>
            <Button variant="default" size="sm" onClick={handleApply} className="bg-amber-500 hover:bg-amber-600">
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

