/**
 * Routeur de contenu principal du Dashboard
 * Affiche la vue appropriée selon la navigation
 */

'use client';

import React from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { OverviewView } from './views/OverviewView';
import { PerformanceView } from './views/PerformanceView';
import { ActionsView } from './views/ActionsView';
import { RisksView } from './views/RisksView';
import { DecisionsView } from './views/DecisionsView';
import { RealtimeView } from './views/RealtimeView';

export function DashboardContentRouter() {
  const { navigation } = useDashboardCommandCenterStore();

  switch (navigation.mainCategory) {
    case 'overview':
      return <OverviewView />;
    case 'performance':
      return <PerformanceView />;
    case 'actions':
      return <ActionsView />;
    case 'risks':
      return <RisksView />;
    case 'decisions':
      return <DecisionsView />;
    case 'realtime':
      return <RealtimeView />;
    default:
      return <OverviewView />;
  }
}

