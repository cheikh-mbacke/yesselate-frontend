/**
 * Page Calendrier & Planification v3.0 - Page racine
 * Redirige vers la vue d'ensemble par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CalendrierOverviewPage } from '@/modules/calendrier/pages/overview/CalendrierOverviewPage';

export default function CalendrierPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine, rediriger vers la vue d'ensemble
    if (pathname === '/maitre-ouvrage/calendrier' || pathname === '/maitre-ouvrage/calendrier/') {
      router.replace('/maitre-ouvrage/calendrier/vue-ensemble');
    }
  }, [pathname, router]);

  // Afficher la vue d'ensemble pendant la redirection
  return <CalendrierOverviewPage />;
}
