/**
 * Mock Data - Teams (Équipes)
 * Données réalistes pour la gestion des équipes projets
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TeamDepartment = 
  | 'Infrastructure' 
  | 'Bâtiment' 
  | 'Ouvrages d\'art' 
  | 'Hydraulique' 
  | 'Aménagement' 
  | 'Topographie' 
  | 'Géotechnique' 
  | 'Qualité'
  | 'Direction'
  | 'Support';

export type MemberRole = 
  | 'chef_projet' 
  | 'ingenieur_senior' 
  | 'ingenieur' 
  | 'technicien_senior' 
  | 'technicien' 
  | 'geometre' 
  | 'controleur' 
  | 'assistant';

export type MemberStatus = 'active' | 'on-leave' | 'unavailable' | 'training';

export interface Skill {
  name: string;
  level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  certified: boolean;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: TeamDepartment;
  role: MemberRole;
  roleLabel: string;
  status: MemberStatus;
  bureau: 'BF' | 'BM' | 'BJ' | 'BCT';
  
  // Experience
  yearsExperience: number;
  joinDate: string;
  skills: Skill[];
  certifications: string[];
  
  // Workload
  currentProjects: string[];
  allocation: number; // total allocation percentage
  availability: number; // remaining availability
  hoursThisWeek: number;
  hoursCapacity: number;
  
  // Performance
  projectsCompleted: number;
  onTimeDelivery: number;
  qualityScore: number;
  
  // Contact
  isOnline: boolean;
  lastSeen?: string;
}

export interface Team {
  id: string;
  name: string;
  department: TeamDepartment;
  bureau: 'BF' | 'BM' | 'BJ' | 'BCT';
  description: string;
  
  // Members
  leaderId: string;
  leader: TeamMember;
  members: TeamMember[];
  memberCount: number;
  
  // Projects
  activeProjects: string[];
  projectCount: number;
  
  // Capacity
  totalCapacity: number; // total hours per week
  usedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  
  // Performance
  avgOnTimeDelivery: number;
  avgQualityScore: number;
  completedProjects: number;
  
  // Status
  status: 'operational' | 'overloaded' | 'understaffed' | 'on-project';
  createdAt: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  projectTitle: string;
  memberId: string;
  memberName: string;
  role: string;
  allocation: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planned';
  hoursLogged: number;
  hoursEstimated: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - MEMBERS
// ═══════════════════════════════════════════════════════════════════════════

export const mockTeamMembers: TeamMember[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Bureau BF - Infrastructure
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'USR-001',
    firstName: 'Moussa',
    lastName: 'Konaté',
    email: 'm.konate@bmo.bf',
    phone: '+226 70 12 34 56',
    department: 'Infrastructure',
    role: 'chef_projet',
    roleLabel: 'Chef de projet Senior',
    status: 'active',
    bureau: 'BF',
    yearsExperience: 15,
    joinDate: '2015-03-15',
    skills: [
      { name: 'Gestion de projet', level: 'expert', certified: true },
      { name: 'Routes et chaussées', level: 'expert', certified: true },
      { name: 'MS Project', level: 'advanced', certified: false },
    ],
    certifications: ['PMP', 'PRINCE2'],
    currentProjects: ['PRJ-001', 'PRJ-007'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 45,
    hoursCapacity: 40,
    projectsCompleted: 28,
    onTimeDelivery: 92,
    qualityScore: 95,
    isOnline: true,
  },
  {
    id: 'USR-002',
    firstName: 'Fatou',
    lastName: 'Diarra',
    email: 'f.diarra@bmo.bf',
    phone: '+226 70 23 45 67',
    department: 'Infrastructure',
    role: 'ingenieur_senior',
    roleLabel: 'Ingénieur civil Senior',
    status: 'active',
    bureau: 'BF',
    yearsExperience: 10,
    joinDate: '2018-06-01',
    skills: [
      { name: 'Génie civil', level: 'expert', certified: true },
      { name: 'Béton armé', level: 'expert', certified: true },
      { name: 'AutoCAD', level: 'advanced', certified: true },
    ],
    certifications: ['Ingénieur agréé'],
    currentProjects: ['PRJ-001'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 42,
    hoursCapacity: 40,
    projectsCompleted: 18,
    onTimeDelivery: 94,
    qualityScore: 96,
    isOnline: true,
  },
  {
    id: 'USR-003',
    firstName: 'Ibrahim',
    lastName: 'Touré',
    email: 'i.toure@bmo.bf',
    phone: '+226 70 34 56 78',
    department: 'Topographie',
    role: 'geometre',
    roleLabel: 'Géomètre Principal',
    status: 'active',
    bureau: 'BF',
    yearsExperience: 12,
    joinDate: '2016-02-15',
    skills: [
      { name: 'Topographie', level: 'expert', certified: true },
      { name: 'GPS différentiel', level: 'expert', certified: true },
      { name: 'Covadis', level: 'advanced', certified: false },
    ],
    certifications: ['Géomètre Expert'],
    currentProjects: ['PRJ-001', 'PRJ-011'],
    allocation: 80,
    availability: 20,
    hoursThisWeek: 32,
    hoursCapacity: 40,
    projectsCompleted: 35,
    onTimeDelivery: 98,
    qualityScore: 97,
    isOnline: true,
  },
  {
    id: 'USR-004',
    firstName: 'Awa',
    lastName: 'Coulibaly',
    email: 'a.coulibaly@bmo.bf',
    phone: '+226 70 45 67 89',
    department: 'Qualité',
    role: 'controleur',
    roleLabel: 'Contrôleur Qualité',
    status: 'active',
    bureau: 'BF',
    yearsExperience: 8,
    joinDate: '2019-09-01',
    skills: [
      { name: 'Contrôle qualité', level: 'expert', certified: true },
      { name: 'Essais matériaux', level: 'advanced', certified: true },
      { name: 'Normes ISO', level: 'advanced', certified: true },
    ],
    certifications: ['ISO 9001 Lead Auditor'],
    currentProjects: ['PRJ-001', 'PRJ-007', 'PRJ-013'],
    allocation: 60,
    availability: 40,
    hoursThisWeek: 24,
    hoursCapacity: 40,
    projectsCompleted: 22,
    onTimeDelivery: 100,
    qualityScore: 99,
    isOnline: false,
    lastSeen: '2026-01-10T12:30:00Z',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Bureau BM - Ouvrages d'art
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'USR-010',
    firstName: 'Ousmane',
    lastName: 'Mbaye',
    email: 'o.mbaye@bmo.sn',
    phone: '+221 77 123 45 67',
    department: 'Ouvrages d\'art',
    role: 'chef_projet',
    roleLabel: 'Chef de projet',
    status: 'active',
    bureau: 'BM',
    yearsExperience: 12,
    joinDate: '2017-01-10',
    skills: [
      { name: 'Ponts et ouvrages', level: 'expert', certified: true },
      { name: 'Calcul de structures', level: 'expert', certified: true },
      { name: 'ROBOT Structural', level: 'advanced', certified: false },
    ],
    certifications: ['Ingénieur Structures'],
    currentProjects: ['PRJ-002'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 48,
    hoursCapacity: 40,
    projectsCompleted: 15,
    onTimeDelivery: 85,
    qualityScore: 92,
    isOnline: true,
  },
  {
    id: 'USR-011',
    firstName: 'Mamadou',
    lastName: 'Fall',
    email: 'm.fall@bmo.sn',
    phone: '+221 77 234 56 78',
    department: 'Ouvrages d\'art',
    role: 'ingenieur_senior',
    roleLabel: 'Ingénieur structure',
    status: 'active',
    bureau: 'BM',
    yearsExperience: 9,
    joinDate: '2018-04-01',
    skills: [
      { name: 'Calcul BA', level: 'expert', certified: true },
      { name: 'Eurocode', level: 'advanced', certified: true },
      { name: 'Précontrainte', level: 'advanced', certified: false },
    ],
    certifications: [],
    currentProjects: ['PRJ-002'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 44,
    hoursCapacity: 40,
    projectsCompleted: 12,
    onTimeDelivery: 88,
    qualityScore: 94,
    isOnline: true,
  },
  {
    id: 'USR-012',
    firstName: 'Aïssatou',
    lastName: 'Ndoye',
    email: 'a.ndoye@bmo.sn',
    phone: '+221 77 345 67 89',
    department: 'Géotechnique',
    role: 'ingenieur',
    roleLabel: 'Ingénieur géotechnique',
    status: 'active',
    bureau: 'BM',
    yearsExperience: 6,
    joinDate: '2020-02-15',
    skills: [
      { name: 'Mécanique des sols', level: 'advanced', certified: true },
      { name: 'Essais in-situ', level: 'advanced', certified: true },
      { name: 'PLAXIS', level: 'intermediate', certified: false },
    ],
    certifications: [],
    currentProjects: ['PRJ-002', 'PRJ-014'],
    allocation: 80,
    availability: 20,
    hoursThisWeek: 32,
    hoursCapacity: 40,
    projectsCompleted: 8,
    onTimeDelivery: 90,
    qualityScore: 91,
    isOnline: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Bureau BM - Bâtiment
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'USR-020',
    firstName: 'Kadiatou',
    lastName: 'Keita',
    email: 'k.keita@bmo.ml',
    phone: '+223 66 12 34 56',
    department: 'Bâtiment',
    role: 'chef_projet',
    roleLabel: 'Chef de projet',
    status: 'active',
    bureau: 'BM',
    yearsExperience: 14,
    joinDate: '2014-06-01',
    skills: [
      { name: 'Gestion de projet', level: 'expert', certified: true },
      { name: 'Bâtiment tous corps', level: 'expert', certified: false },
      { name: 'REVIT', level: 'advanced', certified: true },
    ],
    certifications: ['PMP'],
    currentProjects: ['PRJ-003'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 42,
    hoursCapacity: 40,
    projectsCompleted: 25,
    onTimeDelivery: 96,
    qualityScore: 95,
    isOnline: true,
  },
  {
    id: 'USR-050',
    firstName: 'Seydou',
    lastName: 'Coulibaly',
    email: 's.coulibaly@bmo.ml',
    phone: '+223 66 23 45 67',
    department: 'Bâtiment',
    role: 'chef_projet',
    roleLabel: 'Chef de projet Senior',
    status: 'active',
    bureau: 'BM',
    yearsExperience: 18,
    joinDate: '2012-01-15',
    skills: [
      { name: 'Gestion de projet', level: 'expert', certified: true },
      { name: 'Bâtiments hospitaliers', level: 'expert', certified: false },
      { name: 'Coordination BIM', level: 'advanced', certified: true },
    ],
    certifications: ['PMP', 'PRINCE2'],
    currentProjects: [],
    allocation: 0,
    availability: 100,
    hoursThisWeek: 0,
    hoursCapacity: 40,
    projectsCompleted: 42,
    onTimeDelivery: 94,
    qualityScore: 97,
    isOnline: false,
    lastSeen: '2025-12-28T17:00:00Z',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Bureau BJ - Hydraulique
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'USR-040',
    firstName: 'Pascal',
    lastName: 'Adjovi',
    email: 'p.adjovi@bmo.bj',
    phone: '+229 97 12 34 56',
    department: 'Hydraulique',
    role: 'chef_projet',
    roleLabel: 'Chef de projet',
    status: 'active',
    bureau: 'BJ',
    yearsExperience: 11,
    joinDate: '2017-08-01',
    skills: [
      { name: 'Hydraulique urbaine', level: 'expert', certified: true },
      { name: 'Assainissement', level: 'expert', certified: true },
      { name: 'EPANET', level: 'advanced', certified: false },
    ],
    certifications: ['Ingénieur hydraulicien'],
    currentProjects: ['PRJ-005'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 40,
    hoursCapacity: 40,
    projectsCompleted: 16,
    onTimeDelivery: 91,
    qualityScore: 93,
    isOnline: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Bureau BCT
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'USR-090',
    firstName: 'Yao',
    lastName: 'Kouassi',
    email: 'y.kouassi@bmo.ci',
    phone: '+225 07 12 34 56',
    department: 'Bâtiment',
    role: 'chef_projet',
    roleLabel: 'Chef de projet',
    status: 'active',
    bureau: 'BCT',
    yearsExperience: 10,
    joinDate: '2018-03-01',
    skills: [
      { name: 'Réhabilitation', level: 'expert', certified: false },
      { name: 'Diagnostic bâtiment', level: 'expert', certified: true },
      { name: 'Gestion de projet', level: 'advanced', certified: true },
    ],
    certifications: ['PMP'],
    currentProjects: ['PRJ-010'],
    allocation: 100,
    availability: 0,
    hoursThisWeek: 38,
    hoursCapacity: 40,
    projectsCompleted: 14,
    onTimeDelivery: 93,
    qualityScore: 94,
    isOnline: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - TEAMS
// ═══════════════════════════════════════════════════════════════════════════

export const mockTeams: Team[] = [
  {
    id: 'TEAM-001',
    name: 'Infrastructure BF',
    department: 'Infrastructure',
    bureau: 'BF',
    description: 'Équipe dédiée aux projets d\'infrastructure routière du Burkina Faso',
    leaderId: 'USR-001',
    leader: mockTeamMembers.find(m => m.id === 'USR-001')!,
    members: mockTeamMembers.filter(m => m.bureau === 'BF' && m.department === 'Infrastructure'),
    memberCount: 12,
    activeProjects: ['PRJ-001', 'PRJ-007', 'PRJ-013'],
    projectCount: 3,
    totalCapacity: 480,
    usedCapacity: 420,
    availableCapacity: 60,
    utilizationRate: 87.5,
    avgOnTimeDelivery: 93,
    avgQualityScore: 95,
    completedProjects: 45,
    status: 'operational',
    createdAt: '2015-01-01T00:00:00Z',
  },
  {
    id: 'TEAM-002',
    name: 'Ouvrages d\'art BM',
    department: 'Ouvrages d\'art',
    bureau: 'BM',
    description: 'Équipe spécialisée dans les ponts et grands ouvrages',
    leaderId: 'USR-010',
    leader: mockTeamMembers.find(m => m.id === 'USR-010')!,
    members: mockTeamMembers.filter(m => m.bureau === 'BM' && m.department === 'Ouvrages d\'art'),
    memberCount: 8,
    activeProjects: ['PRJ-002'],
    projectCount: 1,
    totalCapacity: 320,
    usedCapacity: 300,
    availableCapacity: 20,
    utilizationRate: 93.8,
    avgOnTimeDelivery: 86,
    avgQualityScore: 93,
    completedProjects: 22,
    status: 'overloaded',
    createdAt: '2016-06-01T00:00:00Z',
  },
  {
    id: 'TEAM-003',
    name: 'Bâtiment BM',
    department: 'Bâtiment',
    bureau: 'BM',
    description: 'Équipe bâtiment tous corps d\'état',
    leaderId: 'USR-020',
    leader: mockTeamMembers.find(m => m.id === 'USR-020')!,
    members: mockTeamMembers.filter(m => m.bureau === 'BM' && m.department === 'Bâtiment'),
    memberCount: 15,
    activeProjects: ['PRJ-003', 'PRJ-008', 'PRJ-009', 'PRJ-014'],
    projectCount: 4,
    totalCapacity: 600,
    usedCapacity: 480,
    availableCapacity: 120,
    utilizationRate: 80,
    avgOnTimeDelivery: 94,
    avgQualityScore: 96,
    completedProjects: 68,
    status: 'operational',
    createdAt: '2014-03-15T00:00:00Z',
  },
  {
    id: 'TEAM-004',
    name: 'Hydraulique BJ',
    department: 'Hydraulique',
    bureau: 'BJ',
    description: 'Équipe spécialisée en hydraulique et assainissement',
    leaderId: 'USR-040',
    leader: mockTeamMembers.find(m => m.id === 'USR-040')!,
    members: mockTeamMembers.filter(m => m.bureau === 'BJ'),
    memberCount: 10,
    activeProjects: ['PRJ-005', 'PRJ-012'],
    projectCount: 2,
    totalCapacity: 400,
    usedCapacity: 360,
    availableCapacity: 40,
    utilizationRate: 90,
    avgOnTimeDelivery: 89,
    avgQualityScore: 92,
    completedProjects: 28,
    status: 'operational',
    createdAt: '2017-01-01T00:00:00Z',
  },
  {
    id: 'TEAM-005',
    name: 'Réhabilitation BCT',
    department: 'Bâtiment',
    bureau: 'BCT',
    description: 'Équipe spécialisée en réhabilitation et rénovation',
    leaderId: 'USR-090',
    leader: mockTeamMembers.find(m => m.id === 'USR-090')!,
    members: mockTeamMembers.filter(m => m.bureau === 'BCT'),
    memberCount: 6,
    activeProjects: ['PRJ-010'],
    projectCount: 1,
    totalCapacity: 240,
    usedCapacity: 180,
    availableCapacity: 60,
    utilizationRate: 75,
    avgOnTimeDelivery: 93,
    avgQualityScore: 94,
    completedProjects: 18,
    status: 'operational',
    createdAt: '2018-06-01T00:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════════════════

export const mockAssignments: ProjectAssignment[] = [
  {
    id: 'ASSIGN-001',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    memberId: 'USR-001',
    memberName: 'Moussa Konaté',
    role: 'Chef de projet',
    allocation: 100,
    startDate: '2026-01-15',
    status: 'active',
    hoursLogged: 180,
    hoursEstimated: 2000,
  },
  {
    id: 'ASSIGN-002',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    memberId: 'USR-002',
    memberName: 'Fatou Diarra',
    role: 'Ingénieur civil',
    allocation: 100,
    startDate: '2026-01-15',
    status: 'active',
    hoursLogged: 175,
    hoursEstimated: 1800,
  },
  {
    id: 'ASSIGN-003',
    projectId: 'PRJ-002',
    projectTitle: 'Pont de Kaolack',
    memberId: 'USR-010',
    memberName: 'Ousmane Mbaye',
    role: 'Chef de projet',
    allocation: 100,
    startDate: '2025-11-01',
    status: 'active',
    hoursLogged: 320,
    hoursEstimated: 1500,
  },
  {
    id: 'ASSIGN-004',
    projectId: 'PRJ-003',
    projectTitle: 'Centre Commercial Bamako',
    memberId: 'USR-020',
    memberName: 'Kadiatou Keita',
    role: 'Chef de projet',
    allocation: 100,
    startDate: '2025-06-01',
    status: 'active',
    hoursLogged: 680,
    hoursEstimated: 1200,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMemberById = (id: string): TeamMember | undefined => {
  return mockTeamMembers.find((m) => m.id === id);
};

export const getMembersByBureau = (bureau: 'BF' | 'BM' | 'BJ' | 'BCT'): TeamMember[] => {
  return mockTeamMembers.filter((m) => m.bureau === bureau);
};

export const getMembersByDepartment = (department: TeamDepartment): TeamMember[] => {
  return mockTeamMembers.filter((m) => m.department === department);
};

export const getAvailableMembers = (minAvailability: number = 20): TeamMember[] => {
  return mockTeamMembers.filter((m) => m.availability >= minAvailability && m.status === 'active');
};

export const getTeamById = (id: string): Team | undefined => {
  return mockTeams.find((t) => t.id === id);
};

export const getTeamsByBureau = (bureau: 'BF' | 'BM' | 'BJ' | 'BCT'): Team[] => {
  return mockTeams.filter((t) => t.bureau === bureau);
};

export const getOverloadedTeams = (): Team[] => {
  return mockTeams.filter((t) => t.utilizationRate > 90);
};

export const getAssignmentsByProject = (projectId: string): ProjectAssignment[] => {
  return mockAssignments.filter((a) => a.projectId === projectId);
};

export const getAssignmentsByMember = (memberId: string): ProjectAssignment[] => {
  return mockAssignments.filter((a) => a.memberId === memberId);
};

export const getTotalTeamCapacity = (): number => {
  return mockTeams.reduce((sum, t) => sum + t.totalCapacity, 0);
};

export const getTotalUsedCapacity = (): number => {
  return mockTeams.reduce((sum, t) => sum + t.usedCapacity, 0);
};

export const getGlobalUtilizationRate = (): number => {
  const total = getTotalTeamCapacity();
  const used = getTotalUsedCapacity();
  return total > 0 ? Math.round((used / total) * 100) : 0;
};

