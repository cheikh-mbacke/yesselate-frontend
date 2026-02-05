/**
 * Page : Analyse > Services
 */

'use client';

import React from 'react';
import { useValidationStats } from '../../hooks';
import { Building2 } from 'lucide-react';

export function ServicesPage() {
  const { data: stats, isLoading, error } = useValidationStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des services...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des services</div>
      </div>
    );
  }

  const services = Object.entries(stats.parService).map(([service, count]) => ({
    service,
    count,
    percentage: stats.totalDocuments > 0 ? (count / stats.totalDocuments) * 100 : 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">Services</h2>
        </div>
        <p className="text-sm text-slate-400">
          Répartition des documents par service
        </p>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(({ service, count, percentage }) => (
            <div
              key={service}
              className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50"
            >
              <div className="text-sm font-medium text-slate-300 mb-1">{service}</div>
              <div className="text-2xl font-bold text-slate-200 mb-1">{count}</div>
              <div className="text-xs text-slate-400">{percentage.toFixed(1)}% du total</div>
              
              {/* Barre de progression */}
              <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500/50 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucune donnée disponible</div>
        </div>
      )}
    </div>
  );
}

