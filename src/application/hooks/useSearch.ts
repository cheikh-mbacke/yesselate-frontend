/**
 * useSearch Hook
 * Hook optimisé pour la recherche avec debounce
 */

import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface SearchOptions<T> {
  items: T[];
  searchKeys: (keyof T)[];
  searchQuery: string;
  debounceDelay?: number;
  caseSensitive?: boolean;
}

/**
 * Hook pour rechercher dans une liste d'items
 * 
 * @param options - Options de recherche
 * @returns Items filtrés et statistiques
 */
export function useSearch<T extends Record<string, any>>({
  items,
  searchKeys,
  searchQuery,
  debounceDelay = 300,
  caseSensitive = false,
}: SearchOptions<T>) {
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    const query = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();

    return items.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (value == null) return false;
        
        const stringValue = String(value);
        const searchValue = caseSensitive ? stringValue : stringValue.toLowerCase();
        
        return searchValue.includes(query);
      });
    });
  }, [items, searchKeys, debouncedQuery, caseSensitive]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      filtered: filteredItems.length,
      query: debouncedQuery,
      hasResults: filteredItems.length > 0,
      isEmpty: filteredItems.length === 0 && debouncedQuery.trim().length > 0,
    };
  }, [items.length, filteredItems.length, debouncedQuery]);

  return {
    filteredItems,
    stats,
    debouncedQuery,
  };
}

