/**
 * Demandes Command Center - Content Router
 * Route vers les différentes vues selon la navigation
 */

'use client';

import React from 'react';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { DemandesOverviewView } from './views/DemandesOverviewView';
import { DemandesPendingView } from './views/DemandesPendingView';
import { DemandesUrgentView } from './views/DemandesUrgentView';
import { DemandesValidatedView } from './views/DemandesValidatedView';
import { DemandesRejectedView } from './views/DemandesRejectedView';
import { DemandesOverdueView } from './views/DemandesOverdueView';

export function DemandesContentRouter() {
  const { navigation } = useDemandesCommandCenterStore();

  switch (navigation.mainCategory) {
    case 'overview':
      return <DemandesOverviewView />;
    case 'pending':
      return <DemandesPendingView />;
    case 'urgent':
      return <DemandesUrgentView />;
    case 'validated':
      return <DemandesValidatedView />;
    case 'rejected':
      return <DemandesRejectedView />;
    case 'overdue':
      return <DemandesOverdueView />;
    default:
      return <DemandesOverviewView />;
  }
}

