/**
 * Route: /maitre-ouvrage/validation-bc/overview/stats
 * Page Statistiques
 */

'use client';

import { StatsPage } from '@/modules/validation-bc/pages/overview/StatsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function OverviewStatsPage() {
  return (
    <ToastProvider>
      <StatsPage />
    </ToastProvider>
  );
}
