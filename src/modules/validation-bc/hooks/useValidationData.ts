/**
 * Hook pour récupérer les données de validation
 */

import { useQuery } from '@tanstack/react-query';
import { getValidationDocuments } from '../api/validationApi';
import type { ValidationFiltres } from '../types/validationTypes';

/**
 * Hook pour récupérer les documents avec filtres
 */
export function useValidationData(filtres?: ValidationFiltres) {
  return useQuery({
    queryKey: ['validation-bc-data', filtres],
    queryFn: () => getValidationDocuments(filtres),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
  });
}

