/**
 * ====================================================================
 * TYPES: Substitution - Tous les types nécessaires
 * ====================================================================
 */

// ================================
// Entités principales
// ================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  bureau: string;
  role: string;
  competences: string[];
  disponibilite: 'available' | 'busy' | 'absent';
  chargeActuelle: number; // 0-100
  score: number; // Score de performance
  avatar?: string;
}

export interface Substitution {
  id: string;
  ref: string;
  titulaire: Employee;
  substitut?: Employee;
  status: 'active' | 'pending' | 'completed' | 'expired';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: 'absence' | 'blocage' | 'technique' | 'documents';
  description: string;
  bureau: string;
  dateDebut: Date;
  dateFin?: Date;
  delay: number; // Jours de retard
  amount: number; // Montant FCFA
  linkedProjects?: string[];
  documents?: Document[];
  comments?: Comment[];
  timeline?: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Absence {
  id: string;
  employeeId: string;
  employee: Employee;
  type: 'maladie' | 'conge' | 'formation' | 'autre';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  description?: string;
  documents?: Document[];
  approvedBy?: string;
  approvedAt?: Date;
  substitutionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delegation {
  id: string;
  fromUserId: string;
  fromUser: Employee;
  toUserId: string;
  toUser: Employee;
  type: 'temporary' | 'permanent';
  permissions: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'revoked';
  reason: string;
  ruleId?: string;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
}

export interface DelegationRule {
  id: string;
  name: string;
  description: string;
  fromRole: string;
  toRole: string;
  permissions: string[];
  conditions: Record<string, any>;
  autoApprove: boolean;
  active: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  entityType: 'substitution' | 'absence' | 'delegation';
  entityId: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  entityType: 'substitution' | 'absence' | 'delegation';
  entityId: string;
  userId: string;
  user: Employee;
  content: string;
  mentions: string[];
  attachments?: Document[];
  parentId?: string; // Pour les réponses
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  entityType: 'substitution' | 'absence' | 'delegation';
  entityId: string;
  type: 'created' | 'updated' | 'assigned' | 'escalated' | 'completed' | 'commented' | 'approved' | 'rejected' | 'revoked';
  userId: string;
  user: Employee;
  description: string;
  metadata: Record<string, any>;
  icon?: string;
  color?: string;
  createdAt: Date;
}

// ================================
// Filtres & Critères
// ================================

export interface SubstitutionFilter {
  status?: Substitution['status'];
  urgency?: Substitution['urgency'];
  reason?: Substitution['reason'];
  bureau?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  hasSubstitut?: boolean;
  minDelay?: number;
  maxDelay?: number;
}

export interface AbsenceFilter {
  type?: Absence['type'];
  status?: Absence['status'];
  bureau?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
}

export interface DelegationFilter {
  type?: Delegation['type'];
  status?: Delegation['status'];
  bureau?: string;
  search?: string;
  fromUserId?: string;
  toUserId?: string;
  hasRule?: boolean;
}

export interface SubstituteCriteria {
  requiredCompetences?: string[];
  bureau?: string;
  excludeIds?: string[];
  minScore?: number;
  maxWorkload?: number;
  availableOn?: Date;
}

// ================================
// Réponses paginées
// ================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ================================
// Données de création/mise à jour
// ================================

export interface SubstitutionCreateData {
  titulaireId: string;
  reason: Substitution['reason'];
  urgency: Substitution['urgency'];
  description: string;
  bureau: string;
  dateDebut: Date;
  dateFin?: Date;
  linkedProjects?: string[];
  documents?: File[];
}

export interface SubstitutionUpdateData {
  description?: string;
  urgency?: Substitution['urgency'];
  dateFin?: Date;
  linkedProjects?: string[];
}

export interface AbsenceCreateData {
  employeeId: string;
  type: Absence['type'];
  startDate: Date;
  endDate: Date;
  reason: string;
  description?: string;
  documents?: File[];
}

export interface AbsenceUpdateData {
  type?: Absence['type'];
  endDate?: Date;
  reason?: string;
  description?: string;
}

export interface DelegationCreateData {
  fromUserId: string;
  toUserId: string;
  type: Delegation['type'];
  permissions: string[];
  startDate: Date;
  endDate?: Date;
  reason: string;
}

export interface DelegationUpdateData {
  permissions?: string[];
  endDate?: Date;
  reason?: string;
}

// ================================
// Analytics & Stats
// ================================

export interface SubstitutionStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  critical: number;
  averageDelay: number;
  totalAmount: number;
  byBureau: Record<string, number>;
  byReason: Record<string, number>;
  byUrgency: Record<string, number>;
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface AbsenceStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageDuration: number;
  currentAbsences: number;
  upcomingAbsences: number;
}

export interface DelegationStats {
  total: number;
  active: number;
  temporary: number;
  permanent: number;
  byBureau: Record<string, number>;
  mostDelegated: { user: Employee; count: number }[];
}

export interface AvailabilityStatus {
  available: boolean;
  reason?: string;
  until?: Date;
  alternateContacts?: Employee[];
}

export interface WorkloadData {
  current: number; // 0-100
  substitutions: number;
  projects: number;
  delegations: number;
  capacity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface SubstituteCandidate {
  employee: Employee;
  score: number;
  reason: string;
  availability: boolean;
  workload: number;
  competencesMatch: number;
  previousSubstitutions: number;
}

// ================================
// Calendrier
// ================================

export interface CalendarEvent {
  id: string;
  type: 'absence' | 'delegation' | 'substitution';
  title: string;
  start: Date;
  end: Date;
  employee: Employee;
  color: string;
  allDay?: boolean;
  data: Absence | Delegation | Substitution;
}

export interface Conflict {
  id: string;
  type: 'absence_overlap' | 'delegation_overlap' | 'no_substitute';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  entities: string[];
  suggestedAction?: string;
}

// ================================
// Notifications
// ================================

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  entityType?: 'substitution' | 'absence' | 'delegation';
  entityId?: string;
  actionUrl?: string;
  createdAt: Date;
}

// ================================
// Exports & Rapports
// ================================

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv';
  period: {
    from: Date;
    to: Date;
  };
  categories: string[];
  fields: string[];
  filters?: SubstitutionFilter | AbsenceFilter | DelegationFilter;
}

export interface Report {
  id: string;
  type: string;
  title: string;
  period: string;
  generatedBy: string;
  generatedAt: Date;
  url: string;
  format: string;
  size: number;
}

