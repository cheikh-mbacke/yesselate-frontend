/**
 * Hook pour récupérer les données des demandes
 */

import { useQuery } from '@tanstack/react-query';
import { getDemandes, getDemandesByStatus, getDemandesByService, getDemandesTrends, getServiceStats } from '../api/demandesApi';
import { useDemandesFilters } from './useDemandesFilters';
import type { Demande, DemandeTrend, ServiceStats } from '../types/demandesTypes';

/**
 * Récupère toutes les demandes avec les filtres actuels
 */
export function useDemandesData() {
  const { filters } = useDemandesFilters();

  return useQuery<Demande[]>({
    queryKey: ['demandes', 'list', filters],
    queryFn: () => getDemandes(filters),
    staleTime: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Récupère les demandes par statut
 */
export function useDemandesByStatus(status: string) {
  return useQuery<Demande[]>({
    queryKey: ['demandes', 'status', status],
    queryFn: () => getDemandesByStatus(status),
    enabled: !!status,
    staleTime: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Récupère les demandes par service
 */
export function useDemandesByService(service: string) {
  return useQuery<Demande[]>({
    queryKey: ['demandes', 'service', service],
    queryFn: () => getDemandesByService(service),
    enabled: !!service,
    staleTime: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Récupère les tendances
 */
export function useDemandesTrends(days: number = 30) {
  return useQuery<DemandeTrend[]>({
    queryKey: ['demandes', 'trends', days],
    queryFn: () => getDemandesTrends(days),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Récupère les statistiques par service
 */
export function useServiceStats() {
  return useQuery<ServiceStats[]>({
    queryKey: ['demandes', 'services', 'stats'],
    queryFn: getServiceStats,
    staleTime: 60000,
  });
}

