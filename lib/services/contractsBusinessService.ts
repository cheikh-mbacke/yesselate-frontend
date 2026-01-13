// Service métier pour la gestion des contrats
// Règles de validation, calculs de risque, workflow 2-man rule

import type { Contract } from '@/lib/types/bmo.types';

// ================================
// Types
// ================================
export interface ContractWithRisk extends Contract {
  riskScore: number;
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
  daysToExpiry: number | null;
  amountValue: number;
  workflowState: 'PENDING_BJ' | 'PENDING_BMO' | 'SIGNED' | 'REJECTED' | 'ARCHIVED';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
  requiredActions: string[];
}

export interface RiskAnalysis {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: string[];
  recommendations: string[];
}

export interface WorkflowCheck {
  canBJApprove: boolean;
  canBMOSign: boolean;
  missingSteps: string[];
  nextAction: string | null;
}

export interface ConflictCheck {
  hasConflicts: boolean;
  conflicts: Array<{
    type: 'DATE_OVERLAP' | 'PARTNER_DUPLICATE' | 'AMOUNT_THRESHOLD';
    message: string;
    conflictingContractId: string;
  }>;
}

// ================================
// Helpers
// ================================
function parseMoney(v: unknown): number {
  if (typeof v === 'number') return v;
  const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
  return Number(raw.replace(/,/g, '')) || 0;
}

function parseFRDate(d?: string | null): Date | null {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
}

function getDaysToExpiry(expiryStr: string): number | null {
  const expiryDate = parseFRDate(expiryStr);
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ================================
// Calcul du risque
// ================================
export function calculateRiskScore(contract: Contract): RiskAnalysis {
  let score = 0;
  const signals: string[] = [];
  const recommendations: string[] = [];

  const amountValue = parseMoney((contract as any).amount);
  const daysToExpiry = (contract as any).expiry ? getDaysToExpiry((contract as any).expiry) : null;

  // Risque temporel (échéance)
  if (daysToExpiry !== null) {
    if (daysToExpiry < 0) {
      score += 35;
      signals.push('⚠️ Contrat expiré');
      recommendations.push('Action immédiate requise : renouvellement ou archivage');
    } else if (daysToExpiry <= 3) {
      score += 25;
      signals.push('🔥 Échéance dans ≤ 3 jours');
      recommendations.push('Validation urgente avant expiration');
    } else if (daysToExpiry <= 7) {
      score += 15;
      signals.push('⚡ Échéance dans ≤ 7 jours');
      recommendations.push('Prioriser la validation');
    } else if (daysToExpiry <= 14) {
      score += 8;
      signals.push('⏰ Échéance dans ≤ 14 jours');
      recommendations.push('Planifier la validation');
    }
  } else {
    score += 5;
    signals.push('❓ Date d\'échéance manquante');
    recommendations.push('Compléter la date d\'échéance');
  }

  // Risque financier (montant)
  if (amountValue >= 100_000_000) {
    score += 25;
    signals.push('💰 Montant très élevé (≥ 100M)');
    recommendations.push('Validation multi-niveaux recommandée');
  } else if (amountValue >= 50_000_000) {
    score += 22;
    signals.push('💸 Montant élevé (≥ 50M)');
    recommendations.push('Vérification approfondie des clauses');
  } else if (amountValue >= 10_000_000) {
    score += 14;
    signals.push('💵 Montant significatif (≥ 10M)');
    recommendations.push('Contrôle budgétaire nécessaire');
  }

  // Risque workflow (statut)
  if (contract.status === 'pending') {
    score += 18;
    signals.push('⏳ En attente de validation');
  } else if (contract.status === 'rejected') {
    score += 30;
    signals.push('❌ Contrat rejeté précédemment');
    recommendations.push('Analyser les raisons du rejet');
  }

  // Risque qualité (données manquantes)
  if (!contract.subject?.trim()) {
    score += 10;
    signals.push('📝 Objet manquant');
    recommendations.push('Compléter l\'objet du contrat');
  }
  if (!(contract as any).partner?.trim()) {
    score += 10;
    signals.push('🤝 Partenaire manquant');
    recommendations.push('Identifier le partenaire contractuel');
  }
  if (!(contract as any).bureau?.trim()) {
    score += 5;
    signals.push('🏢 Bureau non spécifié');
    recommendations.push('Attribuer le contrat à un bureau');
  }

  // Risque type de contrat
  const type = (contract as any).type;
  if (type === 'Avenant') {
    score += 8;
    signals.push('📄 Avenant (modification de contrat existant)');
    recommendations.push('Vérifier la cohérence avec le contrat principal');
  } else if (type === 'Sous-traitance') {
    score += 12;
    signals.push('🔗 Sous-traitance (tiers impliqué)');
    recommendations.push('Valider les qualifications du sous-traitant');
  }

  // Niveau de risque final
  score = Math.min(100, score);
  let level: RiskAnalysis['level'];
  if (score >= 70) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 30) level = 'MEDIUM';
  else level = 'LOW';

  return {
    score,
    level,
    signals,
    recommendations,
  };
}

// ================================
// Validation métier
// ================================
export function validateContract(contract: Contract): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requiredActions: string[] = [];

  // Validation champs obligatoires
  if (!contract.subject?.trim()) {
    errors.push('L\'objet du contrat est obligatoire');
  }
  if (!(contract as any).partner?.trim()) {
    errors.push('Le partenaire contractuel est obligatoire');
  }
  if (!(contract as any).type?.trim()) {
    errors.push('Le type de contrat est obligatoire');
  }

  // Validation montant
  const amount = parseMoney((contract as any).amount);
  if (amount <= 0) {
    errors.push('Le montant doit être supérieur à zéro');
  }
  if (amount >= 100_000_000) {
    warnings.push('Montant très élevé : validation supplémentaire recommandée');
    requiredActions.push('Obtenir l\'approbation du comité de direction');
  }

  // Validation dates
  const expiry = (contract as any).expiry ? parseFRDate((contract as any).expiry) : null;
  if (!expiry) {
    warnings.push('Date d\'échéance manquante');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) {
      errors.push('La date d\'échéance est déjà dépassée');
    } else {
      const daysToExpiry = getDaysToExpiry((contract as any).expiry);
      if (daysToExpiry !== null && daysToExpiry <= 3) {
        warnings.push(`Échéance imminente : ${daysToExpiry} jour(s) restant(s)`);
        requiredActions.push('Traitement en urgence requis');
      }
    }
  }

  // Validation bureau
  if (!(contract as any).bureau?.trim()) {
    warnings.push('Le bureau de gestion n\'est pas spécifié');
  }

  // Validation type
  const validTypes = ['Marché', 'Avenant', 'Sous-traitance'];
  if ((contract as any).type && !validTypes.includes((contract as any).type)) {
    warnings.push(`Type de contrat non standard: ${(contract as any).type}`);
  }

  // Calcul du risque pour recommandations supplémentaires
  const riskAnalysis = calculateRiskScore(contract);
  if (riskAnalysis.level === 'CRITICAL' || riskAnalysis.level === 'HIGH') {
    requiredActions.push('Analyse de risque approfondie requise');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    canProceed: errors.length === 0,
    requiredActions,
  };
}

// ================================
// Workflow 2-man rule
// ================================
export function checkWorkflowState(
  contract: Contract,
  currentUserRole: 'BJ' | 'BMO' | 'OTHER'
): WorkflowCheck {
  const workflowState = (contract as any).workflowState || 'PENDING_BJ';
  const missingSteps: string[] = [];
  let canBJApprove = false;
  let canBMOSign = false;
  let nextAction: string | null = null;

  switch (workflowState) {
    case 'PENDING_BJ':
      canBJApprove = currentUserRole === 'BJ';
      nextAction = 'Validation par le Bureau Juridique (BJ)';
      if (!canBJApprove) {
        missingSteps.push('Attente validation BJ');
      }
      break;

    case 'PENDING_BMO':
      // Vérifier que la validation BJ existe
      const hasBJApproval = !!(contract as any).bjApproval;
      if (!hasBJApproval) {
        missingSteps.push('Validation BJ manquante (2-man rule)');
      } else {
        canBMOSign = currentUserRole === 'BMO';
        nextAction = 'Signature par la Direction (BMO)';
        if (!canBMOSign) {
          missingSteps.push('Attente signature BMO');
        }
      }
      break;

    case 'SIGNED':
      nextAction = 'Contrat signé - aucune action requise';
      break;

    case 'REJECTED':
      nextAction = 'Contrat rejeté - révision nécessaire';
      missingSteps.push('Contrat rejeté - nécessite révision');
      break;

    case 'ARCHIVED':
      nextAction = 'Contrat archivé';
      break;

    default:
      missingSteps.push('État de workflow inconnu');
  }

  return {
    canBJApprove,
    canBMOSign,
    missingSteps,
    nextAction,
  };
}

// ================================
// Détection de conflits
// ================================
export function checkConflicts(
  contract: Contract,
  allContracts: Contract[]
): ConflictCheck {
  const conflicts: ConflictCheck['conflicts'] = [];

  const currentPartner = (contract as any).partner?.trim().toLowerCase();
  const currentAmount = parseMoney((contract as any).amount);
  const currentExpiry = (contract as any).expiry ? parseFRDate((contract as any).expiry) : null;

  // Vérifier les duplicatas de partenaire avec montants similaires
  allContracts.forEach((other) => {
    if (other.id === contract.id) return;

    const otherPartner = (other as any).partner?.trim().toLowerCase();
    const otherAmount = parseMoney((other as any).amount);
    const otherExpiry = (other as any).expiry ? parseFRDate((other as any).expiry) : null;

    // Conflit: même partenaire + montant similaire (± 10%)
    if (
      currentPartner &&
      otherPartner &&
      currentPartner === otherPartner &&
      Math.abs(currentAmount - otherAmount) / currentAmount < 0.1
    ) {
      conflicts.push({
        type: 'PARTNER_DUPLICATE',
        message: `Contrat similaire avec ${(other as any).partner} détecté (montant proche)`,
        conflictingContractId: other.id,
      });
    }

    // Conflit: chevauchement de dates pour même partenaire
    if (
      currentPartner &&
      otherPartner &&
      currentPartner === otherPartner &&
      currentExpiry &&
      otherExpiry
    ) {
      const today = new Date();
      // Si les deux contrats sont actifs (pas expirés)
      if (currentExpiry >= today && otherExpiry >= today) {
        conflicts.push({
          type: 'DATE_OVERLAP',
          message: `Chevauchement de période avec contrat ${other.id} pour le même partenaire`,
          conflictingContractId: other.id,
        });
      }
    }
  });

  // Vérifier les seuils de montant pour le bureau
  const currentBureau = (contract as any).bureau;
  const totalAmountForBureau = allContracts
    .filter((c) => (c as any).bureau === currentBureau && c.status !== 'rejected')
    .reduce((sum, c) => sum + parseMoney((c as any).amount), 0);

  // Seuil arbitraire : 500M par bureau
  if (totalAmountForBureau + currentAmount > 500_000_000) {
    conflicts.push({
      type: 'AMOUNT_THRESHOLD',
      message: `Seuil budgétaire dépassé pour ${currentBureau} (> 500M FCFA)`,
      conflictingContractId: contract.id,
    });
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

// ================================
// Génération du rapport de validation
// ================================
export interface ValidationReport {
  contractId: string;
  validation: ValidationResult;
  riskAnalysis: RiskAnalysis;
  workflowCheck: WorkflowCheck;
  conflictCheck: ConflictCheck;
  summary: {
    status: 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'REVIEW_REQUIRED' | 'REJECTED';
    message: string;
    criticalIssues: number;
    warnings: number;
  };
  generatedAt: string;
  generatedBy: string;
}

export function generateValidationReport(
  contract: Contract,
  allContracts: Contract[],
  currentUserRole: 'BJ' | 'BMO' | 'OTHER',
  userId: string
): ValidationReport {
  const validation = validateContract(contract);
  const riskAnalysis = calculateRiskScore(contract);
  const workflowCheck = checkWorkflowState(contract, currentUserRole);
  const conflictCheck = checkConflicts(contract, allContracts);

  const criticalIssues = validation.errors.length + conflictCheck.conflicts.length;
  const warnings = validation.warnings.length + riskAnalysis.signals.length;

  let status: ValidationReport['summary']['status'];
  let message: string;

  if (!validation.valid || conflictCheck.hasConflicts) {
    status = 'REJECTED';
    message = 'Validation refusée : erreurs critiques détectées';
  } else if (riskAnalysis.level === 'CRITICAL' || warnings > 5) {
    status = 'REVIEW_REQUIRED';
    message = 'Révision manuelle requise : risque élevé ou nombreuses alertes';
  } else if (warnings > 0 || riskAnalysis.level === 'HIGH') {
    status = 'APPROVED_WITH_CONDITIONS';
    message = 'Validation conditionnelle : suivi recommandé';
  } else {
    status = 'APPROVED';
    message = 'Validation approuvée';
  }

  return {
    contractId: contract.id,
    validation,
    riskAnalysis,
    workflowCheck,
    conflictCheck,
    summary: {
      status,
      message,
      criticalIssues,
      warnings,
    },
    generatedAt: new Date().toISOString(),
    generatedBy: userId,
  };
}

// ================================
// Helper - Enrichir contrat avec métadonnées
// ================================
export function enrichContract(contract: Contract): ContractWithRisk {
  const riskAnalysis = calculateRiskScore(contract);
  const amountValue = parseMoney((contract as any).amount);
  const daysToExpiry = (contract as any).expiry ? getDaysToExpiry((contract as any).expiry) : null;

  const priority: 'NOW' | 'WATCH' | 'OK' = 
    riskAnalysis.level === 'CRITICAL' ? 'NOW' :
    riskAnalysis.level === 'HIGH' ? 'WATCH' :
    'OK';

  const workflowState: ContractWithRisk['workflowState'] = 
    (contract as any).workflowState ||
    (contract.status === 'validated' ? 'SIGNED' :
     contract.status === 'rejected' ? 'REJECTED' :
     'PENDING_BJ');

  return {
    ...contract,
    riskScore: riskAnalysis.score,
    riskSignals: riskAnalysis.signals,
    priority,
    daysToExpiry,
    amountValue,
    workflowState,
  };
}

