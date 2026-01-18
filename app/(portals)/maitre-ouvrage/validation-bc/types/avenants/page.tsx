/**
 * Route: /maitre-ouvrage/validation-bc/types/avenants
 * Page Avenants
 */

'use client';

import { AvenantsPage } from '@/modules/validation-bc/pages/types/AvenantsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function AvenantsPageRoute() {
  return (
    <ToastProvider>
      <AvenantsPage />
    </ToastProvider>
  );
}
