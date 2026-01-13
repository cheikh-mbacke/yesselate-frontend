/**
 * Trend Analysis Entity
 * Résultat de l'analyse de tendances sur des périodes
 */

import type { PeriodData } from './Period';

export interface TrendAnalysis {
  globalTrend: number;
  globalTrendPercent: string;
  isImproving: boolean;
  isDegrading: boolean;
  problematicPeriods: PeriodData[];
  worstPeriod: PeriodData | null;
  needsAction: boolean;
}

export interface TrendAnalysisConfig {
  subCategory: string;
  thresholds: {
    degradation: number;
    improvement: number;
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionType: 'alert' | 'task' | 'meeting' | 'report' | 'review';
  icon?: string;
}

