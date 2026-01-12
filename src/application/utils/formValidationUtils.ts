/**
 * Form Validation Utilities
 * Helpers pour la validation de formulaires avancée
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Crée une règle de validation personnalisée
 */
export function createRule(
  validate: (value: any) => boolean,
  message: string
): ValidationRule {
  return { validate, message };
}

/**
 * Valide une valeur avec plusieurs règles
 */
export function validateValue(
  value: any,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Règles de validation communes
 */
export const commonRules = {
  required: (message: string = 'Ce champ est requis'): ValidationRule =>
    createRule(
      (value) => value !== null && value !== undefined && value !== '',
      message
    ),

  minLength: (min: number, message?: string): ValidationRule =>
    createRule(
      (value) => typeof value === 'string' && value.length >= min,
      message || `Minimum ${min} caractères requis`
    ),

  maxLength: (max: number, message?: string): ValidationRule =>
    createRule(
      (value) => typeof value === 'string' && value.length <= max,
      message || `Maximum ${max} caractères autorisés`
    ),

  min: (min: number, message?: string): ValidationRule =>
    createRule(
      (value) => typeof value === 'number' && value >= min,
      message || `La valeur doit être supérieure ou égale à ${min}`
    ),

  max: (max: number, message?: string): ValidationRule =>
    createRule(
      (value) => typeof value === 'number' && value <= max,
      message || `La valeur doit être inférieure ou égale à ${max}`
    ),

  email: (message: string = 'Email invalide'): ValidationRule =>
    createRule(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message
    ),

  phone: (message: string = 'Numéro de téléphone invalide'): ValidationRule =>
    createRule(
      (value) => /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, '')),
      message
    ),

  url: (message: string = 'URL invalide'): ValidationRule =>
    createRule(
      (value) => /^https?:\/\/.+/.test(value),
      message
    ),

  pattern: (pattern: RegExp, message: string): ValidationRule =>
    createRule(
      (value) => pattern.test(value),
      message
    ),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule =>
    createRule(validator, message),
};

/**
 * Valide un objet de formulaire complet
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  rules: Record<keyof T, ValidationRule[]>
): {
  isValid: boolean;
  errors: Record<keyof T, string[]>;
} {
  const errors: Record<string, string[]> = {} as Record<keyof T, string[]>;
  let isValid = true;

  for (const field in rules) {
    const fieldRules = rules[field];
    const value = formData[field];
    const result = validateValue(value, fieldRules);

    if (!result.isValid) {
      isValid = false;
      errors[field] = result.errors;
    } else {
      errors[field] = [];
    }
  }

  return { isValid, errors };
}

/**
 * Valide un champ de formulaire
 */
export function validateField(
  value: any,
  rules: ValidationRule[]
): ValidationResult {
  return validateValue(value, rules);
}

/**
 * Crée un validateur de formulaire réutilisable
 */
export function createFormValidator<T extends Record<string, any>>(
  rules: Record<keyof T, ValidationRule[]>
) {
  return (formData: T) => validateForm(formData, rules);
}

/**
 * Valide un fichier
 */
export function validateFile(
  file: File | null,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): ValidationResult {
  const errors: string[] = [];

  if (!file) {
    return { isValid: false, errors: ['Aucun fichier sélectionné'] };
  }

  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`Le fichier est trop volumineux (max: ${options.maxSize} bytes)`);
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé`);
  }

  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`Extension non autorisée`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide une date
 */
export function validateDate(
  date: string | Date | null,
  options?: {
    min?: Date;
    max?: Date;
    required?: boolean;
  }
): ValidationResult {
  const errors: string[] = [];

  if (!date) {
    if (options?.required) {
      errors.push('La date est requise');
    }
    return { isValid: errors.length === 0, errors };
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    errors.push('Date invalide');
    return { isValid: false, errors };
  }

  if (options?.min && dateObj < options.min) {
    errors.push(`La date doit être après ${options.min.toLocaleDateString()}`);
  }

  if (options?.max && dateObj > options.max) {
    errors.push(`La date doit être avant ${options.max.toLocaleDateString()}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un nombre
 */
export function validateNumber(
  value: any,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  }
): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    if (options?.required) {
      errors.push('Ce champ est requis');
    }
    return { isValid: errors.length === 0, errors };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    errors.push('Valeur numérique invalide');
    return { isValid: false, errors };
  }

  if (options?.integer && !Number.isInteger(num)) {
    errors.push('Un nombre entier est requis');
  }

  if (options?.min !== undefined && num < options.min) {
    errors.push(`La valeur doit être supérieure ou égale à ${options.min}`);
  }

  if (options?.max !== undefined && num > options.max) {
    errors.push(`La valeur doit être inférieure ou égale à ${options.max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

