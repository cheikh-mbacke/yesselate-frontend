/**
 * Hook pour charger et afficher une vue depuis le registry
 * Gère le cache et le chargement des données via le store Zustand
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry, navToKey, type NavKey, type ViewEntry } from './dashboardRegistry';

export function useDashboardView() {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const cache = useDashboardCommandCenterStore((state) => state.cache);
  const setCache = useDashboardCommandCenterStore((state) => state.setCache);
  
  const navKey: NavKey = useMemo(() => ({
    main: navigation.mainCategory,
    sub: navigation.subCategory,
    subSub: navigation.subSubCategory,
  }), [navigation.mainCategory, navigation.subCategory, navigation.subSubCategory]);

  const key = useMemo(() => navToKey(navKey), [navKey]);
  const entry = useMemo(() => dashboardRegistry[key], [key]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entry) {
      setData(null);
      setError(new Error(`Vue non trouvée pour la clé: ${key}`));
      return;
    }

    // Vérifier le cache depuis le store
    const cached = cache[key];
    const now = Date.now();
    
    if (cached && (now - cached.fetchedAt) < cached.ttl) {
      setData(cached.data);
      setError(null);
      return;
    }

    // Si pas de loader, vue pure
    if (!entry.loader) {
      setData({});
      setError(null);
      return;
    }

    // Charger les données
    setLoading(true);
    setError(null);
    
    entry.loader(navKey)
      .then((result) => {
        // Mettre en cache dans le store
        setCache(key, {
          data: result.data,
          fetchedAt: result.fetchedAt,
          ttl: entry.ttl || 60_000,
        });
        setData(result.data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, entry, navKey, cache, setCache]);

  return {
    entry,
    data,
    loading,
    error,
    navKey,
  };
}

