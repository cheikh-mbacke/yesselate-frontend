/**
 * Route: /maitre-ouvrage/validation-bc/analyse/tendances
 * Page Analyse Tendances
 */

'use client';

import { TendancesPage } from '@/modules/validation-bc/pages/analyse/TendancesPage';
import { ToastProvider } from '@/components/ui/toast';

export default function AnalyseTendancesPageRoute() {
  return (
    <ToastProvider>
      <TendancesPage />
    </ToastProvider>
  );
}
