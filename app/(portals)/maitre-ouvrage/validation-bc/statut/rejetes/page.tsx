/**
 * Route: /maitre-ouvrage/validation-bc/statut/rejetes
 * Page Documents rejetés
 */

'use client';

import { RejetesPage } from '@/modules/validation-bc/pages/statut/RejetesPage';
import { ToastProvider } from '@/components/ui/toast';

export default function RejetesPageRoute() {
  return (
    <ToastProvider>
      <RejetesPage />
    </ToastProvider>
  );
}
