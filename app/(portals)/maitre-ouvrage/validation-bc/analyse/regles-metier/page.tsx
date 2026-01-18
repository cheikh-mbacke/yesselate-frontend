/**
 * Route: /maitre-ouvrage/validation-bc/analyse/regles-metier
 * Page Règles métier
 */

'use client';

import { ReglesMetierPage } from '@/modules/validation-bc/pages/analyse/ReglesMetierPage';
import { ToastProvider } from '@/components/ui/toast';

export default function ReglesMetierPageRoute() {
  return (
    <ToastProvider>
      <ReglesMetierPage />
    </ToastProvider>
  );
}

