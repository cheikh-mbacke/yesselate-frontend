/**
 * Tests unitaires pour useTrendAnalysis hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrendAnalysis } from '../useTrendAnalysis';
import type { PeriodData } from '@/domain/analytics/entities/Period';

describe('useTrendAnalysis', () => {
  it('should return null for empty data', () => {
    const { result } = renderHook(() =>
      useTrendAnalysis([], 'critical')
    );

    expect(result.current).toBeNull();
  });

  it('should return null for single period', () => {
    const data: PeriodData[] = [
      { period: '2024-01', label: 'Jan 24', value: 10 },
    ];

    const { result } = renderHook(() =>
      useTrendAnalysis(data, 'critical')
    );

    expect(result.current).toBeNull();
  });

  it('should analyze trends correctly', () => {
    const data: PeriodData[] = [
      { period: '2024-01', label: 'Jan 24', value: 2 },
      { period: '2024-02', label: 'Feb 24', value: 4 },
      { period: '2024-03', label: 'Mar 24', value: 6 },
    ];

    const { result } = renderHook(() =>
      useTrendAnalysis(data, 'critical')
    );

    expect(result.current).not.toBeNull();
    expect(result.current?.isDegrading).toBe(true);
    expect(result.current?.globalTrend).toBeGreaterThan(0);
  });

  it('should use correct thresholds for critical subcategory', () => {
    const data: PeriodData[] = [
      { period: '2024-01', label: 'Jan 24', value: 2 },
      { period: '2024-02', label: 'Feb 24', value: 5 }, // +150% - devrait être problématique
    ];

    const { result } = renderHook(() =>
      useTrendAnalysis(data, 'critical')
    );

    expect(result.current?.problematicPeriods.length).toBeGreaterThan(0);
  });
});

