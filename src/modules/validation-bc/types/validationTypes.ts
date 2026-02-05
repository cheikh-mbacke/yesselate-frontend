/**
 * Types TypeScript pour le module Validation-BC - Maître d'Ouvrage
 */

// ================================
// Types de base
// ================================

export type TypeDocument = "BC" | "FACTURE" | "AVENANT";

export type StatutDocument = "EN_ATTENTE" | "VALIDE" | "REJETE" | "URGENT";

export type PrioriteDocument = "NORMALE" | "ELEVEE" | "CRITIQUE";

export type Service = "ACHATS" | "FINANCE" | "JURIDIQUE" | "AUTRES";

// ================================
// Interfaces principales
// ================================

export interface DocumentValidation {
  id: string;
  numero: string;
  titre: string;
  description?: string;
  type: TypeDocument;
  statut: StatutDocument;
  priorite: PrioriteDocument;
  service: Service;
  demandeur: string;
  demandeurId?: string;
  validateur?: string;
  validateurId?: string;
  montant: number;
  devise?: string;
  dateCreation: string;
  dateValidation?: string;
  dateRejet?: string;
  dateEcheance?: string;
  delaiMoyen?: number; // en jours
  commentaire?: string;
  justificatifs?: string[];
  anomalies?: string[];
  projetId?: string;
  projetNom?: string;
  chantierId?: string;
  chantierNom?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface ValidationStats {
  totalDocuments: number;
  enAttente: number;
  valides: number;
  rejetes: number;
  urgents: number;
  tauxValidation: number; // en pourcentage
  delaiMoyen: number; // en jours
  anomalies: number;
  parType: Record<TypeDocument, number>;
  parStatut: Record<StatutDocument, number>;
  parService: Record<Service, number>;
  tendances?: {
    documents: number[];
    validations: number[];
    rejets: number[];
    dates: string[];
  };
}

export interface ValidationFiltres {
  types?: TypeDocument[];
  statuts?: StatutDocument[];
  services?: Service[];
  validateurs?: string[];
  demandeurs?: string[];
  projets?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  montantMin?: number;
  montantMax?: number;
  recherche?: string;
}

export interface Validateur {
  id: string;
  nom: string;
  service: Service;
  email?: string;
  telephone?: string;
  documentsEnCours: number;
  documentsValides: number;
  documentsRejetes: number;
  delaiMoyen: number;
  tauxValidation: number;
}

export interface RegleMetier {
  id: string;
  nom: string;
  description: string;
  typeDocument: TypeDocument;
  condition: string;
  action: string;
  active: boolean;
  priorite: PrioriteDocument;
}

// ================================
// Types pour la navigation
// ================================

export interface ValidationNavItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
  badge?: number;
  badgeType?: "default" | "warning" | "critical";
  children?: ValidationNavItem[];
}

