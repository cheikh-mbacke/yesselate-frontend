/**
 * Hook pour gérer les filtres des contrats avec Zustand
 * Réexporte le store pour une utilisation simplifiée
 */

import { useContratsFiltersStore } from '../stores/contratsFiltersStore';

export function useContratsFilters() {
  return useContratsFiltersStore();
}

