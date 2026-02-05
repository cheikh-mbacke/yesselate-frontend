/**
 * Hook pour gérer les comparaisons analytics
 */

import { useState, useCallback, useMemo } from 'react';

export interface ComparisonItem {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

interface UseComparisonOptions {
  initialItems?: ComparisonItem[];
  criteria?: string[];
  onItemsChange?: (items: ComparisonItem[]) => void;
}

export function useComparison(options: UseComparisonOptions = {}) {
  const [items, setItems] = useState<ComparisonItem[]>(options.initialItems || []);
  const [criteria, setCriteria] = useState<string[]>(options.criteria || []);

  const addItem = useCallback((item: ComparisonItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<ComparisonItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  }, []);

  const addCriterion = useCallback((criterion: string) => {
    setCriteria((prev) => (prev.includes(criterion) ? prev : [...prev, criterion]));
  }, []);

  const removeCriterion = useCallback((criterion: string) => {
    setCriteria((prev) => prev.filter((c) => c !== criterion));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  // Données pour visualisations
  const matrixData = useMemo(() => {
    return items.map((item) => ({
      name: item.label,
      ...criteria.reduce((acc, crit) => {
        acc[crit] = item.data[crit] || 0;
        return acc;
      }, {} as Record<string, number>),
    }));
  }, [items, criteria]);

  const radarData = useMemo(() => {
    return items.map((item) => ({
      name: item.label,
      ...criteria.reduce((acc, crit) => {
        acc[crit] = item.data[crit] || 0;
        return acc;
      }, {} as Record<string, number>),
    }));
  }, [items, criteria]);

  // Statistiques comparatives
  const statistics = useMemo(() => {
    if (items.length === 0 || criteria.length === 0) {
      return {};
    }

    const stats: Record<string, { min: number; max: number; avg: number; stdDev: number }> = {};

    criteria.forEach((crit) => {
      const values = items.map((item) => item.data[crit] || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      stats[crit] = { min, max, avg, stdDev };
    });

    return stats;
  }, [items, criteria]);

  // Notifier les changements
  useState(() => {
    if (options.onItemsChange) {
      options.onItemsChange(items);
    }
  });

  return {
    items,
    criteria,
    addItem,
    removeItem,
    updateItem,
    addCriterion,
    removeCriterion,
    clearItems,
    matrixData,
    radarData,
    statistics,
    itemsCount: items.length,
    criteriaCount: criteria.length,
  };
}

