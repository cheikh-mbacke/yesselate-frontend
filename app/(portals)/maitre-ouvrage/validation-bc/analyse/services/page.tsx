/**
 * Route: /maitre-ouvrage/validation-bc/analyse/services
 * Page Services
 */

'use client';

import { ServicesPage } from '@/modules/validation-bc/pages/analyse/ServicesPage';
import { ToastProvider } from '@/components/ui/toast';

export default function ServicesPageRoute() {
  return (
    <ToastProvider>
      <ServicesPage />
    </ToastProvider>
  );
}
