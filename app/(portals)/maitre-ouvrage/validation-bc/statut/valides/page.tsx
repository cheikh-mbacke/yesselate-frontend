/**
 * Route: /maitre-ouvrage/validation-bc/statut/valides
 * Page Documents validés
 */

'use client';

import { ValidesPage } from '@/modules/validation-bc/pages/statut/ValidesPage';
import { ToastProvider } from '@/components/ui/toast';

export default function ValidesPageRoute() {
  return (
    <ToastProvider>
      <ValidesPage />
    </ToastProvider>
  );
}
