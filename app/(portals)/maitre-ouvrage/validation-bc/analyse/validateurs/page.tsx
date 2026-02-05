/**
 * Route: /maitre-ouvrage/validation-bc/analyse/validateurs
 * Page Validateurs
 */

'use client';

import { ValidateursPage } from '@/modules/validation-bc/pages/analyse/ValidateursPage';
import { ToastProvider } from '@/components/ui/toast';

export default function ValidateursPageRoute() {
  return (
    <ToastProvider>
      <ValidateursPage />
    </ToastProvider>
  );
}
