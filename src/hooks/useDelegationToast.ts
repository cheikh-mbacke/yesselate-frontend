import { useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number; // en ms, 0 = pas de fermeture auto
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

// Store simple pour les toasts (pourrait être migré vers zustand si besoin)
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const notify = () => {
  listeners.forEach(listener => listener([...toasts]));
};

const addToast = (options: ToastOptions): string => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const toast: Toast = {
    ...options,
    id,
    type: options.type || 'info',
    duration: options.duration !== undefined ? options.duration : 5000,
    createdAt: Date.now(),
  };
  
  toasts = [toast, ...toasts];
  notify();

  // Auto-dismiss si duration > 0
  if (toast.duration > 0) {
    setTimeout(() => removeToast(id), toast.duration);
  }

  return id;
};

const removeToast = (id: string) => {
  const toast = toasts.find(t => t.id === id);
  if (toast?.onClose) {
    toast.onClose();
  }
  toasts = toasts.filter(t => t.id !== id);
  notify();
};

const clearAllToasts = () => {
  toasts = [];
  notify();
};

export const toastManager = {
  add: addToast,
  remove: removeToast,
  clear: clearAllToasts,
  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  getToasts: () => [...toasts],
};

/**
 * Hook pour afficher des notifications toast
 * Avec des helpers typés pour chaque type de notification
 */
export function useDelegationToast() {
  const showToast = useCallback((options: ToastOptions) => {
    return toastManager.add(options);
  }, []);

  const success = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
    return showToast({ ...options, title, description, type: 'success' });
  }, [showToast]);

  const error = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
    return showToast({ ...options, title, description, type: 'error' });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
    return showToast({ ...options, title, description, type: 'warning' });
  }, [showToast]);

  const info = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'type'>) => {
    return showToast({ ...options, title, description, type: 'info' });
  }, [showToast]);

  const dismiss = useCallback((id: string) => {
    toastManager.remove(id);
  }, []);

  const dismissAll = useCallback(() => {
    toastManager.clear();
  }, []);

  // Helpers spécifiques aux délégations
  const delegationCreated = useCallback((delegationId: string) => {
    return success(
      'Délégation créée',
      `La délégation ${delegationId} a été créée avec succès`,
      { duration: 4000 }
    );
  }, [success]);

  const delegationExtended = useCallback((delegationId: string) => {
    return success(
      'Délégation prolongée',
      `La délégation ${delegationId} a été prolongée`,
      { duration: 4000 }
    );
  }, [success]);

  const delegationRevoked = useCallback((delegationId: string) => {
    return warning(
      'Délégation révoquée',
      `La délégation ${delegationId} a été révoquée`,
      { duration: 4000 }
    );
  }, [warning]);

  const delegationSuspended = useCallback((delegationId: string) => {
    return warning(
      'Délégation suspendue',
      `La délégation ${delegationId} a été suspendue`,
      { duration: 4000 }
    );
  }, [warning]);

  const exportCompleted = useCallback((format: string, count: number) => {
    return success(
      'Export terminé',
      `${count} délégation(s) exportée(s) au format ${format.toUpperCase()}`,
      { duration: 3000 }
    );
  }, [success]);

  const actionError = useCallback((action: string, reason?: string) => {
    return error(
      `Erreur : ${action}`,
      reason || 'Une erreur est survenue. Veuillez réessayer.',
      { duration: 6000 }
    );
  }, [error]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    // Helpers spécifiques
    delegationCreated,
    delegationExtended,
    delegationRevoked,
    delegationSuspended,
    exportCompleted,
    actionError,
  };
}

// Composant Toast (à intégrer dans l'UI)
export { ToastContainer } from './ToastContainer';

