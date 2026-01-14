/**
 * Service API pour le module Centre de Commande – Gouvernance
 * Utilise Axios pour les appels API
 */

import axios from 'axios';
import type {
  GouvernanceFilters,
  GouvernanceStats,
  GouvernanceOverviewResponse,
  GouvernanceSyntheseResponse,
  ProjetGouvernance,
  BudgetGouvernance,
  JalonGouvernance,
  RisqueGouvernance,
  ValidationGouvernance,
  PointAttention,
  DecisionGouvernance,
  ArbitrageGouvernance,
  InstanceGouvernance,
  IndicateurConformite,
  AuditGouvernance,
  EngagementGouvernance,
  TendanceMensuelle,
  PaginatedResponse,
} from '../types/gouvernanceTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/gouvernance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================================
// Vue d'ensemble et statistiques
// ================================

export async function getGouvernanceOverview(
  params?: Partial<GouvernanceFilters>
): Promise<GouvernanceOverviewResponse> {
  try {
    const response = await apiClient.get<GouvernanceOverviewResponse>('/overview', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la vue d\'ensemble:', error);
    throw error;
  }
}

export async function getGouvernanceStats(
  params?: Partial<GouvernanceFilters>
): Promise<GouvernanceStats> {
  try {
    const response = await apiClient.get<GouvernanceStats>('/stats', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}

export async function getTendancesMensuelles(
  params?: Partial<GouvernanceFilters>
): Promise<TendanceMensuelle[]> {
  try {
    const response = await apiClient.get<TendanceMensuelle[]>('/tendances', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error);
    throw error;
  }
}

// ================================
// Synthèses
// ================================

export async function getSyntheseProjets(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ProjetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ProjetGouvernance>>('/synthese/projets', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la synthèse projets:', error);
    throw error;
  }
}

export async function getSyntheseBudget(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<BudgetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<BudgetGouvernance>>('/synthese/budget', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la synthèse budget:', error);
    throw error;
  }
}

export async function getSyntheseJalons(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<JalonGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<JalonGouvernance>>('/synthese/jalons', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la synthèse jalons:', error);
    throw error;
  }
}

export async function getSyntheseRisques(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<RisqueGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<RisqueGouvernance>>('/synthese/risques', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la synthèse risques:', error);
    throw error;
  }
}

export async function getSyntheseValidations(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ValidationGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ValidationGouvernance>>('/synthese/validations', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la synthèse validations:', error);
    throw error;
  }
}

// ================================
// Points d'attention
// ================================

export async function getPointsAttention(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des points d\'attention:', error);
    throw error;
  }
}

export async function getDepassementsBudget(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<BudgetGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<BudgetGouvernance>>('/attention/depassements-budget', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des dépassements budget:', error);
    throw error;
  }
}

export async function getRetardsCritiques(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<JalonGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<JalonGouvernance>>('/attention/retards-critiques', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des retards critiques:', error);
    throw error;
  }
}

export async function getRessourcesIndispo(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention/ressources-indispo', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des ressources indisponibles:', error);
    throw error;
  }
}

export async function getEscalades(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<PointAttention>> {
  try {
    const response = await apiClient.get<PaginatedResponse<PointAttention>>('/attention/escalades', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des escalades:', error);
    throw error;
  }
}

// ================================
// Arbitrages et décisions
// ================================

export async function getDecisionsValidees(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<DecisionGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<DecisionGouvernance>>('/arbitrages/decisions-validees', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des décisions validées:', error);
    throw error;
  }
}

export async function getArbitragesEnAttente(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<ArbitrageGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ArbitrageGouvernance>>('/arbitrages/en-attente', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des arbitrages en attente:', error);
    throw error;
  }
}

export async function getHistoriqueDecisions(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<DecisionGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<DecisionGouvernance>>('/arbitrages/historique', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des décisions:', error);
    throw error;
  }
}

// ================================
// Instances de coordination
// ================================

export async function getReunionsDG(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-dg', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions DG:', error);
    throw error;
  }
}

export async function getReunionsMOAMOE(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-moa-moe', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions MOA/MOE:', error);
    throw error;
  }
}

export async function getReunionsTransverses(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<InstanceGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<InstanceGouvernance>>('/instances/reunions-transverses', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions transverses:', error);
    throw error;
  }
}

// ================================
// Conformité et performance
// ================================

export async function getIndicateursConformite(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<IndicateurConformite>> {
  try {
    const response = await apiClient.get<PaginatedResponse<IndicateurConformite>>('/conformite/indicateurs', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des indicateurs de conformité:', error);
    throw error;
  }
}

export async function getAuditGouvernance(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<AuditGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<AuditGouvernance>>('/conformite/audit', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des audits:', error);
    throw error;
  }
}

export async function getSuiviEngagements(
  params?: Partial<GouvernanceFilters>
): Promise<PaginatedResponse<EngagementGouvernance>> {
  try {
    const response = await apiClient.get<PaginatedResponse<EngagementGouvernance>>('/conformite/engagements', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du suivi des engagements:', error);
    throw error;
  }
}

