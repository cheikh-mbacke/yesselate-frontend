/**
 * Service API pour le module Calendrier & Planification
 * Utilise Axios pour les appels API
 */

import axios from 'axios';
import type {
  CalendrierFilters,
  CalendrierOverviewResponse,
  JalonsResponse,
  SyncStatusResponse,
  AffectationsResponse,
  CalendrierAlertesResponse,
  Jalon,
  EvenementCalendrier,
  Absence,
  Affectation,
  CalendrierAlerte,
} from '../types/calendrierTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/calendrier`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================================
// Vue d'ensemble
// ================================

export async function getCalendrierOverview(
  params?: Partial<CalendrierFilters>
): Promise<CalendrierOverviewResponse> {
  try {
    const response = await apiClient.get<CalendrierOverviewResponse>('/overview', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la vue d\'ensemble:', error);
    throw error;
  }
}

// ================================
// Jalons
// ================================

export async function getJalons(
  params?: {
    type?: 'SLA' | 'CONTRAT' | 'INTERNE';
    chantier_id?: number;
    est_retard?: boolean;
    est_sla_risque?: boolean;
  }
): Promise<JalonsResponse> {
  try {
    const response = await apiClient.get<JalonsResponse>('/jalons', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons:', error);
    throw error;
  }
}

export async function getJalonsSLARisque(): Promise<Jalon[]> {
  try {
    const response = await getJalons({ est_sla_risque: true });
    return response.jalons;
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons SLA à risque:', error);
    throw error;
  }
}

export async function getJalonsRetards(): Promise<Jalon[]> {
  try {
    const response = await getJalons({ est_retard: true });
    return response.jalons;
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons en retard:', error);
    throw error;
  }
}

export async function getJalonsAVenir(
  date_debut?: string,
  date_fin?: string
): Promise<Jalon[]> {
  try {
    const response = await apiClient.get<JalonsResponse>('/jalons/a-venir', {
      params: { date_debut, date_fin },
    });
    return response.data.jalons;
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons à venir:', error);
    throw error;
  }
}

// ================================
// Événements
// ================================

export async function getEvenements(
  params?: {
    type?: 'EVENEMENT' | 'REUNION_PROJET' | 'REUNION_DECISIONNELLE';
    chantier_id?: number;
    date_debut?: string;
    date_fin?: string;
  }
): Promise<EvenementCalendrier[]> {
  try {
    const response = await apiClient.get<EvenementCalendrier[]>('/evenements', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
}

export async function getEvenementsInternes(): Promise<EvenementCalendrier[]> {
  return getEvenements({ type: 'EVENEMENT' });
}

export async function getReunionsProjets(
  chantier_id?: number
): Promise<EvenementCalendrier[]> {
  return getEvenements({ type: 'REUNION_PROJET', chantier_id });
}

export async function getReunionsDecisionnelles(): Promise<EvenementCalendrier[]> {
  return getEvenements({ type: 'REUNION_DECISIONNELLE' });
}

// ================================
// Absences
// ================================

export async function getAbsences(
  params?: {
    user_id?: number;
    equipe_id?: number;
    chantier_id?: number;
    date_debut?: string;
    date_fin?: string;
  }
): Promise<Absence[]> {
  try {
    const response = await apiClient.get<Absence[]>('/absences', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    throw error;
  }
}

export async function getAbsencesGlobales(): Promise<Absence[]> {
  return getAbsences();
}

export async function getAbsencesParEquipe(equipe_id: number): Promise<Absence[]> {
  return getAbsences({ equipe_id });
}

export async function getAbsencesParChantier(chantier_id: number): Promise<Absence[]> {
  return getAbsences({ chantier_id });
}

// ================================
// Synchronisation
// ================================

export async function getSyncStatus(): Promise<SyncStatusResponse> {
  try {
    const response = await apiClient.get<SyncStatusResponse>('/sync-status');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de synchronisation:', error);
    throw error;
  }
}

// ================================
// Affectations ressources
// ================================

export async function getAffectations(
  params?: {
    user_id?: number;
    chantier_id?: number;
    est_suralloue?: boolean;
    date_debut?: string;
    date_fin?: string;
  }
): Promise<AffectationsResponse> {
  try {
    const response = await apiClient.get<AffectationsResponse>('/affectations', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    throw error;
  }
}

export async function getSurAllocations(): Promise<Affectation[]> {
  try {
    const response = await getAffectations({ est_suralloue: true });
    return response.affectations;
  } catch (error) {
    console.error('Erreur lors de la récupération des sur-allocations:', error);
    throw error;
  }
}

// ================================
// Alertes calendrier
// ================================

export async function getCalendrierAlertes(
  params?: {
    type?: 'SLA_RISQUE' | 'RETARD' | 'SURALLOCATION';
    jalon_id?: number;
    chantier_id?: number;
    user_id?: number;
    est_resolue?: boolean;
  }
): Promise<CalendrierAlertesResponse> {
  try {
    const response = await apiClient.get<CalendrierAlertesResponse>('/alertes', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    throw error;
  }
}

export async function getAlertesNonResolues(): Promise<CalendrierAlerte[]> {
  try {
    const response = await getCalendrierAlertes({ est_resolue: false });
    return response.alertes;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes non résolues:', error);
    throw error;
  }
}

