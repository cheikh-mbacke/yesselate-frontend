/**
 * Route: /maitre-ouvrage/validation-bc/historique/validations
 * Page Historique des validations
 */

'use client';

import { HistoriqueValidationsPage } from '@/modules/validation-bc/pages/historique/HistoriqueValidationsPage';
import { ToastProvider } from '@/components/ui/toast';

export default function HistoriqueValidationsPageRoute() {
  return (
    <ToastProvider>
      <HistoriqueValidationsPage />
    </ToastProvider>
  );
}
