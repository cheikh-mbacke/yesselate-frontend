/**
 * Hook pour la navigation entre documents Validation BC
 * Utilisé avec ValidationBCDetailModal pour la navigation ← →
 * Pattern similaire à useListNavigation mais adapté pour Validation BC
 */

import { useState, useCallback, useMemo } from 'react';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

export function useValidationBCListNavigation(documents: ValidationDocument[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = documents.find((item) => item.id === selectedId);
  const selectedIndex = selectedItem ? documents.indexOf(selectedItem) : -1;

  const canGoNext = selectedIndex < documents.length - 1;
  const canGoPrevious = selectedIndex > 0;

  const handleNext = useCallback(() => {
    if (canGoNext && selectedIndex < documents.length - 1) {
      setSelectedId(documents[selectedIndex + 1].id);
    }
  }, [canGoNext, selectedIndex, documents]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious && selectedIndex > 0) {
      setSelectedId(documents[selectedIndex - 1].id);
    }
  }, [canGoPrevious, selectedIndex, documents]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleOpen = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return {
    selectedId,
    selectedItem,
    isOpen: selectedId !== null,
    canGoNext,
    canGoPrevious,
    handleNext: canGoNext ? handleNext : undefined,
    handlePrevious: canGoPrevious ? handlePrevious : undefined,
    handleClose,
    handleOpen,
  };
}

