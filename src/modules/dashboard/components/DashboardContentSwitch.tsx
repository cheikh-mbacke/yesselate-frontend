'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry, navToKey, type NavKey } from '../registry/dashboardRegistry';

function resolveViewKey(nav: NavKey) {
  // fallback intelligent si un niveau manque
  const main = nav.main;
  const sub = nav.sub ?? 'summary';
  const subSub = nav.subSub ?? 'dashboard';
  return `${main}::${sub}::${subSub}`;
}

export function DashboardContentSwitch() {
  const navState = useDashboardCommandCenterStore((s) => s.navigation);
  const cache = useDashboardCommandCenterStore((s) => s.cache);
  const setCache = useDashboardCommandCenterStore((s) => s.setCache);

  const nav: NavKey = useMemo(
    () => ({
      main: navState.mainCategory,
      sub: navState.subCategory,
      subSub: navState.subSubCategory,
    }),
    [navState.mainCategory, navState.subCategory, navState.subSubCategory]
  );

  const viewKey = useMemo(() => resolveViewKey(nav), [nav]);
  const view = dashboardRegistry[viewKey];

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError(null);

      if (!view) {
        setData(null);
        return;
      }

      // si pas de loader, vue statique
      if (!view.loader) {
        setData(null);
        return;
      }

      const key = navToKey(nav);
      const ttl = view.ttl ?? 30_000;
      const cached = cache[key];

      const isFresh =
        cached && Date.now() - cached.fetchedAt < (cached.ttl ?? ttl);

      if (isFresh) {
        setData(cached.data);
        return;
      }

      setLoading(true);
      try {
        const res = await view.loader(nav);
        if (cancelled) return;
        setData(res.data);
        setCache(key, { data: res.data, fetchedAt: res.fetchedAt, ttl });
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [viewKey, view, nav, cache, setCache]);

  if (!view) {
    return (
      <div className="p-6 text-sm text-slate-300">
        Vue introuvable pour <span className="font-mono">{viewKey}</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[300px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm z-10">
          <div className="text-sm text-slate-200 px-3 py-2 rounded-xl border border-slate-700/40 bg-slate-900/60">
            Chargement…
          </div>
        </div>
      )}

      {error && (
        <div className={cn("p-4 m-4 rounded-xl border", "bg-red-500/10 border-red-500/30 text-red-200")}>
          {error}
        </div>
      )}

      {view.render({ nav, data })}
    </div>
  );
}

