/**
 * Page : Contrats à valider > Faible priorité
 */

'use client';

import React from 'react';
import { useContratsByPriorite } from '../../hooks';
import { ContratCard } from '../../components/ContratCard';
import { Info } from 'lucide-react';

export function FaiblePrioritePage() {
  const { data: contrats, isLoading, error } = useContratsByPriorite('LOW');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des contrats faible priorité...</div>
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

  if (!contrats || contrats.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="h-5 w-5" />
          <span>Aucun contrat faible priorité</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Contrats faible priorité</h2>
        <span className="text-sm text-slate-400 font-medium">{contrats.length} contrat(s)</span>
      </div>
      <div className="grid gap-4">
        {contrats.map((contrat) => (
          <ContratCard key={contrat.id} contrat={contrat} />
        ))}
      </div>
    </div>
  );
}

