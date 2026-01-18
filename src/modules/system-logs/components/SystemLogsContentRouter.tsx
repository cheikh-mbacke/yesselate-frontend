/**
 * Router de contenu pour le module System Logs
 */

'use client';

import React from 'react';
import type { SystemLogsMainCategory } from '../types/systemLogsNavigationTypes';

interface SystemLogsContentRouterProps {
  mainCategory: SystemLogsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function SystemLogsContentRouter({ mainCategory, subCategory, subSubCategory }: SystemLogsContentRouterProps) {
  // TODO: Créer des pages spécifiques pour chaque niveau
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-2">
        System Logs - {mainCategory}
        {subCategory && ` - ${subCategory}`}
        {subSubCategory && ` - ${subSubCategory}`}
      </h2>
      <p className="text-slate-400">Contenu à venir</p>
    </div>
  );
}

