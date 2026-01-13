// ============================================
// Helpers pour la gestion d'URL propre
// ============================================

/**
 * Construit une query string propre sans undefined/null/""
 * Ne génère jamais ?x=undefined
 */
export function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    // Ignorer undefined, null, et chaînes vides
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Convertir en string proprement
    const stringValue = String(value);
    
    // Ne jamais ajouter "undefined" ou "null" comme valeur
    if (stringValue === 'undefined' || stringValue === 'null') {
      continue;
    }

    searchParams.append(key, stringValue);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Parse une query string en objet, en filtrant les valeurs invalides
 */
export function parseQuery(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    // Ignorer les valeurs "undefined" ou "null"
    if (value && value !== 'undefined' && value !== 'null') {
      result[key] = value;
    }
  }

  return result;
}

