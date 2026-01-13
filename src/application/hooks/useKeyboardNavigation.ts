/**
 * useKeyboardNavigation Hook
 * Gestion de la navigation au clavier pour les listes et menus
 */

import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Hook pour gérer la navigation au clavier dans une liste
 * 
 * @param options - Options de configuration
 * @returns Objet avec selectedIndex et handlers
 */
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  enabled = true,
  loop = true,
  orientation = 'vertical',
}: UseKeyboardNavigationOptions) {
  const selectedIndexRef = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      const isVertical = orientation === 'vertical';
      const isHorizontal = orientation === 'horizontal';

      let newIndex = selectedIndexRef.current;

      // Navigation verticale
      if (isVertical) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = loop
            ? (selectedIndexRef.current + 1) % itemCount
            : Math.min(selectedIndexRef.current + 1, itemCount - 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = loop
            ? (selectedIndexRef.current - 1 + itemCount) % itemCount
            : Math.max(selectedIndexRef.current - 1, 0);
        }
      }

      // Navigation horizontale
      if (isHorizontal) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newIndex = loop
            ? (selectedIndexRef.current + 1) % itemCount
            : Math.min(selectedIndexRef.current + 1, itemCount - 1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newIndex = loop
            ? (selectedIndexRef.current - 1 + itemCount) % itemCount
            : Math.max(selectedIndexRef.current - 1, 0);
        }
      }

      // Sélection avec Enter ou Espace
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(selectedIndexRef.current);
        return;
      }

      // Home/End pour aller au début/fin
      if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = itemCount - 1;
      }

      if (newIndex !== selectedIndexRef.current) {
        selectedIndexRef.current = newIndex;
        onSelect?.(newIndex);
      }
    },
    [enabled, itemCount, onSelect, loop, orientation]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);

  const setSelectedIndex = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      selectedIndexRef.current = index;
      onSelect?.(index);
    }
  }, [itemCount, onSelect]);

  return {
    selectedIndex: selectedIndexRef.current,
    setSelectedIndex,
  };
}

