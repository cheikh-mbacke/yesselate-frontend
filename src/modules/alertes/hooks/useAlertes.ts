/**
 * Hook principal pour récupérer les alertes
 */

import { useQuery } from '@tanstack/react-query';
import { getAlertes, getAlerteById } from '../api/alertesApi';
import type { Alerte, AlerteFiltres } from '../types/alertesTypes';

/**
 * Hook pour récupérer toutes les alertes avec filtres
 */
export function useAlertes(filtres?: AlerteFiltres) {
  return useQuery({
    queryKey: ['alertes', filtres],
    queryFn: () => getAlertes(filtres),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
  });
}

/**
 * Hook pour récupérer une alerte par ID
 */
export function useAlerte(id: string | null) {
  return useQuery({
    queryKey: ['alerte', id],
    queryFn: () => (id ? getAlerteById(id) : null),
    enabled: !!id,
    staleTime: 30000,
  });
}

