'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { arbitrages } from '@/lib/data';

export default function ArbitragesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const stats = {
    total: arbitrages.length,
    pending: arbitrages.filter((a) => a.status === 'pending').length,
    resolved: arbitrages.filter((a) => a.status === 'resolved').length,
    critical: arbitrages.filter((a) => a.impact === 'critical').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚖️ Arbitrages
            <Badge variant="urgent">{stats.pending}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Conflits et décisions requérant l&apos;intervention du DG
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-[10px] text-slate-400">Résolus</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-[10px] text-slate-400">Critiques</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des arbitrages */}
      <div className="space-y-3">
        {arbitrages.map((arbitrage, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all',
              arbitrage.impact === 'critical' && 'border-l-4 border-l-red-500',
              arbitrage.impact === 'high' && 'border-l-4 border-l-amber-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-orange-400">
                      {arbitrage.id}
                    </span>
                    <Badge
                      variant={arbitrage.status === 'pending' ? 'warning' : 'success'}
                    >
                      {arbitrage.status === 'pending' ? 'En attente' : 'Résolu'}
                    </Badge>
                    <Badge
                      variant={
                        arbitrage.impact === 'critical'
                          ? 'urgent'
                          : arbitrage.impact === 'high'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      Impact: {arbitrage.impact}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm">{arbitrage.subject}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">{arbitrage.date}</p>
                  <p className="text-[10px] text-red-400">
                    ⏰ Deadline: {arbitrage.deadline}
                  </p>
                </div>
              </div>

              {/* Parties */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-400">Parties:</span>
                {arbitrage.parties.map((party, pi) => (
                  <BureauTag key={pi} bureau={party} />
                ))}
              </div>

              {/* Description */}
              <div
                className={cn(
                  'p-3 rounded-lg text-xs',
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                )}
              >
                {arbitrage.description}
              </div>

              {/* Résolution si résolu */}
              {arbitrage.resolution && (
                <div
                  className={cn(
                    'mt-2 p-3 rounded-lg text-xs border',
                    darkMode
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-emerald-50 border-emerald-200'
                  )}
                >
                  <span className="text-emerald-400 font-bold">Résolution: </span>
                  {arbitrage.resolution}
                </div>
              )}

              {/* Demandeur */}
              <p className="text-xs text-slate-400 mt-2">
                Demandé par: <span className="font-semibold">{arbitrage.requestedBy}</span>
              </p>

              {/* Actions */}
              {arbitrage.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                    onClick={() => addToast('Décision d\'arbitrage enregistrée', 'success')}
                  >
                    ⚖️ Rendre une décision
                  </Button>
                  <Button
                    variant="info"
                    onClick={() => addToast('Détails arbitrage', 'info')}
                  >
                    📋 Détails
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => addToast('Réunion planifiée', 'info')}
                  >
                    📅 Planifier réunion
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
