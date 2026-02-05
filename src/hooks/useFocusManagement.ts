// ============================================
// Hook pour gérer le focus après les actions
// ============================================

import { useCallback, useRef } from 'react';

interface FocusManagementOptions {
  /**
   * ID de l'élément actuel
   */
  currentId: string | null;
  /**
   * Liste des éléments disponibles
   */
  items: Array<{ id: string }>;
  /**
   * Callback appelé quand le focus doit être déplacé
   */
  onFocus?: (id: string) => void;
  /**
   * Sélecteur pour trouver l'élément DOM (par défaut: `#alert-{id}`)
   */
  getElementSelector?: (id: string) => string;
}

/**
 * Hook pour gérer le focus après les actions (acquitter, résoudre, etc.)
 */
export function useFocusManagement({
  currentId,
  items,
  onFocus,
  getElementSelector = (id) => `#alert-${id}`,
}: FocusManagementOptions) {
  const previousFocusRef = useRef<string | null>(null);

  const moveFocusToNext = useCallback(
    (removedId: string) => {
      const currentIndex = items.findIndex((item) => item.id === removedId);
      const nextItem = items[currentIndex + 1] || items[currentIndex - 1] || items[0];

      if (nextItem && nextItem.id !== removedId) {
        previousFocusRef.current = nextItem.id;

        // Essayer de focus l'élément DOM
        setTimeout(() => {
          const selector = getElementSelector(nextItem.id);
          const element = document.querySelector(selector) as HTMLElement;
          
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else if (onFocus) {
            onFocus(nextItem.id);
          }
        }, 100);
      }
    },
    [items, getElementSelector, onFocus]
  );

  const moveFocusToPrevious = useCallback(() => {
    if (previousFocusRef.current) {
      const selector = getElementSelector(previousFocusRef.current);
      const element = document.querySelector(selector) as HTMLElement;
      
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (onFocus && previousFocusRef.current) {
        onFocus(previousFocusRef.current);
      }
    }
  }, [getElementSelector, onFocus]);

  const restoreFocus = useCallback(() => {
    if (currentId) {
      const selector = getElementSelector(currentId);
      const element = document.querySelector(selector) as HTMLElement;
      
      if (element) {
        element.focus();
      }
    }
  }, [currentId, getElementSelector]);

  return {
    moveFocusToNext,
    moveFocusToPrevious,
    restoreFocus,
  };
}

