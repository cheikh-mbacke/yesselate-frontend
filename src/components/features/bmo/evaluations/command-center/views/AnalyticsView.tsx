/**
 * Vue Analytics - Analyses et statistiques avancées
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';

interface AnalyticsViewProps {
  subCategory: string | null;
}

export function AnalyticsView({ subCategory }: AnalyticsViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = {};
      const statsResult = await evaluationsApiService.getStats(filters);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Analytics & Statistiques
        </h2>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats?.total || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-emerald-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Complétées</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.completed || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Score moyen</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{stats?.avgScore || 0}/100</p>
              </div>
              <Users className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Recos en attente</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{stats?.pendingRecsTotal || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder pour graphiques */}
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Graphiques et analyses détaillées</p>
          <p className="text-xs text-slate-600">À implémenter avec une bibliothèque de graphiques (Chart.js, Recharts, etc.)</p>
        </CardContent>
      </Card>
    </div>
  );
}
