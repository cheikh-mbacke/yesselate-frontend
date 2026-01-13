'use client';
import { useState, useMemo, useCallback } from 'react';

/**
 * Hook pour gérer la navigation dans une liste d'items
 * Utile pour les modals de détail avec navigation prev/next
 * 
 * @example
 * const { selectedItem, isOpen, handleNext, handlePrevious, handleOpen, handleClose } = useListNavigation(items, (item) => item.id);
 */
export function useListNavigation<T>(
  items: T[],
  getId: (item: T) => string
) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Item sélectionné actuellement
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find((item) => getId(item) === selectedId) || null;
  }, [items, selectedId, getId]);

  // Index de l'item sélectionné
  const selectedIndex = useMemo(() => {
    if (!selectedId) return -1;
    return items.findIndex((item) => getId(item) === selectedId);
  }, [items, selectedId, getId]);

  // Navigation précédente
  const canNavigatePrev = useMemo(() => {
    return selectedIndex > 0;
  }, [selectedIndex]);

  // Navigation suivante
  const canNavigateNext = useMemo(() => {
    return selectedIndex >= 0 && selectedIndex < items.length - 1;
  }, [selectedIndex, items.length]);

  // Ouvrir un item
  const handleOpen = useCallback((item: T | string) => {
    const id = typeof item === 'string' ? item : getId(item);
    setSelectedId(id);
    setIsOpen(true);
  }, [getId]);

  // Fermer
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Optionnel: garder selectedId pour rouvrir rapidement
    // setSelectedId(null);
  }, []);

  // Navigation précédente
  const handlePrevious = useCallback(() => {
    if (!canNavigatePrev) return;
    const prevIndex = selectedIndex - 1;
    const prevItem = items[prevIndex];
    if (prevItem) {
      setSelectedId(getId(prevItem));
    }
  }, [canNavigatePrev, selectedIndex, items, getId]);

  // Navigation suivante
  const handleNext = useCallback(() => {
    if (!canNavigateNext) return;
    const nextIndex = selectedIndex + 1;
    const nextItem = items[nextIndex];
    if (nextItem) {
      setSelectedId(getId(nextItem));
    }
  }, [canNavigateNext, selectedIndex, items, getId]);

  // Réinitialiser
  const reset = useCallback(() => {
    setSelectedId(null);
    setIsOpen(false);
  }, []);

  return {
    // État
    selectedId,
    selectedItem,
    selectedIndex,
    isOpen,
    
    // Navigation
    canNavigatePrev,
    canNavigateNext,
    handlePrevious,
    handleNext,
    
    // Actions
    handleOpen,
    handleClose,
    reset,
    
    // Helpers
    setSelectedId,
    setIsOpen,
  };
}

