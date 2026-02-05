/**
 * Hook pour récupérer les données des alertes
 */

import { useQuery } from '@tanstack/react-query';
import { getAlertes } from '../api/alertesApi';
import type { AlerteFiltres } from '../types/alertesTypes';

/**
 * Hook pour récupérer les alertes avec filtres
 */
export function useAlertesData(filtres?: AlerteFiltres) {
  return useQuery({
    queryKey: ['centre-alertes-data', filtres],
    queryFn: () => getAlertes(filtres),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
  });
}

