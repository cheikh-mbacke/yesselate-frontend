/**
 * Service API pour la gestion des anomalies et annotations
 * Centralise tous les appels API liés aux anomalies et annotations des documents de validation
 */

import type {
  DocumentAnomaly,
  DocumentAnnotation,
  DocumentType,
} from '@/lib/types/document-validation.types';

const BASE_URL = '/api/validation-bc';

export interface CreateAnnotationDto {
  documentId: string;
  documentType: DocumentType;
  field?: string;
  comment: string;
  anomalyId?: string;
  createdBy: string;
  type?: 'comment' | 'correction' | 'approval' | 'rejection';
}

export interface UpdateAnnotationDto {
  comment: string;
}

export interface ResolveAnomalyDto {
  comment?: string;
}

/**
 * Helper pour les appels API avec gestion d'erreurs
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * API pour la gestion des anomalies et annotations
 */
export const validationBCAnomaliesAPI = {
  /**
   * Récupère toutes les anomalies d'un document
   */
  async getAnomalies(documentId: string): Promise<DocumentAnomaly[]> {
    return fetchJson<DocumentAnomaly[]>(`${BASE_URL}/documents/${documentId}/anomalies`);
  },

  /**
   * Récupère toutes les annotations d'un document
   */
  async getAnnotations(documentId: string): Promise<DocumentAnnotation[]> {
    return fetchJson<DocumentAnnotation[]>(`${BASE_URL}/documents/${documentId}/annotations`);
  },

  /**
   * Résout une anomalie
   */
  async resolveAnomaly(anomalyId: string, data?: ResolveAnomalyDto): Promise<DocumentAnomaly> {
    return fetchJson<DocumentAnomaly>(`${BASE_URL}/anomalies/${anomalyId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  /**
   * Crée une nouvelle annotation
   */
  async createAnnotation(data: CreateAnnotationDto): Promise<DocumentAnnotation> {
    return fetchJson<DocumentAnnotation>(`${BASE_URL}/annotations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Met à jour une annotation existante
   */
  async updateAnnotation(id: string, data: UpdateAnnotationDto): Promise<DocumentAnnotation> {
    return fetchJson<DocumentAnnotation>(`${BASE_URL}/annotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprime une annotation
   */
  async deleteAnnotation(id: string): Promise<void> {
    await fetchJson<void>(`${BASE_URL}/annotations/${id}`, {
      method: 'DELETE',
    });
  },
};

