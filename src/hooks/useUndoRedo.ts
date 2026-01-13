// ============================================
// Hook pour gérer un système d'historique (Undo/Redo)
// ============================================

import { useState, useCallback, useRef } from 'react';

/**
 * Hook pour gérer l'historique d'un état avec undo/redo
 * @param initialState - État initial
 * @param maxHistorySize - Taille maximale de l'historique (défaut: 50)
 */
export function useUndoRedo<T>(initialState: T, maxHistorySize: number = 50) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIndexRef = useRef(0);

  const currentState = history[historyIndex];

  const updateState = useCallback(
    (newState: T) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndexRef.current + 1);
        newHistory.push(newState);
        const trimmed = newHistory.slice(-maxHistorySize);
        historyIndexRef.current = trimmed.length - 1;
        setHistoryIndex(trimmed.length - 1);
        return trimmed;
      });
    },
    [maxHistorySize]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      return true;
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < history.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      return true;
    }
    return false;
  }, [history.length]);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    historyIndexRef.current = 0;
    setHistoryIndex(0);
  }, []);

  return {
    currentState,
    updateState,
    undo,
    redo,
    reset,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    historyLength: history.length,
  };
}

