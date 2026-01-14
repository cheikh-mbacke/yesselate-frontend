/**
 * Vue Alertes RH & ressources
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Users } from 'lucide-react';

const mockAlerts: Alert[] = [];

export function RHResourcesView() {
  const { openModal } = useCentreAlertesCommandCenterStore();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes RH & ressources</h2>
            <p className="text-sm text-slate-400">
              Alertes issues du domaine RH & Ressources
            </p>
          </div>
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

