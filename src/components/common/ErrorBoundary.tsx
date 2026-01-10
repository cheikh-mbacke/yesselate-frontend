/**
 * Error Boundary Component
 * ========================
 * 
 * Composant pour capturer les erreurs React et empêcher le crash de l'application
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Callback personnalisé
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Mettre à jour l'état avec les infos d'erreur
    this.setState({
      error,
      errorInfo,
    });

    // En production, envoyer à un service de monitoring (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher l'UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/20 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-red-950/10 p-6">
          <div className="max-w-2xl w-full">
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Oups ! Une erreur est survenue</h1>
                    <p className="text-red-100 mt-1">
                      Quelque chose s'est mal passé. Nous sommes désolés pour le désagrément.
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8">
                {/* Message d'erreur */}
                {this.state.error && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Message d'erreur :
                    </h2>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                      <code className="text-sm text-red-800 dark:text-red-300 font-mono">
                        {this.state.error.message}
                      </code>
                    </div>
                  </div>
                )}

                {/* Stack trace (dev only) */}
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mb-6">
                    <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-2">
                      Détails techniques (développement)
                    </summary>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 max-h-64 overflow-auto">
                      <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Réessayer
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Recharger la page
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Retour accueil
                  </button>
                </div>

                {/* Info supplémentaire */}
                <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Que faire ?</strong>
                  </p>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>Essayez de recharger la page</li>
                    <li>Vérifiez votre connexion internet</li>
                    <li>Si le problème persiste, contactez le support technique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour déclencher une erreur (utile pour tests)
 */
export function useThrowError() {
  return (error: Error) => {
    throw error;
  };
}
