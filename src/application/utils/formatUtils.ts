/**
 * Format Utilities
 * Utilitaires de formatage pour dates, nombres, devises, etc.
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date selon un pattern
 */
export function formatDate(
  date: string | Date | null | undefined,
  pattern: string = 'dd/MM/yyyy'
): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, pattern, { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Formate une date relative (il y a X jours)
 */
export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0,
  locale: string = 'fr-FR'
): string {
  if (value == null || isNaN(value)) return '-';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formate une devise (FCFA par défaut)
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'FCFA',
  locale: string = 'fr-FR'
): string {
  if (amount == null || isNaN(amount)) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'FCFA' ? 'XOF' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
}

/**
 * Formate un pourcentage
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value == null || isNaN(value)) return '-';
  
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Formate une durée (en secondes, minutes, heures, jours)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
}

/**
 * Formate une taille de fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
}

/**
 * Formate un numéro de téléphone
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';
  
  // Format: +229 XX XX XX XX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+229 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Formate un texte avec troncature
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Formate un texte avec capitalisation
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formate un texte avec capitalisation de chaque mot
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

