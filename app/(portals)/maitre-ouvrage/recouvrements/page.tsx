'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recouvrements, litiges } from '@/lib/data';

export default function RecouvrementsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Calculs
  const totalRecouvrement = recouvrements.reduce(
    (a, r) => a + parseFloat(r.montant.replace(/,/g, '')),
    0
  );
  const totalLitiges = litiges.reduce(
    (a, l) => a + parseFloat(l.montant.replace(/,/g, '')),
    0
  );

  const statusStyles = {
    relance: { color: 'amber', label: 'Relance' },
    huissier: { color: 'orange', label: 'Huissier' },
    contentieux: { color: 'red', label: 'Contentieux' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Recouvrements & Litiges
            <Badge variant="urgent">{recouvrements.length + litiges.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Créances impayées et contentieux en cours
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">
              {(totalRecouvrement / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">À recouvrer</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">
              {(totalLitiges / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">En litige</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {recouvrements.length}
            </p>
            <p className="text-[10px] text-slate-400">Dossiers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{litiges.length}</p>
            <p className="text-[10px] text-slate-400">Litiges</p>
          </CardContent>
        </Card>
      </div>

      {/* Recouvrements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            💰 Créances à recouvrer
            <Badge variant="warning">{recouvrements.length}</Badge>
          </CardTitle>
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
                    Débiteur
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Montant
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Retard
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Relances
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Statut
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recouvrements.map((rec, i) => {
                  const status = statusStyles[rec.status as keyof typeof statusStyles];
                  return (
                    <tr
                      key={i}
                      className={cn(
                        'border-t',
                        darkMode
                          ? 'border-slate-700/50 hover:bg-orange-500/5'
                          : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[10px] text-orange-400">
                          {rec.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-semibold">{rec.debiteur}</p>
                          <p className="text-[10px] text-slate-400">{rec.type}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-amber-400">
                        {rec.montant} FCFA
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            rec.delay > 60
                              ? 'urgent'
                              : rec.delay > 30
                              ? 'warning'
                              : 'default'
                          }
                        >
                          J+{rec.delay}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">{rec.relances}</td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            rec.status === 'contentieux'
                              ? 'urgent'
                              : rec.status === 'huissier'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {status?.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="warning"
                            onClick={() => addToast(`Relance envoyée à ${rec.debiteur}`, 'info')}
                          >
                            📧
                          </Button>
                          <Button
                            size="xs"
                            variant="info"
                            onClick={() => addToast('Détails dossier', 'info')}
                          >
                            👁
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Litiges */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ⚖️ Litiges en cours
            <Badge variant="urgent">{litiges.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {litiges.map((litige, i) => (
            <div
              key={i}
              className={cn(
                'p-3 rounded-lg border-l-4 border-l-red-500',
                darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-orange-400">
                      {litige.id}
                    </span>
                    <Badge variant="urgent">{litige.type}</Badge>
                  </div>
                  <h4 className="font-bold text-sm mt-1">{litige.objet}</h4>
                  <p className="text-xs text-slate-400">vs {litige.adversaire}</p>
                </div>
                <span className="font-mono font-bold text-red-400">
                  {litige.montant} FCFA
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Juridiction: </span>
                  {litige.juridiction}
                </div>
                <div>
                  <span className="text-slate-400">Avocat: </span>
                  {litige.avocat}
                </div>
                <div>
                  <span className="text-slate-400">Statut: </span>
                  <span className="text-amber-400">{litige.status}</span>
                </div>
                {litige.prochainRdv && (
                  <div>
                    <span className="text-slate-400">Prochain RDV: </span>
                    <span className="text-red-400">{litige.prochainRdv}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="xs"
                  variant="info"
                  onClick={() => addToast('Détails litige', 'info')}
                >
                  📋 Dossier
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => addToast('Historique litige', 'info')}
                >
                  📜 Historique
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
