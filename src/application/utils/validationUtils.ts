/**
 * Validation Utilities
 * Helpers pour la validation de données
 */

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone (format Bénin)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Format Bénin: 9 chiffres ou +229 suivi de 9 chiffres
  return cleaned.length === 9 || (cleaned.startsWith('229') && cleaned.length === 12);
}

/**
 * Valide une URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valide une date
 */
export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}

/**
 * Valide un nombre dans une plage
 */
export function isNumberInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Valide une longueur de texte
 */
export function isValidLength(
  text: string,
  min: number,
  max: number
): boolean {
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Valide un mot de passe (au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un code bureau (format: 2-3 lettres)
 */
export function isValidBureauCode(code: string): boolean {
  return /^[A-Z]{2,3}$/.test(code.toUpperCase());
}

/**
 * Valide un montant (positif)
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && !isNaN(amount) && isFinite(amount);
}

/**
 * Valide un pourcentage (0-100)
 */
export function isValidPercent(percent: number): boolean {
  return percent >= 0 && percent <= 100 && !isNaN(percent);
}

/**
 * Valide un UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valide un champ requis
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Combine plusieurs validations
 */
export function validateAll(
  validations: Array<{ valid: boolean; message?: string }>
): { valid: boolean; errors: string[] } {
  const errors = validations
    .filter(v => !v.valid)
    .map(v => v.message || 'Validation échouée');

  return {
    valid: errors.length === 0,
    errors,
  };
}

