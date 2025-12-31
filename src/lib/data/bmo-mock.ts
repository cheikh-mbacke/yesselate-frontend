// ============================================
// Données mockées pour le module BMO
// Centralisées pour faciliter la migration vers l'API
// ============================================

import type {
  Bureau,
  Employee,
  EmployeeDetails,
  Project,
  Demand,
  Delegation,
  Decision,
  PurchaseOrder,
  Contract,
  Payment,
  Invoice,
  Amendment,
  BlockedDossier,
  HRRequest,
  BureauExchange,
  Arbitration,
  ExternalMessage,
  Recovery,
  Litigation,
  CalendarEvent,
  Reminder,
  Note,
  SystemAlert,
  Substitution,
  TimelineItem,
  PerformanceData,
  RACIRow,
  AuditItem,
  Consigne,
  NavSection,
  Organigramme,
} from '@/lib/types/bmo.types';

// --- Bureaux ---
export const bureaux: Bureau[] = [
  { code: 'BMO', name: "Maîtrise d'Ouvrage", icon: '🏛️', color: '#F97316', head: 'A. Mbacke', agents: 5, tasks: 14, completion: 92, budget: '15M', desc: 'Pilotage, gouvernance et coordination des bureaux' },
  { code: 'BFC', name: 'Bureau Finance et Comptabilité', icon: '🏦', color: '#3B82F6', head: 'F. DIOP', agents: 3, tasks: 12, completion: 80, budget: '8M', desc: 'Gestion financière et Comptabilité' },
  { code: 'BMCM', name: 'Bureau Marché Communication et Marketing', icon: '🏪', color: '#10B981', head: 'M. BA', agents: 2, tasks: 10, completion: 85, budget: '5M', desc: "Appels d'offres, contrats" },
  { code: 'BAA', name: 'Bureau Achats et Approvisionnement', icon: '🛒', color: '#06B6D4', head: 'A. SECK', agents: 4, tasks: 18, completion: 78, budget: '12M', desc: 'Achats, logistique' },
  { code: 'BCT', name: 'Bureau Contrôle Technique', icon: '📍', color: '#EF4444', head: 'C. GUEYE', agents: 3, tasks: 8, completion: 62, budget: '6M', desc: 'Contrôle technique des chantiers' },
  { code: 'BACQ', name: 'Bureau Audit et Contrôle Qualité', icon: '🔬', color: '#EC4899', head: 'S. MBAYE', agents: 2, tasks: 6, completion: 95, budget: '3M', desc: 'Tests, certifications' },
  { code: 'BJ', name: 'Bureau Juridique', icon: '⚖️', color: '#8B5CF6', head: 'N. FAYE', agents: 2, tasks: 6, completion: 100, budget: '4M', desc: 'Rédaction des contrats, Assistance juridique, Conformité juridique, Gestion des litiges' },
  { code: 'BEX', name: 'Bureau Exécution', icon: '🔧', color: '#6366F1', head: 'A. DIENG', agents: 5, tasks: 15, completion: 75, budget: '10M', desc: 'Exécution des projets et suivi des chantiers' },
];

// --- Employés ---
export const employees: Employee[] = [
  { id: 'EMP-001', name: 'Ibrahim FALL', initials: 'IF', role: 'Assistant DG - Coordination', bureau: 'BMO', status: 'active', email: 'i.fall@yessalate.sn', phone: '+221 77 123 45 67', salary: '850,000', skills: ['Coordination', 'Management'] },
  { id: 'EMP-002', name: 'Mariama SARR', initials: 'MS', role: 'Responsable Validation', bureau: 'BMO', status: 'active', email: 'm.sarr@yessalate.sn', phone: '+221 77 234 56 78', salary: '750,000', delegated: true, skills: ['Validation', 'OHADA'] },
  { id: 'EMP-003', name: 'Ousmane NDIAYE', initials: 'ON', role: 'Chargé RH & Administration', bureau: 'BMO', status: 'active', email: 'o.ndiaye@yessalate.sn', phone: '+221 77 345 67 89', salary: '650,000', skills: ['RH', 'Paie'] },
  { id: 'EMP-004', name: 'Fatou DIOP', initials: 'FD', role: 'Chef Bureau Finance', bureau: 'BF', status: 'active', email: 'f.diop@yessalate.sn', phone: '+221 77 456 78 90', salary: '900,000', skills: ['Comptabilité', 'Budget'] },
  { id: 'EMP-005', name: 'Moussa BA', initials: 'MB', role: 'Chef Bureau Marché', bureau: 'BM', status: 'active', email: 'm.ba@yessalate.sn', phone: '+221 77 567 89 01', salary: '900,000', skills: ['Marchés publics', 'Contrats'] },
  { id: 'EMP-006', name: 'Aïssatou SECK', initials: 'AS', role: 'Responsable Achats', bureau: 'BA', status: 'active', email: 'a.seck@yessalate.sn', phone: '+221 77 678 90 12', salary: '700,000', skills: ['Achats', 'Logistique'] },
  { id: 'EMP-007', name: 'Cheikh GUEYE', initials: 'CG', role: 'Chef Contrôle Terrain', bureau: 'BCT', status: 'mission', email: 'c.gueye@yessalate.sn', phone: '+221 77 789 01 23', salary: '800,000', skills: ['BTP', 'Supervision'] },
  { id: 'EMP-008', name: 'Ndèye FAYE', initials: 'NF', role: 'Juriste Senior', bureau: 'BJ', status: 'active', email: 'n.faye@yessalate.sn', phone: '+221 77 890 12 34', salary: '750,000', skills: ['Droit OHADA', 'Contrats'] },
];

export const employeesDetails: EmployeeDetails[] = [
  { employeeId: 'EMP-001', contractType: 'CDI', contractStart: '15/03/2020', emergencyContact: '+221 77 111 22 33', address: 'Dakar, Sacré-Cœur 3', bankAccount: 'SN08 1234 5678 9012', socialSecurity: 'CSS-2020-12345' },
  { employeeId: 'EMP-002', contractType: 'CDI', contractStart: '01/06/2021', emergencyContact: '+221 77 222 33 44', address: 'Dakar, Mermoz', bankAccount: 'SN08 2345 6789 0123', socialSecurity: 'CSS-2021-23456' },
  { employeeId: 'EMP-003', contractType: 'CDI', contractStart: '10/01/2022', emergencyContact: '+221 77 333 44 55', address: 'Dakar, Fann', bankAccount: 'SN08 3456 7890 1234', socialSecurity: 'CSS-2022-34567' },
  { employeeId: 'EMP-004', contractType: 'CDI', contractStart: '01/09/2019', emergencyContact: '+221 77 444 55 66', address: 'Dakar, Point E', bankAccount: 'SN08 4567 8901 2345', socialSecurity: 'CSS-2019-45678' },
  { employeeId: 'EMP-005', contractType: 'CDI', contractStart: '15/04/2020', emergencyContact: '+221 77 555 66 77', address: 'Dakar, Almadies', bankAccount: 'SN08 5678 9012 3456', socialSecurity: 'CSS-2020-56789' },
  { employeeId: 'EMP-006', contractType: 'CDD', contractStart: '01/01/2024', contractEnd: '31/12/2025', emergencyContact: '+221 77 666 77 88', address: 'Dakar, Ouakam', bankAccount: 'SN08 6789 0123 4567', socialSecurity: 'CSS-2024-67890' },
  { employeeId: 'EMP-007', contractType: 'CDI', contractStart: '20/02/2021', emergencyContact: '+221 77 777 88 99', address: 'Thiès, Centre', bankAccount: 'SN08 7890 1234 5678', socialSecurity: 'CSS-2021-78901' },
  { employeeId: 'EMP-008', contractType: 'CDI', contractStart: '05/05/2022', emergencyContact: '+221 77 888 99 00', address: 'Dakar, Plateau', bankAccount: 'SN08 8901 2345 6789', socialSecurity: 'CSS-2022-89012' },
];

// --- Projets ---
export const projects: Project[] = [
  { id: 'PRJ-0018', name: 'Villa Diamniadio', client: 'M. Diallo', budget: '36.4M', spent: '24.7M', progress: 68, status: 'active', bureau: 'BCT', team: 8 },
  { id: 'PRJ-0017', name: 'Route Zone B', client: 'Mairie Rufisque', budget: '125M', spent: '56.2M', progress: 45, status: 'active', bureau: 'BM', team: 15 },
  { id: 'PRJ-0016', name: 'Immeuble R+4 Almadies', client: 'SCI Teranga', budget: '89M', spent: '81.9M', progress: 92, status: 'active', bureau: 'BCT', team: 12 },
  { id: 'PRJ-0015', name: 'Rénovation École Pikine', client: 'IEF Pikine', budget: '18M', spent: '18M', progress: 100, status: 'completed', bureau: 'BQC', team: 6 },
  { id: 'PRJ-0014', name: 'Extension usine SUNEOR', client: 'SUNEOR SA', budget: '245M', spent: '56.4M', progress: 23, status: 'blocked', bureau: 'BJ', team: 20 },
];

// --- Demandes ---
export const demands: Demand[] = [
  { id: 'DEM-2025-0156', bureau: 'BA', icon: '🛒', type: 'BC', subject: 'Matériaux Diamniadio', priority: 'urgent', amount: '1,250,000', date: '22/12/2025' },
  { id: 'DEM-2025-0155', bureau: 'BJ', icon: '⚖️', type: 'Contrat', subject: 'Avenant CSE BTP', priority: 'urgent', amount: '—', date: '22/12/2025' },
  { id: 'DEM-2025-0154', bureau: 'BF', icon: '🏦', type: 'Paiement', subject: 'Facture SENELEC', priority: 'normal', amount: '850,000', date: '21/12/2025' },
  { id: 'DEM-2025-0153', bureau: 'BM', icon: '🏪', type: 'AO', subject: 'Sélection fournisseur béton', priority: 'normal', amount: 'N/A', date: '21/12/2025' },
  { id: 'DEM-2025-0152', bureau: 'BCT', icon: '📍', type: 'Visite', subject: 'Inspection chantier Lot 4', priority: 'high', amount: '—', date: '20/12/2025' },
  { id: 'DEM-2025-0151', bureau: 'BQC', icon: '🔬', type: 'Contrôle', subject: 'Test béton armé phase 2', priority: 'normal', amount: '—', date: '20/12/2025' },
  { id: 'DEM-2025-0150', bureau: 'BF', icon: '🏦', type: 'Budget', subject: 'Révision budget Q1 2025', priority: 'high', amount: '15,000,000', date: '19/12/2025' },
];

// --- Délégations ---
export const delegations: Delegation[] = [
  { id: 'DEL-001', type: 'Validation BC < 2M', agent: 'Mariama SARR', initials: 'MS', scope: 'BC et paiements < 2M FCFA', start: '01/01/2025', end: '31/03/2025', status: 'active', usageCount: 23 },
  { id: 'DEL-002', type: 'Coordination Bureau Terrain', agent: 'Ibrahim FALL', initials: 'IF', scope: 'Supervision complète BCT', start: '01/01/2025', end: '30/06/2025', status: 'active', usageCount: 45 },
  { id: 'DEL-003', type: 'Gestion RH', agent: 'Ousmane NDIAYE', initials: 'ON', scope: 'Recrutement, contrats, formation', start: '01/06/2024', end: 'Permanente', status: 'active', usageCount: 89 },
];

// --- Décisions ---
export const decisions: Decision[] = [
  { id: 'DEC-2025-0089', type: 'Validation N+1', subject: 'BC-PRJ0018-2025-0048', date: '22/12/2025 14:23', author: 'A. DIALLO', status: 'executed', hash: 'SHA256:8f4a2b...' },
  { id: 'DEC-2025-0088', type: 'Substitution', subject: 'PAY-2025-0039', date: '22/12/2025 13:15', author: 'A. DIALLO', status: 'executed', hash: 'SHA256:3c7e1d...' },
  { id: 'DEC-2025-0087', type: 'Délégation', subject: 'Extension pouvoir M. Sarr', date: '22/12/2025 11:30', author: 'A. DIALLO', status: 'executed', hash: 'SHA256:9a2f5c...' },
  { id: 'DEC-2025-0086', type: 'Arbitrage', subject: 'Litige fournisseur SENELEC', date: '21/12/2025 16:45', author: 'A. DIALLO', status: 'executed', hash: 'SHA256:1b8d4e...' },
];

// --- Substitutions ---
export const substitutions: Substitution[] = [
  { ref: 'PAY-2025-0041', bureau: 'BF', icon: '🏦', desc: 'Paiement EIFFAGE - Situation n°4', amount: '8,750,000 FCFA', delay: 7, reason: 'Absence responsable' },
  { ref: 'VAL-2025-0089', bureau: 'BF', icon: '🏦', desc: 'Validation budget PRJ-INFRA', amount: '15,000,000 FCFA', delay: 6, reason: 'Blocage technique' },
  { ref: 'CTR-2025-0034', bureau: 'BM', icon: '🏪', desc: 'Contrat cadre SOGEA SATOM', amount: '45,000,000 FCFA', delay: 5, reason: 'Négociation en cours' },
  { ref: 'DEM-2025-0142', bureau: 'BCT', icon: '📍', desc: 'Autorisation travaux Zone C', amount: '—', delay: 5, reason: 'Documents manquants' },
];

// --- Timeline ---
export const timeline: TimelineItem[] = [
  { type: 'validated', title: 'BC Validé', desc: 'BC-PRJ0018-2025-0048', time: 'Il y a 12 min', bureau: 'BMO' },
  { type: 'substitution', title: 'Substitution BMO', desc: 'PAY-2025-0039', time: 'Il y a 1h', bureau: 'BMO' },
  { type: 'delegation', title: 'Délégation créée', desc: 'Validation BC → M. Sarr', time: 'Il y a 2h', bureau: 'BMO' },
  { type: 'alert', title: 'Alerte budget', desc: 'PRJ-INFRA +12%', time: 'Il y a 4h', bureau: 'BF' },
];
