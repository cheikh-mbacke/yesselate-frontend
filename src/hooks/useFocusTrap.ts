/**
 * Hook pour piéger le focus dans un conteneur (modale, dropdown, etc.)
 * 
 * Implémente le pattern de focus trap pour l'accessibilité :
 * - Tab : avance dans les éléments focusables
 * - Shift+Tab : recule dans les éléments focusables
 * - Le focus reste dans le conteneur
 * 
 * @example
 * ```tsx
 * const modalRef = useFocusTrap(isOpen);
 * 
 * return (
 *   <div ref={modalRef} className="modal">
 *     <button>Premier</button>
 *     <button>Deuxième</button>
 *     <button>Dernier</button>
 *   </div>
 * );
 * ```
 */

import { useEffect, useRef } from 'react';

/**
 * Hook pour piéger le focus dans un conteneur
 * 
 * @param isActive - Active/désactive le focus trap
 * @returns Ref à attacher au conteneur
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Sélecteurs pour les éléments focusables
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    // Récupérer tous les éléments focusables
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      // Filtrer les éléments cachés
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      );
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial sur le premier élément
    firstElement.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const activeElement = document.activeElement as HTMLElement;
      
      // Vérifier que l'élément actif est dans le conteneur
      if (!container.contains(activeElement)) {
        firstElement.focus();
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab : reculer
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab : avancer
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return containerRef;
}

