/**
 * Routeur de contenu pour le Workspace Gouvernance
 * Affiche le contenu approprié selon le type d'onglet actif
 */

'use client';

import React from 'react';
import { useGovernanceWorkspaceStore, type GovernanceTab } from '@/lib/stores/governanceWorkspaceStore';
import { RACIInboxView } from './views/RACIInboxView';
import { AlertsInboxView } from './views/AlertsInboxView';
import { RACIDetailView } from './views/RACIDetailView';
import { AlertDetailView } from './views/AlertDetailView';
import { GovernanceDashboard } from './GovernanceDashboard';

export function GovernanceWorkspaceContent() {
  const { showDashboard, tabs, activeTabId, getActiveTab } = useGovernanceWorkspaceStore();
  
  // Si dashboard visible, l'afficher
  if (showDashboard) {
    return <GovernanceDashboard />;
  }
  
  // Sinon afficher le contenu de l'onglet actif
  const activeTab = getActiveTab();
  
  if (!activeTab) {
    return <GovernanceDashboard />;
  }
  
  return <TabContent tab={activeTab} />;
}

interface TabContentProps {
  tab: GovernanceTab;
}

function TabContent({ tab }: TabContentProps) {
  switch (tab.type) {
    case 'raci-inbox':
      return <RACIInboxView />;
    
    case 'alerts-inbox':
      return <AlertsInboxView />;
    
    case 'raci-activity':
      return <RACIDetailView activityId={tab.metadata?.activityId} />;
    
    case 'alert-detail':
      return <AlertDetailView alertId={tab.metadata?.alertId} />;
    
    case 'raci-comparator':
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Comparateur RACI</h2>
          <p className="text-white/60">Comparaison de matrices RACI (à implémenter)</p>
        </div>
      );
    
    case 'raci-heatmap':
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Heatmap RACI</h2>
          <p className="text-white/60">Carte de chaleur des responsabilités (à implémenter)</p>
        </div>
      );
    
    case 'analytics':
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Analytics & Rapports</h2>
          <p className="text-white/60">Rapports et analyses (à implémenter)</p>
        </div>
      );
    
    case 'dashboard':
    default:
      return <GovernanceDashboard />;
  }
}

