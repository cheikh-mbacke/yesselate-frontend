/**
 * Page : Par statut > En négociation
 */

'use client';

import React from 'react';
import { useContratsByStatut } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { MessageSquare } from 'lucide-react';

interface NegociationPageProps {
  filterActifs?: boolean;
}

export function NegociationPage({ filterActifs }: NegociationPageProps = {}) {
  const { data: contrats, isLoading, error } = useContratsByStatut('NEGOCIATION');

  const filteredContrats = React.useMemo(() => {
    if (!contrats || filterActifs === undefined) return contrats;
    // Si filterActifs, on considère actifs ceux qui ont des commentaires récents
    if (filterActifs) {
      return contrats.filter((c) => c.commentaires && c.commentaires.length > 0);
    }
    return contrats;
  }, [contrats, filterActifs]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats en négociation...</div>
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
          <MessageSquare className="h-5 w-5" />
          <span>Aucun contrat en négociation</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Contrats en négociation</h2>
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

