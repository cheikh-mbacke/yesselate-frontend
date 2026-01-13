/**
 * URL Utilities
 * Helpers pour manipuler les URLs
 */

/**
 * Construit une URL avec query parameters
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params) return baseUrl;

  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Parse les query parameters d'une URL
 */
export function parseQueryParams(url?: string): Record<string, string> {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.search : '');
  const params = new URLSearchParams(targetUrl);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Obtient un query parameter spécifique
 */
export function getQueryParam(key: string, url?: string): string | null {
  const params = parseQueryParams(url);
  return params[key] || null;
}

/**
 * Ajoute ou met à jour un query parameter
 */
export function setQueryParam(
  key: string,
  value: string | number | boolean | null,
  url?: string
): string {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const urlObj = new URL(currentUrl, window.location.origin);

  if (value === null || value === undefined) {
    urlObj.searchParams.delete(key);
  } else {
    urlObj.searchParams.set(key, String(value));
  }

  return urlObj.toString();
}

/**
 * Supprime un query parameter
 */
export function removeQueryParam(key: string, url?: string): string {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const urlObj = new URL(currentUrl, window.location.origin);
  urlObj.searchParams.delete(key);
  return urlObj.toString();
}

/**
 * Obtient le chemin de l'URL sans query parameters
 */
export function getPathname(url?: string): string {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const urlObj = new URL(targetUrl, window.location.origin);
  return urlObj.pathname;
}

/**
 * Vérifie si une URL est absolue
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalise une URL
 */
export function normalizeUrl(url: string, base?: string): string {
  try {
    const urlObj = new URL(url, base || window.location.origin);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Obtient le domaine d'une URL
 */
export function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Obtient le protocole d'une URL
 */
export function getProtocol(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol.replace(':', '');
  } catch {
    return null;
  }
}

/**
 * Combine plusieurs segments d'URL
 */
export function joinUrl(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      if (index === 0) {
        return segment.replace(/\/+$/, '');
      }
      return segment.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

