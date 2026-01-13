/**
 * Fonctions de hachage cryptographique pour la traçabilité
 * ========================================================
 * 
 * Chaque événement de délégation est hashé et chaîné pour garantir
 * l'intégrité et l'anti-contestation du journal d'audit.
 * 
 * Utilise SHA3-256 (plus sécurisé) avec fallback sur SHA-256.
 */

import crypto from 'crypto';

// ============================================
// DÉTECTION SHA3-256
// ============================================

let SHA3_AVAILABLE = false;
try {
  crypto.createHash('sha3-256');
  SHA3_AVAILABLE = true;
} catch {
  SHA3_AVAILABLE = false;
}

/**
 * Hash SHA3-256 ou SHA-256 (fallback)
 */
export function sha3_256(input: string): string {
  const algo = SHA3_AVAILABLE ? 'sha3-256' : 'sha256';
  return crypto.createHash(algo).update(input, 'utf8').digest('hex');
}

/**
 * Retourne l'algorithme utilisé
 */
export function getHashAlgorithm(): 'sha3-256' | 'sha256' {
  return SHA3_AVAILABLE ? 'sha3-256' : 'sha256';
}

// ============================================
// SÉRIALISATION STABLE
// ============================================

/**
 * Sérialisation stable d'un objet (ordre des clés déterministe)
 * Garantit que le même objet produit toujours le même hash.
 */
export function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  const sorted = Object.keys(obj as Record<string, unknown>)
    .sort()
    .map(k => `"${k}":${stableStringify((obj as Record<string, unknown>)[k])}`);
  
  return '{' + sorted.join(',') + '}';
}

// ============================================
// HASHING MÉTIER
// ============================================

/**
 * Hash de la décision initiale (création de la délégation)
 */
export function hashDecision(payload: unknown): string {
  const str = stableStringify(payload);
  return sha3_256(str);
}

/**
 * Hash chaîné (pour l'audit trail)
 * Combine le hash précédent avec le nouveau payload.
 * 
 * Format: sha3_256(previousHash + ':' + stableStringify(payload))
 */
export function hashChain(previousHash: string | null, payload: unknown): string {
  const prev = previousHash ?? '';
  const str = prev + ':' + stableStringify(payload);
  return sha3_256(str);
}

/**
 * Calcule le hash d'un événement d'audit
 */
export function computeEventHash(
  event: {
    eventType: string;
    actorId: string;
    details?: unknown;
    targetDocRef?: string;
    targetAmount?: number;
    createdAt: Date | string;
  },
  previousHash: string | null
): string {
  const body = {
    prev: previousHash ?? '',
    event: {
      type: event.eventType,
      actor: event.actorId,
      details: event.details,
      doc: event.targetDocRef,
      amount: event.targetAmount,
      at: typeof event.createdAt === 'string' ? event.createdAt : event.createdAt.toISOString(),
    },
  };
  return sha3_256(JSON.stringify(body));
}

// ============================================
// VÉRIFICATION DE CHAÎNE
// ============================================

export interface ChainEvent {
  id: string;
  previousHash: string | null;
  eventHash: string;
  eventType: string;
  actorId: string;
  details?: unknown;
  targetDocRef?: string;
  targetAmount?: number;
  createdAt: Date | string;
}

export interface ChainVerificationResult {
  valid: boolean;
  brokenAt?: number;
  brokenEventId?: string;
  message: string;
  algorithm: 'sha3-256' | 'sha256';
  eventsChecked: number;
}

/**
 * Vérifie l'intégrité complète d'une chaîne d'événements
 */
export function verifyChain(events: ChainEvent[]): ChainVerificationResult {
  if (events.length === 0) {
    return {
      valid: true,
      message: 'Chaîne vide.',
      algorithm: getHashAlgorithm(),
      eventsChecked: 0,
    };
  }
  
  // Trier par date de création
  const sorted = [...events].sort((a, b) => {
    const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
    const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
    return dateA.getTime() - dateB.getTime();
  });
  
  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const expectedPrev = i === 0 ? null : sorted[i - 1].eventHash;
    
    // Vérifier le chaînage
    if (event.previousHash !== expectedPrev) {
      return {
        valid: false,
        brokenAt: i,
        brokenEventId: event.id,
        message: `Chaînage rompu à l'index ${i}: previousHash "${event.previousHash?.slice(0, 8)}..." ≠ attendu "${expectedPrev?.slice(0, 8)}...".`,
        algorithm: getHashAlgorithm(),
        eventsChecked: i + 1,
      };
    }
    
    // Vérifier le hash de l'événement
    const computedHash = computeEventHash(event, event.previousHash);
    if (computedHash !== event.eventHash) {
      return {
        valid: false,
        brokenAt: i,
        brokenEventId: event.id,
        message: `Hash invalide à l'index ${i}: contenu modifié (hash calculé "${computedHash.slice(0, 8)}..." ≠ stocké "${event.eventHash.slice(0, 8)}...").`,
        algorithm: getHashAlgorithm(),
        eventsChecked: i + 1,
      };
    }
  }
  
  return {
    valid: true,
    message: `Chaîne valide (${sorted.length} événement(s) vérifiés).`,
    algorithm: getHashAlgorithm(),
    eventsChecked: sorted.length,
  };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Génère un hash court pour affichage (8 premiers caractères)
 */
export function shortHash(hash: string | null | undefined): string {
  if (!hash) return '—';
  return hash.slice(0, 8) + '…';
}

/**
 * Compare deux hashs de manière sécurisée (timing-safe)
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  if (hash1.length !== hash2.length) return false;
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash1, 'hex'),
      Buffer.from(hash2, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Génère un identifiant unique pour un événement
 */
export function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString('hex');
  return `evt_${timestamp}_${random}`;
}

