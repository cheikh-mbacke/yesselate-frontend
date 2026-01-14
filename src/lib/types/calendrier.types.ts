/**
 * Types pour le module Calendrier & Planification
 * Module de pilotage temporel transversal
 */

// ================================
// Types d'onglets (ancien système - à déprécier)
// ================================

export type CalendrierTab =
  | 'vue-ensemble'
  | 'sla-retards'
  | 'conflits'
  | 'echeances-operationnelles'
  | 'jalons-projets'
  | 'rh-absences'
  | 'instances-reunions'
  | 'planification-ia';

// ================================
// Navigation hiérarchique (nouveau système)
// ================================

// Niveau 1 - Domaines principaux
export type CalendrierDomain =
  | 'overview'        // Vue d'ensemble
  | 'milestones'      // Jalons & Contrats
  | 'absences'        // Absences & Congés
  | 'events';         // Événements & Réunions

// Niveau 2 - Sous-domaines
export type CalendrierSection = string | null;

// Niveau 3 - Vues spécifiques
export type CalendrierView = string | null;

// État de navigation
export interface CalendrierNavigationState {
  domain: CalendrierDomain;
  section: CalendrierSection;
  view: CalendrierView;
  period?: 'week' | 'month' | 'quarter';
}

// Filtres contextuels
export interface CalendrierContextFilters {
  chantierId?: string | null;
  teamId?: string | null;
  eventType?: string | null;
}

// ================================
// Types de base
// ================================

export type Criticite = 'critique' | 'majeur' | 'mineur';
export type StatutSLA = 'a-jour' | 'en-risque' | 'en-retard' | 'depasse';
export type TypeConflit = 'ressources' | 'reunions' | 'jalons' | 'validations' | 'missions';
export type TypeEcheance =
  | 'demande'
  | 'validation-bc'
  | 'validation-facture'
  | 'validation-contrat'
  | 'validation-paiement'
  | 'dossier-bloque'
  | 'substitution'
  | 'arbitrage'
  | 'ticket-client'
  | 'recouvrement'
  | 'litige';
export type ModuleSource =
  | 'demandes'
  | 'validation-bc'
  | 'validation-factures'
  | 'validation-contrats'
  | 'validation-paiements'
  | 'blocked'
  | 'substitution'
  | 'arbitrages-vivants'
  | 'tickets-clients'
  | 'recouvrements'
  | 'litiges'
  | 'projets-en-cours'
  | 'employes'
  | 'missions'
  | 'delegations'
  | 'conferences'
  | 'echanges-structures'
  | 'messages-externes';

// ================================
// SLA & Retards
// ================================

export interface SLA {
  id: string;
  type: TypeEcheance;
  moduleSource: ModuleSource;
  elementId: string;
  elementLabel: string;
  echeancePrevue: string; // ISO date
  echeanceReelle?: string; // ISO date
  retard?: number; // en jours
  impact: Criticite;
  statut: StatutSLA;
  responsable?: string;
  bureau?: string;
  lienModule?: string; // URL vers le module source
}

// ================================
// Conflits
// ================================

export interface Conflit {
  id: string;
  type: TypeConflit;
  elements: {
    id: string;
    label: string;
    type: string;
    date: string;
    moduleSource: ModuleSource;
  }[];
  dates: {
    start: string;
    end: string;
  };
  impact: Criticite;
  suggestions?: SuggestionResolution[];
  statut: 'actif' | 'resolu' | 'ignore';
}

export interface SuggestionResolution {
  id: string;
  type: 'deplacer' | 'fusionner' | 'desassigner' | 'arbitrer';
  description: string;
  nouveauCreneau?: {
    start: string;
    end: string;
  };
  elementId?: string;
  impactEstime: Criticite;
}

// ================================
// Échéances opérationnelles
// ================================

export interface EcheanceOperationnelle {
  id: string;
  type: TypeEcheance;
  moduleSource: ModuleSource;
  elementId: string;
  elementLabel: string;
  date: string; // ISO date
  statut: 'a-traiter' | 'en-cours' | 'termine' | 'en-retard';
  criticite: Criticite;
  responsable?: string;
  bureau?: string;
  lienModule?: string;
}

// ================================
// Jalons Projets
// ================================

export interface JalonProjet {
  id: string;
  projetId: string;
  projetLabel: string;
  jalonLabel: string;
  datePrevue: string; // ISO date
  dateReelle?: string; // ISO date
  statut: 'a-venir' | 'en-cours' | 'termine' | 'en-retard';
  impact: Criticite;
  bloquant: boolean;
  bureau?: string;
  lienProjet?: string;
}

// ================================
// RH & Absences
// ================================

export interface Absence {
  id: string;
  employeId: string;
  employeNom: string;
  bureau?: string;
  type: 'conges' | 'arret-maladie' | 'formation' | 'mission' | 'delegation';
  dateDebut: string; // ISO date
  dateFin: string; // ISO date
  impact?: {
    validations: number;
    reunions: number;
    missions: number;
  };
}

export interface Mission {
  id: string;
  employeId: string;
  employeNom: string;
  bureau?: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  impact?: {
    reunions: number;
    validations: number;
  };
}

export interface Delegation {
  id: string;
  delegantId: string;
  delegantNom: string;
  delegueId: string;
  delegueNom: string;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
}

// ================================
// Instances & Réunions
// ================================

export interface InstanceReunion {
  id: string;
  type: 'conference' | 'reunion-projet' | 'instance-crise' | 'echange-structure' | 'message-externe';
  titre: string;
  date: string; // ISO date
  dateFin?: string;
  statut: 'planifiee' | 'terminee' | 'reportee' | 'annulee' | 'en-retard';
  participants?: string[];
  moduleSource: ModuleSource;
  lienModule?: string;
  critique: boolean;
}

// ================================
// Planification IA
// ================================

export interface SuggestionIA {
  id: string;
  type: 'creneau-optimal' | 'replanification' | 'regroupement' | 'reallocation';
  description: string;
  elementIds: string[];
  nouveauCreneau?: {
    start: string;
    end: string;
  };
  benefices?: string[];
  impactEstime: Criticite;
  statut: 'en-attente' | 'accepte' | 'refuse' | 'ignore';
}

export interface AnalyseCharge {
  personneId: string;
  personneNom: string;
  periode: {
    start: string;
    end: string;
  };
  charge: number; // nombre d'événements
  disponibilite: number; // pourcentage
  surcharge: boolean;
}

// ================================
// KPIs Vue d'ensemble
// ================================

export interface KPICalendrier {
  evenementsAujourdhui: number;
  evenementsCetteSemaine: number;
  retardsSLA: number;
  conflitsActifs: number;
  evenementsTerminesAujourdhui: number;
  totalEvenementsCeMois: number;
}

// ================================
// Filtres
// ================================

export interface FiltresCalendrier {
  periode?: {
    start: string;
    end: string;
  };
  module?: ModuleSource[];
  bureau?: string[];
  criticite?: Criticite[];
  statut?: string[];
}

// ================================
// Synchronisation
// ================================

export interface StatutSynchronisation {
  module: ModuleSource;
  etat: 'synchronise' | 'en-cours' | 'erreur';
  derniereMiseAJour?: string;
  elementsSynchronises?: number;
  erreur?: string;
}

