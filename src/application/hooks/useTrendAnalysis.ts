/**
 * useTrendAnalysis Hook
 * Hook réutilisable pour l'analyse de tendances
 */

import { useMemo } from 'react';
import { TrendAnalysisService } from '@/domain/analytics/services/TrendAnalysisService';
import type { PeriodData } from '@/domain/analytics/entities/Period';
import type { TrendAnalysisConfig } from '@/domain/analytics/entities/TrendAnalysis';

/**
 * Seuils par défaut selon la sous-catégorie
 */
function getThresholdsForSubCategory(subCategory: string): TrendAnalysisConfig['thresholds'] {
  const baseThresholds = {
    degradation: 15,
    improvement: 10,
  };

  if (subCategory === 'critical') {
    return {
      degradation: 10, // Plus sensible pour les critiques
      improvement: 5,
    };
  }

  if (subCategory === 'resolved') {
    return {
      degradation: 20, // Moins sensible pour les résolues
      improvement: 15,
    };
  }

  return baseThresholds;
}

/**
 * Hook pour analyser les tendances sur des périodes
 * 
 * @param periodData - Données de périodes à analyser
 * @param subCategory - Sous-catégorie pour le contexte
 * @returns Analyse des tendances
 */
export function useTrendAnalysis(
  periodData: PeriodData[],
  subCategory: string
) {
  return useMemo(() => {
    if (!periodData || periodData.length === 0) {
      return null;
    }

    const config: TrendAnalysisConfig = {
      subCategory,
      thresholds: getThresholdsForSubCategory(subCategory),
    };

    return TrendAnalysisService.analyzePeriods(periodData, config);
  }, [periodData, subCategory]);
}

