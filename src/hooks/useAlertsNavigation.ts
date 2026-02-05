/**
 * useAlertsNavigation Hook
 * ========================
 * 
 * Hook for managing alerts navigation using the navigation configuration
 */

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { shortcuts, domainTree, categoryToQuery, getCategoryQuery, type NavNode } from '@/lib/config/alertsNavigation';
import type { AlertCategory } from '@/lib/types/alert.types';

export function useAlertsNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Navigate to a category
   */
  const navigateToCategory = (category: AlertCategory) => {
    router.push(`/alertes/${category}`);
  };

  /**
   * Navigate to a domain node
   */
  const navigateToNode = (node: NavNode) => {
    if (node.query) {
      // Build query string from node query
      const params = new URLSearchParams(node.query);
      router.push(`/alertes?${params.toString()}`);
    } else {
      router.push(`/alertes`);
    }
  };

  /**
   * Get current category from URL
   */
  const currentCategory = useMemo(() => {
    const path = window.location.pathname;
    const match = path.match(/\/alertes\/([^/]+)/);
    if (match) {
      const category = match[1] as AlertCategory;
      return shortcuts.find(s => s.key === category)?.key || 'overview';
    }
    return 'overview';
  }, []);

  /**
   * Get query parameters for current category
   */
  const currentCategoryQuery = useMemo(() => {
    return getCategoryQuery(currentCategory);
  }, [currentCategory]);

  /**
   * Get all shortcuts
   */
  const allShortcuts = useMemo(() => shortcuts, []);

  /**
   * Get shortcuts with badges
   */
  const shortcutsWithBadges = useMemo(() => {
    return shortcuts.filter(s => s.badge);
  }, []);

  /**
   * Get domain tree
   */
  const allDomains = useMemo(() => domainTree, []);

  /**
   * Find a node in the domain tree by key
   */
  const findNode = (key: string, tree: NavNode[] = domainTree): NavNode | undefined => {
    for (const node of tree) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNode(key, node.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  /**
   * Get all query parameters from search params and category
   */
  const getAllQueryParams = useMemo(() => {
    const categoryQuery = getCategoryQuery(currentCategory);
    const searchQuery: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      searchQuery[key] = value;
    });

    return { ...categoryQuery, ...searchQuery };
  }, [currentCategory, searchParams]);

  return {
    // Navigation functions
    navigateToCategory,
    navigateToNode,
    
    // Current state
    currentCategory,
    currentCategoryQuery,
    getAllQueryParams,
    
    // Configuration data
    shortcuts: allShortcuts,
    shortcutsWithBadges,
    domainTree: allDomains,
    
    // Utilities
    findNode,
    getCategoryQuery,
  };
}

