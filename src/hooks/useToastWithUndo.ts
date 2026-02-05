// ============================================
// Hook pour les toasts avec action Undo
// ============================================

import { useCallback } from 'react';
import type { Toast } from '@/lib/types/bmo.types';

interface ToastWithUndoOptions {
  message: string;
  type?: Toast['type'];
  undoAction?: () => void;
  undoLabel?: string;
  duration?: number;
}

/**
 * Hook pour créer des toasts avec action Undo
 */
export function useToastWithUndo(
  addToast: (message: string, type?: Toast['type']) => void,
  removeToast: (id: number) => void
) {
  const showToastWithUndo = useCallback(
    ({ message, type = 'success', undoAction, undoLabel = 'Annuler', duration = 5000 }: ToastWithUndoOptions) => {
      if (!undoAction) {
        // Toast normal si pas d'action undo
        addToast(message, type);
        return;
      }

      // Créer un toast avec action undo
      // Note: Cette implémentation nécessite que le composant Toast supporte les actions
      // Pour l'instant, on utilise un toast normal avec un message enrichi
      const toastId = Date.now();
      
      // Simuler l'ajout d'un toast avec action
      // Dans une implémentation complète, il faudrait modifier le store pour supporter les actions
      addToast(`${message} (${undoLabel} disponible)`, type);

      // Retourner une fonction pour annuler
      return {
        undo: () => {
          undoAction();
          removeToast(toastId);
        },
        toastId,
      };
    },
    [addToast, removeToast]
  );

  return { showToastWithUndo };
}

