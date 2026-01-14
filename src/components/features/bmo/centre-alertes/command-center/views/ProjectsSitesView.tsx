/**
 * Vue Alertes projets & chantiers
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Building2 } from 'lucide-react';

const mockAlerts: Alert[] = [];

export function ProjectsSitesView() {
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
          <Building2 className="h-6 w-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes projets & chantiers</h2>
            <p className="text-sm text-slate-400">
              Alertes issues du domaine Projets & Clients
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

