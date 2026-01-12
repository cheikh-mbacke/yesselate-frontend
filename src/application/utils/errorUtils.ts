/**
 * Error Utilities
 * Helpers pour la gestion des erreurs
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Crée une erreur structurée
 */
export function createError(
  code: string,
  message: string,
  details?: any
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extrait le message d'erreur d'une erreur inconnue
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Une erreur inattendue est survenue';
}

/**
 * Extrait le code d'erreur
 */
export function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      return String(error.code);
    }
    if ('status' in error) {
      return String(error.status);
    }
    if ('statusCode' in error) {
      return String(error.statusCode);
    }
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Vérifie si une erreur est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    );
  }
  return false;
}

/**
 * Vérifie si une erreur est une erreur d'authentification
 */
export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === '401' || code === 'UNAUTHORIZED' || code === 'FORBIDDEN';
}

/**
 * Vérifie si une erreur est une erreur de validation
 */
export function isValidationError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === '400' || code === 'VALIDATION_ERROR' || code === 'BAD_REQUEST';
}

/**
 * Formate une erreur pour l'affichage utilisateur
 */
export function formatErrorForUser(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
  }
  if (isAuthError(error)) {
    return 'Vous n\'êtes pas autorisé à effectuer cette action.';
  }
  if (isValidationError(error)) {
    return 'Les données fournies sont invalides. Veuillez vérifier vos saisies.';
  }
  return getErrorMessage(error);
}

/**
 * Log une erreur de manière structurée
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    context,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
  };

  console.error('Error logged:', errorInfo);
  
  // Ici, vous pourriez envoyer l'erreur à un service de logging (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(errorInfo);
  // }
}

