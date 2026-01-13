/**
 * String Utilities
 * Helpers pour manipuler les chaînes de caractères
 */

/**
 * Capitalise la première lettre (version avancée)
 * Note: capitalize existe déjà dans formatUtils.ts
 */
export function capitalizeString(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalise chaque mot (version avancée)
 * Note: capitalizeWords existe déjà dans formatUtils.ts
 */
export function capitalizeWordsString(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Convertit en camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Convertit en kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convertit en snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convertit en PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Tronque une chaîne avec ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Tronque une chaîne au niveau des mots
 */
export function truncateWords(str: string, maxWords: number, suffix: string = '...'): string {
  const words = str.split(' ');
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Supprime les accents
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Supprime les espaces en début et fin
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Supprime tous les espaces
 */
export function removeSpaces(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Remplace plusieurs espaces par un seul
 */
export function normalizeSpaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extrait les mots d'une chaîne
 */
export function extractWords(str: string): string[] {
  return str.match(/\b\w+\b/g) || [];
}

/**
 * Compte les mots
 */
export function countWords(str: string): number {
  return extractWords(str).length;
}

/**
 * Compte les caractères (sans espaces)
 */
export function countCharacters(str: string, excludeSpaces: boolean = false): number {
  if (excludeSpaces) {
    return str.replace(/\s/g, '').length;
  }
  return str.length;
}

/**
 * Vérifie si une chaîne est vide ou ne contient que des espaces (version string)
 * Note: isEmpty existe déjà dans objectUtils.ts
 */
export function isEmptyString(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Masque une partie d'une chaîne
 */
export function mask(str: string, start: number = 0, end?: number, maskChar: string = '*'): string {
  const length = str.length;
  const endIndex = end !== undefined ? end : length;
  
  if (start < 0 || endIndex > length || start > endIndex) {
    return str;
  }

  const visibleStart = str.slice(0, start);
  const visibleEnd = str.slice(endIndex);
  const masked = maskChar.repeat(endIndex - start);

  return visibleStart + masked + visibleEnd;
}

/**
 * Masque un email
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = mask(localPart, 2, localPart.length - 2);
  return `${maskedLocal}@${domain}`;
}

/**
 * Masque un numéro de téléphone
 */
export function maskPhone(phone: string, visibleStart: number = 2, visibleEnd: number = 2): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= visibleStart + visibleEnd) return phone;

  const start = cleaned.slice(0, visibleStart);
  const end = cleaned.slice(-visibleEnd);
  const middle = '*'.repeat(cleaned.length - visibleStart - visibleEnd);

  return `${start}${middle}${end}`;
}

/**
 * Génère un slug à partir d'une chaîne
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Génère des initiales à partir d'un nom
 */
export function getInitials(name: string, maxLength: number = 2): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase().slice(0, maxLength);
  }

  return words
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Vérifie si une chaîne contient une sous-chaîne (insensible à la casse)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Remplace toutes les occurrences (insensible à la casse)
 */
export function replaceAllIgnoreCase(
  str: string,
  search: string,
  replace: string
): string {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return str.replace(regex, replace);
}

