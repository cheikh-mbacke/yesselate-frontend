'use client';

import { useState, useEffect } from 'react';

/**
 * Component to display keyboard shortcuts with platform-specific formatting
 * Prevents hydration errors by detecting platform only on the client side
 */
export function KeyboardShortcut({ shortcut }: { shortcut: string }) {
  const [displayShortcut, setDisplayShortcut] = useState(shortcut);

  useEffect(() => {
    // Only detect platform on client side after hydration
    const isMacPlatform = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || 
                          /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (!isMacPlatform) {
      // Replace ⌘ with Ctrl on Windows/Linux
      setDisplayShortcut(shortcut.replace(/⌘/g, 'Ctrl'));
    }
  }, [shortcut]);

  return <>{displayShortcut}</>;
}
