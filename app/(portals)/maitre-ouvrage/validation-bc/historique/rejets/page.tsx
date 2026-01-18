/**
 * Route: /maitre-ouvrage/validation-bc/historique/rejets
 * Page Historique des rejets
 */

'use client';

import { HistoriqueRejetsPage } from '@/modules/validation-bc/pages/historique/HistoriqueRejetsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function HistoriqueRejetsPageRoute() {
  return (
    <ToastProvider>
      <HistoriqueRejetsPage />
    </ToastProvider>
  );
}
