// ============================================
// Hook pour gérer les raccourcis clavier de la page Governance
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import type { TabValue } from './useGovernanceFilters';

export interface UseGovernanceKeyboardShortcutsProps {
  activeTab: TabValue;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onTabChange: (tab: TabValue) => void;
  onFocusModeToggle: () => void;
  onShortcutsToggle: () => void;
  onCloseModals: () => void;
  // RACI shortcuts
  onToggleComparator: () => void;
  onToggleHeatmap: () => void;
  onToggleAISuggestions: () => void;
  // Alerts shortcuts
  onBulkAcknowledge: () => void;
  onBulkResolve: () => void;
  canBulkAction: boolean;
  addToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

/**
 * Hook pour gérer tous les raccourcis clavier de la page Governance
 */
export function useGovernanceKeyboardShortcuts({
  activeTab,
  searchInputRef,
  onTabChange,
  onFocusModeToggle,
  onShortcutsToggle,
  onCloseModals,
  onToggleComparator,
  onToggleHeatmap,
  onToggleAISuggestions,
  onBulkAcknowledge,
  onBulkResolve,
  canBulkAction,
  addToast,
}: UseGovernanceKeyboardShortcutsProps) {
  // Handler pour les raccourcis clavier
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignorer si dans un input/textarea (sauf Escape)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key !== 'Escape') return;
      }

      // / pour focus recherche
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Escape pour fermer modals/panels
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseModals();
        return;
      }

      // Tab switching: 1 = RACI, 2 = Alertes
      if (e.key === '1' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onTabChange('raci');
        return;
      }
      if (e.key === '2' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onTabChange('alerts');
        return;
      }

      // Navigation dans les alertes (si onglet alertes actif)
      if (activeTab === 'alerts' && !e.ctrlKey && !e.metaKey) {
        if (e.key === 'a' && canBulkAction) {
          e.preventDefault();
          onBulkAcknowledge();
          return;
        }
        if (e.key === 'r' && canBulkAction) {
          e.preventDefault();
          onBulkResolve();
          return;
        }
      }

      // RACI shortcuts
      if (activeTab === 'raci') {
        if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onToggleComparator();
          return;
        }
        if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onToggleHeatmap();
          return;
        }
      }

      // Toggle suggestions IA
      if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggleAISuggestions();
        return;
      }

      // Afficher raccourcis
      if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onShortcutsToggle();
        return;
      }

      // Mode Focus
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onFocusModeToggle();
        return;
      }
    },
    [
      activeTab,
      canBulkAction,
      searchInputRef,
      onTabChange,
      onFocusModeToggle,
      onShortcutsToggle,
      onCloseModals,
      onToggleComparator,
      onToggleHeatmap,
      onToggleAISuggestions,
      onBulkAcknowledge,
      onBulkResolve,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

