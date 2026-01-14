/**
 * Route: /maitre-ouvrage/alerts/critiques
 * Page principale Alertes critiques - Redirige vers paiements par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PaiementsBloquesPage } from '@/modules/centre-alertes/pages/critiques/PaiementsBloquesPage';

export default function CritiquesPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine critiques, rediriger vers paiements
    if (pathname === '/maitre-ouvrage/alerts/critiques' || pathname === '/maitre-ouvrage/alerts/critiques/') {
      router.replace('/maitre-ouvrage/alerts/critiques/paiements');
    }
  }, [pathname, router]);

  // Afficher la page paiements pendant la redirection
  return <PaiementsBloquesPage />;
}

