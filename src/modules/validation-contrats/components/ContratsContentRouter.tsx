/**
 * Router de contenu pour le module Validation-Contrats
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { ContratsMainCategory } from '../types/contratsTypes';
import {
  IndicateursPage,
  StatsPage,
  TrendsPage,
} from '../pages/overview';
import {
  EnAttentePage,
  UrgentsPage,
  ValidesPage,
  RejetesPage,
  NegociationPage,
} from '../pages/statut';
import {
  CritiquesPage,
  MoyensPage,
  FaiblePrioritePage,
} from '../pages/priorite';
import {
  AnalyticsPage,
  VueFinancierePage,
  DocumentsPage,
  ReglesMetierPage,
} from '../pages/analyse';

interface ContratsContentRouterProps {
  mainCategory: ContratsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function ContratsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: ContratsContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'indicateurs' || !subCategory) {
      return <IndicateursPage />;
    }
    if (subCategory === 'stats') {
      return <StatsPage />;
    }
    if (subCategory === 'trends') {
      return <TrendsPage />;
    }
  }

  // Par statut
  if (mainCategory === 'statut') {
    // Si on a un subSubCategory, filtrer par service ou période
    if (subSubCategory) {
      // Extraire le service ou la période depuis l'ID
      const service = subSubCategory.includes('achats')
        ? 'Achats'
        : subSubCategory.includes('finance')
        ? 'Finance'
        : subSubCategory.includes('juridique')
        ? 'Juridique'
        : subSubCategory.includes('travaux')
        ? 'Travaux'
        : undefined;

      const periode = subSubCategory.includes('aujourdhui')
        ? 'today'
        : subSubCategory.includes('semaine')
        ? 'week'
        : subSubCategory.includes('mois')
        ? 'month'
        : undefined;

      if (subCategory === 'en-attente') {
        return <EnAttentePage filterService={service} />;
      }
      if (subCategory === 'urgents') {
        return <UrgentsPage filterService={service} />;
      }
      if (subCategory === 'valides') {
        return <ValidesPage filterService={service} filterPeriode={periode} />;
      }
      if (subCategory === 'rejetes') {
        return <RejetesPage filterRecent={subSubCategory.includes('recents')} />;
      }
      if (subCategory === 'negociation') {
        return <NegociationPage filterActifs={subSubCategory.includes('actifs')} />;
      }
    }

    // Sinon, afficher la page normale (niveau 2)
    if (subCategory === 'en-attente') {
      return <EnAttentePage />;
    }
    if (subCategory === 'urgents') {
      return <UrgentsPage />;
    }
    if (subCategory === 'valides') {
      return <ValidesPage />;
    }
    if (subCategory === 'rejetes') {
      return <RejetesPage />;
    }
    if (subCategory === 'negociation') {
      return <NegociationPage />;
    }
  }

  // Contrats à valider (par priorité)
  if (mainCategory === 'priorite') {
    // Si on a un subSubCategory, filtrer par service
    if (subSubCategory) {
      const service = subSubCategory.includes('achats')
        ? 'Achats'
        : subSubCategory.includes('finance')
        ? 'Finance'
        : subSubCategory.includes('juridique')
        ? 'Juridique'
        : undefined;

      if (subCategory === 'critiques') {
        return <CritiquesPage filterService={service} />;
      }
      if (subCategory === 'moyens') {
        return <MoyensPage filterService={service} />;
      }
    }

    // Sinon, afficher la page normale
    if (subCategory === 'critiques') {
      return <CritiquesPage />;
    }
    if (subCategory === 'moyens') {
      return <MoyensPage />;
    }
    if (subCategory === 'faible-priorite') {
      return <FaiblePrioritePage />;
    }
  }

  // Analyse & gouvernance
  if (mainCategory === 'analyse') {
    if (subCategory === 'analytics' || !subCategory) {
      return <AnalyticsPage />;
    }
    if (subCategory === 'vue-financiere') {
      return <VueFinancierePage />;
    }
    if (subCategory === 'documents') {
      return <DocumentsPage />;
    }
    if (subCategory === 'regles-metier') {
      return <ReglesMetierPage />;
    }
  }

  // Par défaut, afficher la vue d'ensemble
  return <IndicateursPage />;
}

