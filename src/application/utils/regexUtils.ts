/**
 * Regex Utilities
 * Helpers pour les expressions régulières
 */

/**
 * Patterns regex communs
 */
export const regexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^https?:\/\/.+/,
  ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
  ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  alpha: /^[a-zA-Z]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  creditCard: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  frenchPostalCode: /^(0[1-9]|[1-9][0-9])[0-9]{3}$/,
  siret: /^\d{14}$/,
  iban: /^[A-Z]{2}\d{2}[A-Z0-9]+$/,
};

/**
 * Teste une chaîne contre un pattern
 */
export function testRegex(pattern: string | RegExp, str: string): boolean {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(str);
}

/**
 * Trouve toutes les correspondances
 */
export function matchAll(pattern: string | RegExp, str: string): RegExpMatchArray[] {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : new RegExp(pattern.source, 'g');
  const matches: RegExpMatchArray[] = [];
  let match;

  while ((match = regex.exec(str)) !== null) {
    matches.push(match);
  }

  return matches;
}

/**
 * Remplace toutes les correspondances
 */
export function replaceAll(
  str: string,
  pattern: string | RegExp,
  replacement: string | ((match: string, ...args: any[]) => string)
): string {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : new RegExp(pattern.source, 'g');
  
  if (typeof replacement === 'function') {
    return str.replace(regex, replacement);
  }
  
  return str.replace(regex, replacement);
}

/**
 * Extrait les correspondances
 */
export function extract(pattern: string | RegExp, str: string): string[] {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : new RegExp(pattern.source, 'g');
  const matches = str.match(regex);
  return matches || [];
}

/**
 * Échappe les caractères spéciaux d'un pattern regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Crée un pattern regex pour une recherche insensible à la casse
 */
export function createCaseInsensitivePattern(str: string): RegExp {
  return new RegExp(escapeRegex(str), 'i');
}

/**
 * Valide un email (version regex)
 * Note: isValidEmail existe déjà dans validationUtils.ts
 */
export function isValidEmailRegex(email: string): boolean {
  return regexPatterns.email.test(email);
}

/**
 * Valide un numéro de téléphone (version regex)
 * Note: isValidPhone existe déjà dans validationUtils.ts
 */
export function isValidPhoneRegex(phone: string): boolean {
  return regexPatterns.phone.test(phone.replace(/\s/g, ''));
}

/**
 * Valide une URL (version regex)
 * Note: isValidUrl existe déjà dans validationUtils.ts
 */
export function isValidUrlRegex(url: string): boolean {
  return regexPatterns.url.test(url);
}

/**
 * Valide une couleur hex
 */
export function isValidHexColor(color: string): boolean {
  return regexPatterns.hexColor.test(color);
}

/**
 * Valide un slug
 */
export function isValidSlug(slug: string): boolean {
  return regexPatterns.slug.test(slug);
}

// Note: isValidUUID existe déjà dans validationUtils.ts
// Utiliser isValidUUIDRegex pour la version regex uniquement
export function isValidUUIDRegex(uuid: string): boolean {
  return regexPatterns.uuid.test(uuid);
}

// Note: Ces fonctions existent déjà dans validationUtilsAdvanced.ts
// Utiliser les versions Regex uniquement pour les patterns regex
export function isValidFrenchPostalCodeRegex(code: string): boolean {
  return regexPatterns.frenchPostalCode.test(code);
}

export function isValidSIRETRegex(siret: string): boolean {
  return regexPatterns.siret.test(siret.replace(/\s/g, ''));
}

export function isValidIBANRegex(iban: string): boolean {
  return regexPatterns.iban.test(iban.replace(/\s/g, '').toUpperCase());
}

/**
 * Extrait les emails d'un texte
 */
export function extractEmails(text: string): string[] {
  return extract(regexPatterns.email, text);
}

/**
 * Extrait les URLs d'un texte
 */
export function extractUrls(text: string): string[] {
  return extract(regexPatterns.url, text);
}

/**
 * Extrait les numéros de téléphone d'un texte
 */
export function extractPhones(text: string): string[] {
  return extract(regexPatterns.phone, text.replace(/\s/g, ''));
}

/**
 * Masque une partie d'un texte avec regex
 */
export function maskWithRegex(
  text: string,
  pattern: string | RegExp,
  maskChar: string = '*'
): string {
  return text.replace(pattern, (match) => maskChar.repeat(match.length));
}

