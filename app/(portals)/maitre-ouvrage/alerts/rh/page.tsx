/**
 * Route: /maitre-ouvrage/alerts/rh
 * Page principale Alertes RH - Redirige vers absences par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AbsencesBloquantesPage } from '@/modules/centre-alertes/pages/rh/AbsencesBloquantesPage';

export default function RhPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine RH, rediriger vers absences
    if (pathname === '/maitre-ouvrage/alerts/rh' || pathname === '/maitre-ouvrage/alerts/rh/') {
      router.replace('/maitre-ouvrage/alerts/rh/absences');
    }
  }, [pathname, router]);

  // Afficher la page absences pendant la redirection
  return <AbsencesBloquantesPage />;
}

