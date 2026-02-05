/**
 * Page : Par statut > Validés
 */

'use client';

import React from 'react';
import { useContratsByStatut } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { CheckCircle2 } from 'lucide-react';

interface ValidesPageProps {
  filterService?: string;
  filterPeriode?: 'today' | 'week' | 'month';
}

export function ValidesPage({ filterService, filterPeriode }: ValidesPageProps = {}) {
  const { data: contrats, isLoading, error } = useContratsByStatut('VALIDE');

  const filteredContrats = React.useMemo(() => {
    if (!contrats) return contrats;
    let filtered = [...contrats];

    if (filterService) {
      filtered = filtered.filter((c) => c.service === filterService);
    }

    if (filterPeriode && filterPeriode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((c) => c.dateValidation?.startsWith(today));
    } else if (filterPeriode === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((c) => c.dateValidation && new Date(c.dateValidation) >= weekAgo);
    } else if (filterPeriode === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((c) => c.dateValidation && new Date(c.dateValidation) >= monthAgo);
    }

    return filtered;
  }, [contrats, filterService, filterPeriode]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats validés...</div>
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
          <CheckCircle2 className="h-5 w-5" />
          <span>Aucun contrat validé</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Contrats validés
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

