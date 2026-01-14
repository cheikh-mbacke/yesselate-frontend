/**
 * React Query hooks pour le Centre d'Alertes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  centreAlertesAPI,
  type CentreAlertesKPIs,
  type CentreAlertesFilters,
  type TreatAlertPayload,
  type EscalateAlertPayload,
  type AssignAlertPayload,
  type AcknowledgeAlertPayload,
} from '../centre-alertes/centreAlertesClient';
import { alertsKeys } from './useAlerts';

// Query keys
export const centreAlertesKeys = {
  all: ['centre-alertes'] as const,
  kpis: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'kpis', filters] as const,
  alerts: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'alerts', filters] as const,
  critical: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'critical', filters] as const,
  operational: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'operational', filters] as const,
  sla: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'sla', filters] as const,
  financial: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'financial', filters] as const,
  rh: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'rh', filters] as const,
  projects: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'projects', filters] as const,
  system: (filters?: CentreAlertesFilters) => [...centreAlertesKeys.all, 'system', filters] as const,
};

/**
 * Hook pour récupérer les KPIs
 */
export function useCentreAlertesKPIs(filters?: CentreAlertesFilters) {
  return useQuery({
    queryKey: centreAlertesKeys.kpis(filters),
    queryFn: () => centreAlertesAPI.getKPIs(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Hook pour récupérer les alertes critiques
 */
export function useCriticalAlerts(filters?: CentreAlertesFilters) {
  return useQuery({
    queryKey: centreAlertesKeys.critical(filters),
    queryFn: () => centreAlertesAPI.getCriticalAlerts(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Hook pour récupérer les alertes opérationnelles
 */
export function useOperationalAlerts(filters?: CentreAlertesFilters) {
  return useQuery({
    queryKey: centreAlertesKeys.operational(filters),
    queryFn: () => centreAlertesAPI.getOperationalAlerts(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Hook pour récupérer les alertes SLA
 */
export function useSLAAlerts(filters?: CentreAlertesFilters) {
  return useQuery({
    queryKey: centreAlertesKeys.sla(filters),
    queryFn: () => centreAlertesAPI.getSLAAlerts(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Hook pour traiter une alerte
 */
export function useTreatAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TreatAlertPayload }) =>
      centreAlertesAPI.treatAlert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
    },
  });
}

/**
 * Hook pour escalader une alerte
 */
export function useEscalateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EscalateAlertPayload }) =>
      centreAlertesAPI.escalateAlert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
    },
  });
}

/**
 * Hook pour assigner une alerte
 */
export function useAssignAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignAlertPayload }) =>
      centreAlertesAPI.assignAlert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
    },
  });
}

/**
 * Hook pour acquitter une alerte
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AcknowledgeAlertPayload }) =>
      centreAlertesAPI.acknowledgeAlert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
    },
  });
}

/**
 * Hook pour actions en masse
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, action, data }: { ids: string[]; action: string; data?: any }) =>
      centreAlertesAPI.bulkAction(ids, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
    },
  });
}

