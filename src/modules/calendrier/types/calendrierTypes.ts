/**
 * Types TypeScript pour le module Calendrier & Planification v3.0
 * Alignés avec le schéma SQL de la base de données
 */

// ================================
// Types de vue et période
// ================================

export type PeriodeVue = "semaine" | "mois" | "trimestre";
export type ModeVue = "gantt" | "calendrier" | "timeline";

// ================================
// Types de base (alignés avec le schéma SQL)
// ================================

/**
 * Chantier - Table: chantiers
 */
export interface Chantier {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  date_debut?: string | null; // DATE
  date_fin?: string | null; // DATE
  budget?: number | null; // NUMERIC(18,2)
  created_at?: string; // TIMESTAMP
}

/**
 * Jalon - Table: jalons
 */
export interface Jalon {
  id: number;
  chantier_id: number | null;
  libelle: string;
  type: "SLA" | "CONTRAT" | "INTERNE" | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  est_retard: boolean;
  est_sla_risque: boolean;
  statut: "À venir" | "En cours" | "Terminé" | null;
  created_at?: string; // TIMESTAMP
}

/**
 * Événement - Table: evenements
 */
export interface EvenementCalendrier {
  id: number;
  type: "EVENEMENT" | "REUNION_PROJET" | "REUNION_DECISIONNELLE" | null;
  titre: string | null;
  description?: string | null;
  date_debut: string | null; // TIMESTAMP
  date_fin: string | null; // TIMESTAMP
  chantier_id: number | null;
  created_at?: string; // TIMESTAMP
}

/**
 * Absence - Table: absences
 */
export interface Absence {
  id: number;
  user_id: number;
  chantier_id: number | null;
  type: "CONGÉ" | "MISSION" | "ABSENCE" | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  motif?: string | null;
  created_at?: string; // TIMESTAMP
  // Champs calculés/joins (non dans la table)
  employe_nom?: string;
  equipe_id?: number | null;
  statut?: "DEMANDE" | "VALIDE" | "REFUSE"; // À gérer côté backend
}

/**
 * Affectation ressource - Table: affectations
 */
export interface Affectation {
  id: number;
  user_id: number;
  chantier_id: number;
  role: string | null;
  date_debut: string | null; // DATE
  date_fin: string | null; // DATE
  est_suralloue: boolean;
  created_at?: string; // TIMESTAMP
  // Champs calculés/joins
  user_nom?: string;
  chantier_nom?: string;
}

/**
 * Statut de synchronisation - Table: calendrier_sync
 */
export interface SyncStatus {
  id?: number;
  module: "DEMANDES" | "VALIDATIONS" | "PROJETS" | "RH";
  statut: "OK" | "WARNING" | "ERROR";
  derniere_sync: string; // TIMESTAMP
  created_at?: string; // TIMESTAMP
  message?: string; // Champ calculé côté frontend
}

/**
 * Alerte calendrier - Table: calendrier_alertes
 */
export interface CalendrierAlerte {
  id: number;
  type: "SLA_RISQUE" | "RETARD" | "SURALLOCATION";
  jalon_id: number | null;
  chantier_id: number | null;
  user_id: number | null;
  date_declenchement: string; // TIMESTAMP
  est_resolue: boolean;
  resolue_at: string | null; // TIMESTAMP
  created_at?: string; // TIMESTAMP
  // Champs calculés/joins
  jalon_libelle?: string;
  chantier_nom?: string;
  user_nom?: string;
}

// ================================
// Types pour les filtres
// ================================

export interface CalendrierFilters {
  periode: PeriodeVue;
  vue: ModeVue;
  chantier_id?: number | null;
  equipe_id?: number | null;
  date_debut?: string;
  date_fin?: string;
}

// ================================
// Types pour les stats/badges
// ================================

export interface CalendrierStats {
  jalons_at_risk_count: number;
  jalons_retard_count: number;
  jalons_total_count: number;
  retards_detectes_count: number;
  sur_allocation_ressources_count: number;
}

// ================================
// Types pour les réponses API
// ================================

export interface CalendrierOverviewResponse {
  jalons: Jalon[];
  evenements: EvenementCalendrier[];
  absences: Absence[];
  chantiers: Chantier[];
  stats: CalendrierStats;
}

export interface JalonsResponse {
  jalons: Jalon[];
  total: number;
}

export interface SyncStatusResponse {
  statuts: SyncStatus[];
}

export interface AffectationsResponse {
  affectations: Affectation[];
  total: number;
}

export interface CalendrierAlertesResponse {
  alertes: CalendrierAlerte[];
  total: number;
}

