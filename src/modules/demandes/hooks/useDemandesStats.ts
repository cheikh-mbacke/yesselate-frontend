/**
 * Hook pour récupérer les statistiques des demandes
 */

import { useQuery } from '@tanstack/react-query';
import { getDemandesStats } from '../api/demandesApi';
import type { DemandeStats } from '../types/demandesTypes';

export function useDemandesStats() {
  return useQuery<DemandeStats>({
    queryKey: ['demandes', 'stats'],
    queryFn: getDemandesStats,
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });
}

