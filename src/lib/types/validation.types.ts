// ============================================
// Types pour la logique métier de validation
// Centre de pilotage BMO - Contrôle et Coordination
// ============================================

export type ValidationContext = 'bc' | 'facture' | 'avenant';

export type ValidationStatus = 
  | 'pending'           // En attente de validation
  | 'in_review'         // En cours de révision
  | 'approved'          // Approuvé
  | 'rejected'          // Rejeté
  | 'needs_complement'  // Nécessite des compléments
  | 'escalated'         // Escaladé vers un niveau supérieur
  | 'archived';         // Archivé

export type ValidationLevel = 
  | 'bureau'      // Validation au niveau du bureau opérationnel
  | 'bmo'         // Validation au niveau du BMO (centre de pilotage)
  | 'dg'          // Validation au niveau du Directeur Général
  | 'ca';         // Validation au niveau du Conseil d'Administration

export interface ValidationCriteria {
  id: string;
  label: string;
  type: 'required' | 'optional' | 'warning';
  context: ValidationContext[];
  description: string;
  automatedCheck?: boolean; // Vérification automatique possible
}

export interface ValidationChecklist {
  criteria: ValidationCriteria[];
  mandatoryItems: string[];  // IDs des critères obligatoires
  warnings: string[];         // IDs des critères avec avertissement
  automatedResults?: Record<string, { passed: boolean; reason?: string }>;
}

export interface ValidationDecision {
  id: string;
  context: ValidationContext;
  itemId: string;  // ID du BC/Facture/Avenant
  decision: 'approve' | 'reject' | 'request_complement' | 'escalate';
  level: ValidationLevel;
  decidedBy: string;
  decidedAt: string;
  reason: string;
  conditions?: string[];  // Conditions attachées à l'approbation
  hash: string;           // Hash SHA3-256 pour traçabilité
  requiresConfirmation?: boolean; // Nécessite confirmation d'un niveau supérieur
}

export interface ValidationWorkflow {
  id: string;
  context: ValidationContext;
  steps: ValidationWorkflowStep[];
  currentStep: number;
  status: ValidationStatus;
}

export interface ValidationWorkflowStep {
  id: string;
  order: number;
  level: ValidationLevel;
  responsible: string;  // Bureau ou rôle responsable
  status: 'pending' | 'completed' | 'rejected' | 'skipped';
  completedAt?: string;
  completedBy?: string;
  comments?: string;
  required?: boolean;   // Étape obligatoire ou non
}

// ============================================
// Logique métier spécifique par type
// ============================================

// --- BC (Bons de Commande) ---
export interface BCValidationContext {
  // Origine : Bureau Achat et Approvisionnement
  originBureau: 'BA';  // Bureau Achat
  workflow: 'procurement';  // Workflow d'achat
  
  // Pourquoi le BC arrive au BMO ?
  escalationReasons: BCEscalationReason[];
  
  // Ce que le BMO doit vérifier
  bmoChecks: BMOCheck[];
  
  // Ce que le BMO attend
  expectedOutcomes: BMOExpectedOutcome[];
  
  // Décision du BMO
  bmoDecision?: BMOBCDecision;
}

export type BCEscalationReason = 
  | 'montant_eleve'              // Montant supérieur au seuil du bureau
  | 'depassement_budget'         // Dépassement budgétaire projet
  | 'decision_strategique'       // Décision stratégique requise
  | 'conflit_autre_achat'        // Conflit avec un autre achat
  | 'fournisseur_non_habituel'   // Fournisseur non référencé
  | 'urgence_non_justifiee'      // Urgence non justifiée
  | 'complement_requis';         // Compléments requis par le bureau

export interface BMOCheck {
  id: string;
  type: 'budget' | 'conformity' | 'strategy' | 'risk' | 'traceability';
  label: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  details?: string;
  automated?: boolean;
}

export interface BMOExpectedOutcome {
  type: 'approval' | 'rejection' | 'modification' | 'escalation' | 'complement';
  description: string;
  conditions?: string[];
}

export interface BMOBCDecision {
  decision: 'approve' | 'reject' | 'modify' | 'escalate' | 'request_complement';
  reason: string;
  conditions?: string[];  // Conditions d'approbation
  budgetImpact?: {
    projetId: string;
    montant: number;
    budgetRestant: number;
    pourcentageUtilise: number;
  };
  riskAssessment?: {
    niveau: 'low' | 'medium' | 'high' | 'critical';
    raisons: string[];
  };
  escaladeVers?: 'DG' | 'CA';
  complementRequis?: {
    type: string;
    description: string;
    deadline?: string;
  };
}

// --- Factures ---
export interface FactureValidationContext {
  // Origine : Bureau Finance
  originBureau: 'BF';  // Bureau Finance
  workflow: 'payment';  // Workflow de paiement
  
  // Pourquoi la facture arrive au BMO ?
  escalationReasons: FactureEscalationReason[];
  
  // Ce que le BMO doit vérifier
  bmoChecks: BMOCheck[];
  
  // Ce que le BMO attend
  expectedOutcomes: BMOExpectedOutcome[];
  
  // Décision du BMO
  bmoDecision?: BMOFactureDecision;
}

export type FactureEscalationReason =
  | 'montant_eleve'              // Montant supérieur au seuil
  | 'facture_non_conforme'       // Facture non conforme (manque pièces)
  | 'litige_fournisseur'         // Litige avec le fournisseur
  | 'depassement_budget'         // Dépassement budgétaire
  | 'echeance_imminente'         // Échéance imminente (risque pénalités)
  | 'fournisseur_suspect'        // Fournisseur avec historique suspect
  | 'discrepance_montant'        // Discrepance entre BC et facture
  | 'complement_requis';         // Compléments requis

export interface BMOFactureDecision {
  decision: 'approve' | 'reject' | 'contest' | 'escalate' | 'request_complement';
  reason: string;
  paymentConditions?: {
    dateLimite?: string;
    conditions?: string[];
  };
  contestation?: {
    motif: string;
    montantDispute?: number;
    piecesJustificatives?: string[];
  };
  escaladeVers?: 'DG' | 'CA';
  complementRequis?: {
    type: string;
    description: string;
    deadline?: string;
  };
}

// --- Avenants ---
export interface AvenantValidationContext {
  // Origine : Bureau Juridique
  originBureau: 'BJ';  // Bureau Juridique
  workflow: 'contract_modification';  // Workflow de modification contractuelle
  
  // Pourquoi l'avenant arrive au BMO ?
  escalationReasons: AvenantEscalationReason[];
  
  // Ce que le BMO doit vérifier
  bmoChecks: BMOCheck[];
  
  // Ce que le BMO attend
  expectedOutcomes: BMOExpectedOutcome[];
  
  // Décision du BMO
  bmoDecision?: BMOAvenantDecision;
}

export type AvenantEscalationReason =
  | 'impact_financier_eleve'     // Impact financier significatif
  | 'impact_delai'               // Impact sur les délais
  | 'impact_technique'           // Impact technique majeur
  | 'decision_strategique'       // Décision stratégique requise
  | 'litige_contractuel'         // Litige contractuel
  | 'depassement_budget'         // Dépassement budgétaire
  | 'modification_majeure'       // Modification majeure du contrat
  | 'complement_requis';         // Compléments requis

export interface BMOAvenantDecision {
  decision: 'approve' | 'reject' | 'modify' | 'escalate' | 'request_complement';
  reason: string;
  impactAssessment?: {
    financier: {
      montant: number;
      impact: 'positive' | 'negative' | 'neutral';
      justification?: string;
    };
    delai: {
      jours: number;
      impact: 'avance' | 'retard' | 'neutre';
      justification?: string;
    };
    technique: {
      description: string;
      impact: 'majeur' | 'moyen' | 'mineur';
    };
  };
  conditions?: string[];
  escaladeVers?: 'DG' | 'CA';
  complementRequis?: {
    type: string;
    description: string;
    deadline?: string;
  };
}

// ============================================
// Règles de pilotage et contrôle
// ============================================

export interface PilotageRule {
  id: string;
  context: ValidationContext[];
  name: string;
  description: string;
  condition: string;  // Condition d'application
  action: 'auto_approve' | 'auto_reject' | 'alert' | 'escalate' | 'request_complement';
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
}

export interface ControlParameter {
  id: string;
  context: ValidationContext;
  name: string;
  value: number | string | boolean;
  unit?: string;
  description: string;
  editable: boolean;
}

// Exemple de paramètres de contrôle
export const defaultControlParameters: ControlParameter[] = [
  // BC
  {
    id: 'bc_montant_seuil_bmo',
    context: 'bc',
    name: 'Seuil de montant pour validation BMO',
    value: 5000000,
    unit: 'FCFA',
    description: 'BC avec montant supérieur nécessitent validation BMO',
    editable: true,
  },
  {
    id: 'bc_montant_seuil_dg',
    context: 'bc',
    name: 'Seuil de montant pour validation DG',
    value: 20000000,
    unit: 'FCFA',
    description: 'BC avec montant supérieur nécessitent validation DG',
    editable: true,
  },
  // Factures
  {
    id: 'facture_delai_alerte',
    context: 'facture',
    name: 'Délai d\'alerte avant échéance',
    value: 7,
    unit: 'jours',
    description: 'Nombre de jours avant échéance pour alerter',
    editable: true,
  },
  {
    id: 'facture_montant_seuil_bmo',
    context: 'facture',
    name: 'Seuil de montant pour validation BMO',
    value: 3000000,
    unit: 'FCFA',
    description: 'Factures avec montant supérieur nécessitent validation BMO',
    editable: true,
  },
  // Avenants
  {
    id: 'avenant_impact_financier_seuil',
    context: 'avenant',
    name: 'Seuil d\'impact financier pour validation BMO',
    value: 5000000,
    unit: 'FCFA',
    description: 'Avenants avec impact financier supérieur nécessitent validation BMO',
    editable: true,
  },
];

