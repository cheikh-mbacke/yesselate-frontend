/**
 * useMediaQuery Hook
 * Hook pour détecter les media queries
 */

import { useState, useEffect } from 'react';

/**
 * Hook pour détecter une media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Vérifier immédiatement
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Écouter les changements
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Utiliser addEventListener si disponible (plus moderne)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback pour les anciens navigateurs
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

/**
 * Hook pour détecter si on est sur mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook pour détecter si on est sur tablette
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * Hook pour détecter si on est sur desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

