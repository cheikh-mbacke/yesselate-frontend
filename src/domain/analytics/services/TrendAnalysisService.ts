/**
 * TrendAnalysisService
 * Service métier pour l'analyse de tendances sur des périodes
 * Logique pure, testable, réutilisable
 */

import type { PeriodData, PeriodType } from '../entities/Period';
import type { TrendAnalysis, TrendAnalysisConfig, Recommendation } from '../entities/TrendAnalysis';

export class TrendAnalysisService {
  /**
   * Analyse les tendances sur une série de périodes
   * 
   * @param periodData - Données de périodes à analyser
   * @param config - Configuration de l'analyse
   * @returns Analyse complète avec tendances et recommandations
   */
  static analyzePeriods(
    periodData: PeriodData[],
    config: TrendAnalysisConfig
  ): TrendAnalysis {
    if (periodData.length < 2) {
      return this.createEmptyAnalysis();
    }

    const trend = this.calculateGlobalTrend(periodData);
    const problematicPeriods = this.identifyProblematicPeriods(
      periodData,
      config.thresholds,
      config.subCategory
    );
    const worstPeriod = this.findWorstPeriod(
      periodData,
      config.subCategory
    );

    return {
      globalTrend: trend.value,
      globalTrendPercent: trend.percent,
      isImproving: this.isImproving(trend, config.subCategory),
      isDegrading: this.isDegrading(trend, config.subCategory),
      problematicPeriods,
      worstPeriod,
      needsAction: this.shouldTriggerAction(problematicPeriods, trend, config.thresholds),
    };
  }

  /**
   * Génère des recommandations basées sur l'analyse
   */
  static generateRecommendations(
    analysis: TrendAnalysis,
    context: {
      category?: string;
      subCategory: string;
      currentPeriodValue: number;
    }
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.needsAction) {
      if (analysis.isDegrading) {
        recommendations.push({
          id: 'rec-degrading',
          title: 'Tendance à la dégradation détectée',
          description: `Évolution de ${analysis.globalTrendPercent}% observée. Intervention recommandée pour inverser la tendance.`,
          priority: context.subCategory === 'critical' ? 'high' : 'medium',
          actionType: 'meeting',
        });

        if (analysis.worstPeriod) {
          recommendations.push({
            id: 'rec-worst-period',
            title: `Analyser la période ${analysis.worstPeriod.label}`,
            description: `Cette période présente les indicateurs les plus préoccupants. Analyse approfondie recommandée.`,
            priority: 'high',
            actionType: 'review',
          });
        }
      }

      if (analysis.problematicPeriods.length > 0) {
        recommendations.push({
          id: 'rec-problematic',
          title: `${analysis.problematicPeriods.length} période(s) problématique(s) identifiée(s)`,
          description: 'Créer un plan d\'action pour corriger les écarts observés sur ces périodes.',
          priority: 'medium',
          actionType: 'task',
        });
      }
    }

    if (analysis.isImproving) {
      recommendations.push({
        id: 'rec-improving',
        title: 'Tendance positive observée',
        description: `Amélioration de ${Math.abs(parseFloat(analysis.globalTrendPercent))}% détectée. Capitaliser sur les bonnes pratiques.`,
        priority: 'low',
        actionType: 'report',
      });
    }

    // Recommandations spécifiques selon le filtre
    if (context.subCategory === 'critical' && context.currentPeriodValue > 0) {
      recommendations.push({
        id: 'rec-critical-action',
        title: 'Action immédiate requise',
        description: `${context.currentPeriodValue} alerte(s) critique(s) en cours. Mettre en place un plan d'intervention d'urgence.`,
        priority: 'high',
        actionType: 'meeting',
      });
    }

    if (context.subCategory === 'warning' && context.currentPeriodValue > 5) {
      recommendations.push({
        id: 'rec-warning-monitoring',
        title: 'Renforcer le suivi',
        description: `${context.currentPeriodValue} avertissement(s) actif(s). Surveiller l'évolution pour éviter l'escalade.`,
        priority: 'medium',
        actionType: 'alert',
      });
    }

    return recommendations;
  }

  /**
   * Calcule la tendance globale entre deux moitiés de la série
   */
  private static calculateGlobalTrend(
    periodData: PeriodData[]
  ): { value: number; percent: string } {
    const midpoint = Math.floor(periodData.length / 2);
    const firstHalf = periodData.slice(0, midpoint);
    const secondHalf = periodData.slice(midpoint);

    const firstHalfAvg = this.calculateAverage(firstHalf);
    const secondHalfAvg = this.calculateAverage(secondHalf);

    const trend = secondHalfAvg - firstHalfAvg;
    const percent = firstHalfAvg > 0
      ? ((trend / firstHalfAvg) * 100).toFixed(1)
      : '0';

    return { value: trend, percent };
  }

  /**
   * Calcule la moyenne des valeurs
   */
  private static calculateAverage(periods: PeriodData[]): number {
    if (periods.length === 0) return 0;
    return periods.reduce((sum, p) => sum + p.value, 0) / periods.length;
  }

  /**
   * Identifie les périodes problématiques
   */
  private static identifyProblematicPeriods(
    periodData: PeriodData[],
    thresholds: TrendAnalysisConfig['thresholds'],
    subCategory: string
  ): PeriodData[] {
    return periodData.filter((period, idx) => {
      if (idx === 0) return false;

      const prevValue = periodData[idx - 1].value;
      const periodChange = period.value - prevValue;
      const periodChangePercent = prevValue > 0
        ? (periodChange / prevValue) * 100
        : 0;

      // Pour critiques/avertissements : augmentation = problématique
      // Pour résolues : diminution = problématique
      if (subCategory === 'resolved') {
        return periodChangePercent < -thresholds.degradation;
      } else {
        return periodChangePercent > thresholds.degradation;
      }
    });
  }

  /**
   * Trouve la période la plus problématique
   */
  private static findWorstPeriod(
    periodData: PeriodData[],
    subCategory: string
  ): PeriodData | null {
    if (periodData.length === 0) return null;

    return periodData.reduce((worst, current, idx) => {
      if (idx === 0) return current;

      const worstIdx = periodData.indexOf(worst);
      const worstChange = worst.value - (periodData[worstIdx - 1]?.value || worst.value);
      const currentChange = current.value - (periodData[idx - 1]?.value || current.value);

      if (subCategory === 'resolved') {
        return currentChange < worstChange ? current : worst;
      } else {
        return currentChange > worstChange ? current : worst;
      }
    }, periodData[0]);
  }

  /**
   * Détermine si la tendance est améliorante
   */
  private static isImproving(
    trend: { value: number },
    subCategory: string
  ): boolean {
    // Pour résolues : augmentation = amélioration
    // Pour critiques/avertissements : diminution = amélioration
    return subCategory === 'resolved' ? trend.value > 0 : trend.value < 0;
  }

  /**
   * Détermine si la tendance est dégradante
   */
  private static isDegrading(
    trend: { value: number },
    subCategory: string
  ): boolean {
    // Pour résolues : diminution = dégradation
    // Pour critiques/avertissements : augmentation = dégradation
    return subCategory === 'resolved' ? trend.value < 0 : trend.value > 0;
  }

  /**
   * Détermine si une action est nécessaire
   */
  private static shouldTriggerAction(
    problematicPeriods: PeriodData[],
    trend: { percent: string },
    thresholds: TrendAnalysisConfig['thresholds']
  ): boolean {
    return problematicPeriods.length > 0 ||
           Math.abs(parseFloat(trend.percent)) > thresholds.degradation;
  }

  /**
   * Crée une analyse vide
   */
  private static createEmptyAnalysis(): TrendAnalysis {
    return {
      globalTrend: 0,
      globalTrendPercent: '0',
      isImproving: false,
      isDegrading: false,
      problematicPeriods: [],
      worstPeriod: null,
      needsAction: false,
    };
  }
}

