'use client';

import { useEffect } from 'react';

type ShortcutHandler = () => void;

type Shortcuts = {
  onCommandPalette?: ShortcutHandler; // Ctrl/Cmd+K
  onFilters?: ShortcutHandler;        // Ctrl/Cmd+F
  onExport?: ShortcutHandler;         // Ctrl/Cmd+E
  onFullscreen?: ShortcutHandler;     // F11
  onBack?: ShortcutHandler;           // Alt+Left
  onToggleSidebar?: ShortcutHandler;  // Ctrl/Cmd+B
  onStats?: ShortcutHandler;          // Ctrl/Cmd+I
  onShortcutsHelp?: ShortcutHandler;  // ?
};

export function useCommandCenterShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (target as any).isContentEditable) return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key.toLowerCase() === 'k' && shortcuts.onCommandPalette) {
        e.preventDefault();
        shortcuts.onCommandPalette();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'f' && shortcuts.onFilters) {
        e.preventDefault();
        shortcuts.onFilters();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'e' && shortcuts.onExport) {
        e.preventDefault();
        shortcuts.onExport();
        return;
      }

      if (e.key === 'F11' && shortcuts.onFullscreen) {
        e.preventDefault();
        shortcuts.onFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft' && shortcuts.onBack) {
        e.preventDefault();
        shortcuts.onBack();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'b' && shortcuts.onToggleSidebar) {
        e.preventDefault();
        shortcuts.onToggleSidebar();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'i' && shortcuts.onStats) {
        e.preventDefault();
        shortcuts.onStats();
        return;
      }

      if (e.key === '?' && !isMod && !e.altKey && shortcuts.onShortcutsHelp) {
        e.preventDefault();
        shortcuts.onShortcutsHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

