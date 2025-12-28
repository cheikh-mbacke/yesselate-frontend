'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { decisions } from '@/lib/data';

export default function DecisionsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const stats = {
    total: decisions.length,
    executed: decisions.filter((d) => d.status === 'executed').length,
    pending: decisions.filter((d) => d.status === 'pending').length,
  };

  const decisionTypes = {
    'Validation N+1': { icon: '✅', color: 'emerald' },
    Substitution: { icon: '🔄', color: 'amber' },
    Délégation: { icon: '🔑', color: 'blue' },
    Arbitrage: { icon: '⚖️', color: 'purple' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚖️ Décisions
            <Badge variant="gold">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Historique des décisions prises et traçabilité
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle décision créée', 'success')}>
          + Nouvelle décision
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total décisions</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.executed}</p>
            <p className="text-[10px] text-slate-400">Exécutées</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des décisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📜 Registre des décisions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    ID
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Type
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Objet
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Date
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Auteur
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Statut
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((decision, i) => {
                  const typeInfo =
                    decisionTypes[decision.type as keyof typeof decisionTypes];
                  return (
                    <tr
                      key={i}
                      className={cn(
                        'border-t cursor-pointer',
                        darkMode
                          ? 'border-slate-700/50 hover:bg-orange-500/5'
                          : 'border-gray-100 hover:bg-gray-50'
                      )}
                      onClick={() => addToast(`Détails décision ${decision.id}`, 'info')}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                          {decision.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1">
                          {typeInfo?.icon} {decision.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-orange-400">
                        {decision.subject}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{decision.date}</td>
                      <td className="px-3 py-2.5 font-semibold">{decision.author}</td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            decision.status === 'executed'
                              ? 'success'
                              : decision.status === 'pending'
                              ? 'warning'
                              : 'urgent'
                          }
                        >
                          {decision.status === 'executed'
                            ? 'Exécutée'
                            : decision.status === 'pending'
                            ? 'En attente'
                            : 'Annulée'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[9px] text-slate-500">
                          {decision.hash}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info traçabilité */}
      <Card className="border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-bold text-sm text-purple-400">
                Traçabilité OHADA
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque décision est horodatée et signée numériquement avec un hash
                SHA-256 unique. Cette traçabilité garantit l&apos;authenticité et
                l&apos;intégrité des décisions conformément aux exigences de l&apos;Acte
                Uniforme OHADA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
