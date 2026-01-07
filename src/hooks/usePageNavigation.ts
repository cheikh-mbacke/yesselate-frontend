// ============================================
// Hook pour automatiser la navigation entre pages
// ============================================

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useNavigationStore } from '@/lib/stores';
import { routeMapping, generateNavParams, parseNavParams, createCrossPageLink, getActivePageId } from '@/lib/services/navigation.service';

/**
 * Hook pour gérer la navigation automatique d'une page
 */
export function usePageNavigation(pageId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    setPageFilter, 
    getPageFilter, 
    setPageLoading, 
    isPageLoading,
    addToHistory 
  } = useNavigationStore();

  // Récupérer les filtres persistants
  const savedFilters = getPageFilter(pageId);
  
  // Appliquer les filtres depuis l'URL au chargement
  useEffect(() => {
    try {
      const urlFilters = parseNavParams(searchParams);
      if (Object.keys(urlFilters).length > 0) {
        setPageFilter(pageId, urlFilters);
      } else if (Object.keys(savedFilters).length > 0) {
        // Restaurer les filtres sauvegardés si pas de filtres dans l'URL
        const params = new URLSearchParams();
        Object.entries(savedFilters).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        router.replace(`${routeMapping[pageId]}?${params.toString()}`);
      }
    } catch (error) {
      // Ignorer les erreurs d'hydratation
      console.warn('Erreur lors de la lecture des paramètres URL:', error);
    }
  }, [searchParams, pageId, router, setPageFilter, savedFilters]); // Dépendances correctes

  /**
   * Naviguer vers une autre page avec contexte
   */
  const navigateTo = useCallback((
    targetPageId: string, 
    context?: Record<string, any>,
    options?: { replace?: boolean }
  ) => {
    const link = createCrossPageLink({
      fromPage: pageId,
      toPage: targetPageId,
      context,
    });
    
    if (options?.replace) {
      router.replace(link);
    } else {
      router.push(link);
    }
  }, [pageId, router]);

  /**
   * Mettre à jour les filtres de la page actuelle
   */
  const updateFilters = useCallback((filters: Record<string, any>, replace = false) => {
    setPageFilter(pageId, filters);
    const url = generateNavParams(pageId, filters);
    
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [pageId, router, setPageFilter]);

  /**
   * Réinitialiser les filtres
   */
  const resetFilters = useCallback(() => {
    setPageFilter(pageId, {});
    router.push(routeMapping[pageId]);
  }, [pageId, router, setPageFilter]);

  /**
   * Obtenir les filtres actuels (URL + sauvegardés)
   */
  const getFilters = useCallback(() => {
    // Désactivé temporairement pour éviter les problèmes d'hydratation
    // const urlFilters = parseNavParams(searchParams);
    // return { ...savedFilters, ...urlFilters };
    return savedFilters;
  }, [savedFilters]);

  /**
   * Marquer la page comme en chargement
   */
  const setLoading = useCallback((loading: boolean) => {
    setPageLoading(pageId, loading);
  }, [pageId, setPageLoading]);

  const loading = isPageLoading(pageId);

  return {
    navigateTo,
    updateFilters,
    resetFilters,
    getFilters,
    setLoading,
    loading,
    savedFilters,
    currentFilters: getFilters(),
  };
}

/**
 * Hook pour créer des liens automatiques entre pages
 */
export function useCrossPageLinks(pageId: string) {
  const { navigateTo } = usePageNavigation(pageId);

  return {
    // Liens vers les pages principales
    goToDashboard: () => navigateTo('dashboard'),
    goToAlerts: (alertId?: string) => navigateTo('alerts', alertId ? { alertId } : undefined),
    goToCalendrier: (date?: string) => navigateTo('calendrier', date ? { date } : undefined),
    goToAnalytics: (report?: string) => navigateTo('analytics', report ? { report } : undefined),
    
    // Liens vers les pages d'exécution
    goToDemandes: (filter?: string) => navigateTo('demandes', filter ? { filter } : undefined),
    goToValidationBC: (tab?: string, bcId?: string) => navigateTo('validation-bc', { tab, bcId }),
    goToBlocked: (dossierId?: string) => navigateTo('blocked', dossierId ? { dossierId } : undefined),
    
    // Liens vers les projets
    goToProjet: (projetId: string) => navigateTo('projets-en-cours', { projet: projetId }),
    
    // Liens vers les finances
    goToFinances: (period?: string) => navigateTo('finances', period ? { period } : undefined),
    
    // Navigation générique
    goToPage: navigateTo,
  };
}

