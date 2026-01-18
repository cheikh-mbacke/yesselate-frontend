/**
 * Router de contenu pour le module Validation-BC
 * Affiche la bonne page selon la navigation
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  IndicateursPage,
  StatsPage,
  TrendsPage,
} from '../pages/overview';
import {
  BonsCommandePage,
  FacturesPage,
  AvenantsPage,
} from '../pages/types';
import {
  EnAttentePage,
  ValidesPage,
  RejetesPage,
  UrgentsPage,
} from '../pages/statut';
import {
  HistoriqueValidationsPage,
  HistoriqueRejetsPage,
} from '../pages/historique';
import {
  TendancesPage as AnalyseTendancesPage,
  ValidateursPage,
  ServicesPage,
  ReglesMetierPage,
} from '../pages/analyse';

interface ValidationContentRouterProps {
  mainCategory?: string;
  subCategory?: string | null;
  subSubCategory?: string | null;
}

export function ValidationContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: ValidationContentRouterProps) {
  const pathname = usePathname();

  // Déterminer la catégorie et sous-catégorie depuis le pathname si non fournies
  if (!mainCategory && pathname) {
    if (pathname.includes('/overview/indicateurs')) {
      mainCategory = 'overview';
      subCategory = 'indicateurs';
    } else if (pathname.includes('/overview/stats')) {
      mainCategory = 'overview';
      subCategory = 'stats';
    } else if (pathname.includes('/overview/tendances')) {
      mainCategory = 'overview';
      subCategory = 'tendances';
    } else if (pathname.includes('/types/bc')) {
      mainCategory = 'types';
      subCategory = 'bc';
    } else if (pathname.includes('/types/factures')) {
      mainCategory = 'types';
      subCategory = 'factures';
    } else if (pathname.includes('/types/avenants')) {
      mainCategory = 'types';
      subCategory = 'avenants';
    } else if (pathname.includes('/statut/en-attente')) {
      mainCategory = 'statut';
      subCategory = 'en-attente';
    } else if (pathname.includes('/statut/valides')) {
      mainCategory = 'statut';
      subCategory = 'valides';
    } else if (pathname.includes('/statut/rejetes')) {
      mainCategory = 'statut';
      subCategory = 'rejetes';
    } else if (pathname.includes('/statut/urgents')) {
      mainCategory = 'statut';
      subCategory = 'urgents';
    } else if (pathname.includes('/historique/validations')) {
      mainCategory = 'historique';
      subCategory = 'validations';
    } else if (pathname.includes('/historique/rejets')) {
      mainCategory = 'historique';
      subCategory = 'rejets';
    } else if (pathname.includes('/analyse/tendances')) {
      mainCategory = 'analyse';
      subCategory = 'tendances';
    } else if (pathname.includes('/analyse/validateurs')) {
      mainCategory = 'analyse';
      subCategory = 'validateurs';
    } else if (pathname.includes('/analyse/services')) {
      mainCategory = 'analyse';
      subCategory = 'services';
    } else if (pathname.includes('/analyse/regles-metier')) {
      mainCategory = 'analyse';
      subCategory = 'regles-metier';
    }
  }

  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'indicateurs') {
      return <IndicateursPage />;
    }
    if (subCategory === 'stats') {
      return <StatsPage />;
    }
    if (subCategory === 'tendances') {
      return <TrendsPage />;
    }
    // Par défaut, afficher les indicateurs
    return <IndicateursPage />;
  }

  // Par type
  if (mainCategory === 'types') {
    if (subCategory === 'bc') {
      return <BonsCommandePage />;
    }
    if (subCategory === 'factures') {
      return <FacturesPage />;
    }
    if (subCategory === 'avenants') {
      return <AvenantsPage />;
    }
  }

  // Par statut
  if (mainCategory === 'statut') {
    if (subCategory === 'en-attente') {
      return <EnAttentePage />;
    }
    if (subCategory === 'valides') {
      return <ValidesPage />;
    }
    if (subCategory === 'rejetes') {
      return <RejetesPage />;
    }
    if (subCategory === 'urgents') {
      return <UrgentsPage />;
    }
  }

  // Historique
  if (mainCategory === 'historique') {
    if (subCategory === 'validations') {
      return <HistoriqueValidationsPage />;
    }
    if (subCategory === 'rejets') {
      return <HistoriqueRejetsPage />;
    }
  }

  // Analyse
  if (mainCategory === 'analyse') {
    if (subCategory === 'tendances') {
      return <AnalyseTendancesPage />;
    }
    if (subCategory === 'validateurs') {
      return <ValidateursPage />;
    }
    if (subCategory === 'services') {
      return <ServicesPage />;
    }
    if (subCategory === 'regles-metier') {
      return <ReglesMetierPage />;
    }
  }

  // Par défaut, afficher les indicateurs
  return <IndicateursPage />;
}

