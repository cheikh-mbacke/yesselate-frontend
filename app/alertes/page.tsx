/**
 * Alerts Page - Default view
 * Route: /alertes
 * Shows overview of all alerts
 * Equivalent to React Router: { path: '/alertes', element: <AlertsPage /> }
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';
import { AlertWorkspaceTabs } from '@/components/features/alerts/workspace/AlertWorkspaceTabs';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { getCategoryQuery } from '@/lib/config/alertsNavigation';

export default function AlertsPage() {
  const router = useRouter();
  const { openTab } = useAlertWorkspaceStore();

  // Open default overview tab on mount
  useEffect(() => {
    // Open overview inbox if no tabs exist
    const tabs = useAlertWorkspaceStore.getState().tabs;
    if (tabs.length === 0) {
      const overviewQuery = getCategoryQuery('overview');
      openTab({
        type: 'inbox',
        id: 'inbox:overview',
        title: "Vue d'ensemble",
        data: { 
          queue: 'overview',
          ...overviewQuery,
        },
      });
    }
  }, [openTab]);

  return (
    <div className="h-full flex flex-col">
      <AlertWorkspaceTabs />
      <div className="flex-1 overflow-y-auto">
        <AlertWorkspaceContent />
      </div>
    </div>
  );
}

