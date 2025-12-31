// ============================================
// Données mockées BMO - Partie 3
// Calendrier, Navigation, Performance, RACI, Audit
// ============================================

import type {
  CalendarEvent,
  PerformanceData,
  RACIRow,
  AuditItem,
  Consigne,
  NavSection,
  Organigramme,
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

// --- Navigation sidebar ---
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
    title: 'Gouvernance',
    items: [
      { id: 'decisions', icon: '⚖️', label: 'Décisions' },
      { id: 'raci', icon: '📐', label: 'Matrice RACI' },
      { id: 'audit', icon: '🔍', label: 'Audit' },
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
