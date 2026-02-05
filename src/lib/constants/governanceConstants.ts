/**
 * Constantes et configuration globale du module Gouvernance
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATUTS
// ═══════════════════════════════════════════════════════════════════════════

export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const HEALTH_STATUSES = {
  ON_TRACK: 'on-track',
  AT_RISK: 'at-risk',
  LATE: 'late',
  BLOCKED: 'blocked',
} as const;

export const RISK_PROBABILITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very-high',
} as const;

export const RISK_IMPACTS = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major',
  CRITICAL: 'critical',
} as const;

export const RISK_STATUSES = {
  IDENTIFIED: 'identified',
  ANALYZING: 'analyzing',
  MITIGATING: 'mitigating',
  MONITORING: 'monitoring',
  CLOSED: 'closed',
} as const;

export const ALERT_TYPES = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const ALERT_CATEGORIES = {
  SYSTEM: 'system',
  PROJECT: 'project',
  BUDGET: 'budget',
  RESOURCE: 'resource',
  QUALITY: 'quality',
  DEADLINE: 'deadline',
  SAFETY: 'safety',
} as const;

export const ALERT_STATUSES = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export const DECISION_TYPES = {
  BUDGET: 'budget',
  PLANNING: 'planning',
  RESOURCE: 'resource',
  QUALITY: 'quality',
  STRATEGIC: 'strategic',
  TECHNICAL: 'technical',
} as const;

export const DECISION_IMPACTS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const DECISION_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DEFERRED: 'deferred',
} as const;

export const ESCALATION_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
} as const;

export const ESCALATION_URGENCIES = {
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ESCALATION_STATUSES = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LABELS (Traductions)
// ═══════════════════════════════════════════════════════════════════════════

export const LABELS = {
  projectStatuses: {
    [PROJECT_STATUSES.ACTIVE]: 'Actif',
    [PROJECT_STATUSES.ON_HOLD]: 'En pause',
    [PROJECT_STATUSES.COMPLETED]: 'Terminé',
    [PROJECT_STATUSES.CANCELLED]: 'Annulé',
  },
  healthStatuses: {
    [HEALTH_STATUSES.ON_TRACK]: 'Conforme',
    [HEALTH_STATUSES.AT_RISK]: 'À risque',
    [HEALTH_STATUSES.LATE]: 'En retard',
    [HEALTH_STATUSES.BLOCKED]: 'Bloqué',
  },
  riskProbabilities: {
    [RISK_PROBABILITIES.LOW]: 'Faible',
    [RISK_PROBABILITIES.MEDIUM]: 'Moyenne',
    [RISK_PROBABILITIES.HIGH]: 'Élevée',
    [RISK_PROBABILITIES.VERY_HIGH]: 'Très élevée',
  },
  riskImpacts: {
    [RISK_IMPACTS.MINOR]: 'Mineur',
    [RISK_IMPACTS.MODERATE]: 'Modéré',
    [RISK_IMPACTS.MAJOR]: 'Majeur',
    [RISK_IMPACTS.CRITICAL]: 'Critique',
  },
  riskStatuses: {
    [RISK_STATUSES.IDENTIFIED]: 'Identifié',
    [RISK_STATUSES.ANALYZING]: 'En analyse',
    [RISK_STATUSES.MITIGATING]: 'Atténuation',
    [RISK_STATUSES.MONITORING]: 'Surveillance',
    [RISK_STATUSES.CLOSED]: 'Clôturé',
  },
  alertTypes: {
    [ALERT_TYPES.CRITICAL]: 'Critique',
    [ALERT_TYPES.WARNING]: 'Avertissement',
    [ALERT_TYPES.INFO]: 'Information',
  },
  alertCategories: {
    [ALERT_CATEGORIES.SYSTEM]: 'Système',
    [ALERT_CATEGORIES.PROJECT]: 'Projet',
    [ALERT_CATEGORIES.BUDGET]: 'Budget',
    [ALERT_CATEGORIES.RESOURCE]: 'Ressource',
    [ALERT_CATEGORIES.QUALITY]: 'Qualité',
    [ALERT_CATEGORIES.DEADLINE]: 'Échéance',
    [ALERT_CATEGORIES.SAFETY]: 'Sécurité',
  },
  alertStatuses: {
    [ALERT_STATUSES.NEW]: 'Nouvelle',
    [ALERT_STATUSES.ACKNOWLEDGED]: 'Prise en compte',
    [ALERT_STATUSES.IN_PROGRESS]: 'En cours',
    [ALERT_STATUSES.RESOLVED]: 'Résolue',
    [ALERT_STATUSES.DISMISSED]: 'Ignorée',
  },
  decisionTypes: {
    [DECISION_TYPES.BUDGET]: 'Budget',
    [DECISION_TYPES.PLANNING]: 'Planning',
    [DECISION_TYPES.RESOURCE]: 'Ressource',
    [DECISION_TYPES.QUALITY]: 'Qualité',
    [DECISION_TYPES.STRATEGIC]: 'Stratégique',
    [DECISION_TYPES.TECHNICAL]: 'Technique',
  },
  decisionImpacts: {
    [DECISION_IMPACTS.LOW]: 'Faible',
    [DECISION_IMPACTS.MEDIUM]: 'Moyen',
    [DECISION_IMPACTS.HIGH]: 'Élevé',
    [DECISION_IMPACTS.CRITICAL]: 'Critique',
  },
  decisionStatuses: {
    [DECISION_STATUSES.PENDING]: 'En attente',
    [DECISION_STATUSES.IN_REVIEW]: 'En révision',
    [DECISION_STATUSES.APPROVED]: 'Approuvée',
    [DECISION_STATUSES.REJECTED]: 'Rejetée',
    [DECISION_STATUSES.DEFERRED]: 'Différée',
  },
  escalationLevels: {
    [ESCALATION_LEVELS.LEVEL_1]: 'Niveau 1 - Chef de projet',
    [ESCALATION_LEVELS.LEVEL_2]: 'Niveau 2 - Direction opérationnelle',
    [ESCALATION_LEVELS.LEVEL_3]: 'Niveau 3 - Direction générale',
  },
  escalationUrgencies: {
    [ESCALATION_URGENCIES.NORMAL]: 'Normal',
    [ESCALATION_URGENCIES.HIGH]: 'Élevée',
    [ESCALATION_URGENCIES.CRITICAL]: 'Critique',
  },
  escalationStatuses: {
    [ESCALATION_STATUSES.NEW]: 'Nouvelle',
    [ESCALATION_STATUSES.ACKNOWLEDGED]: 'Prise en compte',
    [ESCALATION_STATUSES.IN_PROGRESS]: 'En cours',
    [ESCALATION_STATUSES.RESOLVED]: 'Résolue',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COULEURS SÉMANTIQUES
// ═══════════════════════════════════════════════════════════════════════════

export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-900/20',
    text: 'text-green-400',
    border: 'border-green-500',
    icon: 'text-green-400',
  },
  warning: {
    bg: 'bg-amber-900/20',
    text: 'text-amber-400',
    border: 'border-amber-500',
    icon: 'text-amber-400',
  },
  critical: {
    bg: 'bg-red-900/20',
    text: 'text-red-400',
    border: 'border-red-500',
    icon: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-900/20',
    text: 'text-blue-400',
    border: 'border-blue-500',
    icon: 'text-blue-400',
  },
  neutral: {
    bg: 'bg-slate-800/30',
    text: 'text-slate-400',
    border: 'border-slate-600',
    icon: 'text-slate-400',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION AUTO-REFRESH
// ═══════════════════════════════════════════════════════════════════════════

export const AUTO_REFRESH = {
  INTERVAL_MS: 30000, // 30 secondes
  ENABLED_BY_DEFAULT: true,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SEUILS ET LIMITES
// ═══════════════════════════════════════════════════════════════════════════

export const THRESHOLDS = {
  BUDGET_WARNING: 0.85, // 85% du budget consommé
  BUDGET_CRITICAL: 0.95, // 95% du budget consommé
  PROGRESS_LAG_WARNING: 5, // 5% de retard sur le planning
  PROGRESS_LAG_CRITICAL: 15, // 15% de retard sur le planning
  ALERT_URGENT_HOURS: 24, // Alerte urgente si non lue depuis 24h
  DEADLINE_URGENT_DAYS: 3, // Échéance urgente si < 3 jours
  RISK_CRITICALITY_HIGH: 6, // Probabilité × Impact ≥ 6
  RISK_CRITICALITY_CRITICAL: 9, // Probabilité × Impact ≥ 9
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FORMATS D'EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv',
  JSON: 'json',
} as const;

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.EXCEL]: 'Excel (.xlsx)',
  [EXPORT_FORMATS.PDF]: 'PDF (.pdf)',
  [EXPORT_FORMATS.CSV]: 'CSV (.csv)',
  [EXPORT_FORMATS.JSON]: 'JSON (.json)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSIONS (pour futur contrôle d'accès)
// ═══════════════════════════════════════════════════════════════════════════

export const PERMISSIONS = {
  VIEW_PROJECTS: 'governance:projects:view',
  EDIT_PROJECTS: 'governance:projects:edit',
  VIEW_RISKS: 'governance:risks:view',
  EDIT_RISKS: 'governance:risks:edit',
  APPROVE_DECISIONS: 'governance:decisions:approve',
  ESCALATE: 'governance:escalate',
  EXPORT_DATA: 'governance:export',
  MANAGE_SETTINGS: 'governance:settings:manage',
} as const;

