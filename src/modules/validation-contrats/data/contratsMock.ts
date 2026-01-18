/**
 * Données mock pour le module Validation-Contrats
 * Utilisées en développement ou en fallback si l'API n'est pas disponible
 */

import type {
  Contrat,
  ContratsStats,
  TendancesContrats,
} from '../types/contratsTypes';

export const mockContrats: Contrat[] = [
  {
    id: '1',
    numero: 'CTR-2024-001',
    type: 'FOURNITURE',
    statut: 'EN_ATTENTE',
    priorite: 'CRITICAL',
    titre: 'Contrat de fourniture béton prêt à l\'emploi',
    description: 'Contrat de fourniture béton prêt à l\'emploi - Projet Dakar Arena',
    entreprise: 'SOGEA SATOM',
    montant: 450000000,
    devise: 'FCFA',
    dateCreation: '2024-01-15',
    dateEcheance: '2024-01-25',
    dureeMois: 18,
    service: 'Achats',
    bureau: 'Dakar',
  },
  {
    id: '2',
    numero: 'CTR-2024-005',
    type: 'TRAVAUX',
    statut: 'URGENT',
    priorite: 'CRITICAL',
    titre: 'Contrat de sous-traitance - Lot électricité',
    description: 'Contrat de sous-traitance - Lot électricité Dakar Arena',
    entreprise: 'ELEC AFRIQUE',
    montant: 890000000,
    devise: 'FCFA',
    dateCreation: '2024-01-20',
    dateEcheance: '2024-01-30',
    dureeMois: 14,
    service: 'Travaux',
    bureau: 'Dakar',
  },
  {
    id: '3',
    numero: 'CTR-2024-003',
    type: 'PRESTATION',
    statut: 'EN_ATTENTE',
    priorite: 'MEDIUM',
    titre: 'Contrat de prestation - Études géotechniques',
    description: 'Contrat de prestation - Études géotechniques',
    entreprise: 'LABO SENEGAL',
    montant: 85000000,
    devise: 'FCFA',
    dateCreation: '2024-01-18',
    dateEcheance: '2024-01-28',
    dureeMois: 6,
    service: 'Études',
    bureau: 'Dakar',
  },
];

export const mockStats: ContratsStats = {
  total: 73,
  enAttente: 12,
  urgents: 3,
  valides: 45,
  rejetes: 8,
  negociation: 5,
  tauxValidation: 87,
  montantTotal: 5000000000,
  montantEnAttente: 1500000000,
  montantValides: 3200000000,
  delaiMoyenValidation: 5.5,
  parType: {
    FOURNITURE: 25,
    TRAVAUX: 30,
    PRESTATION: 12,
    SERVICE: 4,
    AUTRE: 2,
  },
  parStatut: {
    EN_ATTENTE: 12,
    URGENT: 3,
    VALIDE: 45,
    REJETE: 8,
    NEGOCIATION: 5,
  },
  parPriorite: {
    CRITICAL: 3,
    MEDIUM: 5,
    LOW: 4,
  },
};

export const mockTrends: TendancesContrats = {
  dates: [
    '2024-01-01',
    '2024-01-08',
    '2024-01-15',
    '2024-01-22',
    '2024-01-29',
  ],
  total: [70, 72, 73, 73, 73],
  enAttente: [15, 14, 13, 12, 12],
  valides: [40, 42, 43, 44, 45],
  rejetes: [8, 8, 8, 8, 8],
  tauxValidation: [85, 86, 87, 87, 87],
};

