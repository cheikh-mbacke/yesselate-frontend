/**
 * useRecommendations Hook
 * Génère des recommandations basées sur l'analyse de tendances
 */

import { useMemo } from 'react';
import { TrendAnalysisService } from '@/domain/analytics/services/TrendAnalysisService';
import type { TrendAnalysis, Recommendation } from '@/domain/analytics/entities/TrendAnalysis';

/**
 * Hook pour générer des recommandations basées sur l'analyse
 * 
 * @param analysis - Analyse de tendances
 * @param context - Contexte (catégorie, sous-catégorie, valeur actuelle)
 * @returns Liste de recommandations
 */
export function useRecommendations(
  analysis: TrendAnalysis | null,
  context: {
    category?: string;
    subCategory: string;
    currentPeriodValue: number;
  }
): Recommendation[] {
  return useMemo(() => {
    if (!analysis) {
      return [];
    }

    return TrendAnalysisService.generateRecommendations(analysis, context);
  }, [analysis, context.category, context.subCategory, context.currentPeriodValue]);
}

