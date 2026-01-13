'use client';

import React from 'react';
import { AlertTriangle, Clock, TrendingUp, Shield } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

export function ValidationBCAlertsBanner() {
  // Simuler des alertes (à remplacer par de vraies données)
  const alerts = [
    {
      id: 'alert-1',
      type: 'urgent',
      message: '5 BCs nécessitent une validation urgente avant la fin de journée',
      action: 'Voir la liste',
    },
  ];

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 dark:text-amber-300 flex-none" />
            <div>
              <div className="font-semibold text-amber-900 dark:text-amber-200">{alert.message}</div>
            </div>
          </div>
          <FluentButton size="sm" variant="warning">
            {alert.action}
          </FluentButton>
        </div>
      ))}
    </div>
  );
}

