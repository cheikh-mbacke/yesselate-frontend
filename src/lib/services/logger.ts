/**
 * Service de logging centralisé
 * 
 * Fournit une interface unifiée pour le logging avec support pour :
 * - Logging en développement (console)
 * - Envoi à un service de monitoring en production
 * - Contexte enrichi (user agent, timestamp, etc.)
 * 
 * @example
 * ```ts
 * Logger.error('Erreur lors de la mise à jour', error, { alertId: '123' });
 * Logger.warn('Action non autorisée', { userId: '456' });
 * Logger.info('Action réussie', { action: 'export' });
 * ```
 */

interface LogContext {
  [key: string]: unknown;
}

interface ErrorLogData {
  message: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: LogContext;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export class Logger {
  /**
   * Log une erreur avec contexte
   * 
   * @param message - Message descriptif de l'erreur
   * @param error - Objet Error
   * @param context - Contexte additionnel (optionnel)
   */
  static error(message: string, error: Error, context?: LogContext): void {
    const errorData: ErrorLogData = {
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // En production : envoyer à service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Intégrer Sentry, LogRocket, ou service custom
      // Pour l'instant, on envoie à une API interne
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Fallback silencieux si l'API n'est pas disponible
        // En production réelle, on pourrait utiliser un service externe
      });
    } else {
      // En développement : log dans la console
      console.error('[Logger]', message, error, context);
    }
  }

  /**
   * Log un avertissement avec contexte
   * 
   * @param message - Message d'avertissement
   * @param context - Contexte additionnel (optionnel)
   */
  static warn(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Logger]', message, context);
    }
    
    // En production, on peut aussi envoyer les warnings
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/logs/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Ignorer les erreurs de logging
      });
    }
  }

  /**
   * Log une information avec contexte
   * 
   * @param message - Message informatif
   * @param context - Contexte additionnel (optionnel)
   */
  static info(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Logger]', message, context);
    }
  }

  /**
   * Log une erreur sans objet Error (string ou autre)
   * 
   * @param message - Message d'erreur
   * @param error - Erreur (peut être string, Error, ou autre)
   * @param context - Contexte additionnel (optionnel)
   */
  static errorUnknown(message: string, error: unknown, context?: LogContext): void {
    if (error instanceof Error) {
      Logger.error(message, error, context);
    } else {
      Logger.error(message, new Error(String(error)), context);
    }
  }
}

