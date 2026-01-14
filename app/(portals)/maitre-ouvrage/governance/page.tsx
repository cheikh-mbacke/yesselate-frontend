/**
 * Page Centre de Commande – Gouvernance - Page racine
 * Redirige vers le tableau de bord exécutif par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TableauBordPage from '@/modules/gouvernance/pages/dashboard/TableauBordPage';

export default function GouvernancePage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine, rediriger vers le tableau de bord
    if (pathname === '/maitre-ouvrage/governance' || pathname === '/maitre-ouvrage/governance/') {
      router.replace('/maitre-ouvrage/governance/dashboard');
    }
  }, [pathname, router]);

  // Afficher le tableau de bord pendant la redirection
  return <TableauBordPage />;
}
