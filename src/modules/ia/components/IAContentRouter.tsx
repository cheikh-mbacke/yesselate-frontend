/**
 * Router de contenu pour le module IA
 */

'use client';

import React from 'react';
import type { IAMainCategory } from '../types/iaNavigationTypes';
import { IAContentRouter as OldIAContentRouter } from '@/components/features/bmo/ia/command-center/IAContentRouter';

interface IAContentRouterProps {
  mainCategory: IAMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function IAContentRouter({ mainCategory, subCategory, subSubCategory }: IAContentRouterProps) {
  // Utiliser l'ancien router pour l'instant, mais avec les nouvelles props
  // TODO: Adapter l'ancien router pour accepter les nouvelles props ou créer des pages spécifiques
  return <OldIAContentRouter category={mainCategory} subCategory={subCategory} />;
}

