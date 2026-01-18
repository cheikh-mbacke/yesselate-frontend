/**
 * Router de contenu pour le module Echanges Structures
 */

'use client';

import React from 'react';
import type { EchangesStructuresMainCategory } from '../types/echangesStructuresNavigationTypes';

interface EchangesStructuresContentRouterProps {
  mainCategory: EchangesStructuresMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function EchangesStructuresContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: EchangesStructuresContentRouterProps) {
  // TODO: Créer des pages spécifiques pour chaque niveau
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-2">
        Échanges Structurés - {mainCategory}
        {subCategory && ` - ${subCategory}`}
        {subSubCategory && ` - ${subSubCategory}`}
      </h2>
      <p className="text-slate-400">Contenu à venir</p>
    </div>
  );
}

