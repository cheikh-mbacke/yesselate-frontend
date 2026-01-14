/**
 * Routeur de contenu principal
 * Affiche la vue appropriée selon la navigation hiérarchique (3 niveaux)
 * Structure: Domain (Niveau 1) > Section (Niveau 2) > View (Niveau 3)
 */

'use client';

import React, { Suspense } from 'react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Vue stratégique - Sections
import {
  ExecutiveDashboardView,
  DirectorKPIsView,
  MonthlySummaryView,
} from './views/strategic-view';

// Décisions & Arbitrages - Sections
import {
  PendingDecisionsView,
  DecisionHistoryView,
  BlockingPointsView,
} from './views/decisions-arbitrages';

// Escalades & Risques - Sections
import {
  ActiveEscalationsView,
  MajorRisksView,
  CriticalBlockagesView,
} from './views/escalations-risks';

// Instances & Coordination - Sections
import {
  ScheduledInstancesView,
  MinutesFollowupView,
  SensitiveProjectsView,
} from './views/instances-coordination';

// Conformité & Performance - Sections
import {
  ContractSLAView,
  CommitmentsView,
  ResourceUtilizationView,
} from './views/compliance-performance';

export function ContentRouter() {
  const { navigation } = useGovernanceCommandCenterStore();
  const { mainCategory, subCategory } = navigation;

  // Router selon la hiérarchie: Domain > Section
  const renderView = () => {
    // Si pas de sous-catégorie, afficher la première par défaut
    if (!subCategory) {
      // Fallback vers la vue par défaut du domaine
      if (mainCategory === 'strategic-view') return <ExecutiveDashboardView />;
      if (mainCategory === 'decisions-arbitrages') return <PendingDecisionsView />;
      if (mainCategory === 'escalations-risks') return <ActiveEscalationsView />;
      if (mainCategory === 'instances-coordination') return <ScheduledInstancesView />;
      if (mainCategory === 'compliance-performance') return <ContractSLAView />;
      return <ExecutiveDashboardView />;
    }
    // Vue stratégique
    if (mainCategory === 'strategic-view') {
      switch (subCategory) {
        case 'executive-dashboard':
          return <ExecutiveDashboardView />;
        case 'director-kpis':
          return <DirectorKPIsView />;
        case 'monthly-summary':
          return <MonthlySummaryView />;
        default:
          return <ExecutiveDashboardView />;
      }
    }

    // Décisions & Arbitrages
    if (mainCategory === 'decisions-arbitrages') {
      switch (subCategory) {
        case 'pending-decisions':
          return <PendingDecisionsView />;
        case 'decision-history':
          return <DecisionHistoryView />;
        case 'blocking-points':
          return <BlockingPointsView />;
        default:
          return <PendingDecisionsView />;
      }
    }

    // Escalades & Risques
    if (mainCategory === 'escalations-risks') {
      switch (subCategory) {
        case 'active-escalations':
          return <ActiveEscalationsView />;
        case 'major-risks':
          return <MajorRisksView />;
        case 'critical-blockages':
          return <CriticalBlockagesView />;
        default:
          return <ActiveEscalationsView />;
      }
    }

    // Instances & Coordination
    if (mainCategory === 'instances-coordination') {
      switch (subCategory) {
        case 'scheduled-instances':
          return <ScheduledInstancesView />;
        case 'minutes-followup':
          return <MinutesFollowupView />;
        case 'sensitive-projects':
          return <SensitiveProjectsView />;
        default:
          return <ScheduledInstancesView />;
      }
    }

    // Conformité & Performance
    if (mainCategory === 'compliance-performance') {
      switch (subCategory) {
        case 'contract-sla':
          return <ContractSLAView />;
        case 'commitments':
          return <CommitmentsView />;
        case 'resource-utilization':
          return <ResourceUtilizationView />;
        default:
          return <ContractSLAView />;
      }
    }

    // Fallback
    return <ExecutiveDashboardView />;
  };

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {renderView()}
    </Suspense>
  );
}

