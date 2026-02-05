/**
 * Route: /maitre-ouvrage/alerts/sla
 * Page principale Alertes SLA - Redirige vers depasse par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SlaDepassesPage } from '@/modules/centre-alertes/pages/sla/SlaDepassesPage';

export default function SlaPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine SLA, rediriger vers depasse
    if (pathname === '/maitre-ouvrage/alerts/sla' || pathname === '/maitre-ouvrage/alerts/sla/') {
      router.replace('/maitre-ouvrage/alerts/sla/depasse');
    }
  }, [pathname, router]);

  // Afficher la page depasse pendant la redirection
  return <SlaDepassesPage />;
}

