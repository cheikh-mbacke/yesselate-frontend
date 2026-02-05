// ============================================
// Hook pour la navigation clavier dans les listes
// ============================================

import { useEffect, useCallback } from 'react';

interface ListItem {
  id: string;
}

/**
 * Hook pour gérer la navigation clavier dans une liste
 * @param items - Liste des items
 * @param selectedId - ID de l'item actuellement sélectionné
 * @param onSelect - Callback appelé quand un item est sélectionné
 * @param enabled - Activer/désactiver la navigation (défaut: true)
 */
export function useListKeyboardNavigation<T extends ListItem>(
  items: T[],
  selectedId: string | null,
  onSelect: (id: string) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si dans un input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const currentIndex = items.findIndex((item) => item.id === selectedId);
      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== null && newIndex >= 0 && newIndex < items.length) {
        onSelect(items[newIndex].id);
        
        // Focus sur l'élément sélectionné
        setTimeout(() => {
          const element = document.getElementById(`alert-${items[newIndex!].id}`);
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedId, onSelect, enabled]);
}

