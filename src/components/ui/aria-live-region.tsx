// ============================================
// Composant pour les annonces ARIA live
// ============================================

import { useEffect, useRef } from 'react';

interface AriaLiveRegionProps {
  message: string | null;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * Composant pour annoncer des changements aux lecteurs d'écran
 */
export function AriaLiveRegion({ message, priority = 'polite', className }: AriaLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Réinitialiser le contenu pour forcer l'annonce
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={className || 'sr-only'}
    />
  );
}
