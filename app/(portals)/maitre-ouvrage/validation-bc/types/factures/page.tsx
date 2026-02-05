/**
 * Route: /maitre-ouvrage/validation-bc/types/factures
 * Page Factures
 */

'use client';

import { FacturesPage } from '@/modules/validation-bc/pages/types/FacturesPage';
import { ToastProvider } from '@/components/ui/toast';

export default function FacturesPageRoute() {
  return (
    <ToastProvider>
      <FacturesPage />
    </ToastProvider>
  );
}
