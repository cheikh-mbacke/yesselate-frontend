/**
 * Router de contenu pour le module Alerts
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { AlertsMainCategory, AlertsSubCategory, AlertsSubSubCategory } from '../types/alertsNavigationTypes';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';

interface AlertsContentRouterProps {
  mainCategory: AlertsMainCategory;
  subCategory?: AlertsSubCategory;
  subSubCategory?: AlertsSubSubCategory;
}

// Pages spécifiques (à créer progressivement)
const OverviewAllAlertsPage = () => {
  return (
    <div className="h-full p-6">
      <AlertWorkspaceContent />
    </div>
  );
};

const OverviewTodayPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes - Aujourd'hui</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const OverviewWeekPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes - Cette semaine</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursCritiquesProjetsPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes critiques - Projets</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursCritiquesFinanciersPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes critiques - Financiers</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursAvertissementsRhPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Avertissements - RH</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursAvertissementsSystemePage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Avertissements - Système</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursSlaDepassesPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">SLA Dépassés</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const EnCoursBlocagesPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes bloquées</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const TraitementsAcquitteesPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes acquittées</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const TraitementsResoluesPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes résolues</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const GovernanceReglesPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Règles d'alertes</h2>
      </div>
      <div className="text-slate-400">Configuration des règles d'alertes à venir...</div>
    </div>
  );
};

const GovernanceHistoriquePage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Historique complet</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

const GovernanceSuivisPage = () => {
  return (
    <div className="h-full p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Alertes suivies</h2>
      </div>
      <AlertWorkspaceContent />
    </div>
  );
};

export function AlertsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: AlertsContentRouterProps) {
  // Logique de rendu basée sur les catégories de navigation
  switch (mainCategory) {
    case 'overview':
      switch (subCategory) {
        case 'indicateurs':
          if (subSubCategory === 'summary') return <OverviewAllAlertsPage />;
          if (subSubCategory === 'recent') return <OverviewTodayPage />;
          return <OverviewAllAlertsPage />;
        case 'typologie':
          if (subSubCategory === 'all') return <OverviewAllAlertsPage />;
          if (subSubCategory === 'critical') return <EnCoursCritiquesProjetsPage />;
          return <OverviewAllAlertsPage />;
        case 'bureau':
          if (subSubCategory === 'all') return <OverviewAllAlertsPage />;
          if (subSubCategory === 'recent') return <OverviewTodayPage />;
          return <OverviewAllAlertsPage />;
        default:
          return <OverviewAllAlertsPage />; // Default for overview
      }
    case 'critiques':
      switch (subCategory) {
        case 'validations':
          return <EnCoursBlocagesPage />;
        case 'paiements':
          return <EnCoursBlocagesPage />;
        case 'justificatifs':
          return <EnCoursAvertissementsRhPage />;
        case 'financiers':
          return <EnCoursCritiquesFinanciersPage />;
        default:
          return <EnCoursCritiquesProjetsPage />; // Default for critiques
      }
    case 'sla':
      switch (subCategory) {
        case 'depasse':
          return <EnCoursSlaDepassesPage />;
        case 'attente':
          return <EnCoursAvertissementsRhPage />;
        case 'risque':
          return <EnCoursAvertissementsSystemePage />;
        default:
          return <EnCoursSlaDepassesPage />; // Default for sla
      }
    case 'rh':
      switch (subCategory) {
        case 'absences':
          return <EnCoursAvertissementsRhPage />;
        case 'surallocation':
          return <EnCoursAvertissementsRhPage />;
        case 'retards':
          return <EnCoursAvertissementsRhPage />;
        default:
          return <EnCoursAvertissementsRhPage />; // Default for rh
      }
    case 'projets':
      switch (subCategory) {
        case 'retards-detected':
          return <EnCoursCritiquesProjetsPage />;
        case 'jalons':
          return <EnCoursBlocagesPage />;
        case 'blocages':
          return <EnCoursBlocagesPage />;
        default:
          return <EnCoursCritiquesProjetsPage />; // Default for projets
      }
    default:
      return <OverviewAllAlertsPage />; // Fallback
  }
}
