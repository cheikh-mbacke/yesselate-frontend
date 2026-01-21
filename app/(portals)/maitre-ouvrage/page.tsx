/**
 * Dashboard Maître d'Ouvrage - Page racine
 * Redirige vers /maitre-ouvrage/dashboard par défaut
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Charger le nouveau dashboard dynamiquement
const DashboardContentPage = dynamic(
  () => import('./dashboard/page').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement du dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine, rediriger vers /dashboard
    if (pathname === '/maitre-ouvrage' || pathname === '/maitre-ouvrage/') {
      router.replace('/maitre-ouvrage/dashboard');
    }
  }, [pathname, router]);

  // Afficher le nouveau dashboard pendant la redirection
  return <DashboardContentPage />;
}

