/**
 * Page : Par statut > En attente
 */

'use client';

import React from 'react';
import { useContratsByStatut } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { Clock } from 'lucide-react';

interface EnAttentePageProps {
  filterService?: string;
}

export function EnAttentePage({ filterService }: EnAttentePageProps = {}) {
  const { data: contrats, isLoading, error } = useContratsByStatut('EN_ATTENTE');

  // Filtrer par service si spécifié (niveau 3)
  const filteredContrats = React.useMemo(() => {
    if (!contrats || !filterService) return contrats;
    return contrats.filter((c) => c.service === filterService);
  }, [contrats, filterService]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats en attente...</div>
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
          <Clock className="h-5 w-5" />
          <span>Aucun contrat en attente</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Contrats en attente
          {filterService && <span className="text-sm text-slate-400 ml-2">- {filterService}</span>}
        </h2>
        <span className="text-sm text-slate-400">{displayContrats.length} contrat(s)</span>
      </div>
      <div className="grid gap-4">
        {displayContrats.map((contrat) => (
          <ContratCard key={contrat.id} contrat={contrat} />
        ))}
      </div>
    </div>
  );
}

