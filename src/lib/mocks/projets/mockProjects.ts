/**
 * Mock Data - Projets
 * Données réalistes pour le BMO Command Center
 * Facilement remplaçable par de vraies API calls
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ProjectStatus = 'active' | 'planning' | 'delayed' | 'completed' | 'on-hold' | 'cancelled';
export type ProjectPriority = 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';
export type ProjectPhase = 'conception' | 'estimation' | 'validation' | 'execution' | 'review' | 'testing' | 'deployment' | 'closure';
export type ProjectType = 'Infrastructure' | 'Bâtiment' | 'Ouvrage d\'art' | 'Aménagement' | 'Réhabilitation' | 'Étude';
export type Bureau = 'BF' | 'BM' | 'BJ' | 'BCT';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  department: string;
  allocation: number; // percentage 0-100
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'dwg' | 'img' | 'other';
  size: number; // in bytes
  uploadedAt: string;
  uploadedBy: string;
  category: 'contract' | 'plan' | 'report' | 'invoice' | 'other';
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: 'technical' | 'financial' | 'schedule' | 'resource' | 'external';
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  type: 'general' | 'decision' | 'risk' | 'issue' | 'progress';
  pinned: boolean;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  client: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  bureau: Bureau;
  status: ProjectStatus;
  phase: ProjectPhase;
  priority: ProjectPriority;
  type: ProjectType;
  
  // Dates
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Progress
  progress: number;
  progressByPhase: {
    phase: ProjectPhase;
    progress: number;
    weight: number;
  }[];
  
  // Budget
  budget: {
    initial: number;
    current: number;
    consumed: number;
    committed: number;
    forecast: number;
    currency: string;
  };
  
  // Team
  teamSize: number;
  teamLead: ProjectMember;
  team: ProjectMember[];
  
  // Milestones
  milestonesTotal: number;
  milestonesCompleted: number;
  nextMilestone?: {
    id: string;
    title: string;
    dueDate: string;
    daysRemaining: number;
  };
  
  // Risks
  riskLevel: RiskLevel;
  risks: ProjectRisk[];
  openRisksCount: number;
  
  // Documents
  documentsCount: number;
  documents: ProjectDocument[];
  
  // Notes
  notes: ProjectNote[];
  
  // Tags
  tags: string[];
  
  // Location
  location: {
    region: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Metrics
  metrics: {
    onTimeDelivery: number;
    budgetVariance: number;
    qualityScore: number;
    clientSatisfaction: number;
    teamProductivity: number;
  };
  
  // Dependencies
  dependencies: string[];
  blockedBy: string[];
  
  // Activity
  lastActivity: string;
  activitiesCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    code: 'RN7-EST-2026',
    title: 'Route Nationale RN7 - Tronçon Est',
    description: 'Réhabilitation et élargissement de la Route Nationale 7, tronçon Est sur 45km. Inclut la construction de 3 ponts et l\'aménagement des accotements.',
    client: {
      name: 'Ministère des Infrastructures',
      contact: 'M. Amadou Diallo',
      email: 'a.diallo@ministere-infra.gov',
      phone: '+226 70 12 34 56',
    },
    bureau: 'BF',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Infrastructure',
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
    progress: 61,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 10 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 58, weight: 60 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 4500000000,
      current: 4750000000,
      consumed: 2750000000,
      committed: 450000000,
      forecast: 4800000000,
      currency: 'XOF',
    },
    teamSize: 12,
    teamLead: {
      id: 'USR-001',
      name: 'Ing. Moussa Konaté',
      role: 'Chef de projet',
      department: 'Infrastructure',
      allocation: 100,
    },
    team: [
      { id: 'USR-002', name: 'Fatou Diarra', role: 'Ingénieur civil', department: 'Infrastructure', allocation: 100 },
      { id: 'USR-003', name: 'Ibrahim Touré', role: 'Géomètre', department: 'Topographie', allocation: 80 },
      { id: 'USR-004', name: 'Awa Coulibaly', role: 'Contrôleur qualité', department: 'Qualité', allocation: 60 },
    ],
    milestonesTotal: 8,
    milestonesCompleted: 5,
    nextMilestone: {
      id: 'MS-006',
      title: 'Achèvement tronçon km 20-30',
      dueDate: '2026-02-15',
      daysRemaining: 36,
    },
    riskLevel: 'medium',
    risks: [
      {
        id: 'RSK-001',
        title: 'Retard approvisionnement bitume',
        description: 'Risque de rupture de stock chez le fournisseur principal',
        level: 'medium',
        category: 'external',
        probability: 3,
        impact: 4,
        mitigation: 'Identification de fournisseurs alternatifs',
        owner: 'Moussa Konaté',
        status: 'open',
        createdAt: '2026-01-05T10:00:00Z',
      },
    ],
    openRisksCount: 2,
    documentsCount: 45,
    documents: [
      { id: 'DOC-001', name: 'Contrat principal.pdf', type: 'pdf', size: 2450000, uploadedAt: '2025-12-01', uploadedBy: 'Admin', category: 'contract' },
      { id: 'DOC-002', name: 'Plan topographique.dwg', type: 'dwg', size: 15800000, uploadedAt: '2025-12-15', uploadedBy: 'Ibrahim Touré', category: 'plan' },
    ],
    notes: [
      {
        id: 'NOTE-001',
        content: 'Réunion de coordination avec le client prévue le 15 janvier. Points à aborder: planning révisé et demandes de modification.',
        author: 'Moussa Konaté',
        authorRole: 'Chef de projet',
        createdAt: '2026-01-08T14:00:00Z',
        type: 'general',
        pinned: true,
      },
    ],
    tags: ['prioritaire', 'ministère', 'route nationale', 'phase 2'],
    location: {
      region: 'Centre',
      city: 'Ouagadougou',
      coordinates: { lat: 12.3714, lng: -1.5197 },
    },
    metrics: {
      onTimeDelivery: 85,
      budgetVariance: -5.5,
      qualityScore: 92,
      clientSatisfaction: 88,
      teamProductivity: 94,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T14:30:00Z',
    activitiesCount: 156,
  },
  {
    id: 'PRJ-002',
    code: 'PONT-KLK-2025',
    title: 'Pont de Kaolack',
    description: 'Construction d\'un pont à haubans de 850m traversant le fleuve Saloum. Ouvrage stratégique pour le désenclavement de la région.',
    client: {
      name: 'Région de Kaolack',
      contact: 'Mme. Aminata Sow',
      email: 'a.sow@region-kaolack.sn',
      phone: '+221 33 941 12 34',
    },
    bureau: 'BM',
    status: 'delayed',
    phase: 'execution',
    priority: 'high',
    type: 'Ouvrage d\'art',
    startDate: '2025-11-01',
    endDate: '2026-08-31',
    createdAt: '2025-08-15T09:00:00Z',
    updatedAt: '2026-01-09T16:45:00Z',
    progress: 38,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 28, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 850000000,
      current: 920000000,
      consumed: 320000000,
      committed: 180000000,
      forecast: 980000000,
      currency: 'XOF',
    },
    teamSize: 8,
    teamLead: {
      id: 'USR-010',
      name: 'Ing. Ousmane Mbaye',
      role: 'Chef de projet',
      department: 'Ouvrages d\'art',
      allocation: 100,
    },
    team: [
      { id: 'USR-011', name: 'Mamadou Fall', role: 'Ingénieur structure', department: 'Ouvrages d\'art', allocation: 100 },
      { id: 'USR-012', name: 'Aïssatou Ndoye', role: 'Ingénieur géotechnique', department: 'Géotechnique', allocation: 80 },
    ],
    milestonesTotal: 6,
    milestonesCompleted: 2,
    nextMilestone: {
      id: 'MS-012',
      title: 'Fondations pile centrale',
      dueDate: '2026-01-20',
      daysRemaining: 10,
    },
    riskLevel: 'high',
    risks: [
      {
        id: 'RSK-010',
        title: 'Conditions géotechniques défavorables',
        description: 'Sol plus instable que prévu sur la rive Est, nécessitant des fondations renforcées',
        level: 'high',
        category: 'technical',
        probability: 4,
        impact: 5,
        mitigation: 'Étude géotechnique complémentaire et révision du design des fondations',
        owner: 'Ousmane Mbaye',
        status: 'open',
        createdAt: '2025-12-20T11:00:00Z',
      },
      {
        id: 'RSK-011',
        title: 'Retard livraison câbles',
        description: 'Le fournisseur de câbles de haubanage annonce 3 semaines de retard',
        level: 'high',
        category: 'external',
        probability: 5,
        impact: 4,
        mitigation: 'Négociation accélération et recherche fournisseur alternatif',
        owner: 'Ousmane Mbaye',
        status: 'open',
        createdAt: '2026-01-05T09:00:00Z',
      },
    ],
    openRisksCount: 3,
    documentsCount: 32,
    documents: [],
    notes: [
      {
        id: 'NOTE-010',
        content: 'ALERTE: Le projet accuse un retard de 3 semaines. Plan de rattrapage en cours d\'élaboration.',
        author: 'Ousmane Mbaye',
        authorRole: 'Chef de projet',
        createdAt: '2026-01-08T10:00:00Z',
        type: 'issue',
        pinned: true,
      },
    ],
    tags: ['critique', 'ouvrage d\'art', 'retard', 'région'],
    location: {
      region: 'Kaolack',
      city: 'Kaolack',
      coordinates: { lat: 14.1652, lng: -16.0726 },
    },
    metrics: {
      onTimeDelivery: 65,
      budgetVariance: -15.3,
      qualityScore: 88,
      clientSatisfaction: 72,
      teamProductivity: 78,
    },
    dependencies: [],
    blockedBy: ['PRJ-015'],
    lastActivity: '2026-01-09T16:45:00Z',
    activitiesCount: 89,
  },
  {
    id: 'PRJ-003',
    code: 'CC-BMK-2025',
    title: 'Centre Commercial Bamako',
    description: 'Construction d\'un centre commercial moderne de 25000m² sur 3 niveaux avec parking souterrain de 500 places.',
    client: {
      name: 'Groupe Sahel Invest',
      contact: 'M. Boubacar Traoré',
      email: 'b.traore@sahelinvest.ml',
      phone: '+223 20 22 45 67',
    },
    bureau: 'BM',
    status: 'active',
    phase: 'execution',
    priority: 'medium',
    type: 'Bâtiment',
    startDate: '2025-06-01',
    endDate: '2026-06-30',
    createdAt: '2025-04-01T08:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    progress: 72,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 70, weight: 55 },
      { phase: 'testing', progress: 20, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 2100000000,
      current: 2100000000,
      consumed: 1512000000,
      committed: 320000000,
      forecast: 2050000000,
      currency: 'XOF',
    },
    teamSize: 15,
    teamLead: {
      id: 'USR-020',
      name: 'Ing. Kadiatou Keita',
      role: 'Chef de projet',
      department: 'Bâtiment',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 10,
    milestonesCompleted: 7,
    nextMilestone: {
      id: 'MS-023',
      title: 'Fin gros œuvre niveau 3',
      dueDate: '2026-01-25',
      daysRemaining: 15,
    },
    riskLevel: 'low',
    risks: [],
    openRisksCount: 1,
    documentsCount: 78,
    documents: [],
    notes: [],
    tags: ['commercial', 'privé', 'bonne progression'],
    location: {
      region: 'Bamako',
      city: 'Bamako',
      coordinates: { lat: 12.6392, lng: -8.0029 },
    },
    metrics: {
      onTimeDelivery: 95,
      budgetVariance: 2.4,
      qualityScore: 94,
      clientSatisfaction: 96,
      teamProductivity: 98,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T10:00:00Z',
    activitiesCount: 234,
  },
  {
    id: 'PRJ-004',
    code: 'EP-OUA-2026',
    title: 'École Primaire Ouagadougou',
    description: 'Construction d\'une école primaire de 12 salles de classe avec cantine, bibliothèque et terrain de sport.',
    client: {
      name: 'Mairie de Ouagadougou',
      contact: 'M. Hamidou Sawadogo',
      email: 'h.sawadogo@mairie-ouaga.bf',
      phone: '+226 25 30 67 89',
    },
    bureau: 'BF',
    status: 'planning',
    phase: 'validation',
    priority: 'medium',
    type: 'Bâtiment',
    startDate: '2026-03-01',
    endDate: '2026-10-31',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T09:00:00Z',
    progress: 15,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 20 },
      { phase: 'estimation', progress: 80, weight: 15 },
      { phase: 'validation', progress: 30, weight: 10 },
      { phase: 'execution', progress: 0, weight: 45 },
      { phase: 'testing', progress: 0, weight: 5 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 350000000,
      current: 350000000,
      consumed: 52500000,
      committed: 0,
      forecast: 350000000,
      currency: 'XOF',
    },
    teamSize: 6,
    teamLead: {
      id: 'USR-030',
      name: 'Ing. Mariam Ouédraogo',
      role: 'Chef de projet',
      department: 'Bâtiment',
      allocation: 80,
    },
    team: [],
    milestonesTotal: 5,
    milestonesCompleted: 0,
    nextMilestone: {
      id: 'MS-031',
      title: 'Validation finale des plans',
      dueDate: '2026-02-01',
      daysRemaining: 22,
    },
    riskLevel: 'low',
    risks: [],
    openRisksCount: 0,
    documentsCount: 18,
    documents: [],
    notes: [],
    tags: ['éducation', 'social', 'mairie'],
    location: {
      region: 'Centre',
      city: 'Ouagadougou',
      coordinates: { lat: 12.3655, lng: -1.5342 },
    },
    metrics: {
      onTimeDelivery: 100,
      budgetVariance: 0,
      qualityScore: 0,
      clientSatisfaction: 90,
      teamProductivity: 85,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-08T09:00:00Z',
    activitiesCount: 45,
  },
  {
    id: 'PRJ-005',
    code: 'ASSAIN-COT-2025',
    title: 'Réseau Assainissement Cotonou',
    description: 'Extension et réhabilitation du réseau d\'assainissement des quartiers Est de Cotonou sur 15km de canalisations.',
    client: {
      name: 'Ville de Cotonou',
      contact: 'M. Gérard Houngbédji',
      email: 'g.houngbedji@cotonou.bj',
      phone: '+229 21 31 45 67',
    },
    bureau: 'BJ',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Infrastructure',
    startDate: '2025-09-15',
    endDate: '2026-09-15',
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2026-01-10T11:30:00Z',
    progress: 45,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 42, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 1800000000,
      current: 1850000000,
      consumed: 810000000,
      committed: 280000000,
      forecast: 1880000000,
      currency: 'XOF',
    },
    teamSize: 10,
    teamLead: {
      id: 'USR-040',
      name: 'Ing. Pascal Adjovi',
      role: 'Chef de projet',
      department: 'Hydraulique',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 7,
    milestonesCompleted: 3,
    nextMilestone: {
      id: 'MS-043',
      title: 'Achèvement secteur Akpakpa',
      dueDate: '2026-02-10',
      daysRemaining: 31,
    },
    riskLevel: 'medium',
    risks: [
      {
        id: 'RSK-040',
        title: 'Interférences réseaux existants',
        description: 'Présence de réseaux non cartographiés dans certaines zones',
        level: 'medium',
        category: 'technical',
        probability: 3,
        impact: 3,
        mitigation: 'Détection préalable systématique avant excavation',
        owner: 'Pascal Adjovi',
        status: 'mitigated',
        createdAt: '2025-10-15T10:00:00Z',
      },
    ],
    openRisksCount: 1,
    documentsCount: 56,
    documents: [],
    notes: [],
    tags: ['assainissement', 'ville', 'hydraulique'],
    location: {
      region: 'Littoral',
      city: 'Cotonou',
      coordinates: { lat: 6.3703, lng: 2.3912 },
    },
    metrics: {
      onTimeDelivery: 88,
      budgetVariance: -4.4,
      qualityScore: 90,
      clientSatisfaction: 85,
      teamProductivity: 92,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T11:30:00Z',
    activitiesCount: 167,
  },
  {
    id: 'PRJ-006',
    code: 'HOP-SIK-2025',
    title: 'Hôpital Régional Sikasso',
    description: 'Construction d\'un hôpital régional de 150 lits avec bloc opératoire, services d\'urgence et maternité.',
    client: {
      name: 'Ministère de la Santé',
      contact: 'Dr. Fatoumata Diakité',
      email: 'f.diakite@sante.gov.ml',
      phone: '+223 20 22 78 90',
    },
    bureau: 'BM',
    status: 'completed',
    phase: 'closure',
    priority: 'high',
    type: 'Bâtiment',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    actualEndDate: '2025-12-28',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-12-28T15:00:00Z',
    progress: 100,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 100, weight: 50 },
      { phase: 'testing', progress: 100, weight: 15 },
      { phase: 'closure', progress: 100, weight: 5 },
    ],
    budget: {
      initial: 980000000,
      current: 980000000,
      consumed: 945000000,
      committed: 0,
      forecast: 945000000,
      currency: 'XOF',
    },
    teamSize: 18,
    teamLead: {
      id: 'USR-050',
      name: 'Ing. Seydou Coulibaly',
      role: 'Chef de projet',
      department: 'Bâtiment',
      allocation: 0,
    },
    team: [],
    milestonesTotal: 12,
    milestonesCompleted: 12,
    riskLevel: 'low',
    risks: [],
    openRisksCount: 0,
    documentsCount: 145,
    documents: [],
    notes: [],
    tags: ['santé', 'hôpital', 'terminé', 'succès'],
    location: {
      region: 'Sikasso',
      city: 'Sikasso',
      coordinates: { lat: 11.3175, lng: -5.6665 },
    },
    metrics: {
      onTimeDelivery: 100,
      budgetVariance: 3.6,
      qualityScore: 96,
      clientSatisfaction: 98,
      teamProductivity: 95,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2025-12-28T15:00:00Z',
    activitiesCount: 456,
  },
  {
    id: 'PRJ-007',
    code: 'AER-BOBO-2025',
    title: 'Aéroport Régional Bobo-Dioulasso',
    description: 'Modernisation et extension de l\'aéroport régional: nouvelle piste de 3000m, terminal passagers et zone cargo.',
    client: {
      name: 'Direction Aviation Civile',
      contact: 'M. Abdoulaye Compaoré',
      email: 'a.compaore@dgac.bf',
      phone: '+226 25 33 12 34',
    },
    bureau: 'BF',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Infrastructure',
    startDate: '2025-08-01',
    endDate: '2027-06-30',
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    progress: 28,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 22, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 5200000000,
      current: 5200000000,
      consumed: 1456000000,
      committed: 850000000,
      forecast: 5400000000,
      currency: 'XOF',
    },
    teamSize: 25,
    teamLead: {
      id: 'USR-060',
      name: 'Ing. Jean-Pierre Kaboré',
      role: 'Chef de projet',
      department: 'Infrastructure',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 15,
    milestonesCompleted: 4,
    nextMilestone: {
      id: 'MS-065',
      title: 'Fin terrassement piste',
      dueDate: '2026-03-15',
      daysRemaining: 64,
    },
    riskLevel: 'medium',
    risks: [],
    openRisksCount: 2,
    documentsCount: 89,
    documents: [],
    notes: [],
    tags: ['aéroport', 'aviation', 'stratégique', 'pluriannuel'],
    location: {
      region: 'Hauts-Bassins',
      city: 'Bobo-Dioulasso',
      coordinates: { lat: 11.1604, lng: -4.3309 },
    },
    metrics: {
      onTimeDelivery: 92,
      budgetVariance: -3.8,
      qualityScore: 91,
      clientSatisfaction: 88,
      teamProductivity: 90,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T08:00:00Z',
    activitiesCount: 178,
  },
  {
    id: 'PRJ-008',
    code: 'PI-NIA-2025',
    title: 'Parc Industriel Niamey',
    description: 'Aménagement d\'un parc industriel de 50 hectares avec voiries, réseaux, et bâtiments industriels.',
    client: {
      name: 'Ministère de l\'Industrie',
      contact: 'M. Mahamadou Issoufou',
      email: 'm.issoufou@industrie.ne',
      phone: '+227 20 73 45 67',
    },
    bureau: 'BM',
    status: 'delayed',
    phase: 'execution',
    priority: 'medium',
    type: 'Aménagement',
    startDate: '2025-04-01',
    endDate: '2026-12-31',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-01-09T14:00:00Z',
    progress: 22,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 15, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 3800000000,
      current: 4200000000,
      consumed: 836000000,
      committed: 450000000,
      forecast: 4500000000,
      currency: 'XOF',
    },
    teamSize: 20,
    teamLead: {
      id: 'USR-070',
      name: 'Ing. Ali Maïga',
      role: 'Chef de projet',
      department: 'Aménagement',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 9,
    milestonesCompleted: 2,
    nextMilestone: {
      id: 'MS-073',
      title: 'VRD phase 1',
      dueDate: '2026-01-30',
      daysRemaining: 20,
    },
    riskLevel: 'high',
    risks: [
      {
        id: 'RSK-070',
        title: 'Problèmes fonciers',
        description: 'Contestations de propriété sur une partie du terrain',
        level: 'high',
        category: 'external',
        probability: 4,
        impact: 5,
        mitigation: 'Procédures juridiques en cours, négociations parallèles',
        owner: 'Ali Maïga',
        status: 'open',
        createdAt: '2025-08-20T10:00:00Z',
      },
    ],
    openRisksCount: 3,
    documentsCount: 67,
    documents: [],
    notes: [],
    tags: ['industrie', 'aménagement', 'retard', 'foncier'],
    location: {
      region: 'Niamey',
      city: 'Niamey',
      coordinates: { lat: 13.5127, lng: 2.1128 },
    },
    metrics: {
      onTimeDelivery: 55,
      budgetVariance: -18.4,
      qualityScore: 82,
      clientSatisfaction: 65,
      teamProductivity: 72,
    },
    dependencies: ['PRJ-015'],
    blockedBy: [],
    lastActivity: '2026-01-09T14:00:00Z',
    activitiesCount: 134,
  },
  {
    id: 'PRJ-009',
    code: 'LOG-DAK-2026',
    title: 'Logements Sociaux Dakar',
    description: 'Construction de 200 logements sociaux T3 et T4 dans le quartier de Pikine.',
    client: {
      name: 'Société Nationale d\'Habitation',
      contact: 'Mme. Mariama Diop',
      email: 'm.diop@snh.sn',
      phone: '+221 33 822 56 78',
    },
    bureau: 'BM',
    status: 'planning',
    phase: 'estimation',
    priority: 'medium',
    type: 'Bâtiment',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
    progress: 12,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 20 },
      { phase: 'estimation', progress: 60, weight: 15 },
      { phase: 'validation', progress: 0, weight: 10 },
      { phase: 'execution', progress: 0, weight: 45 },
      { phase: 'testing', progress: 0, weight: 5 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 2800000000,
      current: 2800000000,
      consumed: 84000000,
      committed: 0,
      forecast: 2800000000,
      currency: 'XOF',
    },
    teamSize: 8,
    teamLead: {
      id: 'USR-080',
      name: 'Ing. Cheikh Ndiaye',
      role: 'Chef de projet',
      department: 'Bâtiment',
      allocation: 60,
    },
    team: [],
    milestonesTotal: 8,
    milestonesCompleted: 1,
    nextMilestone: {
      id: 'MS-082',
      title: 'Finalisation APD',
      dueDate: '2026-02-15',
      daysRemaining: 36,
    },
    riskLevel: 'low',
    risks: [],
    openRisksCount: 0,
    documentsCount: 25,
    documents: [],
    notes: [],
    tags: ['logement social', 'habitat', 'planification'],
    location: {
      region: 'Dakar',
      city: 'Pikine',
      coordinates: { lat: 14.7645, lng: -17.3908 },
    },
    metrics: {
      onTimeDelivery: 100,
      budgetVariance: 0,
      qualityScore: 0,
      clientSatisfaction: 85,
      teamProductivity: 88,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-08T14:00:00Z',
    activitiesCount: 34,
  },
  {
    id: 'PRJ-010',
    code: 'STADE-ABJ-2025',
    title: 'Rénovation Stade Félix Houphouët',
    description: 'Rénovation complète du stade national: pelouse, gradins, éclairage et installations VIP.',
    client: {
      name: 'Ministère des Sports',
      contact: 'M. Konan Bédié',
      email: 'k.bedie@sports.ci',
      phone: '+225 27 20 34 56',
    },
    bureau: 'BCT',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Réhabilitation',
    startDate: '2025-07-01',
    endDate: '2026-05-31',
    createdAt: '2025-04-15T08:00:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
    progress: 55,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 10 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 52, weight: 60 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 1500000000,
      current: 1580000000,
      consumed: 790000000,
      committed: 280000000,
      forecast: 1600000000,
      currency: 'XOF',
    },
    teamSize: 14,
    teamLead: {
      id: 'USR-090',
      name: 'Ing. Yao Kouassi',
      role: 'Chef de projet',
      department: 'Réhabilitation',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 6,
    milestonesCompleted: 3,
    nextMilestone: {
      id: 'MS-094',
      title: 'Installation éclairage LED',
      dueDate: '2026-02-28',
      daysRemaining: 49,
    },
    riskLevel: 'medium',
    risks: [],
    openRisksCount: 1,
    documentsCount: 52,
    documents: [],
    notes: [],
    tags: ['sport', 'rénovation', 'stade', 'événementiel'],
    location: {
      region: 'Abidjan',
      city: 'Abidjan',
      coordinates: { lat: 5.3600, lng: -4.0083 },
    },
    metrics: {
      onTimeDelivery: 90,
      budgetVariance: -6.7,
      qualityScore: 93,
      clientSatisfaction: 91,
      teamProductivity: 94,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T09:30:00Z',
    activitiesCount: 189,
  },
  {
    id: 'PRJ-011',
    code: 'UNI-OUA-2026',
    title: 'Campus Universitaire Ouagadougou',
    description: 'Construction d\'un nouveau campus universitaire: 5 amphithéâtres, bibliothèque, résidence étudiante.',
    client: {
      name: 'Université de Ouagadougou',
      contact: 'Pr. Salif Diallo',
      email: 's.diallo@univ-ouaga.bf',
      phone: '+226 25 30 71 23',
    },
    bureau: 'BF',
    status: 'planning',
    phase: 'conception',
    priority: 'high',
    type: 'Bâtiment',
    startDate: '2026-06-01',
    endDate: '2028-08-31',
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2026-01-09T11:00:00Z',
    progress: 8,
    progressByPhase: [
      { phase: 'conception', progress: 40, weight: 20 },
      { phase: 'estimation', progress: 0, weight: 15 },
      { phase: 'validation', progress: 0, weight: 10 },
      { phase: 'execution', progress: 0, weight: 45 },
      { phase: 'testing', progress: 0, weight: 5 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 8500000000,
      current: 8500000000,
      consumed: 425000000,
      committed: 0,
      forecast: 8500000000,
      currency: 'XOF',
    },
    teamSize: 12,
    teamLead: {
      id: 'USR-100',
      name: 'Ing. Arouna Somé',
      role: 'Chef de projet',
      department: 'Bâtiment',
      allocation: 80,
    },
    team: [],
    milestonesTotal: 20,
    milestonesCompleted: 0,
    nextMilestone: {
      id: 'MS-101',
      title: 'Validation esquisse',
      dueDate: '2026-02-28',
      daysRemaining: 49,
    },
    riskLevel: 'low',
    risks: [],
    openRisksCount: 0,
    documentsCount: 15,
    documents: [],
    notes: [],
    tags: ['éducation', 'université', 'campus', 'pluriannuel'],
    location: {
      region: 'Centre',
      city: 'Ouagadougou',
      coordinates: { lat: 12.3569, lng: -1.5352 },
    },
    metrics: {
      onTimeDelivery: 100,
      budgetVariance: 0,
      qualityScore: 0,
      clientSatisfaction: 92,
      teamProductivity: 90,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-09T11:00:00Z',
    activitiesCount: 28,
  },
  {
    id: 'PRJ-012',
    code: 'PORT-LOM-2025',
    title: 'Extension Port de Lomé',
    description: 'Extension du port autonome de Lomé: 2 nouveaux quais, zone de stockage conteneurs.',
    client: {
      name: 'Port Autonome de Lomé',
      contact: 'M. Kodjo Amegan',
      email: 'k.amegan@portlome.tg',
      phone: '+228 22 27 45 89',
    },
    bureau: 'BJ',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Infrastructure',
    startDate: '2025-03-01',
    endDate: '2026-09-30',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2026-01-10T16:00:00Z',
    progress: 58,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 55, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 6200000000,
      current: 6200000000,
      consumed: 3596000000,
      committed: 620000000,
      forecast: 6100000000,
      currency: 'XOF',
    },
    teamSize: 22,
    teamLead: {
      id: 'USR-110',
      name: 'Ing. Mensah Agbeko',
      role: 'Chef de projet',
      department: 'Infrastructure Maritime',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 10,
    milestonesCompleted: 6,
    nextMilestone: {
      id: 'MS-117',
      title: 'Fin quai n°1',
      dueDate: '2026-02-20',
      daysRemaining: 41,
    },
    riskLevel: 'medium',
    risks: [],
    openRisksCount: 2,
    documentsCount: 98,
    documents: [],
    notes: [],
    tags: ['port', 'maritime', 'infrastructure', 'stratégique'],
    location: {
      region: 'Maritime',
      city: 'Lomé',
      coordinates: { lat: 6.1319, lng: 1.2228 },
    },
    metrics: {
      onTimeDelivery: 88,
      budgetVariance: 1.6,
      qualityScore: 94,
      clientSatisfaction: 92,
      teamProductivity: 96,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T16:00:00Z',
    activitiesCount: 287,
  },
  {
    id: 'PRJ-013',
    code: 'HOPX-OUA-2026',
    title: 'Hôpital Pédiatrique Ouagadougou',
    description: 'Construction d\'un hôpital pédiatrique de 100 lits avec service d\'urgences et unité de soins intensifs.',
    client: {
      name: 'Ministère de la Santé BF',
      contact: 'Dr. Mariam Sanou',
      email: 'm.sanou@sante.bf',
      phone: '+226 25 30 89 12',
    },
    bureau: 'BF',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Bâtiment',
    startDate: '2025-09-01',
    endDate: '2026-11-30',
    createdAt: '2025-06-15T08:00:00Z',
    updatedAt: '2026-01-10T10:30:00Z',
    progress: 35,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 30, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 1200000000,
      current: 1200000000,
      consumed: 420000000,
      committed: 180000000,
      forecast: 1200000000,
      currency: 'XOF',
    },
    teamSize: 16,
    teamLead: {
      id: 'USR-120',
      name: 'Ing. Issa Ouédraogo',
      role: 'Chef de projet',
      department: 'Bâtiment Santé',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 8,
    milestonesCompleted: 3,
    nextMilestone: {
      id: 'MS-124',
      title: 'Fin gros œuvre aile A',
      dueDate: '2026-02-05',
      daysRemaining: 26,
    },
    riskLevel: 'low',
    risks: [],
    openRisksCount: 0,
    documentsCount: 48,
    documents: [],
    notes: [],
    tags: ['santé', 'pédiatrie', 'hôpital', 'prioritaire'],
    location: {
      region: 'Centre',
      city: 'Ouagadougou',
      coordinates: { lat: 12.3896, lng: -1.4987 },
    },
    metrics: {
      onTimeDelivery: 95,
      budgetVariance: 0,
      qualityScore: 94,
      clientSatisfaction: 95,
      teamProductivity: 93,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T10:30:00Z',
    activitiesCount: 112,
  },
  {
    id: 'PRJ-014',
    code: 'BARR-NIG-2025',
    title: 'Barrage Hydroélectrique Niger',
    description: 'Construction d\'un barrage hydroélectrique de 50MW sur le fleuve Niger.',
    client: {
      name: 'Société Nigérienne d\'Électricité',
      contact: 'M. Ibrahim Adamou',
      email: 'i.adamou@nigelec.ne',
      phone: '+227 20 72 34 56',
    },
    bureau: 'BM',
    status: 'active',
    phase: 'execution',
    priority: 'high',
    type: 'Infrastructure',
    startDate: '2025-02-01',
    endDate: '2027-12-31',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
    progress: 32,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 28, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 12000000000,
      current: 12500000000,
      consumed: 3840000000,
      committed: 1500000000,
      forecast: 12800000000,
      currency: 'XOF',
    },
    teamSize: 35,
    teamLead: {
      id: 'USR-130',
      name: 'Ing. Moussa Tandina',
      role: 'Chef de projet',
      department: 'Hydraulique',
      allocation: 100,
    },
    team: [],
    milestonesTotal: 18,
    milestonesCompleted: 5,
    nextMilestone: {
      id: 'MS-136',
      title: 'Fin batardeau rive gauche',
      dueDate: '2026-03-01',
      daysRemaining: 50,
    },
    riskLevel: 'medium',
    risks: [
      {
        id: 'RSK-130',
        title: 'Crue exceptionnelle',
        description: 'Risque de crue durant la saison des pluies',
        level: 'medium',
        category: 'external',
        probability: 3,
        impact: 4,
        mitigation: 'Planification travaux en saison sèche, dispositifs de protection',
        owner: 'Moussa Tandina',
        status: 'mitigated',
        createdAt: '2025-05-15T10:00:00Z',
      },
    ],
    openRisksCount: 2,
    documentsCount: 156,
    documents: [],
    notes: [],
    tags: ['énergie', 'barrage', 'hydroélectrique', 'pluriannuel', 'stratégique'],
    location: {
      region: 'Niamey',
      city: 'Kandadji',
      coordinates: { lat: 14.6028, lng: 0.9672 },
    },
    metrics: {
      onTimeDelivery: 85,
      budgetVariance: -6.7,
      qualityScore: 92,
      clientSatisfaction: 88,
      teamProductivity: 91,
    },
    dependencies: [],
    blockedBy: [],
    lastActivity: '2026-01-10T14:00:00Z',
    activitiesCount: 298,
  },
  {
    id: 'PRJ-015',
    code: 'VRD-NIA-2025',
    title: 'VRD Zone Industrielle Niamey',
    description: 'Travaux de voiries et réseaux divers pour la zone industrielle de Niamey - Phase préparatoire.',
    client: {
      name: 'Ministère de l\'Industrie',
      contact: 'M. Mahamadou Issoufou',
      email: 'm.issoufou@industrie.ne',
      phone: '+227 20 73 45 67',
    },
    bureau: 'BM',
    status: 'on-hold',
    phase: 'execution',
    priority: 'low',
    type: 'Infrastructure',
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    createdAt: '2025-04-01T08:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z',
    progress: 45,
    progressByPhase: [
      { phase: 'conception', progress: 100, weight: 15 },
      { phase: 'estimation', progress: 100, weight: 10 },
      { phase: 'validation', progress: 100, weight: 5 },
      { phase: 'execution', progress: 40, weight: 55 },
      { phase: 'testing', progress: 0, weight: 10 },
      { phase: 'closure', progress: 0, weight: 5 },
    ],
    budget: {
      initial: 450000000,
      current: 450000000,
      consumed: 180000000,
      committed: 50000000,
      forecast: 450000000,
      currency: 'XOF',
    },
    teamSize: 8,
    teamLead: {
      id: 'USR-140',
      name: 'Ing. Abdou Garba',
      role: 'Chef de projet',
      department: 'VRD',
      allocation: 0,
    },
    team: [],
    milestonesTotal: 4,
    milestonesCompleted: 2,
    riskLevel: 'medium',
    risks: [
      {
        id: 'RSK-150',
        title: 'Suspension financement',
        description: 'Budget suspendu en attente de résolution des problèmes fonciers du projet principal',
        level: 'high',
        category: 'financial',
        probability: 5,
        impact: 5,
        mitigation: 'En attente de décision',
        owner: 'Direction',
        status: 'open',
        createdAt: '2025-11-10T10:00:00Z',
      },
    ],
    openRisksCount: 1,
    documentsCount: 28,
    documents: [],
    notes: [
      {
        id: 'NOTE-150',
        content: 'Projet suspendu en attente de la résolution des problèmes fonciers du projet PRJ-008.',
        author: 'Direction',
        authorRole: 'Direction Générale',
        createdAt: '2025-11-15T10:00:00Z',
        type: 'decision',
        pinned: true,
      },
    ],
    tags: ['suspendu', 'VRD', 'dépendance'],
    location: {
      region: 'Niamey',
      city: 'Niamey',
      coordinates: { lat: 13.5127, lng: 2.1128 },
    },
    metrics: {
      onTimeDelivery: 60,
      budgetVariance: 0,
      qualityScore: 88,
      clientSatisfaction: 70,
      teamProductivity: 75,
    },
    dependencies: ['PRJ-008'],
    blockedBy: ['PRJ-008'],
    lastActivity: '2025-11-15T10:00:00Z',
    activitiesCount: 67,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find((p) => p.id === id);
};

export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return mockProjects.filter((p) => p.status === status);
};

export const getProjectsByBureau = (bureau: Bureau): Project[] => {
  return mockProjects.filter((p) => p.bureau === bureau);
};

export const getProjectsByPriority = (priority: ProjectPriority): Project[] => {
  return mockProjects.filter((p) => p.priority === priority);
};

export const getDelayedProjects = (): Project[] => {
  return mockProjects.filter((p) => p.status === 'delayed');
};

export const getActiveProjects = (): Project[] => {
  return mockProjects.filter((p) => p.status === 'active');
};

export const getAtRiskProjects = (): Project[] => {
  return mockProjects.filter((p) => p.riskLevel === 'high' || p.status === 'delayed');
};

export const searchProjects = (query: string): Project[] => {
  const lowerQuery = query.toLowerCase();
  return mockProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.code.toLowerCase().includes(lowerQuery) ||
      p.client.name.toLowerCase().includes(lowerQuery) ||
      p.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
};

