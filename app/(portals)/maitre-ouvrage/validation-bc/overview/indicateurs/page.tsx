/**
 * Route: /maitre-ouvrage/validation-bc/overview/indicateurs
 * Page Indicateurs en temps réel
 */

'use client';

import { IndicateursPage } from '@/modules/validation-bc/pages/overview/IndicateursPage';
import { ToastProvider } from '@/components/ui/toast';

export default function OverviewIndicateursPage() {
  return (
    <ToastProvider>
      <IndicateursPage />
    </ToastProvider>
  );
}
