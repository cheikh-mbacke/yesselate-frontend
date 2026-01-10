'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary - Capture les erreurs React et affiche un UI de fallback
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Appeler callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production: envoyer à un service de monitoring (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Exemple avec Sentry:
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
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
      // Fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-2xl w-full">
            <div className="p-8 rounded-2xl border border-red-500/30 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
              {/* Icône et titre */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Oops ! Une erreur est survenue</h1>
                  <p className="text-sm text-slate-400 mt-1">L'application a rencontré un problème inattendu</p>
                </div>
              </div>

              {/* Message utilisateur */}
              <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 mb-6">
                <p className="text-slate-300">
                  Nous sommes désolés pour ce désagrément. L'erreur a été enregistrée et sera examinée par notre équipe.
                </p>
                {showDetails && error && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <p className="text-sm font-mono text-red-400 mb-2">{error.message}</p>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                          Stack trace
                        </summary>
                        <pre className="mt-2 p-3 rounded-lg bg-slate-900/50 text-xs text-slate-400 overflow-auto max-h-48">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </button>

                <a
                  href="mailto:support@yesselate.com?subject=Erreur Application"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contacter le support
                </a>
              </div>

              {/* Détails techniques (dev only) */}
              {showDetails && errorInfo && (
                <details className="mt-6">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    Détails techniques (développement)
                  </summary>
                  <div className="mt-3 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                    <p className="text-xs font-mono text-slate-400 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour déclencher une erreur depuis un composant
 * Utile pour tester l'Error Boundary
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

/**
 * Composant wrapper avec Error Boundary intégré
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

