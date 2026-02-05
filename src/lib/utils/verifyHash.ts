// =============== VÉRIFICATION DE HASH EN LIGNE ===============
// Simule une vérification (en vrai, tu appelles une API ou utilise Web Crypto)

import { useCallback } from 'react';
import { bcToValidate, facturesRecues, avenants, financials } from '@/lib/data';
import type { PurchaseOrder, Facture, FinancialGain, FinancialLoss } from '@/lib/types/bmo.types';
import type { Avenant } from '@/lib/data/avenants';

interface ItemWithDecisionBMO {
  decisionBMO?: {
    decisionId: string;
    hash: string;
  };
}

/**
 * Vérifie l'intégrité d'une décision BMO en comparant son hash
 * 
 * @param decisionId - ID de la décision à vérifier
 * @param providedHash - Hash fourni à vérifier
 * @returns true si le hash correspond, false sinon
 * 
 * @example
 * ```ts
 * const isValid = await verifyDecisionHash('DEC-20250405-001', 'SHA3-256:abc123...');
 * ```
 */
export const verifyDecisionHash = async (
  decisionId: string,
  providedHash: string
): Promise<boolean> => {
  // ⚠️ En production, tu ferais :
  // const response = await fetch(`/api/verify-hash?decisionId=${decisionId}`);
  // const { hash } = await response.json();
  // return hash === providedHash;

  // Ici, simulation : on cherche dans les données locales
  const allItems: ItemWithDecisionBMO[] = [
    ...(bcToValidate as PurchaseOrder[]),
    ...(facturesRecues as Facture[]),
    ...(avenants as Avenant[]),
    ...(financials.gains as FinancialGain[]),
    ...(financials.pertes as FinancialLoss[]),
  ];

  const decision = allItems.find(
    item => item.decisionBMO?.decisionId === decisionId
  );

  return decision?.decisionBMO?.hash === providedHash;
};

/**
 * Hook React réutilisable pour la vérification de hash
 * 
 * @example
 * ```tsx
 * const { verify, isVerifying } = useHashVerification();
 * 
 * const handleVerify = async () => {
 *   const isValid = await verify('DEC-20250405-001', 'SHA3-256:abc123...');
 *   if (isValid) {
 *     console.log('Hash valide !');
 *   }
 * };
 * ```
 */
export const useHashVerification = () => {
  const verify = useCallback(async (decisionId: string, hash: string): Promise<boolean> => {
    const isValid = await verifyDecisionHash(decisionId, hash);
    return isValid;
  }, []);

  return { verify };
};

