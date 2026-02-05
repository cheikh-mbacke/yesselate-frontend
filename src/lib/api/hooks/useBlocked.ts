/**
 * React Query hooks for Blocked Dossiers API
 * Gestion du cache, mutations et refetch pour les dossiers bloqués
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export interface BlockedFilters {
  impact?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  bureau?: string;
  status?: 'pending' | 'escalated' | 'resolved' | 'substituted';
  assignedTo?: string;
  type?: string;
  minDelay?: number;
  maxDelay?: number;
  search?: string;
  slaBreached?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface BlockedDossier {
  id: string;
  refNumber?: string;
  subject: string;
  description?: string;
  impact: string;
  type: string;
  category?: string;
  status: string;
  priority: number;
  delay?: number;
  amount?: number;
  bureauCode: string;
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
  resolutionMethod?: string;
  escalatedAt?: string;
  escalatedToName?: string;
  escalationLevel?: number;
  createdAt: string;
  updatedAt: string;
  comments?: any[];
  auditLog?: any[];
}

export interface BlockedStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  escalated: number;
  resolved: number;
  avgDelay: number;
  maxDelay: number;
  avgPriority: number;
  totalAmount: number;
  overdueSLA: number;
  resolvedToday: number;
  escalatedToday: number;
  urgent: number;
  byBureau: { bureau: string; count: number; critical: number }[];
  byType: { type: string; count: number }[];
  topPriority: any[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  timestamp: string;
}

// ============================================
// QUERY KEYS
// ============================================

export const blockedKeys = {
  all: ['blocked'] as const,
  lists: () => [...blockedKeys.all, 'list'] as const,
  list: (filters?: BlockedFilters, page?: number) => [...blockedKeys.lists(), filters, page] as const,
  details: () => [...blockedKeys.all, 'detail'] as const,
  detail: (id: string) => [...blockedKeys.details(), id] as const,
  stats: () => [...blockedKeys.all, 'stats'] as const,
  statsFiltered: (filters?: BlockedFilters) => [...blockedKeys.stats(), filters] as const,
  matrix: (filters?: BlockedFilters) => [...blockedKeys.all, 'matrix', filters] as const,
  bureaux: () => [...blockedKeys.all, 'bureaux'] as const,
  bureauFiltered: (filters?: BlockedFilters) => [...blockedKeys.bureaux(), filters] as const,
  timeline: (params?: any) => [...blockedKeys.all, 'timeline', params] as const,
  comments: (dossierId: string) => [...blockedKeys.detail(dossierId), 'comments'] as const,
};

// ============================================
// API HELPERS
// ============================================

const BASE_URL = '/api/bmo/blocked';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// ============================================
// HOOKS - QUERIES
// ============================================

/**
 * Récupérer la liste des dossiers bloqués avec filtres et pagination
 */
export function useBlockedDossiers(
  filters?: BlockedFilters,
  page: number = 1,
  pageSize: number = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<BlockedDossier>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: blockedKeys.list(filters, page),
    queryFn: async () => {
      const query = buildQueryString({ ...filters, page, pageSize });
      return fetchJson<PaginatedResponse<BlockedDossier>>(`${BASE_URL}?${query}`);
    },
    staleTime: 30_000, // 30 secondes
    refetchInterval: 60_000, // Auto-refresh chaque minute
    ...options,
  });
}

/**
 * Récupérer un dossier bloqué par ID
 */
export function useBlockedDossier(id: string) {
  return useQuery({
    queryKey: blockedKeys.detail(id),
    queryFn: () => fetchJson<BlockedDossier>(`${BASE_URL}/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Récupérer les statistiques en temps réel
 */
export function useBlockedStats(filters?: BlockedFilters) {
  return useQuery({
    queryKey: blockedKeys.statsFiltered(filters),
    queryFn: async () => {
      const query = filters ? buildQueryString(filters) : '';
      return fetchJson<BlockedStats>(`${BASE_URL}/stats${query ? `?${query}` : ''}`);
    },
    staleTime: 15_000, // 15 secondes (stats = temps réel)
    refetchInterval: 30_000, // Auto-refresh toutes les 30s
  });
}

/**
 * Récupérer la matrice impact x délai
 */
export function useBlockedMatrix(filters?: BlockedFilters) {
  return useQuery({
    queryKey: blockedKeys.matrix(filters),
    queryFn: async () => {
      const query = filters ? buildQueryString(filters) : '';
      return fetchJson<any>(`${BASE_URL}/matrix${query ? `?${query}` : ''}`);
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Récupérer les statistiques par bureau
 */
export function useBlockedBureaux(filters?: BlockedFilters) {
  return useQuery({
    queryKey: blockedKeys.bureauFiltered(filters),
    queryFn: async () => {
      const query = filters ? buildQueryString(filters) : '';
      return fetchJson<any>(`${BASE_URL}/bureaux${query ? `?${query}` : ''}`);
    },
    staleTime: 60_000,
  });
}

/**
 * Récupérer la timeline des blocages
 */
export function useBlockedTimeline(params?: {
  period?: 'day' | 'week' | 'month' | 'year';
  bureau?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: blockedKeys.timeline(params),
    queryFn: async () => {
      const query = params ? buildQueryString(params) : '';
      return fetchJson<any>(`${BASE_URL}/timeline${query ? `?${query}` : ''}`);
    },
    staleTime: 30_000,
  });
}

/**
 * Récupérer les commentaires d'un dossier
 */
export function useBlockedComments(dossierId: string, params?: { visibility?: string; type?: string }) {
  return useQuery({
    queryKey: blockedKeys.comments(dossierId),
    queryFn: async () => {
      const query = params ? buildQueryString(params) : '';
      return fetchJson<{ comments: any[]; total: number }>(
        `${BASE_URL}/${dossierId}/comment${query ? `?${query}` : ''}`
      );
    },
    enabled: !!dossierId,
    staleTime: 30_000,
  });
}

// ============================================
// HOOKS - MUTATIONS
// ============================================

/**
 * Créer un nouveau dossier bloqué
 */
export function useCreateBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<BlockedDossier>) =>
      fetchJson<BlockedDossier>(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate all lists and stats
      queryClient.invalidateQueries({ queryKey: blockedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blockedKeys.stats() });
    },
  });
}

/**
 * Mettre à jour un dossier bloqué
 */
export function useUpdateBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlockedDossier> }) =>
      fetchJson<{ success: boolean; dossier: BlockedDossier }>(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (response, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: blockedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blockedKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blockedKeys.stats() });
    },
  });
}

/**
 * Résoudre un dossier bloqué
 */
export function useResolveBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      method,
      comment,
      actorId,
      actorName,
      actorRole,
      documents,
      delegationRef,
    }: {
      id: string;
      method: 'direct' | 'escalation' | 'substitution' | 'delegation';
      comment?: string;
      actorId: string;
      actorName: string;
      actorRole?: string;
      documents?: any[];
      delegationRef?: string;
    }) =>
      fetchJson<{ success: boolean; dossier: BlockedDossier; auditHash: string }>(
        `${BASE_URL}/${id}/resolve`,
        {
          method: 'POST',
          body: JSON.stringify({ method, comment, actorId, actorName, actorRole, documents, delegationRef }),
        }
      ),
    onMutate: async ({ id }) => {
      // Optimistic update: mark as resolved immediately
      await queryClient.cancelQueries({ queryKey: blockedKeys.detail(id) });
      const previousData = queryClient.getQueryData(blockedKeys.detail(id));

      queryClient.setQueryData(blockedKeys.detail(id), (old: any) => ({
        ...old,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      }));

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(blockedKeys.detail(variables.id), context.previousData);
      }
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: blockedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blockedKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blockedKeys.stats() });
      
      // Update stats optimistically
      queryClient.setQueryData(blockedKeys.stats(), (old: any) => ({
        ...old,
        resolvedToday: (old?.resolvedToday || 0) + 1,
        total: Math.max(0, (old?.total || 0) - 1),
      }));
    },
  });
}

/**
 * Escalader un dossier
 */
export function useEscalateBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      escalatedToId,
      escalatedToName,
      reason,
      urgency,
      deadline,
      actorId,
      actorName,
      actorRole,
      notifyHierarchy,
    }: {
      id: string;
      escalatedToId: string;
      escalatedToName: string;
      reason: string;
      urgency?: string;
      deadline?: string;
      actorId: string;
      actorName: string;
      actorRole?: string;
      notifyHierarchy?: boolean;
    }) =>
      fetchJson<{ success: boolean; dossier: BlockedDossier; escalationLevel: number; auditHash: string }>(
        `${BASE_URL}/${id}/escalate`,
        {
          method: 'POST',
          body: JSON.stringify({
            escalatedToId,
            escalatedToName,
            reason,
            urgency,
            deadline,
            actorId,
            actorName,
            actorRole,
            notifyHierarchy,
          }),
        }
      ),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: blockedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blockedKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blockedKeys.stats() });
      
      // Update stats optimistically
      queryClient.setQueryData(blockedKeys.stats(), (old: any) => ({
        ...old,
        escalatedToday: (old?.escalatedToday || 0) + 1,
        escalated: (old?.escalated || 0) + 1,
      }));
    },
  });
}

/**
 * Ajouter un commentaire
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dossierId,
      content,
      authorId,
      authorName,
      authorRole,
      visibility,
      commentType,
      mentionedUsers,
      attachments,
      parentId,
    }: {
      dossierId: string;
      content: string;
      authorId: string;
      authorName: string;
      authorRole?: string;
      visibility?: string;
      commentType?: string;
      mentionedUsers?: any[];
      attachments?: any[];
      parentId?: string;
    }) =>
      fetchJson<{ success: boolean; comment: any }>(`${BASE_URL}/${dossierId}/comment`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          authorId,
          authorName,
          authorRole,
          visibility,
          commentType,
          mentionedUsers,
          attachments,
          parentId,
        }),
      }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: blockedKeys.detail(variables.dossierId) });
      queryClient.invalidateQueries({ queryKey: blockedKeys.comments(variables.dossierId) });
    },
  });
}

/**
 * Supprimer un dossier (soft delete)
 */
export function useDeleteBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actorId, actorName, reason }: { id: string; actorId: string; actorName: string; reason: string }) => {
      const query = buildQueryString({ actorId, actorName, reason });
      return fetchJson<{ success: boolean }>(`${BASE_URL}/${id}?${query}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: blockedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blockedKeys.stats() });
    },
  });
}

/**
 * Exporter les données
 */
export function useExportBlocked() {
  return useMutation({
    mutationFn: (params: {
      format: 'excel' | 'pdf' | 'csv' | 'json';
      filters?: BlockedFilters;
      columns?: string[];
      includeComments?: boolean;
      includeAuditLog?: boolean;
    }) =>
      fetchJson<{ success: boolean; filename: string; fileUrl: string; count: number; data?: any[] }>(
        `${BASE_URL}/export`,
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      ),
  });
}

// ============================================
// PREFETCH UTILITIES
// ============================================

/**
 * Prefetch les dossiers bloqués pour navigation rapide
 */
export function usePrefetchBlocked() {
  const queryClient = useQueryClient();

  const prefetchDossiers = (filters?: BlockedFilters, page: number = 1) => {
    queryClient.prefetchQuery({
      queryKey: blockedKeys.list(filters, page),
      queryFn: async () => {
        const query = buildQueryString({ ...filters, page, pageSize: 20 });
        return fetchJson<PaginatedResponse<BlockedDossier>>(`${BASE_URL}?${query}`);
      },
    });
  };

  const prefetchStats = () => {
    queryClient.prefetchQuery({
      queryKey: blockedKeys.stats(),
      queryFn: () => fetchJson<BlockedStats>(`${BASE_URL}/stats`),
    });
  };

  const prefetchMatrix = () => {
    queryClient.prefetchQuery({
      queryKey: blockedKeys.matrix(),
      queryFn: () => fetchJson<any>(`${BASE_URL}/matrix`),
    });
  };

  const prefetchBureaux = () => {
    queryClient.prefetchQuery({
      queryKey: blockedKeys.bureaux(),
      queryFn: () => fetchJson<any>(`${BASE_URL}/bureaux`),
    });
  };

  return {
    prefetchDossiers,
    prefetchStats,
    prefetchMatrix,
    prefetchBureaux,
  };
}

