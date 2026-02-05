/**
 * Hooks pour récupérer les alertes par type
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAlertesByTypologie,
  getAlertesBySeverite,
  getAlertesByStatut,
} from '../api/alertesApi';
import type {
  AlerteTypologie,
  AlerteSeverite,
  AlerteStatut,
  AlerteFiltres,
} from '../types/alertesTypes';

/**
 * Hook pour récupérer les alertes par typologie
 */
export function useAlertesByTypologie(
  typologie: AlerteTypologie,
  filtres?: AlerteFiltres
) {
  return useQuery({
    queryKey: ['alertes-typologie', typologie, filtres],
    queryFn: () => getAlertesByTypologie(typologie, filtres),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Hook pour récupérer les alertes par sévérité
 */
export function useAlertesBySeverite(
  severite: AlerteSeverite,
  filtres?: AlerteFiltres
) {
  return useQuery({
    queryKey: ['alertes-severite', severite, filtres],
    queryFn: () => getAlertesBySeverite(severite, filtres),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Hook pour récupérer les alertes par statut
 */
export function useAlertesByStatut(
  statut: AlerteStatut,
  filtres?: AlerteFiltres
) {
  return useQuery({
    queryKey: ['alertes-statut', statut, filtres],
    queryFn: () => getAlertesByStatut(statut, filtres),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

