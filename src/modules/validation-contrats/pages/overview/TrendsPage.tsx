/**
 * Page : Vue d'ensemble > Tendances
 */

'use client';

import React from 'react';
import { useContratsTrends } from '../../hooks';
import { TrendingUp } from 'lucide-react';
import { TrendsChart } from '../../components/TrendsChart';

export function TrendsPage() {
  const { data: trends, isLoading, error } = useContratsTrends('month');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des tendances...</div>
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des tendances</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Tendances</h2>
        <p className="text-sm text-slate-400">Évolution des contrats dans le temps</p>
      </div>

      {/* Graphique de tendances */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Évolution temporelle
        </h3>
        <TrendsChart trends={trends} />
      </div>
    </div>
  );
}

