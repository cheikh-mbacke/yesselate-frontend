/**
 * Tests unitaires pour TrendAnalysisService
 * Tests de la logique métier pure
 */

import { describe, it, expect } from 'vitest';
import { TrendAnalysisService } from '../TrendAnalysisService';
import type { PeriodData } from '../../entities/Period';
import type { TrendAnalysisConfig } from '../../entities/TrendAnalysis';

describe('TrendAnalysisService', () => {
  describe('analyzePeriods', () => {
    it('should return empty analysis for less than 2 periods', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 10 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.problematicPeriods).toHaveLength(0);
      expect(result.worstPeriod).toBeNull();
      expect(result.needsAction).toBe(false);
    });

    it('should identify degrading trends for critical alerts', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 2 },
        { period: '2024-02', label: 'Feb 24', value: 4 },
        { period: '2024-03', label: 'Mar 24', value: 6 },
        { period: '2024-04', label: 'Apr 24', value: 8 },
        { period: '2024-05', label: 'May 24', value: 10 },
        { period: '2024-06', label: 'Jun 24', value: 12 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.isDegrading).toBe(true);
      expect(result.isImproving).toBe(false);
      expect(result.problematicPeriods.length).toBeGreaterThan(0);
    });

    it('should identify improving trends for resolved alerts', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 10 },
        { period: '2024-02', label: 'Feb 24', value: 8 },
        { period: '2024-03', label: 'Mar 24', value: 6 },
        { period: '2024-04', label: 'Apr 24', value: 4 },
        { period: '2024-05', label: 'May 24', value: 2 },
        { period: '2024-06', label: 'Jun 24', value: 1 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'resolved',
        thresholds: { degradation: 15, improvement: 10 },
      });

      // Pour résolues, diminution = amélioration
      expect(result.isImproving).toBe(true);
      expect(result.isDegrading).toBe(false);
    });

    it('should identify worst period correctly', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 2 },
        { period: '2024-02', label: 'Feb 24', value: 3 },
        { period: '2024-03', label: 'Mar 24', value: 8 }, // Plus grande augmentation
        { period: '2024-04', label: 'Apr 24', value: 9 },
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.worstPeriod).not.toBeNull();
      expect(result.worstPeriod?.period).toBe('2024-03');
    });

    it('should trigger action when threshold exceeded', () => {
      const data: PeriodData[] = [
        { period: '2024-01', label: 'Jan 24', value: 2 },
        { period: '2024-02', label: 'Feb 24', value: 5 },
        { period: '2024-03', label: 'Mar 24', value: 10 },
        { period: '2024-04', label: 'Apr 24', value: 20 }, // +100% augmentation
      ];

      const result = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
        thresholds: { degradation: 15, improvement: 10 },
      });

      expect(result.needsAction).toBe(true);
      expect(result.problematicPeriods.length).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for degrading trends', () => {
      const analysis = {
        globalTrend: 10,
        globalTrendPercent: '25.0',
        isImproving: false,
        isDegrading: true,
        problematicPeriods: [
          { period: '2024-03', label: 'Mar 24', value: 10 },
        ],
        worstPeriod: { period: '2024-03', label: 'Mar 24', value: 10 },
        needsAction: true,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(
        analysis,
        {
          subCategory: 'critical',
          currentPeriodValue: 10,
        }
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.priority === 'high')).toBe(true);
    });

    it('should generate recommendations for critical alerts', () => {
      const analysis = {
        globalTrend: 0,
        globalTrendPercent: '0',
        isImproving: false,
        isDegrading: false,
        problematicPeriods: [],
        worstPeriod: null,
        needsAction: false,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(
        analysis,
        {
          subCategory: 'critical',
          currentPeriodValue: 5,
        }
      );

      expect(recommendations.some(r => r.id === 'rec-critical-action')).toBe(true);
    });

    it('should generate recommendations for improving trends', () => {
      const analysis = {
        globalTrend: -5,
        globalTrendPercent: '-20.0',
        isImproving: true,
        isDegrading: false,
        problematicPeriods: [],
        worstPeriod: null,
        needsAction: false,
      };

      const recommendations = TrendAnalysisService.generateRecommendations(
        analysis,
        {
          subCategory: 'resolved',
          currentPeriodValue: 5,
        }
      );

      expect(recommendations.some(r => r.id === 'rec-improving')).toBe(true);
      expect(recommendations.some(r => r.priority === 'low')).toBe(true);
    });
  });
});

