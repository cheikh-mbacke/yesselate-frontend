/**
 * Route: /maitre-ouvrage/validation-bc/overview/tendances
 * Page Tendances
 */

'use client';

import { TrendsPage } from '@/modules/validation-bc/pages/overview/TrendsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function OverviewTrendsPage() {
  return (
    <ToastProvider>
      <TrendsPage />
    </ToastProvider>
  );
}
