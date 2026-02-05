/**
 * Hook pour récupérer les statistiques de validation
 */

import { useQuery } from '@tanstack/react-query';
import { getValidationStats } from '../api/validationApi';
import type { ValidationFiltres } from '../types/validationTypes';

/**
 * Hook pour récupérer les statistiques de validation
 */
export function useValidationStats(filtres?: ValidationFiltres) {
  return useQuery({
    queryKey: ['validation-bc-stats', filtres],
    queryFn: () => getValidationStats(filtres),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
  });
}

