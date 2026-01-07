// =============== HOOK RÉUTILISABLE POUR TOUTE DÉCISION BMO ===============
import { useCallback } from 'react';
import type { BMODecision, RACIRole } from '@/lib/types/bmo.types';

interface TraceOptions {
  origin: string;
  validatorRole: RACIRole;
  comment?: string;
}

/**
 * Hook réutilisable pour créer des décisions BMO avec traçabilité complète
 * 
 * @example
 * ```tsx
 * const { createDecisionBMO, isAccountable } = useBMOTrace();
 * 
 * const decision = createDecisionBMO(
 *   {
 *     origin: 'validation-bc',
 *     validatorRole: 'A',
 *     comment: 'Validé – conformité nomenclature OK',
 *   },
 *   { bcId: 'BC-2025-0154', montant: 185000000 }
 * );
 * ```
 */
export function useBMOTrace() {
  /**
   * Génère un hash SHA3-256 simulé pour la traçabilité
   * En production, utiliser une vraie lib comme `js-sha3` ou un appel API
   */
  const generateDecisionHash = useCallback((data: unknown): string => {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ data, timestamp });
    // Simulation : en production, utiliser une vraie fonction SHA3-256
    const hashBase = btoa(payload).replace(/=/g, '').slice(0, 64);
    return `SHA3-256:${hashBase}`;
  }, []);

  /**
   * Crée une décision BMO avec tous les champs requis
   * 
   * @param options - Options de la décision (origin, validatorRole, comment)
   * @param context - Contexte additionnel pour le hash (optionnel)
   * @returns Une décision BMO complète avec decisionId, origin, validatorRole, hash et comment
   */
  const createDecisionBMO = useCallback(
    (options: TraceOptions, context: Record<string, unknown> = {}): BMODecision => {
      // Génération d'un ID de décision unique
      // Format: ORIGIN-YYYYMMDD-XXXX (ex: VALIDATION-BC-20251215-A1B2)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const originPrefix = options.origin
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const decisionId = `${originPrefix}-${dateStr}-${randomSuffix}`;

      // Génération du hash avec le contexte
      const hash = generateDecisionHash({ ...options, ...context });

      return {
        decisionId,
        origin: options.origin,
        validatorRole: options.validatorRole,
        hash,
        comment: options.comment,
      };
    },
    [generateDecisionHash]
  );

  /**
   * Détermine si l'utilisateur actuel a le rôle Accountable (BMO)
   * À adapter selon votre logique métier
   */
  const isAccountable = useCallback((userRole?: string): boolean => {
    // Logique par défaut : adapter selon vos besoins
    return userRole === 'BMO' || userRole === 'Directeur Général' || userRole === 'bmo';
  }, []);

  return {
    createDecisionBMO,
    isAccountable,
  };
}

