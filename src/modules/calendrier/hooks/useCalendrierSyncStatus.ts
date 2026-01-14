/**
 * Hook pour récupérer l'état de synchronisation des modules
 * Utilisé par le Poste de contrôle Calendrier
 */

import { useState, useEffect } from 'react';
import { getSyncStatus } from '../api/calendrierApi';
import type { SyncStatus } from '../types/calendrierTypes';

interface UseCalendrierSyncStatusResult {
  statuts: SyncStatus[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCalendrierSyncStatus(): UseCalendrierSyncStatusResult {
  const [statuts, setStatuts] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSyncStatus();
      setStatuts(response.statuts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    statuts,
    loading,
    error,
    refetch: fetchData,
  };
}

