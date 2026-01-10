/**
 * Types du domaine métier "Délégations de Pouvoirs"
 * ================================================
 * 
 * Une délégation = un contrat interne d'autorité
 * qui modifie le centre de gravité du pouvoir dans l'entreprise.
 */

// ============================================
// ÉNUMÉRATIONS MÉTIER
// ============================================

/** Catégories de délégation */
export type DelegationCategory =
  | 'SIGNATURE'       // Signature de documents
  | 'ENGAGEMENT'      // Engagement de dépenses
  | 'PAIEMENT'        // Validation de paiements
  | 'VALIDATION'      // Validation technique/métier
  | 'REPRESENTATION'  // Représentation de l'entité
  | 'OPERATIONNEL';   // Actes opérationnels courants

/** Statuts d'une délégation */
export type DelegationStatus =
  | 'draft'      // Brouillon, en cours de rédaction
  | 'submitted'  // Soumise pour approbation
  | 'active'     // Active, peut être utilisée
  | 'suspended'  // Suspendue temporairement
  | 'revoked'    // Révoquée définitivement
  | 'expired';   // Expirée (date fin dépassée)

/** Actions autorisables par une policy */
export type DelegationAction =
  | 'APPROVE_PAYMENT'         // Valider un paiement
  | 'SIGN_CONTRACT'           // Signer un contrat
  | 'APPROVE_PURCHASE_ORDER'  // Valider un bon de commande
  | 'VALIDATE_CHANGE_ORDER'   // Valider un avenant
  | 'APPROVE_RECEPTION'       // Valider une réception
  | 'SIGN_MINUTES'            // Signer un PV
  | 'REPRESENT_ENTITY'        // Représenter l'entité
  | 'COMMIT_BUDGET'           // Engager un budget
  | 'APPROVE_EXPENSE'         // Approuver une dépense
  | 'SIGN_CORRESPONDENCE';    // Signer courrier officiel

/** Rôles des acteurs dans une délégation */
export type DelegationActorRole =
  | 'GRANTOR'      // Délégant (qui donne la délégation)
  | 'DELEGATE'     // Délégataire (qui reçoit le pouvoir)
  | 'CO_APPROVER'  // Co-valideur (dual control)
  | 'CONTROLLER'   // Contrôleur interne
  | 'AUDITOR'      // Auditeur
  | 'WITNESS'      // Témoin
  | 'BACKUP'       // Suppléant
  | 'IMPACTED';    // Personne impactée (chef de projet, budget owner...)

/** Types d'engagements */
export type EngagementType =
  | 'OBLIGATION'     // Ce que le délégataire DOIT faire
  | 'PROHIBITION'    // Ce qu'il NE PEUT PAS faire
  | 'ALERT'          // Obligations d'alerte
  | 'REPORTING'      // Obligations de reporting
  | 'DOCUMENTATION'  // Pièces justificatives exigées
  | 'COMPLIANCE';    // Conformité réglementaire

/** Criticité */
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Types de documents */
export type DocumentType =
  | 'BC'         // Bon de commande
  | 'PAIEMENT'   // Paiement
  | 'CONTRAT'    // Contrat
  | 'AVENANT'    // Avenant
  | 'PV'         // Procès-verbal
  | 'RECEPTION'; // Réception

/** Types d'événements d'audit */
export type DelegationEventType =
  | 'CREATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'ACTIVATED'
  | 'USED'
  | 'EXTENDED'
  | 'MODIFIED'
  | 'SUSPENDED'
  | 'REACTIVATED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'COMMENT';

/** Résultat d'évaluation */
export type EvaluationResult = 'ALLOWED' | 'DENIED' | 'PENDING_CONTROL';

/** Mode de périmètre */
export type ScopeMode = 'ALL' | 'INCLUDE' | 'EXCLUDE';

/** Devises */
export type Currency = 'XOF' | 'EUR' | 'USD';

/** Jours de la semaine */
export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

/** Fréquence de reporting */
export type ReportingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PER_USE' | 'ON_DEMAND';

// ============================================
// TYPES PRINCIPAUX
// ============================================

/** Personne (acteur) */
export interface Person {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

/** Politique de délégation */
export interface DelegationPolicy {
  id: string;
  action: DelegationAction;
  maxAmount?: number;
  currency: Currency;
  allowedProjects?: string[];
  allowedBureaux?: string[];
  allowedSuppliers?: string[];
  excludedSuppliers?: string[];
  allowedCategories?: string[];
  requiresDualControl: boolean;
  requiresLegalReview: boolean;
  requiresFinanceCheck: boolean;
  requiresStepUpAuth: boolean;
  stepUpThreshold?: number;
  enabled: boolean;
}

/** Acteur de la délégation */
export interface DelegationActor {
  id: string;
  user: Person;
  roleType: DelegationActorRole;
  required: boolean;
  canApprove: boolean;
  canRevoke: boolean;
  mustBeNotified: boolean;
  notes?: string;
}

/** Document requis */
export interface RequiredDocument {
  type: string;
  description: string;
  mandatory: boolean;
}

/** Engagement */
export interface DelegationEngagement {
  id: string;
  engagementType: EngagementType;
  title: string;
  description: string;
  criticality: Criticality;
  requiredDocs?: RequiredDocument[];
  frequency?: ReportingFrequency;
  enabled: boolean;
}

/** Contexte d'une action (pour évaluation) */
export interface ActionContext {
  action: DelegationAction;
  projectId?: string;
  projectName?: string;
  bureau: string;
  amount: number;
  currency: Currency;
  supplierId?: string;
  supplierName?: string;
  category?: string;
  documentType?: DocumentType;
  documentRef?: string;
  requesterId?: string;
  requesterName?: string;
  timestamp?: Date;
}

/** Résultat d'évaluation */
export interface PolicyEvaluationResult {
  allowed: boolean;
  result: EvaluationResult;
  reasons: string[];
  controls: {
    dual: boolean;
    legal: boolean;
    finance: boolean;
    stepUp: boolean;
  };
  matchedPolicy?: DelegationPolicy;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

/** Délégation complète */
export interface DelegationFull {
  id: string;
  code?: string;
  title: string;
  category: DelegationCategory;
  status: DelegationStatus;
  object: string;
  description?: string;
  legalBasis?: string;
  
  grantor: Person;
  delegate: Person;
  bureau: string;
  
  startsAt: Date;
  endsAt: Date;
  extendable: boolean;
  maxExtensions: number;
  extensionDays: number;
  
  // Périmètre
  projectScopeMode: ScopeMode;
  projectScopeList?: string[];
  bureauScopeMode: ScopeMode;
  bureauScopeList?: string[];
  supplierScopeMode: ScopeMode;
  supplierScopeList?: string[];
  categoryScopeList?: string[];
  
  // Limites générales
  maxAmount?: number;
  maxTotalAmount?: number;
  currency: Currency;
  maxDailyOps?: number;
  maxMonthlyOps?: number;
  allowedHoursStart?: number;
  allowedHoursEnd?: number;
  allowedDays?: WeekDay[];
  
  // Contrôles généraux
  requiresDualControl: boolean;
  requiresLegalReview: boolean;
  requiresFinanceCheck: boolean;
  requiresStepUpAuth: boolean;
  requiresDocumentation: boolean;
  
  // Utilisation
  usageCount: number;
  usageTotalAmount: number;
  lastUsedAt?: Date;
  
  // Traçabilité
  decisionHash?: string;
  headHash?: string;
  decisionRef?: string;
  decisionDate?: Date;
  
  // Relations
  policies: DelegationPolicy[];
  actors: DelegationActor[];
  engagements: DelegationEngagement[];
  
  createdAt: Date;
  updatedAt: Date;
}

/** Événement d'audit */
export interface DelegationAuditEvent {
  id: string;
  delegationId: string;
  eventType: DelegationEventType;
  actor: Person;
  summary?: string;
  details?: string;
  usageContext?: ActionContext;
  targetDoc?: {
    id?: string;
    ref: string;
    type: DocumentType;
    amount?: number;
  };
  evaluationResult?: EvaluationResult;
  evaluationReasons?: string[];
  controlsRequired?: {
    dual: boolean;
    legal: boolean;
    finance: boolean;
    stepUp: boolean;
  };
  previousHash?: string;
  eventHash: string;
  validation?: {
    validatedBy: Person;
    validatedAt: Date;
  };
  createdAt: Date;
}

/** Usage de délégation */
export interface DelegationUsage {
  id: string;
  delegationId: string;
  context: {
    projectId?: string;
    projectName?: string;
    bureau?: string;
    supplierId?: string;
    supplierName?: string;
    category?: string;
  };
  document: {
    id?: string;
    ref: string;
    type: DocumentType;
    date?: Date;
  };
  amount: number;
  currency: Currency;
  usedBy: Person;
  status: 'PENDING' | 'AUTHORIZED' | 'DENIED' | 'PENDING_CONTROL' | 'CANCELLED';
  controls: {
    dualControl?: { by: Person; at: Date };
    legalReview?: { by: Person; at: Date; notes?: string };
    financeCheck?: { by: Person; at: Date; notes?: string };
  };
  eventId?: string;
  notes?: string;
  createdAt: Date;
}

// ============================================
// RISQUES MÉTIER
// ============================================

/** Types de risques liés aux délégations */
export type DelegationRiskType =
  | 'BUDGET_OVERRUN'          // Dépassement de budget
  | 'CONFLICT_OF_INTEREST'    // Conflit d'intérêts
  | 'SEGREGATION_VIOLATION'   // Violation séparation des tâches
  | 'CONTESTATION'            // Risque de contestation
  | 'FRAUD'                   // Risque de fraude
  | 'CONTINUITY'              // Rupture de continuité
  | 'LIABILITY'               // Responsabilité non clarifiée
  | 'COMPLIANCE';             // Non-conformité réglementaire

/** Risque identifié */
export interface DelegationRisk {
  type: DelegationRiskType;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  mitigation?: string;
  detectedAt: Date;
}

// ============================================
// SIMULATION
// ============================================

/** Requête de simulation */
export interface SimulationRequest {
  delegationId: string;
  context: ActionContext;
}

/** Réponse de simulation */
export interface SimulationResponse {
  request: SimulationRequest;
  evaluation: PolicyEvaluationResult;
  delegation: {
    id: string;
    title: string;
    status: DelegationStatus;
    delegate: Person;
    endsAt: Date;
    remainingAmount?: number;
    remainingOps?: number;
  };
  risks: DelegationRisk[];
  timeline: {
    wouldBeNthUsage: number;
    totalAfterUsage: number;
    remainingDays: number;
  };
  simulatedAt: Date;
}

