/**
 * Hook pour charger les statistiques des délégations
 * Utilisé pour mettre à jour les KPIs et badges dynamiquement
 */

import { useState, useEffect, useCallback } from 'react';

export interface DelegationStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon: number;
  totalUsage: number;
  byBureau: { bureau: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: Array<{
    id: string;
    delegationId: string;
    delegationType: string;
    agentName: string;
    action: string;
    actorName: string;
    details: string | null;
    createdAt: string;
  }>;
  ts: string;
}

type LoadReason = 'init' | 'manual' | 'auto';

export function useDelegationsStats(autoRefresh = false, refreshInterval = 30000) {
  const [stats, setStats] = useState<DelegationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/delegations/stats', {
        cache: 'no-store',
        headers: { 'x-bmo-reason': reason },
      });

      if (!res.ok) {
        const errorMsg = `Stats indisponibles (HTTP ${res.status})`;
        setStats(null);
        setError(errorMsg);
        return;
      }

      const data = (await res.json()) as DelegationStats;
      setStats(data);
      setLastUpdate(new Date());
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      const errorMsg = 'Impossible de charger les stats (réseau ou API).';
      setStats(null);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadStats('init');
  }, [loadStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats('auto');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadStats]);

  return {
    stats,
    loading,
    error,
    lastUpdate,
    refresh: () => loadStats('manual'),
  };
}

