/**
 * Route: /maitre-ouvrage/alerts/projets
 * Page principale Alertes projets - Redirige vers retards par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RetardsDetectesPage } from '@/modules/centre-alertes/pages/projets/RetardsDetectesPage';

export default function ProjetsPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine projets, rediriger vers retards
    if (pathname === '/maitre-ouvrage/alerts/projets' || pathname === '/maitre-ouvrage/alerts/projets/') {
      router.replace('/maitre-ouvrage/alerts/projets/retards');
    }
  }, [pathname, router]);

  // Afficher la page retards pendant la redirection
  return <RetardsDetectesPage />;
}

