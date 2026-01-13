// ============================================
// Hook pour debouncer une valeur
// Utile pour les recherches et autres inputs
// ============================================

import { useEffect, useState } from 'react';

/**
 * Hook pour debouncer une valeur
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes (défaut: 300ms)
 * @returns La valeur debounced
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

