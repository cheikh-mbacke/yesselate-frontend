/**
 * =========================
 * WorkInbox - Modèle unifié
 * =========================
 */

export type WorkKind =
  | 'bc'
  | 'facture'
  | 'avenant'
  | 'contrat'
  | 'paiement'
  | 'litige'
  | 'blocage';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type WorkActionType =
  | 'validate'
  | 'sign'
  | 'pay'
  | 'substitute'
  | 'send_to_bj'
  | 'arbitrage'
  | 'open_decision'
  | 'open_module'
  | 'resolve'
  | 'snooze'
  | 'assign'
  | 'escalate';

export type WorkAction = {
  type: WorkActionType;
  label: string;
  // lien optionnel (page module, décision, détail)
  href?: string;
  // pour audit / UI
  requiresReason?: boolean;
};

export type WorkItem = {
  uid: string; // unique key stable: `${kind}:${id}`
  id: string;
  kind: WorkKind;

  title: string;
  project?: string;
  partner?: string;

  bureauOwner?: string;   // bureau responsable
  bureauBlockedBy?: string; // bureau bloquant (si applicable)

  amountImpactFCFA?: number;
  daysToDue?: number; // J-x (négatif = en retard)

  risk: RiskLevel;
  evidence: string[];
  recommendedActions: WorkAction[];

  links?: Array<{ label: string; href: string }>;

  priorityScore: number;
  createdAtISO: string;
};

export type WorkInboxFilter = 
  | 'all'
  | 'blocages-5j'
  | 'retards-paiements'
  | 'paiements-urgents'
  | 'contrats-signer'
  | 'bc-validation'
  | 'factures-validation'
  | 'high-risk'
  | 'critical';

export type SnoozeDuration = '1j' | '3j' | '7j';

export interface SnoozedItem {
  itemId: string;
  snoozedUntil: string; // ISO string
  reason?: string;
  duration: SnoozeDuration;
}

export interface AssignedItem {
  itemId: string;
  assignedTo: string; // employee ID
  assignedAt: string; // ISO string
  assignedBy: string; // user ID
}

export interface ResolvedItem {
  itemId: string;
  resolvedAt: string; // ISO string
  resolvedBy: string; // user ID
  resolution: string;
}
