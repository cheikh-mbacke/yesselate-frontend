/**
 * Types TypeScript pour le module Validation-Contrats – Maître d'Ouvrage
 * Types pour les données, filtres, statistiques et navigation
 */

import type { LucideIcon } from 'lucide-react';

// ================================
// Types de base
// ================================

export type StatutContrat = 
  | 'EN_ATTENTE' 
  | 'URGENT' 
  | 'VALIDE' 
  | 'REJETE' 
  | 'NEGOCIATION';

export type TypeContrat = 
  | 'FOURNITURE' 
  | 'TRAVAUX' 
  | 'PRESTATION' 
  | 'SERVICE' 
  | 'AUTRE';

export type PrioriteContrat = 
  | 'CRITICAL' 
  | 'MEDIUM' 
  | 'LOW';

export type PeriodeContrat = 
  | 'week' 
  | 'month' 
  | 'quarter' 
  | 'year' 
  | 'custom';

// ================================
// Interfaces principales
// ================================

export interface Contrat {
  id: string;
  numero: string; // Ex: CTR-2024-001
  type: TypeContrat;
  statut: StatutContrat;
  priorite: PrioriteContrat;
  titre: string;
  description: string;
  entreprise: string;
  entrepriseId?: string;
  montant: number;
  devise: string; // Ex: FCFA
  dateCreation: string;
  dateEcheance: string;
  dureeMois: number;
  dateValidation?: string;
  dateRejet?: string;
  validateur?: string;
  validateurId?: string;
  projetId?: string;
  projetNom?: string;
  service?: string;
  bureau?: string;
  clausesStatus?: ClauseStatus[];
  documents?: DocumentContrat[];
  commentaires?: CommentaireContrat[];
  historique?: HistoriqueValidation[];
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface ClauseStatus {
  id: string;
  nom: string;
  statut: 'VALIDE' | 'EN_ATTENTE' | 'REJETE' | 'NEGOCIATION';
  commentaire?: string;
}

export interface DocumentContrat {
  id: string;
  nom: string;
  type: string;
  url?: string;
  dateUpload: string;
  statut: 'VALIDE' | 'EN_ATTENTE' | 'MANQUANT';
}

export interface CommentaireContrat {
  id: string;
  auteur: string;
  auteurId: string;
  date: string;
  texte: string;
  type: 'COMMENTAIRE' | 'VALIDATION' | 'REJET' | 'NEGOCIATION';
}

export interface HistoriqueValidation {
  id: string;
  date: string;
  action: 'CREATION' | 'VALIDATION' | 'REJET' | 'MODIFICATION' | 'NEGOCIATION';
  utilisateur: string;
  utilisateurId: string;
  commentaire?: string;
}

// ================================
// Types de statistiques (KPI)
// ================================

export interface ContratsStats {
  total: number;
  enAttente: number;
  urgents: number;
  valides: number;
  rejetes: number;
  negociation: number;
  tauxValidation: number; // en pourcentage
  montantTotal: number;
  montantEnAttente: number;
  montantValides: number;
  delaiMoyenValidation: number; // en jours
  parType: Record<TypeContrat, number>;
  parStatut: Record<StatutContrat, number>;
  parPriorite: Record<PrioriteContrat, number>;
  tendances?: TendancesContrats;
  lastUpdated?: string;
}

export interface TendancesContrats {
  dates: string[];
  total: number[];
  enAttente: number[];
  valides: number[];
  rejetes: number[];
  tauxValidation: number[];
}

// ================================
// Types de filtres
// ================================

export interface ContratsFilters {
  periode: PeriodeContrat;
  dateDebut?: string | null;
  dateFin?: string | null;
  statuts?: StatutContrat[];
  types?: TypeContrat[];
  priorites?: PrioriteContrat[];
  montantMin?: number;
  montantMax?: number;
  dureeMin?: number;
  dureeMax?: number;
  projets?: string[];
  entreprises?: string[];
  services?: string[];
  bureaux?: string[];
  validateurs?: string[];
  recherche?: string;
}

// ================================
// Types pour la navigation
// ================================

export type ContratsMainCategory = 
  | 'overview'
  | 'statut'
  | 'priorite'
  | 'analyse';

export type ContratsSubCategory = 
  | 'indicateurs'
  | 'stats'
  | 'trends'
  | 'en-attente'
  | 'urgents'
  | 'valides'
  | 'rejetes'
  | 'negociation'
  | 'critiques'
  | 'moyens'
  | 'faible-priorite'
  | 'analytics'
  | 'vue-financiere'
  | 'documents'
  | 'regles-metier';

export interface ContratsNavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  route: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: ContratsNavItem[];
}

// ================================
// Types pour les réponses API
// ================================

export interface ContratsResponse {
  contrats: Contrat[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ContratsStatsResponse {
  stats: ContratsStats;
  periode: PeriodeContrat;
}

export interface ContratsTendancesResponse {
  tendances: TendancesContrats;
  periode: PeriodeContrat;
}

// ================================
// Types pour les actions
// ================================

export interface ActionValidation {
  contratId: string;
  action: 'VALIDER' | 'REJETER' | 'METTRE_EN_NEGOCIATION' | 'ARCHIVER';
  commentaire?: string;
  validateurId: string;
}

export interface BulkAction {
  contratIds: string[];
  action: 'VALIDER' | 'REJETER' | 'ARCHIVER' | 'EXPORTER';
  commentaire?: string;
  validateurId: string;
}

