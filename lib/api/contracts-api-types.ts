// API Types & Endpoints pour Validation Contrats
// À implémenter côté backend

/**
 * ================================
 * Types de requêtes/réponses
 * ================================
 */

export interface ContractFiltersRequest {
  types?: string[];
  bureaux?: string[];
  statuses?: ('PENDING_BJ' | 'PENDING_BMO' | 'SIGNED' | 'REJECTED' | 'ARCHIVED')[];
  riskMin?: number;
  riskMax?: number;
  amountMin?: number;
  amountMax?: number;
  expiryDays?: number | null; // null = tous, 0 = expirés, >0 = expires dans X jours
  search?: string;
  sortBy?: 'risk' | 'amount' | 'expiry' | 'created' | 'updated';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ContractResponse {
  id: string;
  subject: string;
  partner: string;
  type: 'Marché' | 'Avenant' | 'Sous-traitance';
  bureau: string;
  amount: string; // Format: "123 456 789 FCFA"
  expiry: string; // Format: "DD/MM/YYYY"
  status: 'pending' | 'validated' | 'rejected';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  
  // Métadonnées calculées côté backend
  riskScore: number;
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
  daysToExpiry: number | null;
  amountValue: number;
  
  // Workflow
  workflowState: 'PENDING_BJ' | 'PENDING_BMO' | 'SIGNED' | 'REJECTED' | 'ARCHIVED';
  bjApproval?: {
    approvedById: string;
    approvedByName: string;
    approvedAtISO: string;
    approvalHash: string; // SHA-256
    ipAddress?: string;
    userAgent?: string;
  };
  bmoSignature?: {
    signedById: string;
    signedByName: string;
    signedAtISO: string;
    signatureHash: string; // SHA-256
    bjApprovalHashRef: string; // Référence au hash BJ (2-man rule)
    ipAddress?: string;
    userAgent?: string;
  };
  
  // Attachments
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  
  // Audit trail
  auditLog?: Array<{
    action: 'created' | 'updated' | 'approved_bj' | 'signed_bmo' | 'rejected' | 'archived';
    performedBy: string;
    performedAt: string;
    details: string;
    hash?: string;
  }>;
}

export interface ContractsListResponse {
  data: ContractResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    fetchedAt: string;
    filters: ContractFiltersRequest;
  };
}

export interface ContractsStatsResponse {
  total: number;
  pendingBJ: number;
  pendingBMO: number;
  signed: number;
  rejected: number;
  archived: number;
  urgent: number; // daysToExpiry <= 7
  expired: number; // daysToExpiry < 0
  highRisk: number; // riskScore >= 70
  totalAmount: number;
  avgAmount: number;
  byType: Record<string, number>;
  byBureau: Record<string, number>;
  byStatus: Record<string, number>;
  ts: string; // ISO 8601
}

export interface ApproveBJRequest {
  contractId: string;
  notes?: string;
  attachments?: string[]; // IDs des pièces justificatives
}

export interface ApproveBJResponse {
  success: boolean;
  contract: ContractResponse;
  approval: {
    approvalHash: string;
    approvedAtISO: string;
    approvedById: string;
    approvedByName: string;
  };
  message: string;
}

export interface SignBMORequest {
  contractId: string;
  bjApprovalHash: string; // Vérification 2-man rule
  notes?: string;
  signaturePin?: string; // PIN de signature électronique (optionnel)
}

export interface SignBMOResponse {
  success: boolean;
  contract: ContractResponse;
  signature: {
    signatureHash: string;
    signedAtISO: string;
    signedById: string;
    signedByName: string;
    bjApprovalHashRef: string;
  };
  certificateUrl?: string; // URL du certificat de signature
  message: string;
}

export interface RejectContractRequest {
  contractId: string;
  reason: string;
  rejectedBy: 'BJ' | 'BMO';
  notes?: string;
}

export interface RejectContractResponse {
  success: boolean;
  contract: ContractResponse;
  rejection: {
    rejectedAtISO: string;
    rejectedById: string;
    rejectedByName: string;
    reason: string;
  };
  message: string;
}

export interface AuditExportRequest {
  contractIds?: string[]; // Si vide, tous les contrats
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  format: 'csv' | 'json' | 'pdf';
  includeManifest?: boolean; // Inclure un fichier manifest avec hash
}

export interface AuditExportResponse {
  success: boolean;
  exportId: string;
  downloadUrl: string;
  expiresAt: string; // ISO 8601
  manifest?: {
    hash: string; // SHA-256 du fichier
    algorithm: 'SHA-256';
    generatedAt: string;
    generatedBy: string;
    recordCount: number;
  };
}

export interface ReminderRequest {
  contractId: string;
  dueDate: string; // ISO 8601
  message: string;
  priority: 'high' | 'medium' | 'low';
  notifyVia: ('email' | 'push' | 'sms')[];
  recipients: string[]; // User IDs
}

export interface ReminderResponse {
  success: boolean;
  reminder: {
    id: string;
    contractId: string;
    dueDate: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
    createdBy: string;
  };
  message: string;
}

/**
 * ================================
 * API Endpoints
 * ================================
 */

export const API_ENDPOINTS = {
  // GET: Liste des contrats avec filtres
  LIST_CONTRACTS: '/api/bmo/contracts',
  
  // GET: Statistiques agrégées
  GET_STATS: '/api/bmo/contracts/stats',
  
  // GET: Détails d'un contrat
  GET_CONTRACT: (id: string) => `/api/bmo/contracts/${id}`,
  
  // POST: Création d'un contrat
  CREATE_CONTRACT: '/api/bmo/contracts',
  
  // PATCH: Mise à jour d'un contrat
  UPDATE_CONTRACT: (id: string) => `/api/bmo/contracts/${id}`,
  
  // DELETE: Suppression (soft delete -> archived)
  DELETE_CONTRACT: (id: string) => `/api/bmo/contracts/${id}`,
  
  // POST: Validation par le Bureau Juridique
  APPROVE_BJ: (id: string) => `/api/bmo/contracts/${id}/approve-bj`,
  
  // POST: Signature par la Direction (BMO)
  SIGN_BMO: (id: string) => `/api/bmo/contracts/${id}/sign-bmo`,
  
  // POST: Rejet d'un contrat
  REJECT_CONTRACT: (id: string) => `/api/bmo/contracts/${id}/reject`,
  
  // POST: Archivage d'un contrat
  ARCHIVE_CONTRACT: (id: string) => `/api/bmo/contracts/${id}/archive`,
  
  // POST: Export audit trail
  EXPORT_AUDIT: '/api/bmo/contracts/export-audit',
  
  // POST: Upload d'une pièce jointe
  UPLOAD_ATTACHMENT: (id: string) => `/api/bmo/contracts/${id}/attachments`,
  
  // DELETE: Suppression d'une pièce jointe
  DELETE_ATTACHMENT: (contractId: string, attachmentId: string) => 
    `/api/bmo/contracts/${contractId}/attachments/${attachmentId}`,
  
  // GET: Historique des actions (audit log)
  GET_AUDIT_LOG: (id: string) => `/api/bmo/contracts/${id}/audit-log`,
  
  // POST: Création d'un rappel
  CREATE_REMINDER: '/api/bmo/contracts/reminders',
  
  // GET: Liste des rappels actifs
  LIST_REMINDERS: '/api/bmo/contracts/reminders',
  
  // DELETE: Suppression d'un rappel
  DELETE_REMINDER: (id: string) => `/api/bmo/contracts/reminders/${id}`,
  
  // POST: Comparaison de plusieurs contrats
  COMPARE_CONTRACTS: '/api/bmo/contracts/compare',
  
  // GET: Recherche full-text
  SEARCH_CONTRACTS: '/api/bmo/contracts/search',
  
  // GET: Prédictions de risque (ML)
  PREDICT_RISK: (id: string) => `/api/bmo/contracts/${id}/predict-risk`,
  
  // POST: Délégation de validation
  DELEGATE_VALIDATION: '/api/bmo/contracts/delegations',
  
  // GET: Liste des délégations actives
  LIST_DELEGATIONS: '/api/bmo/contracts/delegations',
};

/**
 * ================================
 * Exemples d'utilisation
 * ================================
 */

// Exemple 1: Liste des contrats avec filtres
async function fetchContracts(filters: ContractFiltersRequest): Promise<ContractsListResponse> {
  const response = await fetch(`${API_ENDPOINTS.LIST_CONTRACTS}?${new URLSearchParams(filters as any)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

// Exemple 2: Validation BJ
async function approveBJ(request: ApproveBJRequest): Promise<ApproveBJResponse> {
  const response = await fetch(API_ENDPOINTS.APPROVE_BJ(request.contractId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

// Exemple 3: Signature BMO avec 2-man rule
async function signBMO(request: SignBMORequest): Promise<SignBMOResponse> {
  const response = await fetch(API_ENDPOINTS.SIGN_BMO(request.contractId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.code === 'BJ_APPROVAL_REQUIRED') {
      throw new Error('Validation BJ requise avant signature BMO (2-man rule)');
    }
    throw new Error(`HTTP ${response.status}: ${error.message}`);
  }
  
  return response.json();
}

// Exemple 4: Export audit avec hash
async function exportAudit(request: AuditExportRequest): Promise<AuditExportResponse> {
  const response = await fetch(API_ENDPOINTS.EXPORT_AUDIT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

/**
 * ================================
 * Sécurité & Contraintes
 * ================================
 */

// 1. 2-man rule (BJ → BMO)
// - Un contrat DOIT être validé par BJ avant signature BMO
// - Le hash BJ est vérifié lors de la signature BMO
// - Si hash invalide → HTTP 403 Forbidden

// 2. Hachage SHA-256
// - Chaque validation/signature génère un hash unique
// - Format: SHA256:<timestamp>:<userId>:<contractId>:<random>
// - Stocké dans la BDD pour audit trail immuable

// 3. Permissions RACI
// - BJ : Peut valider (R = Responsible)
// - BMO : Peut signer (A = Accountable)
// - Autres : Lecture seule (C = Consulted, I = Informed)

// 4. Rate limiting
// - Max 100 requêtes/minute par utilisateur
// - Max 1000 requêtes/heure pour l'export audit

// 5. Logs d'audit
// - Toute action (CRUD, validation, signature) → audit log
// - Stockage : userId, timestamp, IP, userAgent, action, hash
// - Immutabilité : pas de UPDATE/DELETE sur audit_log table

function getAuthToken(): string {
  // TODO: Récupérer le token JWT depuis le session storage
  return 'TODO';
}

/**
 * ================================
 * Codes d'erreur
 * ================================
 */

export const ERROR_CODES = {
  // Validation
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  BJ_APPROVAL_REQUIRED: 'BJ_APPROVAL_REQUIRED',
  INVALID_BJ_HASH: 'INVALID_BJ_HASH',
  ALREADY_SIGNED: 'ALREADY_SIGNED',
  ALREADY_REJECTED: 'ALREADY_REJECTED',
  
  // Permissions
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  USER_NOT_IN_BJ: 'USER_NOT_IN_BJ',
  USER_NOT_IN_BMO: 'USER_NOT_IN_BMO',
  
  // Business rules
  CONTRACT_EXPIRED: 'CONTRACT_EXPIRED',
  AMOUNT_TOO_HIGH: 'AMOUNT_TOO_HIGH',
  MISSING_ATTACHMENTS: 'MISSING_ATTACHMENTS',
  INVALID_WORKFLOW_STATE: 'INVALID_WORKFLOW_STATE',
  
  // Technique
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  HASH_GENERATION_FAILED: 'HASH_GENERATION_FAILED',
};

