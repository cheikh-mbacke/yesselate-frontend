// ============================================
// Utilitaires pour calculer les statistiques BMO
// Basées sur les décisions BMO et la traçabilité RACI
// ============================================

import type { PurchaseOrder, Financials, Facture } from '@/lib/types/bmo.types';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { Avenant } from '@/lib/data/avenants';

/**
 * Calcule le montant total des BC en attente de décision BMO
 */
export function calculateBCPendingAmount(bcs: (PurchaseOrder | EnrichedBC)[]): number {
  return bcs
    .filter(bc => !bc.decisionBMO)
    .reduce((sum, bc) => {
      // Pour PurchaseOrder, parser le montant depuis amount (string)
      if ('amount' in bc && typeof bc.amount === 'string') {
        const parsed = parseFloat(bc.amount.replace(/[^\d.]/g, '')) || 0;
        return sum + parsed;
      }
      // Pour EnrichedBC, utiliser montantTTC
      if ('montantTTC' in bc && typeof bc.montantTTC === 'number') {
        return sum + bc.montantTTC;
      }
      return sum;
    }, 0);
}

/**
 * Calcule le montant total des BC validés par le BMO (Accountable)
 */
export function calculateBCValidatedAmount(bcs: (PurchaseOrder | EnrichedBC)[]): number {
  return bcs
    .filter(bc => bc.decisionBMO?.validatorRole === 'A')
    .reduce((sum, bc) => {
      // Pour PurchaseOrder, parser le montant depuis amount (string)
      if ('amount' in bc && typeof bc.amount === 'string') {
        const parsed = parseFloat(bc.amount.replace(/[^\d.]/g, '')) || 0;
        return sum + parsed;
      }
      // Pour EnrichedBC, utiliser montantTTC
      if ('montantTTC' in bc && typeof bc.montantTTC === 'number') {
        return sum + bc.montantTTC;
      }
      return sum;
    }, 0);
}

/**
 * Calcule l'impact total financier de toutes les décisions BMO
 * Inclut : gains, pertes, factures et avenants avec décision BMO
 */
export function calculateBMOTotalImpact(
  financials: Financials,
  factures: Facture[] = [],
  avenants: Avenant[] = []
): number {
  const gainsAmount = financials.gains
    .filter(g => g.decisionBMO)
    .reduce((sum, g) => sum + Math.abs(g.montant), 0);

  const pertesAmount = financials.pertes
    .filter(p => p.decisionBMO)
    .reduce((sum, p) => sum + Math.abs(p.montant), 0);

  const facturesAmount = factures
    .filter(f => f.decisionBMO)
    .reduce((sum, f) => sum + Math.abs(f.montantTTC), 0);

  const avenantsAmount = avenants
    .filter(av => av.decisionBMO)
    .reduce((sum, av) => sum + Math.abs(av.ecart), 0);

  return gainsAmount + pertesAmount + facturesAmount + avenantsAmount;
}

/**
 * Statistiques complètes BMO
 */
export interface BMOStats {
  // BC
  bcPendingCount: number;
  bcPendingAmount: number;
  bcValidatedCount: number;
  bcValidatedAmount: number;
  
  // Impact total
  totalImpact: number;
  
  // Détails par type
  gainsWithBMO: number;
  pertesWithBMO: number;
  facturesWithBMO: number;
  avenantsWithBMO: number;
}

/**
 * Calcule toutes les statistiques BMO
 */
export function calculateBMOStats(
  bcs: (PurchaseOrder | EnrichedBC)[],
  financials: Financials,
  factures: Facture[] = [],
  avenants: Avenant[] = []
): BMOStats {
  const bcPending = bcs.filter(bc => !bc.decisionBMO);
  const bcValidated = bcs.filter(bc => bc.decisionBMO?.validatorRole === 'A');

  return {
    bcPendingCount: bcPending.length,
    bcPendingAmount: calculateBCPendingAmount(bcs),
    bcValidatedCount: bcValidated.length,
    bcValidatedAmount: calculateBCValidatedAmount(bcs),
    totalImpact: calculateBMOTotalImpact(financials, factures, avenants),
    gainsWithBMO: financials.gains.filter(g => g.decisionBMO).length,
    pertesWithBMO: financials.pertes.filter(p => p.decisionBMO).length,
    facturesWithBMO: factures.filter(f => f.decisionBMO).length,
    avenantsWithBMO: avenants.filter(av => av.decisionBMO).length,
  };
}

