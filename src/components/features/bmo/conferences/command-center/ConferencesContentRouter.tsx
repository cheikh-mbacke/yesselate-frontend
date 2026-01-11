/**
 * ContentRouter pour Conférences
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { Video } from 'lucide-react';

interface ContentRouterProps {
  category: string;
  subCategory: string | null;
}

export const ConferencesContentRouter = React.memo(function ConferencesContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Vue d'ensemble par défaut
  if (category === 'overview') {
    return <OverviewView />;
  }

  // Vues par catégorie
  if (category === 'planned') {
    return <PlannedView subCategory={subCategory} />;
  }

  if (category === 'ongoing') {
    return <OngoingView subCategory={subCategory} />;
  }

  if (category === 'completed') {
    return <CompletedView subCategory={subCategory} />;
  }

  if (category === 'crisis') {
    return <CrisisView subCategory={subCategory} />;
  }

  if (category === 'arbitrage') {
    return <ArbitrageView subCategory={subCategory} />;
  }

  if (category === 'revue_projet') {
    return <RevueProjetView subCategory={subCategory} />;
  }

  if (category === 'comite_direction') {
    return <ComiteDirectionView subCategory={subCategory} />;
  }

  if (category === 'resolution_blocage') {
    return <ResolutionBlocageView subCategory={subCategory} />;
  }

  // Vue par défaut (placeholder)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category}
          {subCategory && ` - ${subCategory}`}
        </h3>
        <p className="text-slate-500">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Views
// ================================

function OverviewView() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Vue d'ensemble</h2>
        <p className="text-slate-400">Contenu de la vue d'ensemble des conférences</p>
      </div>
    </div>
  );
}

function PlannedView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Conférences Planifiées</h2>
      <p className="text-slate-400">Contenu des conférences planifiées</p>
    </div>
  );
}

function OngoingView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Conférences En Cours</h2>
      <p className="text-slate-400">Contenu des conférences en cours</p>
    </div>
  );
}

function CompletedView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Conférences Terminées</h2>
      <p className="text-slate-400">Contenu des conférences terminées</p>
    </div>
  );
}

function CrisisView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Conférences de Crise</h2>
      <p className="text-slate-400">Contenu des conférences de crise</p>
    </div>
  );
}

function ArbitrageView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Conférences d'Arbitrage</h2>
      <p className="text-slate-400">Contenu des conférences d'arbitrage</p>
    </div>
  );
}

function RevueProjetView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Revues de Projet</h2>
      <p className="text-slate-400">Contenu des revues de projet</p>
    </div>
  );
}

function ComiteDirectionView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Comités de Direction</h2>
      <p className="text-slate-400">Contenu des comités de direction</p>
    </div>
  );
}

function ResolutionBlocageView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Résolutions de Blocage</h2>
      <p className="text-slate-400">Contenu des résolutions de blocage</p>
    </div>
  );
}
