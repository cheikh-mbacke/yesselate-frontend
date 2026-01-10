'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { WorkspaceTabBar, WorkspaceTabItem } from '@/components/ui/workspace-tab-bar';

/**
 * AlertWorkspaceTabs
 * ==================
 * 
 * Utilise le composant générique WorkspaceTabBar (fix du bug button-in-button).
 * Gère aussi la navigation clavier (Ctrl+Tab, Ctrl+W, Delete, Backspace).
 */
export function AlertWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeAll } = useAlertWorkspaceStore();

  // Convertir les tabs du store vers le format du composant générique
  const tabItems: WorkspaceTabItem[] = useMemo(() => {
    return tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      icon: tab.icon ? <span>{tab.icon}</span> : undefined,
      isDirty: tab.isDirty,
      closeable: true,
    }));
  }, [tabs]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+Tab / Ctrl+Shift+Tab : Navigation entre onglets
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      const currentIdx = tabs.findIndex(t => t.id === activeTabId);
      if (currentIdx === -1) return;
      
      const nextIdx = e.shiftKey 
        ? (currentIdx - 1 + tabs.length) % tabs.length
        : (currentIdx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx].id);
      return;
    }
    
    // Ctrl+W : Fermer l'onglet actif
    if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
      return;
    }
    
    // Delete ou Backspace : Fermer l'onglet actif (si pas dans un input)
    if ((e.key === 'Delete' || e.key === 'Backspace')) {
      const target = e.target as HTMLElement;
      // Ne pas fermer si on est dans un input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (target.isContentEditable) return;
      
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
    }
  }, [tabs, activeTabId, setActiveTab, closeTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (tabs.length === 0) return null;

  return (
    <WorkspaceTabBar
      tabs={tabItems}
      activeId={activeTabId}
      onActivate={setActiveTab}
      onClose={closeTab}
      showCloseAll={tabs.length > 1}
      onCloseAll={closeAll}
    />
  );
}

