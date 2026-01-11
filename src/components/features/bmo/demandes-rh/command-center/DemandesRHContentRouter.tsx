/**
 * ContentRouter pour Demandes RH
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const DemandesRHContentRouter = React.memo(function DemandesRHContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Vue par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewContent />;
  }

  // Autres vues (placeholder)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-500">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Content
// ================================
const OverviewContent = React.memo(function OverviewContent() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Vue d'ensemble des Demandes RH</h2>
        <p className="text-slate-400">
          Sélectionnez une catégorie dans la sidebar pour voir les détails.
        </p>
      </div>
    </div>
  );
});

