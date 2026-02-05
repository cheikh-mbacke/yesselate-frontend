'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '@/components/features/bmo/ToastProvider';
import { ModalManager } from '@/components/shared/ModalManager';
import { ErrorBoundary } from '@/components/features/bmo/ErrorBoundary';

/**
 * Providers - Wrapper centralisé pour tous les providers
 * 
 * Ce composant regroupe tous les providers nécessaires à l'application:
 * - ErrorBoundary: Capture les erreurs React
 * - AuthProvider: Gestion authentification
 * - ToastProvider: Notifications globales
 * - ModalManager: Gestion des modals
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ModalManager />
          {children}
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

