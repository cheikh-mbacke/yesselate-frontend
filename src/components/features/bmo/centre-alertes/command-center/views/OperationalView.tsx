/**
 * Vue Alertes opérationnelles
 */

'use client';

import React from 'react';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useOperationalAlerts } from '@/lib/api/hooks/useCentreAlertes';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Settings } from 'lucide-react';

export function OperationalView() {
  const { openModal, filters } = useCentreAlertesCommandCenterStore();
  const { data: alertsData, isLoading } = useOperationalAlerts(filters);

  const alerts: Alert[] =
    alertsData?.alerts?.map((a) => ({
      ...a,
      source: (a.source as any) || 'execution',
      createdAt: new Date(a.createdAt),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
    })) || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes opérationnelles</h2>
            <p className="text-sm text-slate-400">
              Alertes issues des processus opérationnels quotidiens
            </p>
          </div>
        </div>
      </div>

      <AlertTable
        alerts={alerts}
        loading={isLoading}
        onAlertClick={(alert) => openModal('alert-detail', { alert })}
        onAction={(action, alert) => {
          if (action === 'open' && alert.modulePath) {
            window.location.href = alert.modulePath;
          } else {
            openModal('alert-detail', { alert });
          }
        }}
      />
    </div>
  );
}

