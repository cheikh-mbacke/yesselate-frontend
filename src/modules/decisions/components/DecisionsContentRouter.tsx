/**
 * Router de contenu pour le module Decisions
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { DecisionsMainCategory } from '../types/decisionsNavigationTypes';
import { DecisionsWorkspaceContent } from '@/components/features/bmo/workspace/decisions/DecisionsWorkspaceContent';

interface DecisionsContentRouterProps {
  mainCategory: DecisionsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function DecisionsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: DecisionsContentRouterProps) {
  // Pour l'instant, on utilise le contenu existant
  // TODO: Créer des pages spécifiques pour chaque niveau
  return <DecisionsWorkspaceContent />;
}

