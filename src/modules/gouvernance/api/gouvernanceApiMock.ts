/**
 * Données mockées pour le module Gouvernance
 * Utilisées en développement quand les endpoints backend ne sont pas disponibles
 */

import type {
  GouvernanceStats,
  GouvernanceOverviewResponse,
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

// ================================
// Données mockées - Statistiques
// ================================

export const mockStats: GouvernanceStats = {
  projets_actifs: 24,
  budget_consomme_pourcent: 67,
  jalons_respectes_pourcent: 90,
  risques_critiques: 3,
  validations_en_attente: 12,
  budget_total: 18700000,
  budget_consomme: 12529000,
  jalons_total: 156,
  jalons_valides: 151,
  jalons_retard: 5,
  exposition_financiere: 1650000,
  escalades_actives: 3,
  decisions_en_attente: 5,
  taux_conformite: 94,
  last_updated: new Date().toISOString(),
};

// ================================
// Données mockées - Projets
// ================================

export const mockProjets: ProjetGouvernance[] = [
  {
    id: 1,
    nom: 'Projet Alpha - Tours Horizon',
    code: 'ALPHA-2024',
    statut: 'at-risk',
    budget_total: 12500000,
    budget_consomme: 8500000,
    budget_pourcent: 68,
    jalons_total: 45,
    jalons_valides: 40,
    jalons_retard: 5,
    retard_jours: 12,
    risques_count: 8,
    risques_critiques_count: 2,
    exposition_financiere: 450000,
  },
  {
    id: 2,
    nom: 'Projet Beta - Centre Commercial',
    code: 'BETA-2024',
    statut: 'on-track',
    budget_total: 8200000,
    budget_consomme: 4920000,
    budget_pourcent: 60,
    jalons_total: 32,
    jalons_valides: 32,
    jalons_retard: 0,
    risques_count: 3,
    risques_critiques_count: 0,
    exposition_financiere: 0,
  },
  {
    id: 3,
    nom: 'Projet Gamma - Résidence Verte',
    code: 'GAMMA-2024',
    statut: 'late',
    budget_total: 5800000,
    budget_consomme: 4060000,
    budget_pourcent: 70,
    jalons_total: 28,
    jalons_valides: 23,
    jalons_retard: 5,
    retard_jours: 32,
    risques_count: 5,
    risques_critiques_count: 1,
    exposition_financiere: 150000,
  },
  {
    id: 4,
    nom: 'Projet Delta - Infrastructure',
    code: 'DELTA-2024',
    statut: 'on-track',
    budget_total: 15000000,
    budget_consomme: 9000000,
    budget_pourcent: 60,
    jalons_total: 51,
    jalons_valides: 51,
    jalons_retard: 0,
    risques_count: 2,
    risques_critiques_count: 0,
    exposition_financiere: 0,
  },
];

// ================================
// Données mockées - Budget
// ================================

export const mockBudgets: BudgetGouvernance[] = [
  {
    projet_id: 1,
    projet_nom: 'Projet Alpha - Tours Horizon',
    budget_initial: 12500000,
    budget_consomme: 8500000,
    budget_engage: 9000000,
    budget_restant: 3500000,
    pourcent_consomme: 68,
    depassement: 0,
    depassement_pourcent: 0,
    tendance: 'stable',
  },
  {
    projet_id: 2,
    projet_nom: 'Projet Beta - Centre Commercial',
    budget_initial: 8200000,
    budget_consomme: 4920000,
    budget_engage: 5000000,
    budget_restant: 3200000,
    pourcent_consomme: 60,
    depassement: 0,
    depassement_pourcent: 0,
    tendance: 'down',
  },
  {
    projet_id: 3,
    projet_nom: 'Projet Gamma - Résidence Verte',
    budget_initial: 5800000,
    budget_consomme: 4060000,
    budget_engage: 4200000,
    budget_restant: 1600000,
    pourcent_consomme: 70,
    depassement: 0,
    depassement_pourcent: 0,
    tendance: 'up',
  },
  {
    projet_id: 4,
    projet_nom: 'Projet Delta - Infrastructure',
    budget_initial: 15000000,
    budget_consomme: 9000000,
    budget_engage: 9500000,
    budget_restant: 5500000,
    pourcent_consomme: 60,
    depassement: 0,
    depassement_pourcent: 0,
    tendance: 'stable',
  },
];

// ================================
// Données mockées - Jalons
// ================================

export const mockJalons: JalonGouvernance[] = [
  {
    id: 1,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    libelle: 'Validation BC lot 3',
    type: 'CONTRAT',
    date_prevue: '2024-01-15',
    est_retard: true,
    retard_jours: 12,
    est_sla_risque: true,
    statut: 'En cours',
  },
  {
    id: 2,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    libelle: 'Livraison matériaux site B',
    type: 'SLA',
    date_prevue: '2024-01-20',
    est_retard: false,
    est_sla_risque: false,
    statut: 'À venir',
  },
  {
    id: 3,
    projet_id: 2,
    projet_nom: 'Projet Beta',
    libelle: 'Validation plans architecte',
    type: 'INTERNE',
    date_prevue: '2024-01-18',
    est_retard: false,
    est_sla_risque: false,
    statut: 'Terminé',
    date_reelle: '2024-01-17',
  },
  {
    id: 4,
    projet_id: 3,
    projet_nom: 'Projet Gamma',
    libelle: 'Autorisation travaux',
    type: 'CONTRAT',
    date_prevue: '2024-01-10',
    est_retard: true,
    retard_jours: 8,
    est_sla_risque: true,
    statut: 'En cours',
  },
];

// ================================
// Données mockées - Risques
// ================================

export const mockRisques: RisqueGouvernance[] = [
  {
    id: 1,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    titre: 'Dépassement budget lot 4',
    description: 'Risque de dépassement budgétaire sur le lot 4',
    probabilite: 'high',
    impact: 'financial',
    exposition: 450000,
    exposition_type: 'financial',
    statut: 'ouvert',
    date_detection: '2024-01-05',
  },
  {
    id: 2,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    titre: 'Retard validation BC',
    description: 'Retard dans la validation du BC bloquant',
    probabilite: 'medium',
    impact: 'financial',
    exposition: 1200000,
    exposition_type: 'financial',
    statut: 'ouvert',
    date_detection: '2024-01-08',
  },
  {
    id: 3,
    projet_id: 3,
    projet_nom: 'Projet Gamma',
    titre: 'Ressource critique indisponible',
    description: 'Ressource clé indisponible pour le jalon J-5',
    probabilite: 'high',
    impact: 'planning',
    exposition: 15,
    exposition_type: 'days',
    statut: 'ouvert',
    date_detection: '2024-01-12',
  },
];

// ================================
// Données mockées - Validations
// ================================

export const mockValidations: ValidationGouvernance[] = [
  {
    id: 1,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    type: 'BC',
    reference: 'BC-2024-089',
    titre: 'Validation BC lot 3',
    statut: 'en-attente',
    date_demande: '2024-01-03',
    date_echeance: '2024-01-15',
    jours_attente: 12,
    montant: 450000,
    bloqueur: true,
  },
  {
    id: 2,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    type: 'AVENANT',
    reference: 'AV-2024-045',
    titre: 'Avenant budget lot 4',
    statut: 'en-attente',
    date_demande: '2024-01-08',
    date_echeance: '2024-01-20',
    jours_attente: 7,
    montant: 300000,
    bloqueur: false,
  },
  {
    id: 3,
    projet_id: 3,
    projet_nom: 'Projet Gamma',
    type: 'AUTORISATION',
    reference: 'AUT-2024-012',
    titre: 'Autorisation travaux',
    statut: 'bloque',
    date_demande: '2024-01-05',
    date_echeance: '2024-01-10',
    jours_attente: 10,
    bloqueur: true,
  },
];

// ================================
// Données mockées - Points d'attention
// ================================

export const mockPointsAttention: PointAttention[] = [
  {
    id: 1,
    type: 'depassement-budget',
    titre: 'Dépassement budget lot 4 – Projet Alpha',
    description: 'Dépassement budgétaire de 450k€ sur le lot 4',
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    impact: '450k€',
    priorite: 'critical',
    date_detection: '2024-01-10',
    statut: 'ouvert',
  },
  {
    id: 2,
    type: 'retard-critique',
    titre: 'Retard validation BC bloquant',
    description: 'Validation BC lot 3 en retard de 12 jours',
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    impact: '1.2M€',
    priorite: 'critical',
    date_detection: '2024-01-08',
    statut: 'ouvert',
  },
  {
    id: 3,
    type: 'ressource-indispo',
    titre: 'Ressource critique indisponible',
    description: 'Ressource clé indisponible pour jalon J-5',
    projet_id: 3,
    projet_nom: 'Projet Gamma',
    impact: 'Jalon J-5',
    priorite: 'high',
    date_detection: '2024-01-12',
    statut: 'ouvert',
  },
  {
    id: 4,
    type: 'escalade',
    titre: 'Escalade niveau 3 en cours',
    description: 'Escalade critique nécessitant intervention urgente',
    projet_id: 1,
    projet_nom: 'Projet Alpha',
    impact: 'Résolution urgente',
    priorite: 'critical',
    date_detection: '2024-01-14',
    statut: 'en-cours',
  },
];

// ================================
// Données mockées - Décisions
// ================================

export const mockDecisions: DecisionGouvernance[] = [
  {
    id: 1,
    reference: 'DEC-2024-089',
    titre: 'Validation avenant budget lot 3',
    description: 'Validation de l\'avenant budgétaire pour le lot 3',
    type: 'budget',
    statut: 'en-attente',
    impact: 'high',
    responsable: 'J. Martin',
    date_demande: '2024-01-10',
    date_echeance: '2024-01-12',
    montant: 450000,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
  },
  {
    id: 2,
    reference: 'DEC-2024-090',
    titre: 'Prolongation délai phase 2',
    description: 'Prolongation du délai pour la phase 2',
    type: 'planning',
    statut: 'en-attente',
    impact: 'medium',
    responsable: 'M. Dupont',
    date_demande: '2024-01-11',
    date_echeance: '2024-01-14',
    projet_id: 2,
    projet_nom: 'Projet Beta',
  },
  {
    id: 3,
    reference: 'DEC-2024-085',
    titre: 'Validation budget lot 2',
    description: 'Validation du budget pour le lot 2',
    type: 'budget',
    statut: 'valide',
    impact: 'medium',
    responsable: 'J. Martin',
    date_demande: '2024-01-05',
    date_decision: '2024-01-05',
    montant: 300000,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
  },
];

// ================================
// Données mockées - Arbitrages
// ================================

export const mockArbitrages: ArbitrageGouvernance[] = [
  {
    id: 1,
    reference: 'ARB-2024-001',
    titre: 'Arbitrage budget lot 4',
    description: 'Arbitrage nécessaire pour le dépassement budgétaire',
    type: 'budget',
    statut: 'en-attente',
    niveau: 3,
    demandeur: 'Chef de projet Alpha',
    date_demande: '2024-01-10',
    date_echeance: '2024-01-15',
    impact_financier: 450000,
    projet_id: 1,
    projet_nom: 'Projet Alpha',
  },
  {
    id: 2,
    reference: 'ARB-2024-002',
    titre: 'Arbitrage ressource critique',
    description: 'Arbitrage pour réallocation de ressource',
    type: 'resource',
    statut: 'en-attente',
    niveau: 2,
    demandeur: 'Chef de projet Gamma',
    date_demande: '2024-01-12',
    date_echeance: '2024-01-18',
    impact_planning: 15,
    projet_id: 3,
    projet_nom: 'Projet Gamma',
  },
];

// ================================
// Données mockées - Instances
// ================================

export const mockInstances: InstanceGouvernance[] = [
  {
    id: 1,
    nom: 'Comité de pilotage mensuel',
    type: 'DG',
    date: '2024-01-15',
    heure: '14:00',
    participants_count: 8,
    participants: ['DG', 'DAF', 'DMO', 'Chef projet Alpha', 'Chef projet Beta', 'Chef projet Gamma', 'Chef projet Delta', 'RH'],
    ordre_du_jour: ['Budget', 'Jalons', 'Risques'],
    decisions_count: 5,
    statut: 'programmee',
  },
  {
    id: 2,
    nom: 'Revue projets critiques',
    type: 'MOA-MOE',
    date: '2024-01-18',
    heure: '10:00',
    participants_count: 5,
    participants: ['MOA', 'MOE', 'Chef projet Alpha', 'Chef projet Gamma', 'Contrôleur'],
    decisions_count: 3,
    statut: 'programmee',
  },
  {
    id: 3,
    nom: 'Point escalades niveau 3',
    type: 'TRANSVERSE',
    date: '2024-01-20',
    heure: '16:00',
    participants_count: 3,
    participants: ['DG', 'DAF', 'Chef projet Alpha'],
    decisions_count: 2,
    statut: 'programmee',
  },
];

// ================================
// Données mockées - Conformité
// ================================

export const mockIndicateursConformite: IndicateurConformite[] = [
  {
    id: 1,
    nom: 'Taux conformité SLA',
    type: 'SLA',
    valeur: 96,
    valeur_cible: 95,
    pourcent: 101,
    statut: 'conforme',
    date_mesure: '2024-01-15',
    tendance: 'up',
  },
  {
    id: 2,
    nom: 'Taux conformité contrats',
    type: 'CONTRAT',
    valeur: 98,
    valeur_cible: 95,
    pourcent: 103,
    statut: 'conforme',
    date_mesure: '2024-01-15',
    tendance: 'stable',
  },
  {
    id: 3,
    nom: 'Taux conformité audit',
    type: 'AUDIT',
    valeur: 89,
    valeur_cible: 95,
    pourcent: 94,
    statut: 'a-risque',
    date_mesure: '2024-01-15',
    tendance: 'down',
  },
];

export const mockAudits: AuditGouvernance[] = [
  {
    id: 1,
    reference: 'AUD-2024-001',
    type: 'interne',
    date: '2024-01-10',
    statut: 'termine',
    resultat: 'conforme',
    non_conformites_count: 0,
    actions_correctives_count: 0,
  },
  {
    id: 2,
    reference: 'AUD-2024-002',
    type: 'externe',
    date: '2024-01-20',
    statut: 'programme',
  },
];

export const mockEngagements: EngagementGouvernance[] = [
  {
    id: 1,
    type: 'budget',
    reference: 'ENG-2024-001',
    description: 'Engagement budgétaire lot 3',
    montant: 450000,
    date_engagement: '2024-01-05',
    date_echeance: '2024-01-15',
    statut: 'en-cours',
    projet_id: 1,
    projet_nom: 'Projet Alpha',
  },
  {
    id: 2,
    type: 'delai',
    reference: 'ENG-2024-002',
    description: 'Engagement délai phase 2',
    date_engagement: '2024-01-01',
    date_echeance: '2024-02-15',
    statut: 'en-cours',
    projet_id: 2,
    projet_nom: 'Projet Beta',
  },
];

// ================================
// Données mockées - Tendances
// ================================

export const mockTendances: TendanceMensuelle[] = [
  {
    mois: 'Octobre 2023',
    projets_actifs: 22,
    budget_consomme: 11000000,
    jalons_valides: 140,
    risques_critiques: 5,
    validations_en_attente: 15,
    taux_conformite: 92,
  },
  {
    mois: 'Novembre 2023',
    projets_actifs: 23,
    budget_consomme: 11500000,
    jalons_valides: 145,
    risques_critiques: 4,
    validations_en_attente: 13,
    taux_conformite: 93,
  },
  {
    mois: 'Décembre 2023',
    projets_actifs: 23,
    budget_consomme: 12000000,
    jalons_valides: 148,
    risques_critiques: 4,
    validations_en_attente: 14,
    taux_conformite: 93,
  },
  {
    mois: 'Janvier 2024',
    projets_actifs: 24,
    budget_consomme: 12529000,
    jalons_valides: 151,
    risques_critiques: 3,
    validations_en_attente: 12,
    taux_conformite: 94,
  },
];

// ================================
// Helpers pour créer des réponses paginées
// ================================

export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 25
): PaginatedResponse<T> {
  return {
    data,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  };
}

// ================================
// Vue d'ensemble mockée
// ================================

export const mockOverview: GouvernanceOverviewResponse = {
  stats: mockStats,
  projets: mockProjets,
  tendances: mockTendances,
  points_attention: mockPointsAttention,
};

