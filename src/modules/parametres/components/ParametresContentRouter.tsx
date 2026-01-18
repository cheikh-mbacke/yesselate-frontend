/**
 * Router de contenu pour le module Paramètres
 */

'use client';

import React from 'react';
import type { ParametresMainCategory } from '../types/parametresNavigationTypes';

interface ParametresContentRouterProps {
  mainCategory: ParametresMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function ParametresContentRouter({ mainCategory, subCategory, subSubCategory }: ParametresContentRouterProps) {
  // TODO: Créer des pages spécifiques pour chaque niveau
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-2">
        Paramètres - {mainCategory}
        {subCategory && ` - ${subCategory}`}
        {subSubCategory && ` - ${subSubCategory}`}
      </h2>
      <p className="text-slate-400">Contenu à venir</p>
    </div>
  );
}

