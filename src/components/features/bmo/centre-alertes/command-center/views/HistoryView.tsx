/**
 * Vue Historique & traçabilité
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { FileText, Download, Filter } from 'lucide-react';

const mockAlerts: Alert[] = [];

export function HistoryView() {
  const { openModal, filters } = useCentreAlertesCommandCenterStore();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  }, [filters]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-gray-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Historique & traçabilité</h2>
            <p className="text-sm text-slate-400">
              Historique complet des alertes avec filtres avancés
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('filters')}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('export')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <AlertTable
        alerts={alerts}
        loading={loading}
        onAlertClick={(alert) => openModal('alert-detail', { alert })}
      />
    </div>
  );
}

