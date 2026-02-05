/**
 * React Query Hooks pour la gestion des anomalies et annotations
 * Centralise tous les hooks React Query liés aux anomalies et annotations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  validationBCAnomaliesAPI,
  type CreateAnnotationDto,
  type UpdateAnnotationDto,
  type ResolveAnomalyDto,
} from '@/lib/services/validation-bc-anomalies.service';
import type {
  DocumentAnomaly,
  DocumentAnnotation,
} from '@/lib/types/document-validation.types';

// Query keys
export const validationBCAnomaliesKeys = {
  all: ['validation-bc', 'anomalies'] as const,
  lists: () => [...validationBCAnomaliesKeys.all, 'list'] as const,
  list: (documentId: string) => [...validationBCAnomaliesKeys.lists(), documentId] as const,
  details: () => [...validationBCAnomaliesKeys.all, 'detail'] as const,
  detail: (id: string) => [...validationBCAnomaliesKeys.details(), id] as const,
  annotations: {
    all: ['validation-bc', 'annotations'] as const,
    lists: () => [...validationBCAnomaliesKeys.annotations.all, 'list'] as const,
    list: (documentId: string) => [...validationBCAnomaliesKeys.annotations.lists(), documentId] as const,
    details: () => [...validationBCAnomaliesKeys.annotations.all, 'detail'] as const,
    detail: (id: string) => [...validationBCAnomaliesKeys.annotations.details(), id] as const,
  },
};

// ============================================
// QUERIES - Anomalies
// ============================================

/**
 * Récupère les anomalies d'un document
 */
export function useAnomalies(documentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: validationBCAnomaliesKeys.list(documentId),
    queryFn: () => validationBCAnomaliesAPI.getAnomalies(documentId),
    staleTime: 30000, // 30 secondes
    enabled: options?.enabled !== false && !!documentId,
  });
}

// ============================================
// QUERIES - Annotations
// ============================================

/**
 * Récupère les annotations d'un document
 */
export function useAnnotations(documentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: validationBCAnomaliesKeys.annotations.list(documentId),
    queryFn: () => validationBCAnomaliesAPI.getAnnotations(documentId),
    staleTime: 30000, // 30 secondes
    enabled: options?.enabled !== false && !!documentId,
  });
}

// ============================================
// MUTATIONS - Anomalies
// ============================================

/**
 * Résout une anomalie
 */
export function useResolveAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ anomalyId, comment }: { anomalyId: string; comment?: string }) =>
      validationBCAnomaliesAPI.resolveAnomaly(anomalyId, comment ? { comment } : undefined),
    onSuccess: (data, variables) => {
      // Invalider les listes d'anomalies pour tous les documents
      queryClient.invalidateQueries({ queryKey: validationBCAnomaliesKeys.lists() });
      // Invalider les annotations car une résolution peut créer une annotation
      queryClient.invalidateQueries({ queryKey: validationBCAnomaliesKeys.annotations.lists() });
      // Mettre à jour le détail de l'anomalie
      queryClient.setQueryData(validationBCAnomaliesKeys.detail(variables.anomalyId), data);
    },
  });
}

// ============================================
// MUTATIONS - Annotations
// ============================================

/**
 * Crée une nouvelle annotation
 */
export function useCreateAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnotationDto) => validationBCAnomaliesAPI.createAnnotation(data),
    onSuccess: (data) => {
      // Invalider la liste des annotations pour le document concerné
      queryClient.invalidateQueries({
        queryKey: validationBCAnomaliesKeys.annotations.list(data.documentId),
      });
      // Invalider aussi les anomalies car une annotation peut être liée à une anomalie
      queryClient.invalidateQueries({
        queryKey: validationBCAnomaliesKeys.list(data.documentId),
      });
      // Mettre à jour le détail de l'annotation
      queryClient.setQueryData(validationBCAnomaliesKeys.annotations.detail(data.id), data);
    },
  });
}

/**
 * Met à jour une annotation existante
 */
export function useUpdateAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      validationBCAnomaliesAPI.updateAnnotation(id, { comment }),
    onSuccess: (data, variables) => {
      // Invalider la liste des annotations pour le document concerné
      queryClient.invalidateQueries({
        queryKey: validationBCAnomaliesKeys.annotations.lists(),
      });
      // Mettre à jour le détail de l'annotation
      queryClient.setQueryData(validationBCAnomaliesKeys.annotations.detail(variables.id), data);
    },
  });
}

/**
 * Supprime une annotation
 */
export function useDeleteAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, documentId }: { id: string; documentId: string }) =>
      validationBCAnomaliesAPI.deleteAnnotation(id),
    onSuccess: (_, variables) => {
      // Invalider la liste des annotations pour le document concerné
      queryClient.invalidateQueries({
        queryKey: validationBCAnomaliesKeys.annotations.list(variables.documentId),
      });
      // Retirer l'annotation du cache
      queryClient.removeQueries({
        queryKey: validationBCAnomaliesKeys.annotations.detail(variables.id),
      });
    },
  });
}

