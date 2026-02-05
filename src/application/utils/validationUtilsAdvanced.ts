/**
 * Advanced Validation Utilities
 * Helpers pour validations avancées
 */

// Note: isValidEmail, isValidPhone, isValidUrl existent déjà dans validationUtils.ts
// Ces fonctions sont des versions alternatives avec des validations différentes

/**
 * Valide un code postal français
 */
export function isValidFrenchPostalCode(code: string): boolean {
  const postalCodeRegex = /^(0[1-9]|[1-9][0-9])[0-9]{3}$/;
  return postalCodeRegex.test(code);
}

/**
 * Valide un numéro SIRET
 */
export function isValidSIRET(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14 || !/^\d+$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

/**
 * Valide un IBAN
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return false;
  }
  
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) => {
    return (char.charCodeAt(0) - 55).toString();
  });
  
  let remainder = '';
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = (parseInt(remainder + numeric.slice(i, i + 7)) % 97).toString();
  }
  
  return parseInt(remainder) === 1;
}

// Note: isValidDate existe déjà dans validationUtils.ts

/**
 * Valide qu'une date est dans le futur
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Valide qu'une date est dans le passé
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Valide qu'une date est dans une plage
 */
export function isDateInRange(
  date: string | Date,
  min: string | Date,
  max: string | Date
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const minObj = typeof min === 'string' ? new Date(min) : min;
  const maxObj = typeof max === 'string' ? new Date(max) : max;
  return dateObj >= minObj && dateObj <= maxObj;
}

/**
 * Valide un mot de passe (force)
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Au moins 8 caractères');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Au moins une minuscule');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Au moins une majuscule');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Au moins un chiffre');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Au moins un caractère spécial');
  }

  return {
    isValid: score >= 4,
    score,
    feedback: score < 4 ? feedback : [],
  };
}

/**
 * Valide un numéro de carte bancaire (algorithme de Luhn)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valide un NIR (numéro de sécurité sociale français)
 */
export function isValidNIR(nir: string): boolean {
  const cleaned = nir.replace(/\s/g, '');
  if (cleaned.length !== 15 || !/^\d+$/.test(cleaned)) {
    return false;
  }

  const key = parseInt(cleaned.slice(13));
  const number = parseInt(cleaned.slice(0, 13));
  const calculatedKey = 97 - (number % 97);

  return key === calculatedKey || key === (97 - calculatedKey);
}

// Note: isValidAmount existe déjà dans validationUtils.ts

/**
 * Valide un pourcentage (0-100)
 */
export function isValidPercentage(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0 && num <= 100;
}

