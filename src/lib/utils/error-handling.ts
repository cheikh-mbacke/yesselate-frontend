/**
 * Utilitaires pour la gestion d'erreurs réseau et API
 * 
 * Fournit :
 * - Classes d'erreur spécifiques (NetworkError, ApiError)
 * - Fonction pour formater les messages d'erreur utilisateur
 * - Helpers pour détecter le type d'erreur
 */

/**
 * Erreur réseau (connexion, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Erreur API (réponse HTTP avec code d'erreur)
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Formate une erreur en message utilisateur compréhensible
 * 
 * @param error - Erreur à formater
 * @returns Message utilisateur
 * 
 * @example
 * ```ts
 * try {
 *   await updateAlert(id, data);
 * } catch (error) {
 *   const message = handleApiError(error);
 *   addToast(message, 'error');
 * }
 * ```
 */
export function handleApiError(error: unknown): string {
  if (error instanceof NetworkError) {
    if (error.statusCode === 401) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    if (error.statusCode === 403) {
      return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
    }
    if (error.statusCode === 404) {
      return 'Ressource introuvable.';
    }
    if (error.statusCode === 409) {
      return 'Conflit : cette ressource a été modifiée. Veuillez actualiser.';
    }
    if (error.statusCode === 422) {
      return 'Données invalides. Veuillez vérifier vos saisies.';
    }
    if (error.statusCode === 429) {
      return 'Trop de requêtes. Veuillez patienter quelques instants.';
    }
    if (error.statusCode === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    if (error.statusCode === 503) {
      return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
    }
    return 'Problème de connexion. Vérifiez votre réseau et réessayez.';
  }

  if (error instanceof ApiError) {
    return error.message || 'Une erreur s\'est produite lors de la requête.';
  }

  if (error instanceof Error) {
    // Messages d'erreur spécifiques
    if (error.message.includes('fetch')) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
    if (error.message.includes('timeout')) {
      return 'La requête a expiré. Veuillez réessayer.';
    }
    return error.message || 'Une erreur inattendue s\'est produite.';
  }

  return 'Une erreur inattendue s\'est produite.';
}

/**
 * Vérifie si une erreur nécessite une redirection (ex: 401)
 * 
 * @param error - Erreur à vérifier
 * @returns true si redirection nécessaire
 */
export function requiresRedirect(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof ApiError) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
}

/**
 * Vérifie si une erreur est récupérable (peut être retentée)
 * 
 * @param error - Erreur à vérifier
 * @returns true si l'erreur est récupérable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof ApiError) {
    // Erreurs réseau ou serveur (5xx) sont récupérables
    // Erreurs client (4xx) ne sont généralement pas récupérables
    return (
      !error.statusCode ||
      error.statusCode >= 500 ||
      error.statusCode === 408 || // Request Timeout
      error.statusCode === 429    // Too Many Requests
    );
  }
  
  // Erreurs réseau génériques sont récupérables
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }
  
  return false;
}

