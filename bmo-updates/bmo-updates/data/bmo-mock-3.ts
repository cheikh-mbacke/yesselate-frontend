// ============================================
// Données mockées BMO - Partie 3
// Calendrier, Navigation, Performance, RACI, Audit
// + NOUVEAUX: Stats Clients, Paramètres, Détails Bureaux
// ============================================

import type {
  CalendarEvent,
  PerformanceData,
  RACIRow,
  AuditItem,
  Consigne,
  NavSection,
  Organigramme,
  ClientStats,
  ClientsGlobalStats,
  UserSettings,
  BureauDetails,
  ActionLog,
  BudgetAlert,
  ProjectBudget,
} from '@/lib/types/bmo.types';

// --- Événements calendrier ---
export const agendaEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Réunion coordination bureaux', time: '10:00', type: 'meeting', location: 'Salle A', date: '2025-12-24', priority: 'high' },
  { id: 'e2', title: 'Visio client Diallo', time: '14:30', type: 'visio', location: 'Zoom', date: '2025-12-24', priority: 'high', client: 'CLI-001' },
  { id: 'e3', title: 'Échéance rapport mensuel', time: '09:00', type: 'deadline', date: '2025-12-25', priority: 'urgent' },
  { id: 'e4', title: 'Visite chantier Diamniadio', time: '08:00', type: 'site', date: '2025-12-26', priority: 'high', project: 'PRJ-0018' },
  { id: 'e5', title: 'Livraison ciment SOCOCIM', time: '07:00', type: 'delivery', date: '2025-12-24', priority: 'urgent', project: 'PRJ-0018', supplier: 'SOCOCIM' },
  { id: 'e6', title: 'Audience TGI Dakar - SUNEOR', time: '10:00', type: 'legal', date: '2026-01-03', priority: 'critical', project: 'PRJ-0014' },
  { id: 'e7', title: 'RDV Notaire - Acte terrain', time: '15:00', type: 'legal', date: '2025-12-27', priority: 'high' },
  { id: 'e8', title: 'Réunion Mairie Rufisque', time: '10:00', type: 'meeting', date: '2025-12-30', priority: 'high', client: 'CLI-002', project: 'PRJ-0017' },
  { id: 'e9', title: 'Livraison fer à béton', time: '08:00', type: 'delivery', date: '2025-12-24', priority: 'normal', project: 'PRJ-0018' },
  { id: 'e10', title: 'Contrôle qualité béton', time: '09:00', type: 'inspection', date: '2025-12-26', priority: 'high', project: 'PRJ-0018' },
  { id: 'e11', title: 'Formation OHADA', time: '09:00', type: 'training', date: '2026-01-15', endDate: '2026-01-17', priority: 'normal' },
  { id: 'e12', title: 'Entretien annuel I. FALL', time: '14:00', type: 'hr', date: '2025-12-24', priority: 'normal', employee: 'EMP-001' },
];

// --- Données de performance ---
export const performanceData: PerformanceData[] = [
  { month: 'Jan', validations: 45, demandes: 50, budget: 2.1, rejets: 5 },
  { month: 'Fév', validations: 52, demandes: 58, budget: 2.4, rejets: 6 },
  { month: 'Mar', validations: 48, demandes: 54, budget: 2.2, rejets: 6 },
  { month: 'Avr', validations: 61, demandes: 68, budget: 3.1, rejets: 7 },
  { month: 'Mai', validations: 55, demandes: 60, budget: 2.8, rejets: 5 },
  { month: 'Jun', validations: 67, demandes: 72, budget: 3.5, rejets: 5 },
  { month: 'Jul', validations: 72, demandes: 78, budget: 3.8, rejets: 6 },
  { month: 'Aoû', validations: 68, demandes: 74, budget: 3.2, rejets: 6 },
  { month: 'Sep', validations: 75, demandes: 80, budget: 4.1, rejets: 5 },
  { month: 'Oct', validations: 82, demandes: 88, budget: 4.5, rejets: 6 },
  { month: 'Nov', validations: 78, demandes: 84, budget: 4.2, rejets: 6 },
  { month: 'Déc', validations: 92, demandes: 100, budget: 5.2, rejets: 8 },
];

// --- Matrice RACI ---
export const raciMatrix: RACIRow[] = [
  { activity: 'Validation BC', BMO: 'A', BF: 'C', BM: 'R', BA: 'R', BCT: 'I', BQC: 'I', BJ: 'C' },
  { activity: 'Signature contrats', BMO: 'A', BF: 'C', BM: 'R', BA: 'I', BCT: 'I', BQC: 'I', BJ: 'R' },
  { activity: 'Paiements', BMO: 'A', BF: 'R', BM: 'C', BA: 'C', BCT: 'I', BQC: 'I', BJ: 'I' },
  { activity: 'Contrôle terrain', BMO: 'I', BF: 'I', BM: 'C', BA: 'I', BCT: 'R', BQC: 'C', BJ: 'I' },
  { activity: "Appels d'offres", BMO: 'A', BF: 'C', BM: 'R', BA: 'R', BCT: 'I', BQC: 'C', BJ: 'C' },
];

// --- Audit ---
export const auditItems: AuditItem[] = [
  { id: 'AUD-001', type: 'Conformité OHADA', status: 'conforme', score: 98, lastCheck: '20/12/2025', nextCheck: '20/03/2026' },
  { id: 'AUD-002', type: 'Procédures internes', status: 'conforme', score: 95, lastCheck: '15/12/2025', nextCheck: '15/01/2026' },
  { id: 'AUD-003', type: 'Sécurité données', status: 'attention', score: 87, lastCheck: '10/12/2025', nextCheck: '10/01/2026' },
  { id: 'AUD-004', type: 'Traçabilité décisions', status: 'conforme', score: 100, lastCheck: '22/12/2025', nextCheck: '22/01/2026' },
];

// --- Consignes bureaux ---
export const consignesBureaux: Consigne[] = [
  { id: 'CONS-2025-0089', bureau: 'BCT', from: 'DG', title: 'Priorité chantier Diamniadio', content: 'Concentrer toutes les ressources sur PRJ-0018 jusqu\'au 31/12. Report autres chantiers autorisé.', date: '22/12/2025', priority: 'urgent', status: 'active', acknowledgement: ['C. GUEYE', 'M. DIOP'] },
  { id: 'CONS-2025-0088', bureau: 'BF', from: 'DG', title: 'Gel des dépenses non essentielles', content: 'Suspendre tout achat supérieur à 500,000 FCFA non lié aux projets en cours. Validation DG requise.', date: '20/12/2025', priority: 'high', status: 'active', acknowledgement: ['F. DIOP'] },
  { id: 'CONS-2025-0087', bureau: 'ALL', from: 'DG', title: 'Fermeture fin d\'année', content: 'Bureaux fermés du 25/12 au 02/01. Astreinte BCT maintenue. Contact urgence: DG.', date: '18/12/2025', priority: 'normal', status: 'active', acknowledgement: ['I. FALL', 'F. DIOP', 'M. BA', 'C. GUEYE'] },
  { id: 'CONS-2025-0086', bureau: 'BA', from: 'DG', title: 'Négociation tarifs 2026', content: 'Engager négociations avec tous fournisseurs récurrents. Objectif: -5% minimum.', date: '15/12/2025', priority: 'normal', status: 'active', acknowledgement: ['A. SECK'] },
];

// --- Organigramme ---
export const organigramme: Organigramme = {
  dg: { name: 'Abdoulaye DIALLO', role: 'Directeur Général', initials: 'AD' },
  bureaux: [
    {
      code: 'BMO',
      head: { name: 'Ibrahim FALL', role: 'Assistant DG', initials: 'IF' },
      members: [
        { name: 'Mariama SARR', role: 'Resp. Validation', initials: 'MS' },
        { name: 'Ousmane NDIAYE', role: 'Chargé RH', initials: 'ON' },
      ],
    },
    {
      code: 'BF',
      head: { name: 'Fatou DIOP', role: 'Chef Bureau', initials: 'FD' },
      members: [
        { name: 'Abdou KANE', role: 'Comptable', initials: 'AK' },
        { name: 'Rama SY', role: 'Trésorière', initials: 'RS' },
      ],
    },
    {
      code: 'BM',
      head: { name: 'Moussa BA', role: 'Chef Bureau', initials: 'MB' },
      members: [{ name: 'Ibra DIALLO', role: 'Chargé Marchés', initials: 'ID' }],
    },
    {
      code: 'BA',
      head: { name: 'Aïssatou SECK', role: 'Chef Bureau', initials: 'AS' },
      members: [
        { name: 'Pape NDIAYE', role: 'Acheteur', initials: 'PN' },
        { name: 'Coumba FALL', role: 'Logisticienne', initials: 'CF' },
      ],
    },
    {
      code: 'BCT',
      head: { name: 'Cheikh GUEYE', role: 'Chef Bureau', initials: 'CG' },
      members: [
        { name: 'Modou DIOP', role: 'Conducteur Travaux', initials: 'MD' },
        { name: 'Samba NIANG', role: 'Superviseur', initials: 'SN' },
      ],
    },
    {
      code: 'BJ',
      head: { name: 'Ndèye FAYE', role: 'Chef Bureau', initials: 'NF' },
      members: [{ name: 'Amadou DIENG', role: 'Juriste', initials: 'AD' }],
    },
  ],
};

// --- Navigation sidebar (MISE À JOUR avec nouveaux onglets) ---
export const navSections: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
      { id: 'demandes', icon: '📋', label: 'Demandes', badge: 14, badgeType: 'urgent' },
      { id: 'projets', icon: '🏗️', label: 'Projets', badge: 8, badgeType: 'gray' },
      { id: 'calendrier', icon: '📅', label: 'Calendrier' },
    ],
  },
  {
    title: 'Ressources Humaines',
    items: [
      { id: 'employes', icon: '👤', label: 'Employés', badge: 24, badgeType: 'gray' },
      { id: 'missions', icon: '🎯', label: 'Missions', badge: 5, badgeType: 'gray' },
      { id: 'evaluations', icon: '⭐', label: 'Évaluations', badge: 3, badgeType: 'gray' },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { id: 'bureaux', icon: '🏢', label: 'Bureaux', badge: 8, badgeType: 'gray' },
      { id: 'delegations', icon: '🔑', label: 'Délégations', badge: 3, badgeType: 'gray' },
      { id: 'organigramme', icon: '📐', label: 'Organigramme' },
    ],
  },
  {
    title: 'Demandes RH',
    items: [
      { id: 'demandes-rh', icon: '📝', label: 'Toutes + Recrutement', badge: 14, badgeType: 'gray' },
      { id: 'conges', icon: '🏖️', label: 'Congés/Vacances', badge: 3, badgeType: 'gray' },
      { id: 'depenses', icon: '💸', label: 'Dépenses', badge: 3, badgeType: 'gray' },
      { id: 'deplacements', icon: '✈️', label: 'Déplacements', badge: 2, badgeType: 'gray' },
      { id: 'paie-avances', icon: '💰', label: 'Paie/Avances', badge: 1, badgeType: 'gray' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { id: 'echanges', icon: '💬', label: 'Échanges Bureaux', badge: 8, badgeType: 'gray' },
      { id: 'arbitrages', icon: '⚖️', label: 'Arbitrages', badge: 3, badgeType: 'gray' },
      { id: 'messages-externes', icon: '📨', label: 'Messages Externes', badge: 8, badgeType: 'gray' },
      { id: 'visio', icon: '📹', label: 'Visio Conférence' }, // NOUVEAU
    ],
  },
  {
    title: 'Validation',
    items: [
      { id: 'validation-bc', icon: '✅', label: 'BC/Factures/Avenants', badge: 13, badgeType: 'gray' },
      { id: 'validation-contrats', icon: '📜', label: 'Contrats', badge: 3, badgeType: 'gray' },
      { id: 'validation-paiements', icon: '💳', label: 'Paiements N+1', badge: 5, badgeType: 'gray' },
    ],
  },
  {
    title: 'Supervision',
    items: [
      { id: 'blocked', icon: '🚨', label: 'Dossiers bloqués', badge: 4, badgeType: 'gray' },
      { id: 'substitution', icon: '🔄', label: 'Substitution', badge: 4, badgeType: 'gray' },
      { id: 'alerts', icon: '⚠️', label: 'Alertes et Consignes', badge: 7, badgeType: 'gray' },
    ],
  },
  {
    title: 'Finances et Contentieux',
    items: [
      { id: 'recouvrements', icon: '📜', label: 'Recouvrements', badge: 4, badgeType: 'gray' },
      { id: 'litiges', icon: '⚖️', label: 'Litiges', badge: 3, badgeType: 'gray' },
      { id: 'finances', icon: '💰', label: 'Gains/Pertes' },
    ],
  },
  {
    title: 'Clients & Stats', // NOUVEAU
    items: [
      { id: 'stats-clients', icon: '📈', label: 'Statistiques Clients' },
    ],
  },
  {
    title: 'Gouvernance',
    items: [
      { id: 'decisions', icon: '⚖️', label: 'Décisions' },
      { id: 'raci', icon: '📐', label: 'Matrice RACI' },
      { id: 'audit', icon: '🔍', label: 'Audit' },
      { id: 'logs', icon: '📜', label: 'Journal des actions' }, // NOUVEAU
    ],
  },
  {
    title: 'Tech et IA',
    items: [
      { id: 'analytics', icon: '📈', label: 'Tableaux BI' },
      { id: 'api', icon: '🔗', label: 'API et Intégrations', badge: 8, badgeType: 'gray' },
      { id: 'ia', icon: '🤖', label: 'Intelligence Artificielle', badgeType: 'gray' },
    ],
  },
  {
    title: 'Compte', // NOUVEAU
    items: [
      { id: 'parametres', icon: '⚙️', label: 'Paramétrage' },
    ],
  },
];

// --- Données financières ---
export const financials = {
  summary: {
    totalGains: '125.4M',
    totalPertes: '18.2M',
    netResult: '+107.2M',
    marginRate: '23.5%',
  },
  gains: [
    { description: 'Paiement final PRJ-0015', type: 'Projet', category: 'Encaissement', montant: '18,000,000', date: '20/12/2025', project: 'PRJ-0015' },
    { description: 'Situation n°3 PRJ-0017', type: 'Situation', category: 'Encaissement', montant: '15,500,000', date: '18/12/2025', project: 'PRJ-0017' },
    { description: 'Acompte client TERANGA', type: 'Acompte', category: 'Encaissement', montant: '8,900,000', date: '15/12/2025', project: 'PRJ-0016' },
  ],
  pertes: [
    { description: 'Pénalité retard PRJ-0014', type: 'Pénalité', category: 'Charge', montant: '2,500,000', date: '19/12/2025', cause: 'Retard livraison' },
    { description: 'Matériaux défectueux', type: 'Perte', category: 'Charge', montant: '850,000', date: '17/12/2025', preventionAction: 'Renforcer contrôle réception' },
  ],
};

// --- Données pour les graphiques circulaires ---
export const bureauPieData = [
  { name: 'Finance', value: 28, color: '#3B82F6' },
  { name: 'Marché', value: 22, color: '#10B981' },
  { name: 'Achats', value: 18, color: '#06B6D4' },
  { name: 'Terrain', value: 15, color: '#EF4444' },
  { name: 'Juridique', value: 12, color: '#8B5CF6' },
];

export const projectStatusData = [
  { name: 'En cours', value: 5, fill: '#F97316' },
  { name: 'Attente', value: 2, fill: '#D4AF37' },
  { name: 'Terminés', value: 8, fill: '#10B981' },
  { name: 'Bloqués', value: 1, fill: '#EF4444' },
];

// ============================================
// NOUVELLES DONNÉES
// ============================================

// --- Statistiques Clients (NOUVEAU) ---
export const clientsStats: ClientStats[] = [
  {
    id: 'CS-001',
    clientId: 'CLI-001',
    clientName: 'M. Ibrahima DIALLO',
    clientType: 'particulier',
    projectsTotal: 2,
    projectsActive: 1,
    projectsCompleted: 1,
    projectsCancelled: 0,
    chiffreAffairesTotal: 54400000,
    chiffreAffairesAnnee: 36400000,
    paiementsEnCours: 12000000,
    paiementsEnRetard: 0,
    montantImpaye: 0,
    scoreQualite: 95,
    nbReclamations: 0,
    nbLitiges: 0,
    anciennete: 18,
    dernierContact: '22/12/2025',
    projects: [
      { projectId: 'PRJ-0018', projectName: 'Villa Diamniadio', startDate: '01/06/2025', status: 'active', budget: 36400000, paid: 24400000, remaining: 12000000 },
      { projectId: 'PRJ-0010', projectName: 'Rénovation appartement', startDate: '15/01/2024', endDate: '15/06/2024', status: 'completed', budget: 18000000, paid: 18000000, remaining: 0 },
    ],
  },
  {
    id: 'CS-002',
    clientId: 'CLI-002',
    clientName: 'Mairie de Rufisque',
    clientType: 'institution',
    projectsTotal: 3,
    projectsActive: 1,
    projectsCompleted: 2,
    projectsCancelled: 0,
    chiffreAffairesTotal: 185000000,
    chiffreAffairesAnnee: 125000000,
    paiementsEnCours: 68800000,
    paiementsEnRetard: 12500000,
    montantImpaye: 12500000,
    scoreQualite: 78,
    nbReclamations: 2,
    nbLitiges: 0,
    anciennete: 36,
    dernierContact: '20/12/2025',
    projects: [
      { projectId: 'PRJ-0017', projectName: 'Route Zone B', startDate: '01/03/2025', status: 'active', budget: 125000000, paid: 56200000, remaining: 68800000 },
      { projectId: 'PRJ-0012', projectName: 'École primaire Rufisque Nord', startDate: '01/09/2023', endDate: '01/06/2024', status: 'completed', budget: 35000000, paid: 35000000, remaining: 0 },
      { projectId: 'PRJ-0008', projectName: 'Réhabilitation marché', startDate: '01/01/2023', endDate: '01/09/2023', status: 'completed', budget: 25000000, paid: 25000000, remaining: 0 },
    ],
  },
  {
    id: 'CS-003',
    clientId: 'CLI-003',
    clientName: 'SCI TERANGA Immobilier',
    clientType: 'entreprise',
    projectsTotal: 4,
    projectsActive: 1,
    projectsCompleted: 3,
    projectsCancelled: 0,
    chiffreAffairesTotal: 245000000,
    chiffreAffairesAnnee: 89000000,
    paiementsEnCours: 7100000,
    paiementsEnRetard: 0,
    montantImpaye: 0,
    scoreQualite: 92,
    nbReclamations: 1,
    nbLitiges: 0,
    anciennete: 48,
    dernierContact: '21/12/2025',
    projects: [
      { projectId: 'PRJ-0016', projectName: 'Immeuble R+4 Almadies', startDate: '01/02/2025', status: 'active', budget: 89000000, paid: 81900000, remaining: 7100000 },
      { projectId: 'PRJ-0011', projectName: 'Villa Ngor', startDate: '01/06/2023', endDate: '01/03/2024', status: 'completed', budget: 65000000, paid: 65000000, remaining: 0 },
      { projectId: 'PRJ-0007', projectName: 'Local commercial Plateau', startDate: '01/01/2023', endDate: '01/07/2023', status: 'completed', budget: 45000000, paid: 45000000, remaining: 0 },
      { projectId: 'PRJ-0003', projectName: 'Duplex Fann', startDate: '01/06/2022', endDate: '01/02/2023', status: 'completed', budget: 46000000, paid: 46000000, remaining: 0 },
    ],
  },
  {
    id: 'CS-004',
    clientId: 'CLI-004',
    clientName: 'SUNEOR SA',
    clientType: 'entreprise',
    projectsTotal: 1,
    projectsActive: 0,
    projectsCompleted: 0,
    projectsCancelled: 0,
    chiffreAffairesTotal: 245000000,
    chiffreAffairesAnnee: 0,
    paiementsEnCours: 0,
    paiementsEnRetard: 45000000,
    montantImpaye: 45000000,
    scoreQualite: 35,
    nbReclamations: 0,
    nbLitiges: 1,
    anciennete: 24,
    dernierContact: '15/12/2025',
    projects: [
      { projectId: 'PRJ-0014', projectName: 'Extension usine SUNEOR', startDate: '01/01/2025', status: 'blocked', budget: 245000000, paid: 56400000, remaining: 188600000 },
    ],
  },
  {
    id: 'CS-005',
    clientId: 'CLI-005',
    clientName: 'IEF Pikine',
    clientType: 'institution',
    projectsTotal: 1,
    projectsActive: 0,
    projectsCompleted: 1,
    projectsCancelled: 0,
    chiffreAffairesTotal: 18000000,
    chiffreAffairesAnnee: 18000000,
    paiementsEnCours: 0,
    paiementsEnRetard: 0,
    montantImpaye: 0,
    scoreQualite: 100,
    nbReclamations: 0,
    nbLitiges: 0,
    anciennete: 12,
    dernierContact: '18/12/2025',
    projects: [
      { projectId: 'PRJ-0015', projectName: 'Rénovation École Pikine', startDate: '01/06/2025', endDate: '15/12/2025', status: 'completed', budget: 18000000, paid: 18000000, remaining: 0 },
    ],
  },
];

// --- Stats globales clients (NOUVEAU) ---
export const clientsGlobalStats: ClientsGlobalStats = {
  totalClients: 28,
  clientsActifs: 22,
  clientsParticuliers: 15,
  clientsEntreprises: 8,
  clientsInstitutions: 5,
  nouveauxClientsMois: 3,
  chiffreAffairesTotalAnnee: 485000000,
  tauxFidelisation: 78,
  scoreSatisfactionMoyen: 82,
  topClients: [
    { clientId: 'CLI-003', clientName: 'SCI TERANGA Immobilier', chiffreAffaires: 89000000 },
    { clientId: 'CLI-002', clientName: 'Mairie de Rufisque', chiffreAffaires: 125000000 },
    { clientId: 'CLI-001', clientName: 'M. Ibrahima DIALLO', chiffreAffaires: 36400000 },
  ],
  repartitionParType: [
    { type: 'Particuliers', count: 15, percentage: 53.6 },
    { type: 'Entreprises', count: 8, percentage: 28.6 },
    { type: 'Institutions', count: 5, percentage: 17.8 },
  ],
  evolutionMensuelle: [
    { month: 'Jan', nouveaux: 2, chiffreAffaires: 35000000 },
    { month: 'Fév', nouveaux: 1, chiffreAffaires: 42000000 },
    { month: 'Mar', nouveaux: 3, chiffreAffaires: 38000000 },
    { month: 'Avr', nouveaux: 2, chiffreAffaires: 45000000 },
    { month: 'Mai', nouveaux: 1, chiffreAffaires: 52000000 },
    { month: 'Jun', nouveaux: 2, chiffreAffaires: 48000000 },
    { month: 'Jul', nouveaux: 3, chiffreAffaires: 55000000 },
    { month: 'Aoû', nouveaux: 1, chiffreAffaires: 42000000 },
    { month: 'Sep', nouveaux: 2, chiffreAffaires: 48000000 },
    { month: 'Oct', nouveaux: 2, chiffreAffaires: 52000000 },
    { month: 'Nov', nouveaux: 1, chiffreAffaires: 45000000 },
    { month: 'Déc', nouveaux: 3, chiffreAffaires: 58000000 },
  ],
};

// --- Paramètres utilisateur par défaut (NOUVEAU) ---
export const defaultUserSettings: UserSettings = {
  userId: 'USR-001',
  profile: {
    firstName: 'Abdoulaye',
    lastName: 'DIALLO',
    email: 'a.diallo@yessalate.sn',
    phone: '+221 77 123 45 67',
    role: 'Directeur Général',
    bureau: 'BMO',
  },
  preferences: {
    language: 'fr',
    timezone: 'Africa/Dakar',
    dateFormat: 'DD/MM/YYYY',
    currency: 'FCFA',
    theme: 'dark',
    sidebarCollapsed: false,
    compactMode: false,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    urgentOnly: false,
    digest: 'realtime',
    categories: {
      validations: true,
      blocages: true,
      budgets: true,
      rh: true,
      litiges: true,
    },
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '01/10/2025',
    sessionTimeout: 30,
    trustedDevices: ['Chrome - Windows', 'Safari - iPhone'],
  },
};

// --- Détails des bureaux (NOUVEAU) ---
export const bureauxDetails: Record<string, BureauDetails> = {
  BMO: {
    code: 'BMO',
    platforms: [
      { id: 'plt-1', name: 'Portail Validation', url: '/maitre-ouvrage/validation-bc', icon: '✅', description: 'Gestion des validations BC, factures et avenants', status: 'active' },
      { id: 'plt-2', name: 'Tableau de bord', url: '/maitre-ouvrage', icon: '📊', description: 'Vue globale et KPIs', status: 'active' },
      { id: 'plt-3', name: 'Gestion RH', url: '/maitre-ouvrage/employes', icon: '👥', description: 'Suivi des employés et demandes RH', status: 'active' },
    ],
    organigramme: [
      { id: 'EMP-001', name: 'Ibrahim FALL', initials: 'IF', role: 'Assistant DG - Coordination', email: 'i.fall@yessalate.sn', phone: '+221 77 123 45 67', status: 'active', isHead: true },
      { id: 'EMP-002', name: 'Mariama SARR', initials: 'MS', role: 'Responsable Validation', email: 'm.sarr@yessalate.sn', phone: '+221 77 234 56 78', status: 'active', isHead: false },
      { id: 'EMP-003', name: 'Ousmane NDIAYE', initials: 'ON', role: 'Chargé RH & Administration', email: 'o.ndiaye@yessalate.sn', phone: '+221 77 345 67 89', status: 'active', isHead: false },
    ],
    stats: {
      projectsActive: 5,
      projectsCompleted: 12,
      budgetTotal: '15M',
      budgetUsed: '12.8M',
      validationsMonth: 47,
      avgResponseTime: '2.4h',
    },
    recentActivities: [
      { id: 'act-1', action: 'Validation BC-2025-0048', date: '22/12/2025 14:23', agent: 'M. SARR' },
      { id: 'act-2', action: 'Substitution PAY-2025-0039', date: '22/12/2025 13:15', agent: 'A. DIALLO' },
      { id: 'act-3', action: 'Création délégation DEL-003', date: '22/12/2025 11:30', agent: 'I. FALL' },
    ],
  },
  BF: {
    code: 'BF',
    platforms: [
      { id: 'plt-1', name: 'Comptabilité', url: '/comptable', icon: '🧮', description: 'Gestion comptable et financière', status: 'active' },
      { id: 'plt-2', name: 'Paiements', url: '/maitre-ouvrage/validation-paiements', icon: '💳', description: 'Suivi des paiements', status: 'active' },
      { id: 'plt-3', name: 'Trésorerie', url: '#', icon: '🏦', description: 'Gestion de trésorerie', status: 'maintenance' },
    ],
    organigramme: [
      { id: 'EMP-004', name: 'Fatou DIOP', initials: 'FD', role: 'Chef Bureau Finance', email: 'f.diop@yessalate.sn', phone: '+221 77 456 78 90', status: 'active', isHead: true },
      { id: 'EMP-009', name: 'Abdou KANE', initials: 'AK', role: 'Comptable', email: 'a.kane@yessalate.sn', phone: '+221 77 567 89 01', status: 'active', isHead: false },
      { id: 'EMP-010', name: 'Rama SY', initials: 'RS', role: 'Trésorière', email: 'r.sy@yessalate.sn', phone: '+221 77 678 90 12', status: 'conge', isHead: false },
    ],
    stats: {
      projectsActive: 5,
      projectsCompleted: 15,
      budgetTotal: '8M',
      budgetUsed: '6.4M',
      validationsMonth: 32,
      avgResponseTime: '3.1h',
    },
    recentActivities: [
      { id: 'act-1', action: 'Validation paiement EIFFAGE', date: '22/12/2025 15:00', agent: 'F. DIOP' },
      { id: 'act-2', action: 'Rapport budget mensuel', date: '21/12/2025 17:00', agent: 'A. KANE' },
    ],
  },
  // Ajoutez les autres bureaux selon le même modèle...
};

// --- Alertes de dépassement budgétaire (NOUVEAU) ---
export const budgetAlerts: BudgetAlert[] = [
  {
    id: 'BA-001',
    projectId: 'PRJ-INFRA',
    projectName: 'Projet Infrastructure 2025',
    bureau: 'BCT',
    budgetPrevisionnel: 50000000,
    budgetActuel: 56000000,
    depassement: 6000000,
    depassementPourcent: 12,
    date: '22/12/2025',
    status: 'pending',
    requestedBy: 'C. GUEYE',
    motif: 'Hausse des prix des matériaux + travaux supplémentaires imprévus',
  },
  {
    id: 'BA-002',
    projectId: 'PRJ-0017',
    projectName: 'Route Zone B',
    bureau: 'BM',
    budgetPrevisionnel: 125000000,
    budgetActuel: 128500000,
    depassement: 3500000,
    depassementPourcent: 2.8,
    date: '20/12/2025',
    status: 'approved',
    requestedBy: 'M. BA',
    approvedBy: 'A. DIALLO',
    motif: 'Extension du périmètre suite demande Mairie',
  },
];

// --- Budgets projets détaillés (NOUVEAU) ---
export const projectBudgets: ProjectBudget[] = [
  {
    projectId: 'PRJ-0018',
    budgetEstimatif: 34700000,
    budgetPrevisionnel: 36435000, // +5%
    budgetReel: 24700000,
    seuilAlerte: 34700000,
    depassementAutorise: false,
    historique: [
      { date: '01/06/2025', type: 'depense', montant: 5000000, description: 'Fondations', validatedBy: 'F. DIOP' },
      { date: '15/06/2025', type: 'depense', montant: 8000000, description: 'Gros œuvre RDC', validatedBy: 'F. DIOP' },
      { date: '01/07/2025', type: 'depense', montant: 6500000, description: 'Gros œuvre R+1', validatedBy: 'F. DIOP' },
      { date: '15/08/2025', type: 'depense', montant: 5200000, description: 'Toiture + étanchéité', validatedBy: 'F. DIOP' },
    ],
  },
  {
    projectId: 'PRJ-INFRA',
    budgetEstimatif: 47600000,
    budgetPrevisionnel: 49980000, // +5%
    budgetReel: 56000000,
    seuilAlerte: 47600000,
    depassementAutorise: false,
    historique: [
      { date: '01/03/2025', type: 'depense', montant: 15000000, description: 'Travaux préparatoires', validatedBy: 'F. DIOP' },
      { date: '01/05/2025', type: 'depense', montant: 20000000, description: 'Infrastructure principale', validatedBy: 'F. DIOP' },
      { date: '01/08/2025', type: 'depense', montant: 15000000, description: 'Équipements', validatedBy: 'F. DIOP' },
      { date: '15/12/2025', type: 'depense', montant: 6000000, description: 'Travaux supplémentaires (dépassement)', validatedBy: null },
    ],
  },
];
