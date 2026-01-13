/**
 * Types étendus pour le système BMO
 * Stakeholders, Tasks, Risks
 */

// ============================================
// ENUMS (pour validation TypeScript)
// ============================================

export type StakeholderRole = 
  | 'OWNER'        // Pilote du dossier
  | 'APPROVER'     // Valide
  | 'REVIEWER'     // Contrôle
  | 'CONTRIBUTOR'  // Produit des éléments
  | 'INFORMED';    // Informé

export type TaskStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'BLOCKED';

// ============================================
// STAKEHOLDER
// ============================================

export interface DemandStakeholder {
  id: string;
  demandId: string;
  personId: string;
  personName: string;
  role: StakeholderRole;
  required: boolean;
  note?: string | null;
  createdAt: Date | string;
}

export interface CreateStakeholderPayload {
  personId: string;
  personName: string;
  role: StakeholderRole;
  required?: boolean;
  note?: string;
}

// ============================================
// TASK
// ============================================

export interface DemandTask {
  id: string;
  demandId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueAt?: Date | string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: Date | string;
  completedAt?: Date | string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueAt?: Date | string;
  assignedToId?: string;
  assignedToName?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueAt?: Date | string;
  assignedToId?: string;
  assignedToName?: string;
  completedAt?: Date | string;
}

// ============================================
// RISK
// ============================================

export interface DemandRisk {
  id: string;
  demandId: string;
  category: string;        // "Juridique", "Budget", "SLA", "Réputation", etc.
  opportunity: boolean;    // true = opportunité, false = risque
  probability: number;     // 1..5
  impact: number;          // 1..5
  mitigation?: string | null;
  ownerName?: string | null;
  createdAt: Date | string;
}

export interface CreateRiskPayload {
  category: string;
  opportunity?: boolean;
  probability: number;     // 1..5
  impact: number;          // 1..5
  mitigation?: string;
  ownerName?: string;
}

export interface UpdateRiskPayload {
  category?: string;
  opportunity?: boolean;
  probability?: number;
  impact?: number;
  mitigation?: string;
  ownerName?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcule le score de risque/opportunité (Probability × Impact)
 */
export function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact; // 1-25
}

/**
 * Retourne le niveau de criticité basé sur le score
 */
export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score <= 5) return 'LOW';
  if (score <= 10) return 'MEDIUM';
  if (score <= 15) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Labels pour les rôles de stakeholder
 */
export const STAKEHOLDER_ROLE_LABELS: Record<StakeholderRole, string> = {
  OWNER: 'Pilote',
  APPROVER: 'Validateur',
  REVIEWER: 'Contrôleur',
  CONTRIBUTOR: 'Contributeur',
  INFORMED: 'Informé',
};

/**
 * Labels pour les statuts de tâche
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
  BLOCKED: 'Bloqué',
};

/**
 * Catégories de risque prédéfinies
 */
export const RISK_CATEGORIES = [
  'Juridique',
  'Budget',
  'SLA',
  'Réputation',
  'Technique',
  'Ressources',
  'Planning',
  'Qualité',
  'Sécurité',
  'Réglementaire',
] as const;

export type RiskCategory = typeof RISK_CATEGORIES[number];

