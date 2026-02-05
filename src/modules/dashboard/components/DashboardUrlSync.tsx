'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

export function DashboardUrlSync() {
  const router = useRouter();
  const sp = useSearchParams();

  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  // 1) URL -> store (au montage)
  useEffect(() => {
    const main = sp.get('main') as DashboardMainCategory | null;
    const sub = sp.get('sub');
    const subSub = sp.get('subSub');

    if (main) {
      navigate(main, sub ?? null, subSub ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) store -> URL (à chaque changement)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('main', nav.mainCategory);
    if (nav.subCategory) params.set('sub', nav.subCategory);
    if (nav.subSubCategory) params.set('subSub', nav.subSubCategory);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [nav.mainCategory, nav.subCategory, nav.subSubCategory, router]);

  return null;
}

