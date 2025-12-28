'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { delegations } from '@/lib/data';

export default function DelegationsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Stats
  const stats = {
    total: delegations.length,
    active: delegations.filter((d) => d.status === 'active').length,
    expired: delegations.filter((d) => d.status === 'expired').length,
    totalUsage: delegations.reduce((a, d) => a + d.usageCount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔑 Délégations
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Gestion des pouvoirs délégués
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle délégation créée', 'success')}>
          + Nouvelle délégation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            <p className="text-[10px] text-slate-400">Expirées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.totalUsage}</p>
            <p className="text-[10px] text-slate-400">Utilisations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {Math.round(stats.totalUsage / stats.total)}
            </p>
            <p className="text-[10px] text-slate-400">Moy. utilisation</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des délégations */}
      <div className="space-y-3">
        {delegations.map((delegation, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all',
              delegation.status === 'active'
                ? 'border-l-4 border-l-emerald-500'
                : 'border-l-4 border-l-red-500 opacity-70'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white">
                    {delegation.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-orange-400">
                        {delegation.id}
                      </span>
                      <Badge
                        variant={
                          delegation.status === 'active' ? 'success' : 'urgent'
                        }
                      >
                        {delegation.status === 'active' ? 'Active' : 'Expirée'}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm">{delegation.type}</h3>
                    <p className="text-xs text-slate-400">
                      Délégataire: {delegation.agent}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">
                    {delegation.usageCount}
                  </p>
                  <p className="text-[10px] text-slate-400">utilisations</p>
                </div>
              </div>

              {/* Détails */}
              <div
                className={cn(
                  'mt-3 p-3 rounded-lg',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                )}
              >
                <p className="text-xs">
                  <span className="text-slate-400">Périmètre: </span>
                  {delegation.scope}
                </p>
              </div>

              {/* Période */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div>
                  <span className="text-slate-400">Début: </span>
                  <span className="font-semibold">{delegation.start}</span>
                </div>
                <span className="text-slate-500">→</span>
                <div>
                  <span className="text-slate-400">Fin: </span>
                  <span className="font-semibold">{delegation.end}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <Button
                  size="xs"
                  variant="info"
                  onClick={() =>
                    addToast(`Détails délégation ${delegation.id}`, 'info')
                  }
                >
                  📋 Détails
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() =>
                    addToast(`Historique ${delegation.id}`, 'info')
                  }
                >
                  📊 Historique
                </Button>
                {delegation.status === 'active' && (
                  <>
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={() =>
                        addToast(`Modification ${delegation.id}`, 'info')
                      }
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() =>
                        addToast(`Délégation ${delegation.id} révoquée`, 'warning')
                      }
                    >
                      ✕ Révoquer
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info OHADA */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">
                Conformité OHADA
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Les délégations de pouvoir sont conformes à l&apos;Acte Uniforme
                OHADA relatif au droit des sociétés commerciales. Chaque
                délégation est horodatée et tracée avec signature SHA-256.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
