/**
 * Hook pour gérer les raccourcis clavier dans Analytics BTP
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === (e.ctrlKey || e.metaKey);
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === e.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === e.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === e.altKey;

        return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        e.stopPropagation();
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Raccourcis standards pour Analytics BTP
 * Note: Les actions doivent être injectées dynamiquement via useKeyboardShortcuts
 * car elles nécessitent l'accès au store
 */
export const getAnalyticsShortcuts = (actions: {
  openSearch?: () => void;
  setViewMode?: (mode: 'grid' | 'dashboard' | 'comparative') => void;
  openExport?: () => void;
  toggleFilters?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'k',
    metaKey: true,
    description: 'Ouvrir la recherche',
    action: () => {
      actions.openSearch?.();
    },
  },
  {
    key: '1',
    metaKey: true,
    description: 'Vue Grille',
    action: () => {
      actions.setViewMode?.('grid');
    },
  },
  {
    key: '2',
    metaKey: true,
    description: 'Vue Dashboard',
    action: () => {
      actions.setViewMode?.('dashboard');
    },
  },
  {
    key: '3',
    metaKey: true,
    description: 'Vue Comparatif',
    action: () => {
      actions.setViewMode?.('comparative');
    },
  },
  {
    key: 'e',
    metaKey: true,
    description: 'Exporter',
    action: () => {
      actions.openExport?.();
    },
  },
  {
    key: 'f',
    metaKey: true,
    description: 'Filtres',
    action: () => {
      actions.toggleFilters?.();
    },
  },
];

