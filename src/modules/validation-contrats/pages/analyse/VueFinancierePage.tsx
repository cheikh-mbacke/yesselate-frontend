/**
 * Page : Analyse & gouvernance > Vue financière
 */

'use client';

import React from 'react';
import { useContratsStats } from '../../hooks';
import { DollarSign, TrendingUp } from 'lucide-react';

export function VueFinancierePage() {
  const { data: stats, isLoading } = useContratsStats();

  if (isLoading || !stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Vue financière</h2>
        <p className="text-sm text-slate-400">Analyse financière des contrats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Montant total</h3>
          </div>
          <div className="text-2xl font-bold text-slate-200">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(stats.montantTotal)}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-200">En attente</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(stats.montantEnAttente)}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h3 className="text-sm font-semibold text-slate-200">Validés</h3>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(stats.montantValides)}
          </div>
        </div>
      </div>
    </div>
  );
}

