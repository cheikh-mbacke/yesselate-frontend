/**
 * Module Délégations de Pouvoirs
 * ==============================
 * 
 * Export centralisé de tous les types et fonctions du domaine métier.
 */

// Types
export * from './types';

// Moteur de règles
export {
  evaluate,
  canPotentiallyAuthorize,
  findMatchingDelegations,
  formatEvaluationSummary,
} from './policy-engine';

// Hash cryptographique (SHA3-256)
export {
  sha3_256,
  getHashAlgorithm,
  stableStringify,
  hashDecision,
  hashChain,
  computeEventHash,
  verifyChain,
  shortHash,
  compareHashes,
  generateEventId,
} from './hash';

export type { ChainEvent, ChainVerificationResult } from './hash';

// Mappers Prisma <-> Domain
export {
  mapPrismaToDelegation,
  mapDelegationToPrisma,
  mapPrismaPolicy,
  mapPrismaActor,
  mapPrismaEngagement,
  mapPolicyToPrisma,
} from './mapper';

