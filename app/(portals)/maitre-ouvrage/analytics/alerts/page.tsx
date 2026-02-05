'use client';

/**
 * Page dédiée aux Alertes Analytics
 * Route: /maitre-ouvrage/analytics/alerts
 */

import { AlertsDashboardView } from '@/components/features/bmo/analytics/workspace/views/AlertsDashboardView';

export default function AlertsPage() {
  return (
    <div className="h-full">
      <AlertsDashboardView />
    </div>
  );
}

