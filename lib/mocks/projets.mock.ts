/**
 * Mock Data - Projets
 * ====================
 * 
 * Données réalistes pour le développement et les tests
 */

import type { Projet } from '../services/projetsApiService';

export const mockProjets: Projet[] = [
  {
    id: 'PRJ-2026-001',
    numero: 'PRJ-2026-001',
    titre: 'Construction Route Nationale RN7',
    client: 'AGEROUTE Sénégal',
    clientId: 'CLI-001',
    type: 'route',
    status: 'en_cours',
    priorite: 'high',
    dateDebut: '2026-01-15',
    dateFinPrevue: '2026-12-31',
    dateFinReelle: undefined,
    budget: 850000000, // 850M FCFA
    budgetConsomme: 620000000, // 620M FCFA
    avancement: 73,
    bureauId: 'BUR-001',
    chefProjetId: 'USR-001',
    chefProjetNom: 'Amadou DIALLO',
    equipeIds: ['USR-001', 'USR-002', 'USR-003', 'USR-004'],
    description: 'Réhabilitation complète de la route nationale RN7 sur 45km',
    localisation: 'Thiès - Tivaouane',
    phases: [
      { id: 'PH-1', nom: 'Études préliminaires', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Travaux de terrassement', status: 'completed', avancement: 100 },
      { id: 'PH-3', nom: 'Revêtement bitumineux', status: 'in_progress', avancement: 65 },
      { id: 'PH-4', nom: 'Signalisation', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'medium', description: 'Retard possible dû à la saison des pluies' },
      { niveau: 'low', description: 'Disponibilité matériaux importés' },
    ],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    id: 'PRJ-2026-002',
    numero: 'PRJ-2026-002',
    titre: 'Pont Sénégal-Gambie',
    client: 'Ministère des Travaux Publics',
    clientId: 'CLI-002',
    type: 'pont',
    status: 'en_cours',
    priorite: 'critical',
    dateDebut: '2025-06-01',
    dateFinPrevue: '2027-05-31',
    dateFinReelle: undefined,
    budget: 2500000000, // 2.5 Milliards FCFA
    budgetConsomme: 980000000, // 980M FCFA
    avancement: 39,
    bureauId: 'BUR-001',
    chefProjetId: 'USR-005',
    chefProjetNom: 'Fatou SALL',
    equipeIds: ['USR-005', 'USR-006', 'USR-007', 'USR-008', 'USR-009'],
    description: 'Construction d\'un pont routier de 450m sur le fleuve Gambie',
    localisation: 'Ziguinchor',
    phases: [
      { id: 'PH-1', nom: 'Études géotechniques', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Fondations', status: 'in_progress', avancement: 75 },
      { id: 'PH-3', nom: 'Structure principale', status: 'pending', avancement: 0 },
      { id: 'PH-4', nom: 'Finitions', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'high', description: 'Conditions météorologiques défavorables' },
      { niveau: 'medium', description: 'Coordination avec autorités gambiennes' },
    ],
    createdAt: '2025-05-15T09:00:00Z',
    updatedAt: '2026-01-09T16:20:00Z',
  },
  {
    id: 'PRJ-2026-003',
    numero: 'PRJ-2026-003',
    titre: 'Autoroute Dakar-Thiès A1',
    client: 'APIX',
    clientId: 'CLI-003',
    type: 'autoroute',
    status: 'planifie',
    priorite: 'high',
    dateDebut: '2026-03-01',
    dateFinPrevue: '2028-02-28',
    dateFinReelle: undefined,
    budget: 5200000000, // 5.2 Milliards FCFA
    budgetConsomme: 150000000, // 150M FCFA (études)
    avancement: 3,
    bureauId: 'BUR-002',
    chefProjetId: 'USR-010',
    chefProjetNom: 'Ousmane SY',
    equipeIds: ['USR-010', 'USR-011', 'USR-012'],
    description: 'Extension de l\'autoroute à péage Dakar-Thiès, section supplémentaire de 32km',
    localisation: 'Région de Dakar',
    phases: [
      { id: 'PH-1', nom: 'Études d\'impact environnemental', status: 'in_progress', avancement: 45 },
      { id: 'PH-2', nom: 'Expropriation', status: 'pending', avancement: 0 },
      { id: 'PH-3', nom: 'Travaux préparatoires', status: 'pending', avancement: 0 },
      { id: 'PH-4', nom: 'Construction', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'high', description: 'Processus d\'expropriation complexe' },
      { niveau: 'medium', description: 'Disponibilité financement' },
    ],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T11:15:00Z',
  },
  {
    id: 'PRJ-2025-045',
    numero: 'PRJ-2025-045',
    titre: 'Réhabilitation Corniche Dakar',
    client: 'Ville de Dakar',
    clientId: 'CLI-004',
    type: 'urbain',
    status: 'completed',
    priorite: 'medium',
    dateDebut: '2025-03-01',
    dateFinPrevue: '2025-11-30',
    dateFinReelle: '2025-11-28',
    budget: 320000000, // 320M FCFA
    budgetConsomme: 315000000, // 315M FCFA
    avancement: 100,
    bureauId: 'BUR-001',
    chefProjetId: 'USR-002',
    chefProjetNom: 'Aïssatou NDIAYE',
    equipeIds: ['USR-002', 'USR-013', 'USR-014'],
    description: 'Réhabilitation de la chaussée et aménagement paysager de la Corniche Ouest',
    localisation: 'Dakar - Corniche Ouest',
    phases: [
      { id: 'PH-1', nom: 'Démolition', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Voirie', status: 'completed', avancement: 100 },
      { id: 'PH-3', nom: 'Espaces verts', status: 'completed', avancement: 100 },
      { id: 'PH-4', nom: 'Mobilier urbain', status: 'completed', avancement: 100 },
    ],
    risques: [],
    createdAt: '2025-02-15T08:30:00Z',
    updatedAt: '2025-11-28T17:00:00Z',
  },
  {
    id: 'PRJ-2026-004',
    numero: 'PRJ-2026-004',
    titre: 'Échangeur Liberté 6',
    client: 'AGEROUTE Sénégal',
    clientId: 'CLI-001',
    type: 'infrastructure',
    status: 'bloque',
    priorite: 'high',
    dateDebut: '2025-09-01',
    dateFinPrevue: '2026-06-30',
    dateFinReelle: undefined,
    budget: 680000000, // 680M FCFA
    budgetConsomme: 420000000, // 420M FCFA
    avancement: 62,
    bureauId: 'BUR-001',
    chefProjetId: 'USR-003',
    chefProjetNom: 'Moussa KANE',
    equipeIds: ['USR-003', 'USR-015', 'USR-016'],
    description: 'Construction d\'un échangeur routier à Liberté 6',
    localisation: 'Dakar - Liberté 6',
    phases: [
      { id: 'PH-1', nom: 'Études', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Travaux structure', status: 'in_progress', avancement: 80 },
      { id: 'PH-3', nom: 'Voiries connexes', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'critical', description: 'Arrêt chantier pour litige foncier' },
      { niveau: 'high', description: 'Dépassement budgétaire prévu' },
    ],
    motifBlocage: 'Litige foncier avec propriétaire riverain - en attente décision justice',
    dateBlocage: '2025-12-18',
    createdAt: '2025-08-20T09:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'PRJ-2026-005',
    numero: 'PRJ-2026-005',
    titre: 'Piste Rurale Kaolack-Ndoffane',
    client: 'Conseil Départemental Kaolack',
    clientId: 'CLI-005',
    type: 'piste_rurale',
    status: 'en_cours',
    priorite: 'medium',
    dateDebut: '2026-01-05',
    dateFinPrevue: '2026-08-31',
    dateFinReelle: undefined,
    budget: 180000000, // 180M FCFA
    budgetConsomme: 25000000, // 25M FCFA
    avancement: 14,
    bureauId: 'BUR-003',
    chefProjetId: 'USR-017',
    chefProjetNom: 'Cheikh GUEYE',
    equipeIds: ['USR-017', 'USR-018'],
    description: 'Aménagement piste rurale latéritique 18km',
    localisation: 'Kaolack - Ndoffane',
    phases: [
      { id: 'PH-1', nom: 'Topographie', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Terrassement', status: 'in_progress', avancement: 25 },
      { id: 'PH-3', nom: 'Compactage', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'low', description: 'Accessibilité en saison des pluies' },
    ],
    createdAt: '2025-12-20T08:00:00Z',
    updatedAt: '2026-01-10T15:00:00Z',
  },
  {
    id: 'PRJ-2026-006',
    numero: 'PRJ-2026-006',
    titre: 'Parking Souterrain Plateau',
    client: 'Ville de Dakar',
    clientId: 'CLI-004',
    type: 'infrastructure',
    status: 'planifie',
    priorite: 'low',
    dateDebut: '2026-06-01',
    dateFinPrevue: '2027-12-31',
    dateFinReelle: undefined,
    budget: 1200000000, // 1.2 Milliards FCFA
    budgetConsomme: 80000000, // 80M FCFA (études)
    avancement: 7,
    bureauId: 'BUR-001',
    chefProjetId: 'USR-019',
    chefProjetNom: 'Marie DIOP',
    equipeIds: ['USR-019', 'USR-020'],
    description: 'Construction parking souterrain 500 places Place de l\'Indépendance',
    localisation: 'Dakar - Plateau',
    phases: [
      { id: 'PH-1', nom: 'Études de faisabilité', status: 'in_progress', avancement: 60 },
      { id: 'PH-2', nom: 'Autorisations', status: 'pending', avancement: 0 },
      { id: 'PH-3', nom: 'Excavation', status: 'pending', avancement: 0 },
      { id: 'PH-4', nom: 'Construction', status: 'pending', avancement: 0 },
    ],
    risques: [
      { niveau: 'high', description: 'Complexité archéologique du site' },
      { niveau: 'medium', description: 'Gestion circulation pendant travaux' },
    ],
    createdAt: '2025-11-10T10:00:00Z',
    updatedAt: '2026-01-09T14:00:00Z',
  },
  {
    id: 'PRJ-2025-038',
    numero: 'PRJ-2025-038',
    titre: 'Passerelle Piétonne Université',
    client: 'Université Cheikh Anta Diop',
    clientId: 'CLI-006',
    type: 'infrastructure',
    status: 'completed',
    priorite: 'medium',
    dateDebut: '2025-02-01',
    dateFinPrevue: '2025-07-31',
    dateFinReelle: '2025-07-25',
    budget: 85000000, // 85M FCFA
    budgetConsomme: 83000000, // 83M FCFA
    avancement: 100,
    bureauId: 'BUR-002',
    chefProjetId: 'USR-021',
    chefProjetNom: 'Ibrahim SARR',
    equipeIds: ['USR-021', 'USR-022'],
    description: 'Construction passerelle piétonne sécurisée traversée route campus',
    localisation: 'Dakar - UCAD',
    phases: [
      { id: 'PH-1', nom: 'Conception', status: 'completed', avancement: 100 },
      { id: 'PH-2', nom: 'Fabrication', status: 'completed', avancement: 100 },
      { id: 'PH-3', nom: 'Installation', status: 'completed', avancement: 100 },
    ],
    risques: [],
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-07-25T16:30:00Z',
  },
];

// Stats mock pour dashboard
export const mockProjetsStats = {
  total: 48,
  en_cours: 28,
  planifie: 12,
  completed: 6,
  bloque: 2,
  budgetTotal: 15800000000, // 15.8 Milliards FCFA
  budgetConsomme: 9450000000, // 9.45 Milliards FCFA
  tauxAvancement: 60,
  tauxReussite: 92,
  projetsCritiques: 3,
  projetsEnRetard: 5,
};

// Filtres courants
export const mockProjetsFilters = {
  status: ['en_cours', 'planifie', 'bloque', 'completed'],
  priorite: ['low', 'medium', 'high', 'critical'],
  type: ['route', 'pont', 'autoroute', 'infrastructure', 'urbain', 'piste_rurale'],
  bureaux: ['BUR-001', 'BUR-002', 'BUR-003'],
};

