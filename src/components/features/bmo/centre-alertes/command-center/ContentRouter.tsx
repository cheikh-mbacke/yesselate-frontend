/**
 * Router de contenu pour le Centre d'Alertes
 * Affiche le contenu approprié selon l'onglet actif
 */

'use client';

import React from 'react';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { OverviewView } from './views/OverviewView';
import { CriticalView } from './views/CriticalView';
import { OperationalView } from './views/OperationalView';
import { SLADelaysView } from './views/SLADelaysView';
import { FinancialView } from './views/FinancialView';
import { RHResourcesView } from './views/RHResourcesView';
import { ProjectsSitesView } from './views/ProjectsSitesView';
import { SystemSecurityView } from './views/SystemSecurityView';
import { HistoryView } from './views/HistoryView';

export function ContentRouter() {
  const { mainCategory } = useCentreAlertesCommandCenterStore();

  switch (mainCategory) {
    case 'overview':
      return <OverviewView />;
    case 'critical':
      return <CriticalView />;
    case 'operational':
      return <OperationalView />;
    case 'sla-delays':
      return <SLADelaysView />;
    case 'financial':
      return <FinancialView />;
    case 'rh-resources':
      return <RHResourcesView />;
    case 'projects-sites':
      return <ProjectsSitesView />;
    case 'system-security':
      return <SystemSecurityView />;
    case 'history':
      return <HistoryView />;
    default:
      return <OverviewView />;
  }
}

