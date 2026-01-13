/**
 * Service métier pour la gestion des demandes RH
 * Règles métier, validations, calculs
 */

import type { HRRequest } from '@/lib/types/bmo.types';

// ============================================
// TYPES
// ============================================

export type CongeBalance = {
  employeeId: string;
  employeeName: string;
  annuelTotal: number;
  annuelPris: number;
  annuelRestant: number;
  ancienneteTotal: number;
  anciennetePris: number;
  ancienneteRestant: number;
  maladeTotal: number;
  maladePris: number;
  maladeRestant: number;
  lastUpdated: string;
};

export type BusinessRule = {
  id: string;
  code: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
};

export type ValidationResult = {
  valid: boolean;
  rules: BusinessRule[];
  canApprove: boolean;
  requiresSubstitution: boolean;
  requiresManagerApproval: boolean;
  requiresDGApproval: boolean;
};

export type WorkingDaysResult = {
  totalDays: number;
  workingDays: number;
  weekendDays: number;
  publicHolidays: string[];
};

export type ConflictCheck = {
  hasConflict: boolean;
  conflicts: {
    type: 'same_employee' | 'same_team' | 'same_skill' | 'bureau_understaffed';
    severity: 'critical' | 'high' | 'medium';
    message: string;
    affectedPeriod: { start: string; end: string };
    affectedEmployees?: string[];
  }[];
};

// ============================================
// CONSTANTES MÉTIER
// ============================================

const JOURS_FERIES_SENEGAL_2026 = [
  '2026-01-01', // Jour de l'an
  '2026-04-04', // Fête nationale
  '2026-04-05', // Pâques
  '2026-04-06', // Lundi de Pâques
  '2026-05-01', // Fête du travail
  '2026-05-25', // Ascension
  '2026-06-05', // Pentecôte
  '2026-07-17', // Tabaski (estimé)
  '2026-08-15', // Assomption
  '2026-09-25', // Maouloud (estimé)
  '2026-11-01', // Toussaint
  '2026-12-25', // Noël
];

const CONGES_LEGAUX = {
  annuel: 24, // 2 jours par mois
  anciennete: 2, // 1 jour tous les 5 ans
  maternite: 98, // 14 semaines
  paternite: 3,
  maladie: 180, // 6 mois max par an
};

const DELAIS_VALIDATION = {
  conge: 15, // Demande de congé : 15 jours avant
  mission: 7, // Mission : 7 jours avant
  depense: 3, // Dépense : 3 jours
};

const SEUILS_VALIDATION = {
  depense_simple: 100000, // < 100k : chef service
  depense_importante: 500000, // 100k-500k : directeur
  depense_critique: 1000000, // > 500k : DG
  conge_long: 10, // > 10 jours : validation DG
};

// ============================================
// SOLDES DE CONGÉS (Mock - à remplacer par API)
// ============================================

const SOLDES_CONGES: Record<string, CongeBalance> = {
  'EMP-007': {
    employeeId: 'EMP-007',
    employeeName: 'Cheikh GUEYE',
    annuelTotal: 24,
    annuelPris: 14,
    annuelRestant: 10,
    ancienneteTotal: 2,
    anciennetePris: 0,
    ancienneteRestant: 2,
    maladeTotal: 180,
    maladePris: 5,
    maladeRestant: 175,
    lastUpdated: '2026-01-01',
  },
  'EMP-009': {
    employeeId: 'EMP-009',
    employeeName: 'Modou DIOP',
    annuelTotal: 24,
    annuelPris: 12,
    annuelRestant: 12,
    ancienneteTotal: 0,
    anciennetePris: 0,
    ancienneteRestant: 0,
    maladeTotal: 180,
    maladePris: 0,
    maladeRestant: 180,
    lastUpdated: '2026-01-01',
  },
  'EMP-012': {
    employeeId: 'EMP-012',
    employeeName: 'Coumba FALL',
    annuelTotal: 24,
    annuelPris: 0,
    annuelRestant: 24,
    ancienneteTotal: 0,
    anciennetePris: 0,
    ancienneteRestant: 0,
    maladeTotal: 180,
    maladePris: 0,
    maladeRestant: 180,
    lastUpdated: '2026-01-01',
  },
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Parse une date au format DD/MM/YYYY
 */
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formate une date en DD/MM/YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Vérifie si une date est un jour férié
 */
function isPublicHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return JOURS_FERIES_SENEGAL_2026.includes(dateStr);
}

/**
 * Vérifie si une date est un weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Dimanche ou Samedi
}

// ============================================
// FONCTIONS MÉTIER
// ============================================

/**
 * Calcule le nombre de jours ouvrables entre deux dates
 */
export function calculateWorkingDays(startDate: string, endDate: string): WorkingDaysResult {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  let totalDays = 0;
  let workingDays = 0;
  let weekendDays = 0;
  const publicHolidays: string[] = [];
  
  const current = new Date(start);
  
  while (current <= end) {
    totalDays++;
    
    if (isWeekend(current)) {
      weekendDays++;
    } else if (isPublicHoliday(current)) {
      publicHolidays.push(formatDate(current));
    } else {
      workingDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return {
    totalDays,
    workingDays,
    weekendDays,
    publicHolidays,
  };
}

/**
 * Récupère le solde de congés d'un employé
 */
export function getCongeBalance(employeeId: string): CongeBalance | null {
  return SOLDES_CONGES[employeeId] || null;
}

/**
 * Valide une demande de congé selon les règles métier
 */
export function validateCongeDemand(demand: HRRequest): ValidationResult {
  const rules: BusinessRule[] = [];
  let canApprove = true;
  let requiresSubstitution = false;
  let requiresManagerApproval = true;
  let requiresDGApproval = false;
  
  // 1. Vérifier le solde
  if (demand.agentId) {
    const balance = getCongeBalance(demand.agentId);
    
    if (balance) {
      const daysRequested = demand.days || 0;
      
      if (demand.subtype === 'Annuel') {
        if (daysRequested > balance.annuelRestant) {
          rules.push({
            id: 'CONGE_001',
            code: 'SOLDE_INSUFFISANT',
            type: 'error',
            message: `Solde insuffisant: ${balance.annuelRestant} jours disponibles, ${daysRequested} demandés`,
            details: `Solde annuel: ${balance.annuelRestant}/${balance.annuelTotal} jours`,
          });
          canApprove = false;
        } else if (daysRequested === balance.annuelRestant) {
          rules.push({
            id: 'CONGE_002',
            code: 'SOLDE_EPUISE',
            type: 'warning',
            message: 'Cette demande épuisera le solde de congés annuels',
            details: 'Recommandation: prévoir un étalement',
          });
        }
      }
    } else {
      rules.push({
        id: 'CONGE_003',
        code: 'SOLDE_INCONNU',
        type: 'warning',
        message: 'Solde de congés non disponible',
        details: 'Vérification manuelle requise',
      });
    }
  }
  
  // 2. Vérifier le délai de prévenance
  if (demand.startDate) {
    const start = parseDate(demand.startDate);
    const now = new Date();
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart < DELAIS_VALIDATION.conge) {
      rules.push({
        id: 'CONGE_004',
        code: 'DELAI_COURT',
        type: 'warning',
        message: `Délai de prévenance court: ${daysUntilStart} jours (minimum recommandé: ${DELAIS_VALIDATION.conge} jours)`,
        details: 'Validation urgente recommandée',
      });
    }
  }
  
  // 3. Vérifier la durée
  const days = demand.days || 0;
  if (days > SEUILS_VALIDATION.conge_long) {
    requiresDGApproval = true;
    rules.push({
      id: 'CONGE_005',
      code: 'CONGE_LONG',
      type: 'info',
      message: `Congé long (${days} jours) - Validation Directeur Général requise`,
    });
  }
  
  // 4. Vérifier si substitution nécessaire
  if (days >= 7) {
    requiresSubstitution = true;
    rules.push({
      id: 'CONGE_006',
      code: 'SUBSTITUTION_REQUISE',
      type: 'info',
      message: 'Substitution requise pour absence > 7 jours',
      details: 'Désigner un remplaçant avant validation',
    });
  }
  
  // 5. Congé maternité : règles spéciales
  if (demand.subtype === 'Maternité') {
    requiresDGApproval = true;
    requiresSubstitution = true;
    rules.push({
      id: 'CONGE_007',
      code: 'CONGE_MATERNITE',
      type: 'info',
      message: 'Congé maternité: 98 jours légaux (14 semaines)',
      details: 'Substitution longue durée à prévoir + validation DG requise',
    });
  }
  
  return {
    valid: canApprove,
    rules,
    canApprove,
    requiresSubstitution,
    requiresManagerApproval,
    requiresDGApproval,
  };
}

/**
 * Valide une demande de dépense selon les règles métier
 */
export function validateDepenseDemand(demand: HRRequest): ValidationResult {
  const rules: BusinessRule[] = [];
  let canApprove = true;
  let requiresManagerApproval = true;
  let requiresDGApproval = false;
  
  // Montant
  const amount = typeof demand.amount === 'string' 
    ? parseFloat(demand.amount.replace(/,/g, '')) 
    : 0;
  
  // 1. Vérifier les seuils de validation
  if (amount > SEUILS_VALIDATION.depense_critique) {
    requiresDGApproval = true;
    rules.push({
      id: 'DEPENSE_001',
      code: 'MONTANT_CRITIQUE',
      type: 'warning',
      message: `Montant élevé (${amount.toLocaleString()} FCFA) - Validation DG requise`,
    });
  } else if (amount > SEUILS_VALIDATION.depense_importante) {
    rules.push({
      id: 'DEPENSE_002',
      code: 'MONTANT_IMPORTANT',
      type: 'info',
      message: `Montant important (${amount.toLocaleString()} FCFA) - Validation Directeur requise`,
    });
  }
  
  // 2. Vérifier les justificatifs
  const hasFacture = demand.documents?.some(d => d.type === 'facture');
  const hasOrdreMission = demand.documents?.some(d => d.type === 'ordre_mission');
  
  if (demand.subtype === 'Mission' && !hasOrdreMission) {
    rules.push({
      id: 'DEPENSE_003',
      code: 'ORDRE_MISSION_MANQUANT',
      type: 'error',
      message: 'Ordre de mission manquant',
      details: 'Document obligatoire pour les frais de mission',
    });
    canApprove = false;
  }
  
  if (amount > 50000 && !hasFacture) {
    rules.push({
      id: 'DEPENSE_004',
      code: 'FACTURE_MANQUANTE',
      type: 'warning',
      message: 'Facture recommandée pour montants > 50,000 FCFA',
    });
  }
  
  // 3. Vérifier le délai
  if (demand.date) {
    const demandDate = parseDate(demand.date);
    const now = new Date();
    const daysOld = Math.ceil((now.getTime() - demandDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOld > 30) {
      rules.push({
        id: 'DEPENSE_005',
        code: 'DEMANDE_ANCIENNE',
        type: 'warning',
        message: `Demande ancienne (${daysOld} jours) - Vérifier la validité`,
      });
    }
  }
  
  return {
    valid: canApprove,
    rules,
    canApprove,
    requiresSubstitution: false,
    requiresManagerApproval,
    requiresDGApproval,
  };
}

/**
 * Valide une demande de déplacement
 */
export function validateDeplacementDemand(demand: HRRequest): ValidationResult {
  const rules: BusinessRule[] = [];
  let canApprove = true;
  let requiresSubstitution = false;
  
  // 1. Vérifier l'ordre de mission
  const hasOrdreMission = demand.documents?.some(d => d.type === 'ordre_mission');
  
  if (!hasOrdreMission) {
    rules.push({
      id: 'DEPLACEMENT_001',
      code: 'ORDRE_MISSION_REQUIS',
      type: 'error',
      message: 'Ordre de mission obligatoire',
      details: 'Document administratif obligatoire pour tout déplacement',
    });
    canApprove = false;
  }
  
  // 2. Vérifier le délai de prévenance
  if (demand.startDate) {
    const start = parseDate(demand.startDate);
    const now = new Date();
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart < DELAIS_VALIDATION.mission) {
      rules.push({
        id: 'DEPLACEMENT_002',
        code: 'DELAI_COURT',
        type: 'warning',
        message: `Délai court: ${daysUntilStart} jours (recommandé: ${DELAIS_VALIDATION.mission} jours)`,
      });
    }
  }
  
  // 3. Durée longue = substitution
  const days = demand.days || 0;
  if (days >= 5) {
    requiresSubstitution = true;
    rules.push({
      id: 'DEPLACEMENT_003',
      code: 'SUBSTITUTION_REQUISE',
      type: 'info',
      message: 'Mission longue (≥5 jours) - Substitution recommandée',
    });
  }
  
  return {
    valid: canApprove,
    rules,
    canApprove,
    requiresSubstitution,
    requiresManagerApproval: true,
    requiresDGApproval: days > 10,
  };
}

/**
 * Valide une demande selon son type
 */
export function validateDemand(demand: HRRequest): ValidationResult {
  switch (demand.type) {
    case 'Congé':
    case 'Maladie':
      return validateCongeDemand(demand);
    
    case 'Dépense':
      return validateDepenseDemand(demand);
    
    case 'Déplacement':
      return validateDeplacementDemand(demand);
    
    case 'Paie':
      // Validation simple pour avances sur salaire
      return {
        valid: true,
        rules: [{
          id: 'PAIE_001',
          code: 'AVANCE_SALAIRE',
          type: 'info',
          message: 'Avance sur salaire - Validation RH requise',
        }],
        canApprove: true,
        requiresSubstitution: false,
        requiresManagerApproval: true,
        requiresDGApproval: false,
      };
    
    default:
      return {
        valid: true,
        rules: [],
        canApprove: true,
        requiresSubstitution: false,
        requiresManagerApproval: true,
        requiresDGApproval: false,
      };
  }
}

/**
 * Vérifie les conflits potentiels avec d'autres demandes
 */
export function checkConflicts(demand: HRRequest, allDemands: HRRequest[]): ConflictCheck {
  const conflicts: ConflictCheck['conflicts'] = [];
  
  if (!demand.startDate || !demand.endDate) {
    return { hasConflict: false, conflicts: [] };
  }
  
  const start = parseDate(demand.startDate);
  const end = parseDate(demand.endDate);
  
  // Vérifier les chevauchements avec les demandes validées du même employé
  const sameEmployeeConflicts = allDemands.filter(d => 
    d.agentId === demand.agentId &&
    d.id !== demand.id &&
    d.status === 'validated' &&
    d.startDate &&
    d.endDate
  );
  
  sameEmployeeConflicts.forEach(other => {
    const otherStart = parseDate(other.startDate!);
    const otherEnd = parseDate(other.endDate!);
    
    if ((start <= otherEnd && end >= otherStart)) {
      conflicts.push({
        type: 'same_employee',
        severity: 'critical',
        message: `Chevauchement avec ${other.type} du ${other.startDate} au ${other.endDate}`,
        affectedPeriod: { start: demand.startDate!, end: demand.endDate! },
      });
    }
  });
  
  // Vérifier le taux d'absence dans le bureau
  const sameBureauAbsences = allDemands.filter(d =>
    d.bureau === demand.bureau &&
    d.id !== demand.id &&
    d.status === 'validated' &&
    d.startDate &&
    d.endDate &&
    (demand.type === 'Congé' || demand.type === 'Maladie' || demand.type === 'Déplacement')
  );
  
  let overlappingCount = 0;
  const overlappingEmployees: string[] = [];
  
  sameBureauAbsences.forEach(other => {
    const otherStart = parseDate(other.startDate!);
    const otherEnd = parseDate(other.endDate!);
    
    if ((start <= otherEnd && end >= otherStart)) {
      overlappingCount++;
      overlappingEmployees.push(other.agent);
    }
  });
  
  if (overlappingCount >= 2) {
    conflicts.push({
      type: 'bureau_understaffed',
      severity: overlappingCount >= 3 ? 'critical' : 'high',
      message: `${overlappingCount} autres absences prévues dans le bureau ${demand.bureau}`,
      affectedPeriod: { start: demand.startDate!, end: demand.endDate! },
      affectedEmployees: overlappingEmployees,
    });
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Suggère des remplaçants pour une substitution
 */
export function suggestSubstitutes(demand: HRRequest, allDemands: HRRequest[]): Array<{
  employeeId: string;
  employeeName: string;
  bureau: string;
  score: number;
  reason: string;
  available: boolean;
}> {
  // Simulation - en production, croiser avec la base RH
  const candidates = [
    { employeeId: 'EMP-020', employeeName: 'Fatou SARR', bureau: demand.bureau, score: 95, reason: 'Même bureau, compétences similaires', available: true },
    { employeeId: 'EMP-021', employeeName: 'Moussa DIENG', bureau: demand.bureau, score: 85, reason: 'Même bureau, expérience confirmée', available: true },
    { employeeId: 'EMP-022', employeeName: 'Awa NDIAYE', bureau: 'BA', score: 70, reason: 'Bureau adjacent, polyvalente', available: true },
  ];
  
  return candidates;
}

/**
 * Génère un rapport de validation pour une demande
 */
export function generateValidationReport(demand: HRRequest, allDemands: HRRequest[]): {
  validation: ValidationResult;
  conflicts: ConflictCheck;
  workingDays?: WorkingDaysResult;
  balance?: CongeBalance | null;
  substitutes?: ReturnType<typeof suggestSubstitutes>;
} {
  const validation = validateDemand(demand);
  const conflicts = checkConflicts(demand, allDemands);
  
  const report: ReturnType<typeof generateValidationReport> = {
    validation,
    conflicts,
  };
  
  if (demand.startDate && demand.endDate && (demand.type === 'Congé' || demand.type === 'Maladie')) {
    report.workingDays = calculateWorkingDays(demand.startDate, demand.endDate);
  }
  
  if (demand.agentId && (demand.type === 'Congé' || demand.type === 'Maladie')) {
    report.balance = getCongeBalance(demand.agentId);
  }
  
  if (validation.requiresSubstitution) {
    report.substitutes = suggestSubstitutes(demand, allDemands);
  }
  
  return report;
}

