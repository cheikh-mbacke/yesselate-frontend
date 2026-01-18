/**
 * Router de contenu pour le module Delegations
 */

'use client';

import React from 'react';
import type { DelegationsMainCategory } from '../types/delegationsTypes';

interface DelegationsContentRouterProps {
  mainCategory: DelegationsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function DelegationsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: DelegationsContentRouterProps) {
  const getCategoryLabel = () => {
    const categoryLabels: Record<string, string> = {
      'overview': 'Vue d\'ensemble',
      'active': 'Actives',
      'pending': 'En attente',
      'expired': 'Expirées',
      'by-employee': 'Par employé',
      'by-type': 'Par type',
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
        Navigation 3 niveaux activée. Le contenu sera géré par le DelegationsContentRouter existant.
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

