/**
 * Utilitaires Globaux BMO
 * ========================
 * 
 * Fonctions utilitaires réutilisables dans toute l'application
 */

// ============================================
// FORMATAGE
// ============================================

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(2)} Md FCFA`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)} M FCFA`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} K FCFA`;
  }
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formate une durée en jours/heures/minutes
 */
export function formatDuration(hours: number): string {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
  }

  if (hours >= 1) {
    const mins = Math.floor((hours % 1) * 60);
    return mins > 0 ? `${Math.floor(hours)}h ${mins}min` : `${Math.floor(hours)}h`;
  }

  const mins = Math.floor(hours * 60);
  return `${mins}min`;
}

/**
 * Formate une date relative (ex: "il y a 2 heures")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  if (diffWeek < 4) return `il y a ${diffWeek} sem`;
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;

  return targetDate.toLocaleDateString('fr-FR');
}

/**
 * Formate un numéro de téléphone sénégalais
 */
export function formatPhoneNumber(phone: string): string {
  // Exemple: 771234567 → 77 123 45 67
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone sénégalais
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 9 && /^7[0-8]/.test(cleaned);
}

/**
 * Valide un montant
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= 0;
}

// ============================================
// MANIPULATION DE DONNÉES
// ============================================

/**
 * Trie un tableau par une propriété
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Groupe un tableau par une propriété
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Pagine un tableau
 */
export function paginate<T>(array: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

/**
 * Filtre un tableau avec recherche texte
 */
export function searchInArray<T>(
  array: T[],
  query: string,
  keys: (keyof T)[]
): T[] {
  const lowerQuery = query.toLowerCase();

  return array.filter(item =>
    keys.some(key => {
      const value = item[key];
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

// ============================================
// UTILITAIRES DE DATES
// ============================================

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date | string): boolean {
  const target = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  );
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPast(date: Date | string): boolean {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target < new Date();
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Ajoute des jours à une date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = typeof date === 'string' ? new Date(date) : new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================
// UTILITAIRES DE FICHIERS
// ============================================

/**
 * Formate une taille de fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

/**
 * Obtient l'extension d'un fichier
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Obtient le type MIME à partir de l'extension
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

// ============================================
// UTILITAIRES DE COULEURS
// ============================================

/**
 * Génère une couleur à partir d'un string (pour avatars, badges, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#6366f1', // indigo
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Obtient les initiales d'un nom
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// ============================================
// UTILITAIRES DE PERFORMANCE
// ============================================

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// UTILITAIRES DE SÉCURITÉ
// ============================================

/**
 * Échappe les caractères HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Génère un ID unique
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

// ============================================
// UTILITAIRES DE COPIE
// ============================================

/**
 * Copie du texte dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur copie presse-papier:', error);
    return false;
  }
}

/**
 * Clone profond d'un objet
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

