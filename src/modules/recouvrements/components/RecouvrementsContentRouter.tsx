/**
 * Router de contenu pour le module Recouvrements
 */

'use client';

import React from 'react';
import type { RecouvrementsMainCategory } from '../types/recouvrementsTypes';

interface RecouvrementsContentRouterProps {
  mainCategory: RecouvrementsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function RecouvrementsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: RecouvrementsContentRouterProps) {
  const getCategoryLabel = () => {
    const categoryLabels: Record<string, string> = {
      'overview': 'Vue d\'ensemble',
      'pending': 'En attente',
      'in-progress': 'En cours',
      'resolved': 'Résolus',
      'failed': 'Échoués',
      'by-client': 'Par client',
      'by-status': 'Par statut',
      'analytics': 'Analytiques',
    };
    return categoryLabels[mainCategory] || mainCategory;
  };

  const getSubCategoryLabel = () => {
    if (!subCategory) return '';
    return subCategory.charAt(0).toUpperCase() + subCategory.slice(1).replace(/-/g, ' ');
  };

  const getSubSubCategoryLabel = () => {
    if (!subSubCategory) return '';
    return subSubCategory.charAt(0).toUpperCase() + subSubCategory.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-2">
        {getCategoryLabel()}
        {subCategory && ` - ${getSubCategoryLabel()}`}
        {subSubCategory && ` - ${getSubSubCategoryLabel()}`}
      </h2>
      <p className="text-slate-400 mb-4">
        Navigation 3 niveaux activée. Le contenu sera géré par le RecouvrementsContentRouter existant.
      </p>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        <p className="text-sm text-slate-300">
          <strong>Catégorie principale:</strong> {mainCategory}
          {subCategory && (
            <>
              <br />
              <strong>Sous-catégorie:</strong> {subCategory}
            </>
          )}
          {subSubCategory && (
            <>
              <br />
              <strong>Sous-sous-catégorie:</strong> {subSubCategory}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

