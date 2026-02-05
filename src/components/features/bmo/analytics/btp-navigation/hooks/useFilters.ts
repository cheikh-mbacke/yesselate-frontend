/**
 * Hook pour gérer les filtres analytics
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface FilterValue {
  id: string;
  type: 'temporal' | 'geographical' | 'hierarchical' | 'status' | 'custom';
  value: any;
  label?: string;
}

interface UseFiltersOptions {
  initialFilters?: FilterValue[];
  onFiltersChange?: (filters: FilterValue[]) => void;
}

export function useFilters(options: UseFiltersOptions = {}) {
  const [filters, setFilters] = useState<FilterValue[]>(options.initialFilters || []);

  const addFilter = useCallback((filter: FilterValue) => {
    setFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== filter.id);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  const updateFilter = useCallback((filterId: string, updates: Partial<FilterValue>) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === filterId ? { ...f, ...updates } : f))
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const hasFilter = useCallback((filterId: string) => {
    return filters.some((f) => f.id === filterId);
  }, [filters]);

  const getFilter = useCallback((filterId: string) => {
    return filters.find((f) => f.id === filterId);
  }, [filters]);

  const activeFiltersCount = useMemo(() => filters.length, [filters]);

  // Notifier les changements
  useEffect(() => {
    if (options.onFiltersChange) {
      options.onFiltersChange(filters);
    }
  }, [filters, options.onFiltersChange]);

  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilter,
    getFilter,
    activeFiltersCount,
  };
}

