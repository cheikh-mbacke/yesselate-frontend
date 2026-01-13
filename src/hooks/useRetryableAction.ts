/**
 * Hook pour exécuter une action avec retry automatique
 * 
 * Gère les tentatives automatiques en cas d'échec avec :
 * - Backoff exponentiel entre les tentatives
 * - Callback de retry pour feedback utilisateur
 * - Gestion d'état (isRetrying, retryCount, error)
 * 
 * @example
 * ```tsx
 * const { executeWithRetry, isRetrying, retryCount } = useRetryableAction(
 *   () => updateAlert(alertId, updates),
 *   { 
 *     maxRetries: 3,
 *     delay: 1000,
 *     onRetry: (attempt) => addToast(`Tentative ${attempt + 1}/3...`, 'info')
 *   }
 * );
 * 
 * await executeWithRetry();
 * ```
 */

import { useState, useCallback } from 'react';

export interface UseRetryableActionOptions {
  /** Nombre maximum de tentatives (défaut: 3) */
  maxRetries?: number;
  /** Délai initial en ms avant retry (défaut: 1000) */
  delay?: number;
  /** Callback appelé à chaque tentative (sauf la première) */
  onRetry?: (attempt: number) => void;
  /** Callback appelé en cas d'échec final */
  onError?: (error: Error, attempt: number) => void;
}

export interface UseRetryableActionReturn<T> {
  /** Exécute l'action avec retry automatique */
  executeWithRetry: () => Promise<T>;
  /** Indique si une retry est en cours */
  isRetrying: boolean;
  /** Nombre de tentatives effectuées (0 = première tentative) */
  retryCount: number;
  /** Erreur de la dernière tentative (null si succès) */
  error: Error | null;
  /** Réinitialise l'état (isRetrying, retryCount, error) */
  reset: () => void;
}

/**
 * Hook pour exécuter une action avec retry automatique
 * 
 * @param action - Fonction async à exécuter
 * @param options - Options de configuration
 * @returns État et fonction d'exécution
 */
export function useRetryableAction<T>(
  action: () => Promise<T>,
  options: UseRetryableActionOptions = {}
): UseRetryableActionReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    setError(null);
    const maxRetries = options.maxRetries ?? 3;
    const delay = options.delay ?? 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        
        // Appeler onRetry pour les tentatives suivantes
        if (attempt > 0 && options.onRetry) {
          options.onRetry(attempt);
        }
        
        const result = await action();
        
        // Succès : réinitialiser l'état
        setIsRetrying(false);
        setRetryCount(0);
        setError(null);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (attempt < maxRetries - 1) {
          // Attendre avant de réessayer (backoff exponentiel)
          const backoffDelay = delay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        } else {
          // Dernière tentative échouée
          setIsRetrying(false);
          
          if (options.onError) {
            options.onError(error, attempt);
          }
          
          throw error;
        }
      }
    }

    // Ne devrait jamais arriver ici, mais TypeScript le demande
    throw new Error('Max retries reached');
  }, [action, options]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setError(null);
  }, []);

  return { executeWithRetry, isRetrying, retryCount, error, reset };
}

