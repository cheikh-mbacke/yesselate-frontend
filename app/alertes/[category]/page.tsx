/**
 * Alerts Page by Category
 * Route: /alertes/:category
 * Shows alerts filtered by category
 * Equivalent to React Router: { path: '/alertes/:category', element: <AlertsPage /> }
 */

'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';
import { AlertWorkspaceTabs } from '@/components/features/alerts/workspace/AlertWorkspaceTabs';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { shortcuts, getCategoryQuery, getShortcut } from '@/lib/config/alertsNavigation';
import type { AlertCategory } from '@/lib/types/alert.types';

export default function AlertsCategoryPage() {
  const params = useParams();
  const categoryParam = (params?.category as string) || 'overview';
  const { openTab } = useAlertWorkspaceStore();

  // Validate category exists in shortcuts
  const validCategory: AlertCategory = shortcuts.find(s => s.key === categoryParam)?.key || 'overview';
  const shortcut = getShortcut(validCategory);
  const categoryLabel = shortcut?.label || 'Alertes';
  const categoryQuery = getCategoryQuery(validCategory);

  // Open tab for this category on mount
  useEffect(() => {
    const tabs = useAlertWorkspaceStore.getState().tabs;
    const tabId = `inbox:${validCategory}`;
    
    // Only open if tab doesn't exist
    if (!tabs.find(t => t.id === tabId)) {
      openTab({
        type: 'inbox',
        id: tabId,
        title: categoryLabel,
        data: { 
          queue: validCategory,
          ...categoryQuery, // Include query parameters for filtering
        },
      });
    } else {
      // Set as active if it exists
      useAlertWorkspaceStore.getState().setActiveTab(tabId);
    }
  }, [validCategory, categoryLabel, categoryQuery, openTab]);

  return (
    <div className="h-full flex flex-col">
      <AlertWorkspaceTabs />
      <div className="flex-1 overflow-y-auto">
        <AlertWorkspaceContent />
      </div>
    </div>
  );
}

