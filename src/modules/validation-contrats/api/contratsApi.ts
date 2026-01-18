/**
 * API layer pour le module Validation-Contrats
 * Utilise Axios pour les appels API avec fallback sur mock data
 */

import axios from 'axios';
import type {
  Contrat,
  ContratsStats,
  ContratsFilters,
  TendancesContrats,
  ContratsResponse,
  ContratsStatsResponse,
  ContratsTendancesResponse,
  ActionValidation,
  BulkAction,
} from '../types/contratsTypes';

const API_BASE_URL = '/api/contrats';

/**
 * Récupère tous les contrats avec filtres optionnels
 */
export async function getContrats(filters?: ContratsFilters): Promise<ContratsResponse> {
  try {
    const response = await axios.get<ContratsResponse>(API_BASE_URL, { params: filters });
    return response.data;
  } catch (error) {
    // Fallback sur mock data si API non disponible
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockContrats } = await import('../data/contratsMock');
      let filtered = [...mockContrats];

      // Appliquer les filtres
      if (filters?.statuts && filters.statuts.length > 0) {
        filtered = filtered.filter((c) => filters.statuts!.includes(c.statut));
      }
      if (filters?.types && filters.types.length > 0) {
        filtered = filtered.filter((c) => filters.types!.includes(c.type));
      }
      if (filters?.priorites && filters.priorites.length > 0) {
        filtered = filtered.filter((c) => filters.priorites!.includes(c.priorite));
      }
      if (filters?.montantMin) {
        filtered = filtered.filter((c) => c.montant >= filters.montantMin!);
      }
      if (filters?.montantMax) {
        filtered = filtered.filter((c) => c.montant <= filters.montantMax!);
      }
      if (filters?.recherche) {
        const searchLower = filters.recherche.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.numero.toLowerCase().includes(searchLower) ||
            c.titre.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower) ||
            c.entreprise.toLowerCase().includes(searchLower)
        );
      }

      const page = 1;
      const pageSize = 20;
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);

      return {
        contrats: filtered.slice((page - 1) * pageSize, page * pageSize),
        total,
        page,
        pageSize,
        totalPages,
      };
    }
    throw error;
  }
}

/**
 * Récupère un contrat par ID
 */
export async function getContratById(id: string): Promise<Contrat> {
  try {
    const response = await axios.get<Contrat>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockContrats } = await import('../data/contratsMock');
      const contrat = mockContrats.find((c) => c.id === id);
      if (contrat) return contrat;
    }
    throw error;
  }
}

/**
 * Récupère les statistiques globales
 */
export async function getContratsStats(filters?: ContratsFilters): Promise<ContratsStatsResponse> {
  try {
    const response = await axios.get<ContratsStatsResponse>(`${API_BASE_URL}/stats`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockStats } = await import('../data/contratsMock');
      return {
        stats: mockStats,
        periode: filters?.periode || 'month',
      };
    }
    throw error;
  }
}

/**
 * Récupère les tendances sur une période
 */
export async function getContratsTrends(
  periode: string = 'month'
): Promise<ContratsTendancesResponse> {
  try {
    const response = await axios.get<ContratsTendancesResponse>(`${API_BASE_URL}/trends`, {
      params: { periode },
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockTrends } = await import('../data/contratsMock');
      return {
        tendances: mockTrends,
        periode: periode as any,
      };
    }
    throw error;
  }
}

/**
 * Récupère les contrats par statut
 */
export async function getContratsByStatut(statut: string, filters?: ContratsFilters): Promise<Contrat[]> {
  try {
    const response = await axios.get<Contrat[]>(`${API_BASE_URL}/statut/${statut}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockContrats } = await import('../data/contratsMock');
      return mockContrats.filter((c) => c.statut === statut);
    }
    throw error;
  }
}

/**
 * Récupère les contrats par priorité
 */
export async function getContratsByPriorite(
  priorite: string,
  filters?: ContratsFilters
): Promise<Contrat[]> {
  try {
    const response = await axios.get<Contrat[]>(`${API_BASE_URL}/priorite/${priorite}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      const { mockContrats } = await import('../data/contratsMock');
      return mockContrats.filter((c) => c.priorite === priorite);
    }
    throw error;
  }
}

/**
 * Valide un contrat
 */
export async function validerContrat(action: ActionValidation): Promise<Contrat> {
  const response = await axios.post<Contrat>(`${API_BASE_URL}/${action.contratId}/valider`, {
    action: action.action,
    commentaire: action.commentaire,
    validateurId: action.validateurId,
  });
  return response.data;
}

/**
 * Rejette un contrat
 */
export async function rejeterContrat(action: ActionValidation): Promise<Contrat> {
  const response = await axios.post<Contrat>(`${API_BASE_URL}/${action.contratId}/rejeter`, {
    action: action.action,
    commentaire: action.commentaire,
    validateurId: action.validateurId,
  });
  return response.data;
}

/**
 * Actions en masse
 */
export async function bulkActionContrats(action: BulkAction): Promise<{ success: number; failed: number }> {
  const response = await axios.post<{ success: number; failed: number }>(
    `${API_BASE_URL}/bulk-action`,
    action
  );
  return response.data;
}

