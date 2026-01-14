/**
 * Vue Alertes système & sécurité
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Shield } from 'lucide-react';

const mockAlerts: Alert[] = [];

export function SystemSecurityView() {
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
          <Shield className="h-6 w-6 text-slate-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes système & sécurité</h2>
            <p className="text-sm text-slate-400">
              Alertes issues du domaine Système & Sécurité
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

