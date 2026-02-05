/**
 * Route: /maitre-ouvrage/validation-bc/types/bc
 * Page Bons de Commande
 */

'use client';

import { BonsCommandePage } from '@/modules/validation-bc/pages/types/BonsCommandePage';
import { ToastProvider } from '@/components/ui/toast';

export default function BCPage() {
  return (
    <ToastProvider>
      <BonsCommandePage />
    </ToastProvider>
  );
}
