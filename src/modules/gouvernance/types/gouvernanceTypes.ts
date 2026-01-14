/**
 * Types TypeScript pour le module Centre de Commande – Gouvernance
 * Types pour les données, filtres, statistiques et navigation
 */

// ================================
// Types de période et vue
// ================================

export type PeriodeGouvernance = 'week' | 'month' | 'quarter';
export type VueGouvernance = 'dashboard' | 'list' | 'matrix' | 'timeline';

// ================================
// Types de domaine et section
// ================================

export type GouvernanceDomain = 
  | 'strategic' 
  | 'attention' 
  | 'arbitrages' 
  | 'instances' 
  | 'compliance';

export type GouvernanceSection =
  | 'executive-dashboard'
  | 'tendances'
  | 'synthese-projets'
  | 'synthese-budget'
  | 'synthese-jalons'
  | 'synthese-risques'
  | 'synthese-validations'
  | 'depassements-budget'
  | 'retards-critiques'
  | 'ressources-indispo'
  | 'escalades'
  | 'decisions-validees'
  | 'arbitrages-en-attente'
  | 'historique-decisions'
  | 'reunions-dg'
  | 'reunions-moa-moe'
  | 'reunions-transverses'
  | 'indicateurs-conformite'
  | 'audit-gouvernance'
  | 'suivi-engagements';

// ================================
// Types de filtres
// ================================

export interface GouvernanceFilters {
  periode: PeriodeGouvernance;
  vue: VueGouvernance;
  domain?: GouvernanceDomain;
  section?: GouvernanceSection;
  projet_id?: number | null;
  date_debut?: string | null;
  date_fin?: string | null;
  search?: string;
}

// ================================
// Types de statistiques (KPI)
// ================================

export interface GouvernanceStats {
  projets_actifs: number;
  budget_consomme_pourcent: number;
  jalons_respectes_pourcent: number;
  risques_critiques: number;
  validations_en_attente: number;
  budget_total: number;
  budget_consomme: number;
  jalons_total: number;
  jalons_valides: number;
  jalons_retard: number;
  exposition_financiere: number;
  escalades_actives: number;
  decisions_en_attente: number;
  taux_conformite: number;
  last_updated?: string;
}

// ================================
// Types de projets
// ================================

export interface ProjetGouvernance {
  id: number;
  nom: string;
  code?: string;
  statut: 'on-track' | 'at-risk' | 'late';
  budget_total: number;
  budget_consomme: number;
  budget_pourcent: number;
  jalons_total: number;
  jalons_valides: number;
  jalons_retard: number;
  retard_jours?: number;
  risques_count: number;
  risques_critiques_count: number;
  exposition_financiere: number;
}

// ================================
// Types de budget
// ================================

export interface BudgetGouvernance {
  projet_id: number;
  projet_nom: string;
  budget_initial: number;
  budget_consomme: number;
  budget_engage: number;
  budget_restant: number;
  pourcent_consomme: number;
  depassement?: number;
  depassement_pourcent?: number;
  tendance: 'up' | 'down' | 'stable';
}

// ================================
// Types de jalons
// ================================

export interface JalonGouvernance {
  id: number;
  projet_id: number;
  projet_nom: string;
  libelle: string;
  type: 'SLA' | 'CONTRAT' | 'INTERNE';
  date_prevue: string;
  date_reelle?: string;
  est_retard: boolean;
  retard_jours?: number;
  est_sla_risque: boolean;
  statut: 'À venir' | 'En cours' | 'Terminé';
}

// ================================
// Types de risques
// ================================

export interface RisqueGouvernance {
  id: number;
  projet_id: number;
  projet_nom: string;
  titre: string;
  description?: string;
  probabilite: 'low' | 'medium' | 'high';
  impact: 'financial' | 'planning' | 'reputation' | 'quality';
  exposition: number;
  exposition_type: 'financial' | 'days' | 'reputation';
  statut: 'ouvert' | 'mitige' | 'ferme';
  date_detection: string;
}

// ================================
// Types de validations
// ================================

export interface ValidationGouvernance {
  id: number;
  projet_id: number;
  projet_nom: string;
  type: 'BC' | 'AVENANT' | 'AUTORISATION' | 'AUTRE';
  reference: string;
  titre: string;
  statut: 'en-attente' | 'valide' | 'rejete' | 'bloque';
  date_demande: string;
  date_echeance?: string;
  jours_attente?: number;
  montant?: number;
  bloqueur?: boolean;
}

// ================================
// Types de points d'attention
// ================================

export interface PointAttention {
  id: number;
  type: 'depassement-budget' | 'retard-critique' | 'ressource-indispo' | 'escalade';
  titre: string;
  description?: string;
  projet_id?: number;
  projet_nom?: string;
  impact: string;
  priorite: 'low' | 'medium' | 'high' | 'critical';
  date_detection: string;
  statut: 'ouvert' | 'en-cours' | 'resolu';
}

// ================================
// Types de décisions et arbitrages
// ================================

export interface DecisionGouvernance {
  id: number;
  reference: string;
  titre: string;
  description?: string;
  type: 'budget' | 'planning' | 'contract' | 'resource' | 'autre';
  statut: 'en-attente' | 'valide' | 'rejete';
  impact: 'low' | 'medium' | 'high';
  responsable: string;
  date_demande: string;
  date_echeance?: string;
  date_decision?: string;
  montant?: number;
  projet_id?: number;
  projet_nom?: string;
}

export interface ArbitrageGouvernance {
  id: number;
  reference: string;
  titre: string;
  description?: string;
  type: 'budget' | 'planning' | 'resource' | 'contract';
  statut: 'en-attente' | 'valide' | 'rejete';
  niveau: 1 | 2 | 3;
  demandeur: string;
  date_demande: string;
  date_echeance?: string;
  impact_financier?: number;
  impact_planning?: number;
  projet_id?: number;
  projet_nom?: string;
}

// ================================
// Types d'instances
// ================================

export interface InstanceGouvernance {
  id: number;
  nom: string;
  type: 'DG' | 'MOA-MOE' | 'TRANSVERSE';
  date: string;
  heure?: string;
  participants_count: number;
  participants?: string[];
  ordre_du_jour?: string[];
  decisions_count?: number;
  statut: 'programmee' | 'en-cours' | 'terminee';
  compte_rendu_id?: number;
}

// ================================
// Types de conformité
// ================================

export interface IndicateurConformite {
  id: number;
  nom: string;
  type: 'SLA' | 'CONTRAT' | 'AUDIT' | 'ENGAGEMENT';
  valeur: number;
  valeur_cible: number;
  pourcent: number;
  statut: 'conforme' | 'non-conforme' | 'a-risque';
  date_mesure: string;
  tendance: 'up' | 'down' | 'stable';
}

export interface AuditGouvernance {
  id: number;
  reference: string;
  type: 'interne' | 'externe' | 'conformite';
  date: string;
  statut: 'programme' | 'en-cours' | 'termine';
  resultat?: 'conforme' | 'non-conforme' | 'a-ameliorer';
  non_conformites_count?: number;
  actions_correctives_count?: number;
}

export interface EngagementGouvernance {
  id: number;
  type: 'budget' | 'delai' | 'qualite' | 'autre';
  reference: string;
  description: string;
  montant?: number;
  date_engagement: string;
  date_echeance?: string;
  statut: 'en-cours' | 'respecte' | 'non-respecte';
  projet_id?: number;
  projet_nom?: string;
}

// ================================
// Types de tendances
// ================================

export interface TendanceMensuelle {
  mois: string;
  projets_actifs: number;
  budget_consomme: number;
  jalons_valides: number;
  risques_critiques: number;
  validations_en_attente: number;
  taux_conformite: number;
}

// ================================
// Types de réponses API
// ================================

export interface GouvernanceOverviewResponse {
  stats: GouvernanceStats;
  projets: ProjetGouvernance[];
  tendances: TendanceMensuelle[];
  points_attention: PointAttention[];
}

export interface GouvernanceSyntheseResponse {
  projets: ProjetGouvernance[];
  budget: BudgetGouvernance[];
  jalons: JalonGouvernance[];
  risques: RisqueGouvernance[];
  validations: ValidationGouvernance[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

