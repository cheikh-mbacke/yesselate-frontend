/**
 * Routeur de contenu principal
 * Affiche la vue appropriée selon la navigation
 */

'use client';

import React from 'react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { OverviewView } from './views/OverviewView';
import { ProjectsView } from './views/ProjectsView';
import { RisksView } from './views/RisksView';
import { ResourcesView } from './views/ResourcesView';
import { FinancialView } from './views/FinancialView';
import { ComplianceView } from './views/ComplianceView';
import { ProcessesView } from './views/ProcessesView';

export function ContentRouter() {
  const { navigation } = useGovernanceCommandCenterStore();

  switch (navigation.mainCategory) {
    case 'overview':
      return <OverviewView />;
    case 'projects':
      return <ProjectsView />;
    case 'resources':
      return <ResourcesView />;
    case 'financial':
      return <FinancialView />;
    case 'risks':
      return <RisksView />;
    case 'compliance':
      return <ComplianceView />;
    case 'processes':
      return <ProcessesView />;
    default:
      return <OverviewView />;
  }
}

