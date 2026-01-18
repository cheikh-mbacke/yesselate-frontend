/**
 * Router de contenu pour le module Demandes
 * Route vers les bonnes pages selon la navigation
 */

'use client';

import React from 'react';
import { DashboardPage } from '../pages/overview/DashboardPage';
import { StatsPage } from '../pages/overview/StatsPage';
import { TrendsPage } from '../pages/overview/TrendsPage';
import { EnAttentePage } from '../pages/statut/EnAttentePage';
import { UrgentesPage } from '../pages/statut/UrgentesPage';
import { ValideesPage } from '../pages/statut/ValideesPage';
import { RejeteesPage } from '../pages/statut/RejeteesPage';
import { EnRetardPage } from '../pages/statut/EnRetardPage';
import { AchatsPage } from '../pages/actions/AchatsPage';
import { FinancePage } from '../pages/actions/FinancePage';
import { JuridiquePage } from '../pages/actions/JuridiquePage';
import { AchatsServicePage } from '../pages/services/AchatsServicePage';
import { FinanceServicePage } from '../pages/services/FinanceServicePage';
import { JuridiqueServicePage } from '../pages/services/JuridiqueServicePage';
import { AutresServicesPage } from '../pages/services/AutresServicesPage';
import type { DemandeMainCategory } from '../types/demandesTypes';

interface DemandesContentRouterProps {
  mainCategory: DemandeMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function DemandesContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: DemandesContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'dashboard' || !subCategory) {
      return <DashboardPage />;
    }
    if (subCategory === 'statistiques') {
      return <StatsPage />;
    }
    if (subCategory === 'tendances') {
      return <TrendsPage />;
    }
  }

  // Par statut
  if (mainCategory === 'statut') {
    // Si on a un subSubCategory, filtrer par service
    if (subSubCategory) {
      const service = subSubCategory.split('-').slice(-1)[0]; // extraire 'achats', 'finance', etc.
      if (subCategory === 'en-attente') {
        return <EnAttentePage filterService={service} />;
      }
      if (subCategory === 'urgentes') {
        return <UrgentesPage filterService={service} />;
      }
      if (subCategory === 'en-retard') {
        return <EnRetardPage filterService={service} />;
      }
    }

    // Sinon, afficher la page normale
    if (subCategory === 'en-attente') {
      return <EnAttentePage />;
    }
    if (subCategory === 'urgentes') {
      return <UrgentesPage />;
    }
    if (subCategory === 'validees') {
      return <ValideesPage />;
    }
    if (subCategory === 'rejetees') {
      return <RejeteesPage />;
    }
    if (subCategory === 'en-retard') {
      return <EnRetardPage />;
    }
  }

  // Actions prioritaires
  if (mainCategory === 'actions') {
    if (subCategory === 'achats') {
      return <AchatsPage />;
    }
    if (subCategory === 'finance') {
      return <FinancePage />;
    }
    if (subCategory === 'juridique') {
      return <JuridiquePage />;
    }
  }

  // Par service
  if (mainCategory === 'services') {
    if (subCategory === 'service-achats') {
      return <AchatsServicePage />;
    }
    if (subCategory === 'service-finance') {
      return <FinanceServicePage />;
    }
    if (subCategory === 'service-juridique') {
      return <JuridiqueServicePage />;
    }
    if (subCategory === 'autres-services') {
      return <AutresServicesPage />;
    }
  }

  return (
    <div className="p-6">
      <p className="text-slate-400">Page non trouvée</p>
    </div>
  );
}

