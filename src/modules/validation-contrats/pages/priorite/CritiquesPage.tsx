/**
 * Page : Contrats à valider > Critiques
 */

'use client';

import React from 'react';
import { useContratsByPriorite } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { AlertCircle } from 'lucide-react';

interface CritiquesPageProps {
  filterService?: string;
}

export function CritiquesPage({ filterService }: CritiquesPageProps = {}) {
  const { data: contrats, isLoading, error } = useContratsByPriorite('CRITICAL');

  const filteredContrats = React.useMemo(() => {
    if (!contrats || !filterService) return contrats;
    return contrats.filter((c) => c.service === filterService);
  }, [contrats, filterService]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats critiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement</div>
      </div>
    );
  }

  const displayContrats = filteredContrats || contrats;

  if (!displayContrats || displayContrats.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <AlertCircle className="h-5 w-5" />
          <span>Aucun contrat critique</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Contrats critiques
          {filterService && <span className="text-sm text-slate-400 ml-2">- {filterService}</span>}
        </h2>
        <span className="text-sm text-red-400 font-medium">{displayContrats.length} contrat(s)</span>
      </div>
      <div className="grid gap-4">
        {displayContrats.map((contrat) => (
          <ContratCard key={contrat.id} contrat={contrat} />
        ))}
      </div>
    </div>
  );
}

