/**
 * Hook pour récupérer les données des contrats
 */

import { useQuery } from '@tanstack/react-query';
import {
  getContrats,
  getContratById,
  getContratsByStatut,
  getContratsByPriorite,
  getContratsTrends,
} from '../api/contratsApi';
import { useContratsFiltersStore } from '../stores/contratsFiltersStore';
import type { Contrat, TendancesContrats } from '../types/contratsTypes';

/**
 * Récupère tous les contrats avec les filtres actuels
 */
export function useContratsData() {
  const getFilters = useContratsFiltersStore((state) => state.getFilters);

  return useQuery({
    queryKey: ['contrats', 'list', getFilters()],
    queryFn: () => getContrats(getFilters()),
    staleTime: 30000,
  });
}

/**
 * Récupère un contrat par ID
 */
export function useContratById(id: string) {
  return useQuery<Contrat>({
    queryKey: ['contrats', 'detail', id],
    queryFn: () => getContratById(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

/**
 * Récupère les contrats par statut
 */
export function useContratsByStatut(statut: string) {
  const getFilters = useContratsFiltersStore((state) => state.getFilters);

  return useQuery<Contrat[]>({
    queryKey: ['contrats', 'statut', statut, getFilters()],
    queryFn: () => getContratsByStatut(statut, getFilters()),
    enabled: !!statut,
    staleTime: 30000,
  });
}

/**
 * Récupère les contrats par priorité
 */
export function useContratsByPriorite(priorite: string) {
  const getFilters = useContratsFiltersStore((state) => state.getFilters);

  return useQuery<Contrat[]>({
    queryKey: ['contrats', 'priorite', priorite, getFilters()],
    queryFn: () => getContratsByPriorite(priorite, getFilters()),
    enabled: !!priorite,
    staleTime: 30000,
  });
}

/**
 * Récupère les tendances
 */
export function useContratsTrends(periode: string = 'month') {
  return useQuery<TendancesContrats>({
    queryKey: ['contrats', 'trends', periode],
    queryFn: async () => {
      const response = await getContratsTrends(periode);
      return response.tendances;
    },
    staleTime: 60000, // 1 minute
  });
}

