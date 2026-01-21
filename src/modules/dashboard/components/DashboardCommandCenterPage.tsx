'use client';

import { DashboardSidebar } from '../navigation/DashboardSidebar';
import { DashboardSubNavigation } from '../navigation/DashboardSubNavigation';
import { DashboardContentSwitch } from './DashboardContentSwitch';
import { DashboardUrlSync } from './DashboardUrlSync';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

export default function DashboardCommandCenterPage() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  return (
    <>
      {/* Synchronisation URL <-> Store */}
      <DashboardUrlSync />
      
      <div className="flex h-screen">
        <DashboardSidebar
          activeCategory={nav.mainCategory}
          activeSubCategory={nav.subCategory ?? undefined}
          onCategoryChange={(main, sub) => navigate(main as DashboardMainCategory, sub ?? null, null)}
        />

        <div className="flex-1 overflow-auto">
          <DashboardSubNavigation
            mainCategory={nav.mainCategory}
            subCategory={nav.subCategory ?? undefined}
            subSubCategory={nav.subSubCategory ?? undefined}
            onSubCategoryChange={(sub) => navigate(nav.mainCategory, sub, null)}
            onSubSubCategoryChange={(subSub, sub) => navigate(nav.mainCategory, sub ?? nav.subCategory, subSub)}
          />
          <DashboardContentSwitch />
        </div>
      </div>
    </>
  );
}

