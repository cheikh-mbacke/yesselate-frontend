/**
 * Route: /maitre-ouvrage/validation-bc/statut/urgents
 * Page Documents urgents
 */

'use client';

import { UrgentsPage } from '@/modules/validation-bc/pages/statut/UrgentsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function UrgentsPageRoute() {
  return (
    <ToastProvider>
      <UrgentsPage />
    </ToastProvider>
  );
}
