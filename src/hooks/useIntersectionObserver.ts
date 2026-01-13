// ============================================
// Hook pour observer l'intersection d'un élément avec le viewport
// Utile pour le lazy loading progressif
// ============================================

import { useState, useEffect, RefObject } from 'react';

/**
 * Hook pour observer si un élément est visible dans le viewport
 * @param ref - Référence à l'élément à observer
 * @param options - Options pour l'IntersectionObserver
 * @returns true si l'élément est visible
 */
export function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '50px', // Charger 50px avant d'être visible
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
}

