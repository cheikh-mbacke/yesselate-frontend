/**
 * Types TypeScript pour le module Alertes & Risques
 */

// ================================
// Types de base
// ================================

export type AlerteSeverite = 'critical' | 'warning' | 'info' | 'success';

export type AlerteStatut = 
  | 'pending'      // En attente
  | 'acknowledged' // Acquittée
  | 'in_progress'   // En cours de traitement
  | 'resolved'      // Résolue
  | 'escalated'     // Escaladée
  | 'ignored'       // Ignorée
  | 'recurring';    // Récurrente

export type AlerteTypologie =
  | 'paiement-bloque'
  | 'validation-bloquee'
  | 'justificatif-manquant'
  | 'risque-financier'
  | 'delai-approchant'
  | 'document-incomplet'
  | 'risque-mineur'
  | 'sla-validation-bc'
  | 'sla-engagement-budgetaire'
  | 'sla-paiement-fournisseur'
  | 'absence-responsable'
  | 'chaine-validation-interrompue'
  | 'erreur-systeme';

export type AlerteResolutionType =
  | 'manual'      // Résolution manuelle
  | 'automatic'   // Résolution automatique
  | 'ai-assisted'; // Résolution assistée IA

export type SLAType =
  | 'validation-bc'
  | 'engagement-budgetaire'
  | 'paiement-fournisseur';

// ================================
// Interfaces principales
// ================================

export interface Alerte {
  id: string;
  titre: string;
  description: string;
  severite: AlerteSeverite;
  statut: AlerteStatut;
  typologie: AlerteTypologie;
  bureau?: string;
  projet?: string;
  responsable?: string;
  responsableId?: string;
  dateCreation: Date;
  dateModification: Date;
  dateEcheance?: Date;
  dateResolution?: Date;
  dateAcquittement?: Date;
  dateEscalade?: Date;
  slaType?: SLAType;
  slaDelai?: number; // en heures
  slaDepasse?: boolean;
  montant?: number;
  devise?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  notes?: AlerteNote[];
  historique?: AlerteHistorique[];
  resolutionType?: AlerteResolutionType;
  escalatedTo?: string;
  ignoredReason?: string;
  recurringPattern?: string;
}

export interface AlerteNote {
  id: string;
  auteur: string;
  auteurId: string;
  contenu: string;
  dateCreation: Date;
  type: 'note' | 'comment' | 'resolution' | 'escalation';
}

export interface AlerteHistorique {
  id: string;
  date: Date;
  action: string;
  utilisateur: string;
  utilisateurId: string;
  details?: Record<string, unknown>;
}

export interface AlerteStats {
  total: number;
  parSeverite: Record<AlerteSeverite, number>;
  parStatut: Record<AlerteStatut, number>;
  parTypologie: Record<AlerteTypologie, number>;
  parBureau: Record<string, number>;
  parResponsable: Record<string, number>;
  slaDepasses: number;
  tempsMoyenResolution: number; // en heures
  tempsMoyenReponse: number; // en heures
  tauxResolution: number; // pourcentage
  tauxAcquittement: number; // pourcentage
}

export interface AlerteRegle {
  id: string;
  nom: string;
  description: string;
  typologie: AlerteTypologie;
  seuilFinancier?: {
    montant: number;
    devise: string;
    condition: 'superieur' | 'inferieur' | 'egal';
  };
  delaiSLA?: {
    heures: number;
    type: SLAType;
  };
  typologieCritique: boolean;
  active: boolean;
  dateCreation: Date;
  dateModification: Date;
  creePar: string;
  modifiePar?: string;
}

export interface AlerteEscalade {
  id: string;
  alerteId: string;
  escaladeVers: string;
  raison: string;
  priorite: 'low' | 'medium' | 'high' | 'critical';
  dateEscalade: Date;
  dateResolution?: Date;
  statut: 'pending' | 'acknowledged' | 'resolved' | 'ignored';
}

// ================================
// Types pour la navigation
// ================================

export interface AlerteNavigationNode {
  id: string;
  label: string;
  icon?: string;
  route: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: AlerteNavigationNode[];
}

// ================================
// Types pour les filtres
// ================================

export interface AlerteFiltres {
  severites?: AlerteSeverite[];
  statuts?: AlerteStatut[];
  typologies?: AlerteTypologie[];
  bureaux?: string[];
  responsables?: string[];
  projets?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  montantMin?: number;
  montantMax?: number;
  slaDepasse?: boolean;
  tags?: string[];
  recherche?: string;
}

// ================================
// Types pour les exports
// ================================

export type AlerteExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export interface AlerteExportOptions {
  format: AlerteExportFormat;
  filtres?: AlerteFiltres;
  colonnes?: string[];
  includeNotes?: boolean;
  includeHistorique?: boolean;
}

