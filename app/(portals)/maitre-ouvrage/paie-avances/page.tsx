'use client';

/**
 * ========================================
 * PAGE FUSIONNÉE - REDIRECTION
 * ========================================
 * 
 * Cette page a été fusionnée dans demandes-rh.
 * Les demandes de paie & avances sont maintenant un onglet
 * dans la page centrale "Demandes RH".
 * 
 * Date: 10/01/2026
 * Raison: Élimination des redondances - même source de données
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaieAvancesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection vers demandes-rh avec le filtre paie
    router.replace('/maitre-ouvrage/demandes-rh?tab=paie-avances');
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h1 className="text-xl font-semibold text-slate-200 mb-2">
          Redirection en cours...
        </h1>
        <p className="text-sm text-slate-400">
          Cette page a été fusionnée dans "Demandes RH"
        </p>
      </div>
    </div>
  );
}
