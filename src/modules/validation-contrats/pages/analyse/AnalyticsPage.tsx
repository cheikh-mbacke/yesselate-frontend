/**
 * Page : Analyse & gouvernance > Analytics
 */

'use client';

import React from 'react';
import { useContratsStats, useContratsTrends } from '../../hooks';
import { BarChart3, TrendingUp } from 'lucide-react';
import { TrendsChart } from '../../components/TrendsChart';

export function AnalyticsPage() {
  const { data: stats } = useContratsStats();
  const { data: trends } = useContratsTrends('month');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Analytics</h2>
        <p className="text-sm text-slate-400">Analyse approfondie des contrats</p>
      </div>

      {trends && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Tendances
          </h3>
          <TrendsChart trends={trends} />
        </div>
      )}

      {stats && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Répartition par statut
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.parStatut).map(([statut, count]) => (
              <div key={statut} className="text-center">
                <div className="text-2xl font-bold text-slate-200">{count}</div>
                <div className="text-sm text-slate-400 mt-1">{statut.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

