/**
 * Vue Alertes critiques
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useCriticalAlerts } from '@/lib/api/hooks/useCentreAlertes';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

export function CriticalView() {
  const { openModal, filters } = useCentreAlertesCommandCenterStore();
  const { data: alertsData, isLoading } = useCriticalAlerts(filters);

  const alerts: Alert[] =
    alertsData?.alerts?.map((a) => ({
      ...a,
      source: (a.source as any) || 'execution',
      createdAt: new Date(a.createdAt),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
    })) || [];

  const handleAlertClick = (alert: Alert) => {
    openModal('alert-detail', { alert });
  };

  const handleAction = (action: string, alert: Alert) => {
    switch (action) {
      case 'treat':
        openModal('treat', { alert });
        break;
      case 'escalate':
        openModal('escalate', { alert });
        break;
      case 'open':
        if (alert.modulePath) {
          window.location.href = alert.modulePath;
        }
        break;
      default:
        openModal('alert-detail', { alert });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes critiques</h2>
            <p className="text-sm text-slate-400">
              Alertes nécessitant une intervention immédiate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('escalate')}
            className="gap-2"
          >
            Escalader DG
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertTable
        alerts={alerts}
        loading={isLoading}
        onAlertClick={handleAlertClick}
        onAction={handleAction}
      />
    </div>
  );
}

