/**
 * Number Utilities
 * Helpers pour manipuler les nombres
 */

/**
 * Arrondit un nombre à N décimales
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Arrondit vers le haut
 */
export function ceil(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor) / factor;
}

/**
 * Arrondit vers le bas
 */
export function floor(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

/**
 * Clamp un nombre entre min et max (version number)
 * Note: clamp existe déjà dans animationUtils.ts
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Vérifie si un nombre est dans une plage
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Mappe un nombre d'une plage à une autre (version number)
 * Note: mapRange existe déjà dans animationUtils.ts
 */
export function mapRangeNumber(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Normalise un nombre entre 0 et 1 (version number)
 * Note: normalize existe déjà dans animationUtils.ts
 */
export function normalizeNumber(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/**
 * Vérifie si un nombre est pair
 */
export function isEven(value: number): boolean {
  return value % 2 === 0;
}

/**
 * Vérifie si un nombre est impair
 */
export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

/**
 * Vérifie si un nombre est un entier
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Vérifie si un nombre est un float
 */
export function isFloat(value: number): boolean {
  return !Number.isInteger(value) && !isNaN(value);
}

/**
 * Vérifie si un nombre est positif
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Vérifie si un nombre est négatif
 */
export function isNegative(value: number): boolean {
  return value < 0;
}

/**
 * Vérifie si un nombre est zéro
 */
export function isZero(value: number): boolean {
  return value === 0;
}

/**
 * Génère un nombre aléatoire entre min et max (version number)
 * Note: random existe déjà dans arrayUtils.ts
 */
export function randomNumber(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

/**
 * Génère un entier aléatoire entre min et max (inclus)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calcule le pourcentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calcule le pourcentage de changement
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Formate un nombre avec séparateurs de milliers (version number)
 * Note: formatNumber existe déjà dans formatUtils.ts
 */
export function formatNumberValue(
  value: number,
  decimals: number = 0,
  separator: string = ' '
): string {
  const rounded = round(value, decimals);
  const parts = rounded.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.join('.');
}

/**
 * Convertit un nombre en format abrégé (K, M, B)
 */
export function abbreviateNumber(value: number, decimals: number = 1): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e9) {
    return `${sign}${round(abs / 1e9, decimals)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${round(abs / 1e6, decimals)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${round(abs / 1e3, decimals)}K`;
  }

  return value.toString();
}

/**
 * Convertit un nombre en format ordinal (1st, 2nd, 3rd, etc.)
 */
export function toOrdinal(value: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = value % 100;
  return value + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

/**
 * Vérifie si un nombre est premier
 */
export function isPrime(value: number): boolean {
  if (value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;

  const sqrt = Math.sqrt(value);
  for (let i = 3; i <= sqrt; i += 2) {
    if (value % i === 0) return false;
  }

  return true;
}

/**
 * Calcule le PGCD (Plus Grand Commun Diviseur)
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calcule le PPCM (Plus Petit Commun Multiple)
 */
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/**
 * Convertit des degrés en radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convertit des radians en degrés
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

