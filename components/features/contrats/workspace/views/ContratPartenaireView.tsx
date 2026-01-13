'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

export function ContratPartenaireView({ partnerId, tabId }: { partnerId: string; tabId: string }) {
  return (
    <div className="p-8 text-center">
      <Building2 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
        Fiche partenaire
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        ID: {partnerId}
      </p>
      <p className="text-sm text-slate-500 mt-4">
        Cette vue affichera l'historique des contrats avec ce partenaire
      </p>
    </div>
  );
}

