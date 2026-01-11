/**
 * Content Router pour Évaluations
 * Gère l'affichage du contenu selon la catégorie et sous-catégorie
 */

'use client';

import React from 'react';
import type { Evaluation } from '@/lib/types/bmo.types';
import { OverviewView } from './views/OverviewView';
import { ScheduledView } from './views/ScheduledView';
import { InProgressView } from './views/InProgressView';
import { CompletedView } from './views/CompletedView';
import { RecommendationsView } from './views/RecommendationsView';
import { ScoresView } from './views/ScoresView';
import { BureauxView } from './views/BureauxView';
import { AnalyticsView } from './views/AnalyticsView';
import { ArchiveView } from './views/ArchiveView';

interface EvaluationsContentRouterProps {
  category: string;
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

export const EvaluationsContentRouter = React.memo(function EvaluationsContentRouter({
  category,
  subCategory,
  onOpenEvaluation,
}: EvaluationsContentRouterProps) {
  switch (category) {
    case 'overview':
      return <OverviewView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'scheduled':
      return <ScheduledView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'in_progress':
      return <InProgressView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'completed':
      return <CompletedView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'recommendations':
      return <RecommendationsView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'scores':
      return <ScoresView subCategory={subCategory} />;
    case 'bureaux':
      return <BureauxView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    case 'analytics':
      return <AnalyticsView subCategory={subCategory} />;
    case 'archive':
      return <ArchiveView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
    default:
      return <OverviewView subCategory={subCategory} onOpenEvaluation={onOpenEvaluation} />;
  }
});

