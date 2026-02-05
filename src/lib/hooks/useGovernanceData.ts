/**
 * Hooks React pour les données de Gouvernance
 * Gestion du fetching, cache et mutations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { governanceService, type Project, type Risk, type Alert, type Decision, type Escalation, type KPI } from '@/lib/services/governanceService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC HOOKS
// ═══════════════════════════════════════════════════════════════════════════

function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, reset };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useProjects(filters?: {
  status?: string;
  healthStatus?: string;
} & PaginationParams) {
  return useQuery(
    () => governanceService.projects.getAll(filters),
    [filters?.status, filters?.healthStatus, filters?.page, filters?.pageSize]
  );
}

export function useProject(id: string) {
  return useQuery(
    () => governanceService.projects.getById(id),
    [id]
  );
}

export function useUpdateProject() {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Project> }) =>
      governanceService.projects.update(id, data)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RISKS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useRisks(filters?: {
  probability?: string;
  impact?: string;
  status?: string;
  projectId?: string;
} & PaginationParams) {
  return useQuery(
    () => governanceService.risks.getAll(filters),
    [filters?.probability, filters?.impact, filters?.status, filters?.projectId, filters?.page]
  );
}

export function useRisk(id: string) {
  return useQuery(
    () => governanceService.risks.getById(id),
    [id]
  );
}

export function useCreateRisk() {
  return useMutation(
    (data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>) =>
      governanceService.risks.create(data)
  );
}

export function useUpdateRisk() {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Risk> }) =>
      governanceService.risks.update(id, data)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useAlerts(filters?: {
  type?: string;
  category?: string;
  status?: string;
  isRead?: boolean;
} & PaginationParams) {
  return useQuery(
    () => governanceService.alerts.getAll(filters),
    [filters?.type, filters?.category, filters?.status, filters?.isRead, filters?.page]
  );
}

export function useAlert(id: string) {
  return useQuery(
    () => governanceService.alerts.getById(id),
    [id]
  );
}

export function useMarkAlertAsRead() {
  return useMutation(
    (id: string) => governanceService.alerts.markAsRead(id)
  );
}

export function useMarkAllAlertsAsRead() {
  return useMutation(
    () => governanceService.alerts.markAllAsRead()
  );
}

export function useResolveAlert() {
  return useMutation(
    ({ id, resolution }: { id: string; resolution?: string }) =>
      governanceService.alerts.resolve(id, resolution)
  );
}

export function useDismissAlert() {
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      governanceService.alerts.dismiss(id, reason)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISIONS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDecisions(filters?: {
  type?: string;
  status?: string;
  impact?: string;
} & PaginationParams) {
  return useQuery(
    () => governanceService.decisions.getAll(filters),
    [filters?.type, filters?.status, filters?.impact, filters?.page]
  );
}

export function useDecision(id: string) {
  return useQuery(
    () => governanceService.decisions.getById(id),
    [id]
  );
}

export function useCreateDecision() {
  return useMutation(
    (data: Parameters<typeof governanceService.decisions.create>[0]) =>
      governanceService.decisions.create(data)
  );
}

export function useSubmitDecision() {
  return useMutation(
    ({ id, decision, comment }: { id: string; decision: 'approved' | 'rejected' | 'deferred'; comment?: string }) =>
      governanceService.decisions.decide(id, { decision, comment })
  );
}

export function useAddDecisionComment() {
  return useMutation(
    ({ id, text }: { id: string; text: string }) =>
      governanceService.decisions.addComment(id, text)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATIONS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useEscalations(filters?: {
  level?: number;
  urgency?: string;
  status?: string;
} & PaginationParams) {
  return useQuery(
    () => governanceService.escalations.getAll(filters),
    [filters?.level, filters?.urgency, filters?.status, filters?.page]
  );
}

export function useEscalation(id: string) {
  return useQuery(
    () => governanceService.escalations.getById(id),
    [id]
  );
}

export function useCreateEscalation() {
  return useMutation(
    (data: Parameters<typeof governanceService.escalations.create>[0]) =>
      governanceService.escalations.create(data)
  );
}

export function useAcknowledgeEscalation() {
  return useMutation(
    (id: string) => governanceService.escalations.acknowledge(id)
  );
}

export function useResolveEscalation() {
  return useMutation(
    ({ id, resolution }: { id: string; resolution: string }) =>
      governanceService.escalations.resolve(id, resolution)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// KPIs HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useKPIs() {
  return useQuery(
    () => governanceService.kpis.getAll(),
    []
  );
}

export function useRefreshKPIs() {
  return useMutation(
    () => governanceService.kpis.refresh()
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-REFRESH HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAutoRefresh(
  callback: () => void,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(callback, intervalMs);
    return () => clearInterval(interval);
  }, [callback, intervalMs, enabled]);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED DASHBOARD HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useDashboardData() {
  const kpis = useKPIs();
  const criticalAlerts = useAlerts({ type: 'critical', status: 'new' });
  const pendingDecisions = useDecisions({ status: 'pending' });
  const activeEscalations = useEscalations({ status: 'new' });

  const isLoading = kpis.isLoading || criticalAlerts.isLoading || 
                    pendingDecisions.isLoading || activeEscalations.isLoading;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      kpis.refetch(),
      criticalAlerts.refetch(),
      pendingDecisions.refetch(),
      activeEscalations.refetch(),
    ]);
  }, [kpis.refetch, criticalAlerts.refetch, pendingDecisions.refetch, activeEscalations.refetch]);

  return {
    kpis: kpis.data,
    criticalAlerts: criticalAlerts.data,
    pendingDecisions: pendingDecisions.data,
    activeEscalations: activeEscalations.data,
    isLoading,
    refetch: refetchAll,
  };
}

