/**
 * Mock Data - Milestones (Jalons)
 * Données réalistes pour le suivi des jalons projets
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
export type MilestoneCategory = 'design' | 'approval' | 'construction' | 'delivery' | 'payment' | 'review';

export interface MilestoneTask {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
  dueDate?: string;
}

export interface MilestoneDeliverable {
  id: string;
  name: string;
  type: 'document' | 'approval' | 'construction' | 'other';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  
  // Dates
  plannedDate: string;
  actualDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Progress
  progress: number;
  weight: number; // percentage of project this milestone represents
  
  // Dependencies
  dependsOn: string[];
  blockedBy: string[];
  
  // Tasks
  tasks: MilestoneTask[];
  tasksCompleted: number;
  tasksTotal: number;
  
  // Deliverables
  deliverables: MilestoneDeliverable[];
  
  // Team
  owner: string;
  ownerRole: string;
  
  // Notes
  notes: string;
  
  // Flags
  isCritical: boolean;
  isPaymentLinked: boolean;
  paymentAmount?: number;
  
  // History
  history: {
    date: string;
    action: string;
    by: string;
    details?: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const mockMilestones: Milestone[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // PRJ-001: Route Nationale RN7 - Tronçon Est
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'MS-001',
    projectId: 'PRJ-001',
    title: 'Études topographiques validées',
    description: 'Validation finale des études topographiques et géotechniques du tracé',
    category: 'design',
    status: 'completed',
    plannedDate: '2025-12-15',
    actualDate: '2025-12-12',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2025-12-12T15:00:00Z',
    progress: 100,
    weight: 5,
    dependsOn: [],
    blockedBy: [],
    tasks: [
      { id: 'T-001-1', title: 'Levé topographique complet', completed: true, assignee: 'Ibrahim Touré' },
      { id: 'T-001-2', title: 'Étude géotechnique', completed: true, assignee: 'Fatou Diarra' },
      { id: 'T-001-3', title: 'Rapport de synthèse', completed: true, assignee: 'Moussa Konaté' },
    ],
    tasksCompleted: 3,
    tasksTotal: 3,
    deliverables: [
      { id: 'D-001-1', name: 'Plan topographique 1/1000', type: 'document', status: 'approved', submittedAt: '2025-12-10', approvedBy: 'Direction Technique' },
      { id: 'D-001-2', name: 'Rapport géotechnique', type: 'document', status: 'approved', submittedAt: '2025-12-11', approvedBy: 'Direction Technique' },
    ],
    owner: 'Ibrahim Touré',
    ownerRole: 'Géomètre',
    notes: 'Études complétées avec 3 jours d\'avance. Qualité excellente.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 225000000,
    history: [
      { date: '2025-12-12T15:00:00Z', action: 'Jalon complété', by: 'Moussa Konaté', details: 'Avec 3 jours d\'avance' },
      { date: '2025-12-10T10:00:00Z', action: 'Documents soumis', by: 'Ibrahim Touré' },
    ],
  },
  {
    id: 'MS-002',
    projectId: 'PRJ-001',
    title: 'Terrassement tronçon km 0-10',
    description: 'Achèvement des travaux de terrassement sur les 10 premiers kilomètres',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-05',
    actualDate: '2026-01-03',
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2026-01-03T17:00:00Z',
    progress: 100,
    weight: 10,
    dependsOn: ['MS-001'],
    blockedBy: [],
    tasks: [
      { id: 'T-002-1', title: 'Décapage terre végétale', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-002-2', title: 'Remblais et compactage', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-002-3', title: 'Contrôle qualité', completed: true, assignee: 'Awa Coulibaly' },
    ],
    tasksCompleted: 3,
    tasksTotal: 3,
    deliverables: [
      { id: 'D-002-1', name: 'PV réception terrassement', type: 'approval', status: 'approved', submittedAt: '2026-01-03', approvedBy: 'Client' },
    ],
    owner: 'Fatou Diarra',
    ownerRole: 'Ingénieur civil',
    notes: 'Terrassement conforme aux spécifications. Densité optimale atteinte.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 450000000,
    history: [
      { date: '2026-01-03T17:00:00Z', action: 'Jalon complété', by: 'Fatou Diarra' },
    ],
  },
  {
    id: 'MS-003',
    projectId: 'PRJ-001',
    title: 'Couche de base km 0-10',
    description: 'Mise en place de la couche de base sur les 10 premiers kilomètres',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-15',
    actualDate: '2026-01-14',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-14T16:00:00Z',
    progress: 100,
    weight: 10,
    dependsOn: ['MS-002'],
    blockedBy: [],
    tasks: [
      { id: 'T-003-1', title: 'Approvisionnement matériaux', completed: true, assignee: 'Logistique' },
      { id: 'T-003-2', title: 'Mise en œuvre couche de base', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-003-3', title: 'Compactage et nivellement', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-003-4', title: 'Tests de portance', completed: true, assignee: 'Awa Coulibaly' },
    ],
    tasksCompleted: 4,
    tasksTotal: 4,
    deliverables: [
      { id: 'D-003-1', name: 'Rapport essais CBR', type: 'document', status: 'approved', submittedAt: '2026-01-14', approvedBy: 'Laboratoire' },
    ],
    owner: 'Fatou Diarra',
    ownerRole: 'Ingénieur civil',
    notes: 'CBR > 80% sur toute la longueur. Excellent résultat.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 350000000,
    history: [],
  },
  {
    id: 'MS-004',
    projectId: 'PRJ-001',
    title: 'Revêtement bitumineux km 0-10',
    description: 'Application du revêtement bitumineux sur les 10 premiers kilomètres',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-08',
    actualDate: '2026-01-07',
    createdAt: '2025-12-15T08:00:00Z',
    updatedAt: '2026-01-07T18:00:00Z',
    progress: 100,
    weight: 15,
    dependsOn: ['MS-003'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 5,
    tasksTotal: 5,
    deliverables: [],
    owner: 'Moussa Konaté',
    ownerRole: 'Chef de projet',
    notes: 'Bitume de qualité supérieure. Adhérence excellente.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 550000000,
    history: [],
  },
  {
    id: 'MS-005',
    projectId: 'PRJ-001',
    title: 'Pont n°1 - Fondations',
    description: 'Réalisation des fondations du premier pont (km 8)',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-10',
    actualDate: '2026-01-09',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-09T17:00:00Z',
    progress: 100,
    weight: 8,
    dependsOn: ['MS-001'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 4,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Fatou Diarra',
    ownerRole: 'Ingénieur civil',
    notes: 'Fondations profondes réalisées avec succès.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 180000000,
    history: [],
  },
  {
    id: 'MS-006',
    projectId: 'PRJ-001',
    title: 'Achèvement tronçon km 20-30',
    description: 'Finition complète du tronçon km 20 à km 30 incluant signalisation',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-02-15',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    progress: 45,
    weight: 15,
    dependsOn: ['MS-004'],
    blockedBy: [],
    tasks: [
      { id: 'T-006-1', title: 'Terrassement km 20-30', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-006-2', title: 'Couche de base km 20-30', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-006-3', title: 'Revêtement bitumineux', completed: false, assignee: 'Équipe terrain', dueDate: '2026-02-05' },
      { id: 'T-006-4', title: 'Signalisation horizontale', completed: false, assignee: 'Sous-traitant', dueDate: '2026-02-10' },
      { id: 'T-006-5', title: 'Signalisation verticale', completed: false, assignee: 'Sous-traitant', dueDate: '2026-02-12' },
    ],
    tasksCompleted: 2,
    tasksTotal: 5,
    deliverables: [
      { id: 'D-006-1', name: 'PV réception tronçon', type: 'approval', status: 'pending' },
    ],
    owner: 'Moussa Konaté',
    ownerRole: 'Chef de projet',
    notes: 'En bonne voie. Approvisionnement bitume à surveiller.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 680000000,
    history: [
      { date: '2026-01-08T09:00:00Z', action: 'Tâche complétée', by: 'Équipe terrain', details: 'Terrassement terminé' },
    ],
  },
  {
    id: 'MS-007',
    projectId: 'PRJ-001',
    title: 'Pont n°2 - Tablier',
    description: 'Pose du tablier du deuxième pont (km 25)',
    category: 'construction',
    status: 'pending',
    plannedDate: '2026-03-15',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    progress: 0,
    weight: 12,
    dependsOn: ['MS-006'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 0,
    tasksTotal: 6,
    deliverables: [],
    owner: 'Fatou Diarra',
    ownerRole: 'Ingénieur civil',
    notes: 'Préparation en cours. Plans validés.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 420000000,
    history: [],
  },
  {
    id: 'MS-008',
    projectId: 'PRJ-001',
    title: 'Réception finale',
    description: 'Réception définitive de l\'ensemble du projet',
    category: 'delivery',
    status: 'pending',
    plannedDate: '2026-12-31',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    progress: 0,
    weight: 5,
    dependsOn: ['MS-007'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 0,
    tasksTotal: 8,
    deliverables: [],
    owner: 'Moussa Konaté',
    ownerRole: 'Chef de projet',
    notes: '',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 225000000,
    history: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRJ-002: Pont de Kaolack
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'MS-010',
    projectId: 'PRJ-002',
    title: 'Études géotechniques approfondies',
    description: 'Études complémentaires des sols pour les fondations du pont',
    category: 'design',
    status: 'completed',
    plannedDate: '2025-11-30',
    actualDate: '2025-12-05',
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-12-05T16:00:00Z',
    progress: 100,
    weight: 10,
    dependsOn: [],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 4,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Aïssatou Ndoye',
    ownerRole: 'Ingénieur géotechnique',
    notes: 'Études révélant conditions plus complexes que prévu. Design adapté.',
    isCritical: true,
    isPaymentLinked: false,
    history: [],
  },
  {
    id: 'MS-011',
    projectId: 'PRJ-002',
    title: 'Fondations culées',
    description: 'Réalisation des fondations des deux culées',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-12-31',
    actualDate: '2026-01-05',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-05T17:00:00Z',
    progress: 100,
    weight: 15,
    dependsOn: ['MS-010'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 6,
    tasksTotal: 6,
    deliverables: [],
    owner: 'Mamadou Fall',
    ownerRole: 'Ingénieur structure',
    notes: '5 jours de retard dus aux conditions géotechniques.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 127500000,
    history: [],
  },
  {
    id: 'MS-012',
    projectId: 'PRJ-002',
    title: 'Fondations pile centrale',
    description: 'Réalisation des fondations de la pile centrale',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-01-20',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-09T15:00:00Z',
    progress: 60,
    weight: 20,
    dependsOn: ['MS-010'],
    blockedBy: [],
    tasks: [
      { id: 'T-012-1', title: 'Batardeau', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-012-2', title: 'Fouilles', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-012-3', title: 'Ferraillage', completed: false, assignee: 'Équipe ferraillage', dueDate: '2026-01-15' },
      { id: 'T-012-4', title: 'Coulage béton', completed: false, assignee: 'Équipe béton', dueDate: '2026-01-18' },
    ],
    tasksCompleted: 2,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Ousmane Mbaye',
    ownerRole: 'Chef de projet',
    notes: 'Retard de 10 jours anticipé. Plan de rattrapage en cours.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 170000000,
    history: [
      { date: '2026-01-09T10:00:00Z', action: 'Alerte retard', by: 'Ousmane Mbaye', details: 'Conditions sol difficiles' },
    ],
  },
  {
    id: 'MS-013',
    projectId: 'PRJ-002',
    title: 'Pose câbles haubanage',
    description: 'Installation des câbles de haubanage',
    category: 'construction',
    status: 'delayed',
    plannedDate: '2026-04-30',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    progress: 0,
    weight: 25,
    dependsOn: ['MS-012'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 0,
    tasksTotal: 8,
    deliverables: [],
    owner: 'Ousmane Mbaye',
    ownerRole: 'Chef de projet',
    notes: 'En attente livraison câbles. Retard fournisseur de 3 semaines.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 212500000,
    history: [
      { date: '2026-01-05T09:00:00Z', action: 'Retard signalé', by: 'Ousmane Mbaye', details: 'Fournisseur en retard' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRJ-003: Centre Commercial Bamako
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'MS-020',
    projectId: 'PRJ-003',
    title: 'Gros œuvre sous-sol parking',
    description: 'Achèvement du gros œuvre du parking souterrain (500 places)',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-10-15',
    actualDate: '2025-10-12',
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2025-10-12T17:00:00Z',
    progress: 100,
    weight: 15,
    dependsOn: [],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 8,
    tasksTotal: 8,
    deliverables: [],
    owner: 'Kadiatou Keita',
    ownerRole: 'Chef de projet',
    notes: '3 jours d\'avance. Qualité validée par le bureau de contrôle.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 315000000,
    history: [],
  },
  {
    id: 'MS-021',
    projectId: 'PRJ-003',
    title: 'Gros œuvre niveau 1',
    description: 'Achèvement du gros œuvre du premier niveau commercial',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-11-30',
    actualDate: '2025-11-28',
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2025-11-28T16:00:00Z',
    progress: 100,
    weight: 12,
    dependsOn: ['MS-020'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 6,
    tasksTotal: 6,
    deliverables: [],
    owner: 'Kadiatou Keita',
    ownerRole: 'Chef de projet',
    notes: 'Conforme aux plans. Prêt pour second œuvre.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 252000000,
    history: [],
  },
  {
    id: 'MS-022',
    projectId: 'PRJ-003',
    title: 'Gros œuvre niveau 2',
    description: 'Achèvement du gros œuvre du deuxième niveau commercial',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-12-31',
    actualDate: '2025-12-29',
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-12-29T17:00:00Z',
    progress: 100,
    weight: 12,
    dependsOn: ['MS-021'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 6,
    tasksTotal: 6,
    deliverables: [],
    owner: 'Kadiatou Keita',
    ownerRole: 'Chef de projet',
    notes: 'Excellent travail de l\'équipe.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 252000000,
    history: [],
  },
  {
    id: 'MS-023',
    projectId: 'PRJ-003',
    title: 'Fin gros œuvre niveau 3',
    description: 'Achèvement du gros œuvre du troisième niveau avec toiture',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-01-25',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
    progress: 75,
    weight: 15,
    dependsOn: ['MS-022'],
    blockedBy: [],
    tasks: [
      { id: 'T-023-1', title: 'Poteaux et poutres', completed: true, assignee: 'Équipe structure' },
      { id: 'T-023-2', title: 'Dalle', completed: true, assignee: 'Équipe structure' },
      { id: 'T-023-3', title: 'Toiture métallique', completed: false, assignee: 'Sous-traitant charpente', dueDate: '2026-01-20' },
      { id: 'T-023-4', title: 'Étanchéité', completed: false, assignee: 'Sous-traitant étanchéité', dueDate: '2026-01-24' },
    ],
    tasksCompleted: 2,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Kadiatou Keita',
    ownerRole: 'Chef de projet',
    notes: 'Bonne progression. Livraison charpente demain.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 315000000,
    history: [],
  },
  {
    id: 'MS-024',
    projectId: 'PRJ-003',
    title: 'Second œuvre niveau 1',
    description: 'Achèvement du second œuvre niveau 1 (cloisons, faux plafonds, revêtements)',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-02-28',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    progress: 40,
    weight: 10,
    dependsOn: ['MS-021'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 4,
    tasksTotal: 10,
    deliverables: [],
    owner: 'Kadiatou Keita',
    ownerRole: 'Chef de projet',
    notes: 'En parallèle avec gros œuvre N3.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 210000000,
    history: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRJ-005: Réseau Assainissement Cotonou
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'MS-040',
    projectId: 'PRJ-005',
    title: 'Secteur Akpakpa Phase 1',
    description: 'Installation des canalisations principales secteur Akpakpa',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-12-15',
    actualDate: '2025-12-18',
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-12-18T16:00:00Z',
    progress: 100,
    weight: 15,
    dependsOn: [],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 5,
    tasksTotal: 5,
    deliverables: [],
    owner: 'Pascal Adjovi',
    ownerRole: 'Chef de projet',
    notes: 'Léger retard dû à interférences réseaux existants.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 270000000,
    history: [],
  },
  {
    id: 'MS-041',
    projectId: 'PRJ-005',
    title: 'Station de pompage SP1',
    description: 'Construction et mise en service station de pompage n°1',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-12-31',
    actualDate: '2025-12-30',
    createdAt: '2025-10-15T08:00:00Z',
    updatedAt: '2025-12-30T17:00:00Z',
    progress: 100,
    weight: 12,
    dependsOn: ['MS-040'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 6,
    tasksTotal: 6,
    deliverables: [],
    owner: 'Pascal Adjovi',
    ownerRole: 'Chef de projet',
    notes: 'Pompes fonctionnelles. Tests réussis.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 216000000,
    history: [],
  },
  {
    id: 'MS-042',
    projectId: 'PRJ-005',
    title: 'Raccordements Akpakpa',
    description: 'Raccordements individuels secteur Akpakpa (500 ménages)',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-10',
    actualDate: '2026-01-08',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-08T16:00:00Z',
    progress: 100,
    weight: 8,
    dependsOn: ['MS-040', 'MS-041'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 3,
    tasksTotal: 3,
    deliverables: [],
    owner: 'Pascal Adjovi',
    ownerRole: 'Chef de projet',
    notes: '487 raccordements effectués. 13 en attente accord propriétaires.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 144000000,
    history: [],
  },
  {
    id: 'MS-043',
    projectId: 'PRJ-005',
    title: 'Secteur Akpakpa Phase 2',
    description: 'Extension réseau secteur Akpakpa - zone Est',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-02-10',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
    progress: 35,
    weight: 15,
    dependsOn: ['MS-042'],
    blockedBy: [],
    tasks: [
      { id: 'T-043-1', title: 'Tranchées collecteur principal', completed: true, assignee: 'Équipe terrain' },
      { id: 'T-043-2', title: 'Pose canalisations Ø400', completed: false, assignee: 'Équipe pose', dueDate: '2026-01-25' },
      { id: 'T-043-3', title: 'Regards de visite', completed: false, assignee: 'Équipe maçonnerie', dueDate: '2026-02-01' },
      { id: 'T-043-4', title: 'Tests étanchéité', completed: false, assignee: 'Contrôle qualité', dueDate: '2026-02-05' },
    ],
    tasksCompleted: 1,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Pascal Adjovi',
    ownerRole: 'Chef de projet',
    notes: 'Progression conforme au planning.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 270000000,
    history: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRJ-007: Aéroport Régional Bobo-Dioulasso
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'MS-060',
    projectId: 'PRJ-007',
    title: 'Études et conception',
    description: 'Finalisation des études APS et APD',
    category: 'design',
    status: 'completed',
    plannedDate: '2025-10-31',
    actualDate: '2025-10-28',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2025-10-28T17:00:00Z',
    progress: 100,
    weight: 10,
    dependsOn: [],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 5,
    tasksTotal: 5,
    deliverables: [],
    owner: 'Jean-Pierre Kaboré',
    ownerRole: 'Chef de projet',
    notes: 'Études validées par l\'aviation civile.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 520000000,
    history: [],
  },
  {
    id: 'MS-061',
    projectId: 'PRJ-007',
    title: 'Décapage terrain piste',
    description: 'Préparation du terrain pour nouvelle piste',
    category: 'construction',
    status: 'completed',
    plannedDate: '2025-12-15',
    actualDate: '2025-12-12',
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-12-12T16:00:00Z',
    progress: 100,
    weight: 8,
    dependsOn: ['MS-060'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 3,
    tasksTotal: 3,
    deliverables: [],
    owner: 'Jean-Pierre Kaboré',
    ownerRole: 'Chef de projet',
    notes: 'Terrain préparé sur 3.5 km.',
    isCritical: false,
    isPaymentLinked: true,
    paymentAmount: 416000000,
    history: [],
  },
  {
    id: 'MS-062',
    projectId: 'PRJ-007',
    title: 'Terrassement piste - Phase 1',
    description: 'Terrassement premiers 1500m de piste',
    category: 'construction',
    status: 'completed',
    plannedDate: '2026-01-10',
    actualDate: '2026-01-08',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-08T17:00:00Z',
    progress: 100,
    weight: 10,
    dependsOn: ['MS-061'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 4,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Jean-Pierre Kaboré',
    ownerRole: 'Chef de projet',
    notes: 'Compactage optimal atteint.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 520000000,
    history: [],
  },
  {
    id: 'MS-063',
    projectId: 'PRJ-007',
    title: 'Terrassement piste - Phase 2',
    description: 'Terrassement 1500m suivants',
    category: 'construction',
    status: 'in-progress',
    plannedDate: '2026-02-15',
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    progress: 25,
    weight: 10,
    dependsOn: ['MS-062'],
    blockedBy: [],
    tasks: [
      { id: 'T-063-1', title: 'Décapage zone 2', completed: true, assignee: 'Équipe terrassement' },
      { id: 'T-063-2', title: 'Remblais', completed: false, assignee: 'Équipe terrassement', dueDate: '2026-01-30' },
      { id: 'T-063-3', title: 'Compactage', completed: false, assignee: 'Équipe terrassement', dueDate: '2026-02-10' },
    ],
    tasksCompleted: 1,
    tasksTotal: 3,
    deliverables: [],
    owner: 'Jean-Pierre Kaboré',
    ownerRole: 'Chef de projet',
    notes: 'Progression normale.',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 520000000,
    history: [],
  },
  {
    id: 'MS-065',
    projectId: 'PRJ-007',
    title: 'Fin terrassement piste',
    description: 'Achèvement complet terrassement piste 3000m',
    category: 'construction',
    status: 'pending',
    plannedDate: '2026-03-15',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    progress: 0,
    weight: 10,
    dependsOn: ['MS-063'],
    blockedBy: [],
    tasks: [],
    tasksCompleted: 0,
    tasksTotal: 4,
    deliverables: [],
    owner: 'Jean-Pierre Kaboré',
    ownerRole: 'Chef de projet',
    notes: '',
    isCritical: true,
    isPaymentLinked: true,
    paymentAmount: 520000000,
    history: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMilestoneById = (id: string): Milestone | undefined => {
  return mockMilestones.find((m) => m.id === id);
};

export const getMilestonesByProject = (projectId: string): Milestone[] => {
  return mockMilestones.filter((m) => m.projectId === projectId);
};

export const getMilestonesByStatus = (status: MilestoneStatus): Milestone[] => {
  return mockMilestones.filter((m) => m.status === status);
};

export const getUpcomingMilestones = (days: number = 30): Milestone[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return mockMilestones.filter((m) => {
    if (m.status === 'completed' || m.status === 'cancelled') return false;
    const plannedDate = new Date(m.plannedDate);
    return plannedDate >= now && plannedDate <= futureDate;
  }).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
};

export const getDelayedMilestones = (): Milestone[] => {
  return mockMilestones.filter((m) => m.status === 'delayed');
};

export const getCriticalMilestones = (): Milestone[] => {
  return mockMilestones.filter((m) => m.isCritical && m.status !== 'completed' && m.status !== 'cancelled');
};

export const getMilestonesWithPayment = (): Milestone[] => {
  return mockMilestones.filter((m) => m.isPaymentLinked);
};

export const getTotalPaymentValue = (projectId?: string): number => {
  const milestones = projectId 
    ? mockMilestones.filter((m) => m.projectId === projectId && m.isPaymentLinked)
    : mockMilestones.filter((m) => m.isPaymentLinked);
  
  return milestones.reduce((sum, m) => sum + (m.paymentAmount || 0), 0);
};

