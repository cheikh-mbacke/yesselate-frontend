import crypto from 'crypto';

/**
 * Stringify stable pour garantir le même hash pour le même contenu
 * (tri des clés d'objets)
 */
function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return `{${keys.map(k => JSON.stringify(k) + ':' + stableStringify((obj as Record<string, unknown>)[k])).join(',')}}`;
}

/**
 * Hash SHA3-256 (ou SHA256 si SHA3 non disponible) d'un payload
 */
export function hashDecision(payload: unknown): string {
  const algo = crypto.getHashes().includes('sha3-256') ? 'sha3-256' : 'sha256';
  return crypto.createHash(algo).update(stableStringify(payload)).digest('hex');
}

/**
 * Hash chaîné : prev + payload
 * Utilisé pour créer une chaîne d'audit immuable
 */
export function hashChain(prev: string, payload: unknown): string {
  const input = prev + '|' + stableStringify(payload);
  const algo = crypto.getHashes().includes('sha3-256') ? 'sha3-256' : 'sha256';
  return crypto.createHash(algo).update(input).digest('hex');
}

/**
 * Vérifie l'intégrité d'une chaîne d'audit
 */
export function verifyChain(
  decisionHash: string,
  events: Array<{ chainHash: string; action: string; actorName: string; details?: string | null }>
): { valid: boolean; brokenAt?: number } {
  if (events.length === 0) return { valid: true };
  
  let currentHash = decisionHash;
  
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    const expectedHash = hashChain(currentHash, {
      action: event.action,
      actorName: event.actorName,
      details: event.details,
    });
    
    if (expectedHash !== event.chainHash) {
      return { valid: false, brokenAt: i };
    }
    
    currentHash = event.chainHash;
  }
  
  return { valid: true };
}

