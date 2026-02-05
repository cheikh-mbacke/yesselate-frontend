/**
 * Page : Par statut > Rejetés
 */

'use client';

import React from 'react';
import { useContratsByStatut } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { XCircle } from 'lucide-react';

interface RejetesPageProps {
  filterRecent?: boolean;
}

export function RejetesPage({ filterRecent }: RejetesPageProps = {}) {
  const { data: contrats, isLoading, error } = useContratsByStatut('REJETE');

  const filteredContrats = React.useMemo(() => {
    if (!contrats || !filterRecent) return contrats;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return contrats.filter((c) => c.dateRejet && new Date(c.dateRejet) >= monthAgo);
  }, [contrats, filterRecent]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats rejetés...</div>
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
          <XCircle className="h-5 w-5" />
          <span>Aucun contrat rejeté</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Contrats rejetés</h2>
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

