// ============================================
// Types pour le module BMO (Maître d'Ouvrage)
// ============================================

// --- Enums ---
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type BadgeType = 'urgent' | 'warning' | 'success' | 'info' | 'gold' | 'default';
export type ProjectStatus = 'active' | 'blocked' | 'completed' | 'pending';
export type EmployeeStatus = 'active' | 'mission' | 'absent' | 'conge';
export type DemandStatus = 'pending' | 'validated' | 'rejected';
export type ExchangeStatus = 'pending' | 'resolved' | 'escalated' | 'info';
export type ArbitrationStatus = 'pending' | 'resolved';
export type RecoveryStatus = 'relance' | 'huissier' | 'contentieux';
export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Freelance';

// --- Bureau ---
export interface Bureau {
  code: string;
  name: string;
  icon: string;
  color: string;
  head: string;
  agents: number;
  tasks: number;
  completion: number;
  budget: string;
  desc: string;
}

// --- Employé ---
export interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  bureau: string;
  status: EmployeeStatus;
  email: string;
  phone: string;
  salary: string;
  skills: string[];
  delegated?: boolean;
}

export interface EmployeeDetails {
  employeeId: string;
  contractType: ContractType;
  contractStart: string;
  contractEnd?: string;
  emergencyContact: string;
  address: string;
  bankAccount: string;
  socialSecurity: string;
}

// --- Projet ---
export interface Project {
  id: string;
  name: string;
  client: string;
  budget: string;
  spent: string;
  progress: number;
  status: ProjectStatus;
  bureau: string;
  team: number;
}

// --- Demande ---
export interface Demand {
  id: string;
  bureau: string;
  icon: string;
  type: string;
  subject: string;
  priority: Priority;
  amount: string;
  date: string;
  status?: DemandStatus;
}

// --- Délégation ---
export interface Delegation {
  id: string;
  type: string;
  agent: string;
  initials: string;
  scope: string;
  start: string;
  end: string;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

// --- Décision ---
export interface Decision {
  id: string;
  type: string;
  subject: string;
  date: string;
  author: string;
  status: 'executed' | 'pending' | 'cancelled';
  hash: string;
}

// --- Bon de Commande ---
export interface PurchaseOrder {
  id: string;
  project: string;
  subject: string;
  supplier: string;
  amount: string;
  requestedBy: string;
  bureau: string;
  date: string;
  priority: Priority;
  status: DemandStatus;
}

// --- Contrat ---
export interface Contract {
  id: string;
  type: string;
  subject: string;
  partner: string;
  amount: string;
  preparedBy: string;
  bureau: string;
  date: string;
  expiry: string;
  status: DemandStatus;
}

// --- Paiement ---
export interface Payment {
  id: string;
  type: string;
  ref: string;
  beneficiary: string;
  amount: string;
  project: string;
  validatedBy: string;
  bureau: string;
  date: string;
  dueDate: string;
  status: DemandStatus;
}

// --- Facture ---
export interface Invoice {
  id: string;
  fournisseur: string;
  objet: string;
  montant: string;
  projet: string;
  dateFacture: string;
  dateEcheance: string;
  status: DemandStatus;
  validatedBy: string | null;
  bureau: string;
}

// --- Avenant ---
export interface Amendment {
  id: string;
  contratRef: string;
  objet: string;
  partenaire: string;
  impact: 'Financier' | 'Délai' | 'Technique';
  montant: string | null;
  justification: string;
  status: DemandStatus;
  preparedBy: string;
  bureau: string;
  date: string;
}

// --- Dossier bloqué ---
export interface BlockedDossier {
  id: string;
  type: string;
  subject: string;
  amount: string;
  bureau: string;
  responsible: string;
  blockedSince: string;
  delay: number;
  reason: string;
  project: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

// --- Demande RH ---
export interface HRRequest {
  id: string;
  type: string;
  subtype: string;
  agent: string;
  initials: string;
  bureau: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  amount?: string;
  destination?: string;
  reason: string;
  status: DemandStatus;
  date: string;
  priority: Priority;
}

// --- Échange inter-bureaux ---
export interface BureauExchange {
  id: string;
  from: string;
  to: string;
  fromAgent: string;
  toAgent: string;
  subject: string;
  message: string;
  date: string;
  status: ExchangeStatus;
  priority: Priority;
  project?: string;
  attachments?: number;
}

// --- Arbitrage ---
export interface Arbitration {
  id: string;
  subject: string;
  parties: string[];
  description: string;
  requestedBy: string;
  date: string;
  status: ArbitrationStatus;
  impact: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  resolution?: string;
}

// --- Message externe ---
export interface ExternalMessage {
  id: string;
  type: string;
  sender: string;
  contact: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
  priority: Priority;
  project?: string;
  requiresResponse: boolean;
}

// --- Recouvrement ---
export interface Recovery {
  id: string;
  type: string;
  debiteur: string;
  montant: string;
  dateEcheance: string;
  delay: number;
  status: RecoveryStatus;
  relances: number;
  projet?: string;
}

// --- Litige ---
export interface Litigation {
  id: string;
  type: string;
  adversaire: string;
  objet: string;
  montant: string;
  juridiction: string;
  avocat: string;
  status: string;
  prochainRdv?: string;
  projet?: string;
}

// --- Événement calendrier ---
export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'visio' | 'deadline' | 'site' | 'delivery' | 'legal' | 'inspection' | 'training' | 'hr';
  location?: string;
  date: string;
  endDate?: string;
  priority: Priority | 'critical';
  client?: string;
  project?: string;
  supplier?: string;
  employee?: string;
}

// --- Tâche ---
export interface Task {
  id: string;
  text: string;
  priority: Priority;
  due: string;
  done: boolean;
  bureau: string;
}

// --- Rappel ---
export interface Reminder {
  id: string;
  title: string;
  time: string;
  urgent: boolean;
  icon: string;
}

// --- Note ---
export interface Note {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  date: string;
  pinned: boolean;
}

// --- Notification ---
export interface Notification {
  id: number;
  title: string;
  desc: string;
  unread: boolean;
  icon: string;
  time: string;
}

// --- Alerte système ---
export interface SystemAlert {
  id: string;
  title: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  action: string;
}

// --- Toast ---
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

// --- Statistiques temps réel ---
export interface LiveStats {
  demandesEnCours: number;
  validationsJour: number;
  montantTraite: string;
  alertesCritiques: number;
  tauxValidation: number;
  tempsReponse: string;
}

// --- KPIs animés ---
export interface AnimatedKPIs {
  demands: number;
  validated: number;
  projects: number;
  blocked: number;
  budget: number;
  employees: number;
  bureaux: number;
  delegations: number;
}

// --- Navigation ---
export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  badgeType?: BadgeType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// --- Données de performance ---
export interface PerformanceData {
  month: string;
  validations: number;
  demandes: number;
  budget: number;
  rejets: number;
}

// --- Matrice RACI ---
export interface RACIRow {
  activity: string;
  BMO: 'R' | 'A' | 'C' | 'I';
  BF: 'R' | 'A' | 'C' | 'I';
  BM: 'R' | 'A' | 'C' | 'I';
  BA: 'R' | 'A' | 'C' | 'I';
  BCT: 'R' | 'A' | 'C' | 'I';
  BQC: 'R' | 'A' | 'C' | 'I';
  BJ: 'R' | 'A' | 'C' | 'I';
}

// --- Audit ---
export interface AuditItem {
  id: string;
  type: string;
  status: 'conforme' | 'attention' | 'non-conforme';
  score: number;
  lastCheck: string;
  nextCheck: string;
}

// --- Organigramme ---
export interface OrgMember {
  name: string;
  role: string;
  initials: string;
}

export interface OrgBureau {
  code: string;
  head: OrgMember;
  members: OrgMember[];
}

export interface Organigramme {
  dg: OrgMember;
  bureaux: OrgBureau[];
}

// --- Consigne ---
export interface Consigne {
  id: string;
  bureau: string;
  from: string;
  title: string;
  content: string;
  date: string;
  priority: Priority;
  status: 'active' | 'archived';
  acknowledgement: string[];
}

// --- Substitution ---
export interface Substitution {
  ref: string;
  bureau: string;
  icon: string;
  desc: string;
  amount: string;
  delay: number;
  reason: string;
}

// --- Timeline ---
export interface TimelineItem {
  type: 'validated' | 'substitution' | 'delegation' | 'alert' | 'payment' | 'contract';
  title: string;
  desc: string;
  time: string;
  bureau: string;
}

// --- Message IA ---
export interface AIMessage {
  type: 'user' | 'bot';
  text: string;
}

// --- Élément recherchable ---
export interface SearchableItem {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  page: string;
}
