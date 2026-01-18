/**
 * Hook pour récupérer les statistiques des contrats
 */

import { useQuery } from '@tanstack/react-query';
import { getContratsStats } from '../api/contratsApi';
import { useContratsFiltersStore } from '../stores/contratsFiltersStore';
import type { ContratsStats } from '../types/contratsTypes';

export function useContratsStats() {
  const getFilters = useContratsFiltersStore((state) => state.getFilters);

  return useQuery<ContratsStats>({
    queryKey: ['contrats', 'stats', getFilters()],
    queryFn: async () => {
      const response = await getContratsStats(getFilters());
      return response.stats;
    },
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });
}

