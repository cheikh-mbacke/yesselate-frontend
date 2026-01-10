'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { WorkspaceTabBar, WorkspaceTabItem } from '@/components/ui/workspace-tab-bar';

/**
 * CalendarWorkspaceTabs
 * =======================
 * 
 * Utilise le composant générique WorkspaceTabBar (fix du bug button-in-button).
 * Gère aussi la navigation clavier (Ctrl+Tab, Ctrl+W).
 */
export function CalendarWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeAll } = useCalendarWorkspaceStore();

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
    if (!e.ctrlKey) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentIdx = tabs.findIndex(t => t.id === activeTabId);
      if (currentIdx === -1) return;
      
      const nextIdx = e.shiftKey 
        ? (currentIdx - 1 + tabs.length) % tabs.length
        : (currentIdx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx].id);
    }
    
    if (e.key === 'w' || e.key === 'W') {
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

