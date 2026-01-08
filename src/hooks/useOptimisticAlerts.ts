// ============================================
// Hook pour gérer les optimistic updates sur les alertes
// ============================================

import { useState, useMemo, useCallback } from 'react';
import type { Alert } from '@/lib/types/alerts.types';

interface OptimisticUpdate<T extends Alert> {
  alertId: string;
  updates: Partial<T>;
  timestamp: number;
}

/**
 * Hook pour gérer les optimistic updates sur les alertes
 * @param alerts - Liste des alertes
 * @param onUpdate - Fonction pour mettre à jour une alerte (appel API)
 */
export function useOptimisticAlerts<T extends Alert>(
  alerts: T[],
  onUpdate: (alertId: string, updates: Partial<T>) => Promise<void>
) {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate<T>>>(
    new Map()
  );

  const applyOptimisticUpdate = useCallback(
    async (alertId: string, updates: Partial<T>) => {
      // Mise à jour optimiste immédiate
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(alertId, {
          alertId,
          updates,
          timestamp: Date.now(),
        });
        return next;
      });

      try {
        // Appel API réel
        await onUpdate(alertId, updates);

        // Succès : retirer l'update optimiste après un court délai
        setTimeout(() => {
          setOptimisticUpdates((prev) => {
            const next = new Map(prev);
            next.delete(alertId);
            return next;
          });
        }, 100);
      } catch (error) {
        // Erreur : rollback immédiat
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(alertId);
          return next;
        });
        throw error;
      }
    },
    [onUpdate]
  );

  // Appliquer les updates optimistes aux alertes
  const optimisticAlerts = useMemo(() => {
    return alerts.map((alert) => {
      const update = optimisticUpdates.get(alert.id);
      if (update) {
        return { ...alert, ...update.updates };
      }
      return alert;
    });
  }, [alerts, optimisticUpdates]);

  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticUpdates(new Map());
  }, []);

  return {
    optimisticAlerts,
    applyOptimisticUpdate,
    clearOptimisticUpdates,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
  };
}

