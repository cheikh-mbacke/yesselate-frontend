/**
 * Error Boundary pour Validation-BC
 * Capture les erreurs et affiche un fallback élégant
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ValidationBCErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ValidationBC Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-200">
                Une erreur est survenue
              </h2>
              <p className="text-slate-400">
                Nous avons rencontré un problème lors du chargement de cette section.
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour afficher les erreurs
export function useErrorHandler() {
  const [error, setError] = React.useState<string | null>(null);

  const showError = React.useCallback((err: Error | string) => {
    const message = err instanceof Error ? err.message : err;
    setError(message);
    console.error('Error:', err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, showError, clearError };
}

// Composant pour afficher les erreurs inline
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
}: {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400 mb-1">Erreur</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="h-7 text-red-400 hover:text-red-300"
            >
              Réessayer
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-7 text-slate-400 hover:text-slate-300"
            >
              Fermer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

