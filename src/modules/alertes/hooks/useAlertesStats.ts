/**
 * Hook pour récupérer les statistiques des alertes
 */

import { useQuery } from '@tanstack/react-query';
import { getAlertesStats } from '../api/alertesApi';
import type { AlerteFiltres } from '../types/alertesTypes';

/**
 * Hook pour récupérer les statistiques des alertes
 */
export function useAlertesStats(filtres?: AlerteFiltres) {
  return useQuery({
    queryKey: ['alertes-stats', filtres],
    queryFn: () => getAlertesStats(filtres),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
  });
}

