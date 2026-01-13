/**
 * Mock Data - Substitutions
 * ==========================
 * 
 * Données réalistes pour le développement et les tests
 */

export interface SubstitutionMock {
  id: string;
  ref: string;
  titulaire: {
    id: string;
    name: string;
    bureau: string;
    avatar?: string;
  };
  substitut?: {
    id: string;
    name: string;
    bureau: string;
    score: number;
    avatar?: string;
  };
  status: 'active' | 'pending' | 'completed' | 'expired';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: 'absence' | 'blocage' | 'technique' | 'documents';
  description: string;
  bureau: string;
  dateDebut: string;
  dateFin?: string;
  delay: number;
  amount: number;
  linkedProjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export const mockSubstitutions: SubstitutionMock[] = [
  {
    id: 'SUB-2026-001',
    ref: 'SUB-2026-001',
    titulaire: {
      id: 'USR-001',
      name: 'Amadou DIALLO',
      bureau: 'Bureau Dakar',
      avatar: '/avatars/amadou-diallo.jpg',
    },
    substitut: {
      id: 'USR-002',
      name: 'Fatou NDIAYE',
      bureau: 'Bureau Dakar',
      score: 95,
      avatar: '/avatars/fatou-ndiaye.jpg',
    },
    status: 'active',
    urgency: 'high',
    reason: 'absence',
    description: 'Validation BC fournisseur AGEROUTE - Montant: 25M FCFA. Substitution suite à congé maladie du titulaire.',
    bureau: 'Bureau Dakar',
    dateDebut: '2026-01-08T08:00:00Z',
    dateFin: '2026-01-15T17:00:00Z',
    delay: 5,
    amount: 15000000,
    linkedProjects: ['PRJ-2026-001'],
    createdAt: '2026-01-07T14:00:00Z',
    updatedAt: '2026-01-08T08:00:00Z',
  },
  {
    id: 'SUB-2026-002',
    ref: 'SUB-2026-002',
    titulaire: {
      id: 'USR-003',
      name: 'Ibrahima SALL',
      bureau: 'Bureau Dakar',
      avatar: '/avatars/ibrahima-sall.jpg',
    },
    status: 'pending',
    urgency: 'critical',
    reason: 'technique',
    description: 'Approbation paiement urgent fournisseur matériaux - 8.5M FCFA. Titulaire indisponible pour expertise technique requise.',
    bureau: 'Bureau Dakar',
    dateDebut: '2026-01-10T08:00:00Z',
    delay: 3,
    amount: 8500000,
    linkedProjects: ['PRJ-2026-003'],
    createdAt: '2026-01-09T16:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'SUB-2026-003',
    ref: 'SUB-2026-003',
    titulaire: {
      id: 'USR-004',
      name: 'Aissatou FALL',
      bureau: 'Bureau Dakar',
      avatar: '/avatars/aissatou-fall.jpg',
    },
    substitut: {
      id: 'USR-005',
      name: 'Oumar BA',
      bureau: 'Bureau Kaolack',
      score: 88,
      avatar: '/avatars/oumar-ba.jpg',
    },
    status: 'active',
    urgency: 'high',
    reason: 'blocage',
    description: 'Arbitrage inter-bureaux - Dossier bloqué nécessitant expertise externe. Montant: 45M FCFA.',
    bureau: 'Bureau Dakar',
    dateDebut: '2026-01-05T08:00:00Z',
    delay: 8,
    amount: 45000000,
    linkedProjects: ['PRJ-2026-002'],
    createdAt: '2026-01-04T10:00:00Z',
    updatedAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'SUB-2026-004',
    ref: 'SUB-2026-004',
    titulaire: {
      id: 'USR-006',
      name: 'Moussa DIOP',
      bureau: 'Bureau Thiès',
      avatar: '/avatars/moussa-diop.jpg',
    },
    status: 'pending',
    urgency: 'medium',
    reason: 'documents',
    description: 'Signature contrat litige client - 120M FCFA. Titulaire en attente de documents complémentaires.',
    bureau: 'Bureau Thiès',
    dateDebut: '2026-01-03T08:00:00Z',
    delay: 12,
    amount: 120000000,
    linkedProjects: ['PRJ-2026-004'],
    createdAt: '2026-01-02T09:00:00Z',
    updatedAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'SUB-2026-005',
    ref: 'SUB-2026-005',
    titulaire: {
      id: 'USR-007',
      name: 'Khadija SOW',
      bureau: 'Bureau Dakar',
      avatar: '/avatars/khadija-sow.jpg',
    },
    substitut: {
      id: 'USR-008',
      name: 'Mamadou SECK',
      bureau: 'Bureau Dakar',
      score: 92,
      avatar: '/avatars/mamadou-seck.jpg',
    },
    status: 'completed',
    urgency: 'low',
    reason: 'absence',
    description: 'Validation congés équipe - Substitution temporaire pour congés annuels.',
    bureau: 'Bureau Dakar',
    dateDebut: '2026-01-01T08:00:00Z',
    dateFin: '2026-01-07T17:00:00Z',
    delay: 2,
    amount: 0,
    createdAt: '2025-12-30T10:00:00Z',
    updatedAt: '2026-01-07T17:00:00Z',
  },
  {
    id: 'SUB-2026-006',
    ref: 'SUB-2026-006',
    titulaire: {
      id: 'USR-050',
      name: 'Mamadou MBAYE',
      bureau: 'Bureau Dakar',
      avatar: '/avatars/mamadou-mbaye.jpg',
    },
    substitut: {
      id: 'USR-001',
      name: 'Amadou DIALLO',
      bureau: 'Bureau Dakar',
      score: 90,
      avatar: '/avatars/amadou-diallo.jpg',
    },
    status: 'active',
    urgency: 'critical',
    reason: 'blocage',
    description: 'Substitution direction - Dossier critique nécessitant validation niveau 3. Montant: 150M FCFA.',
    bureau: 'Bureau Dakar',
    dateDebut: '2026-01-06T08:00:00Z',
    delay: 0,
    amount: 150000000,
    linkedProjects: ['PRJ-2026-002'],
    createdAt: '2026-01-05T15:00:00Z',
    updatedAt: '2026-01-06T08:00:00Z',
  },
  {
    id: 'SUB-2026-007',
    ref: 'SUB-2026-007',
    titulaire: {
      id: 'USR-009',
      name: 'Aminata TOURE',
      bureau: 'Bureau Kaolack',
      avatar: '/avatars/aminata-toure.jpg',
    },
    status: 'pending',
    urgency: 'medium',
    reason: 'technique',
    description: 'Validation technique spécialisée - Expertises géotechniques requises. Montant: 30M FCFA.',
    bureau: 'Bureau Kaolack',
    dateDebut: '2026-01-09T08:00:00Z',
    delay: 4,
    amount: 30000000,
    linkedProjects: ['PRJ-2026-003'],
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-09T08:00:00Z',
  },
  {
    id: 'SUB-2026-008',
    ref: 'SUB-2026-008',
    titulaire: {
      id: 'USR-010',
      name: 'Sidy CAMARA',
      bureau: 'Bureau Thiès',
      avatar: '/avatars/sidy-camara.jpg',
    },
    substitut: {
      id: 'USR-011',
      name: 'Mariama DIOUF',
      bureau: 'Bureau Thiès',
      score: 87,
      avatar: '/avatars/mariama-diouf.jpg',
    },
    status: 'expired',
    urgency: 'low',
    reason: 'absence',
    description: 'Substitution expirée - Congés maladie terminés. Dossier repris par le titulaire.',
    bureau: 'Bureau Thiès',
    dateDebut: '2025-12-20T08:00:00Z',
    dateFin: '2026-01-02T17:00:00Z',
    delay: 0,
    amount: 0,
    createdAt: '2025-12-19T10:00:00Z',
    updatedAt: '2026-01-02T17:00:00Z',
  },
];

export const mockSubstitutionStats = {
  total: 8,
  parStatus: {
    active: 3,
    pending: 3,
    completed: 1,
    expired: 1,
  },
  parUrgence: {
    critical: 2,
    high: 2,
    medium: 2,
    low: 2,
  },
  parRaison: {
    absence: 3,
    blocage: 2,
    technique: 2,
    documents: 1,
  },
  parBureau: {
    'Bureau Dakar': 5,
    'Bureau Kaolack': 2,
    'Bureau Thiès': 1,
  },
  avecSubstitut: 5,
  sansSubstitut: 3,
  totalMontant: 283500000,
  moyenneDelai: 4.25,
};

