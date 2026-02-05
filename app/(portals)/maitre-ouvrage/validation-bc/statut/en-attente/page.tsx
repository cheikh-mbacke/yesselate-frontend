/**
 * Route: /maitre-ouvrage/validation-bc/statut/en-attente
 * Page Documents en attente
 */

'use client';

import { EnAttentePage } from '@/modules/validation-bc/pages/statut/EnAttentePage';
import { ToastProvider } from '@/components/ui/toast';

export default function EnAttentePageRoute() {
  return (
    <ToastProvider>
      <EnAttentePage />
    </ToastProvider>
  );
}
