'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { paymentsN1 } from '@/lib/data';

export default function ValidationPaiementsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Calcul total
  const totalAmount = paymentsN1.reduce(
    (a, p) => a + parseFloat(p.amount.replace(/,/g, '')),
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💳 Paiements N+1
            <Badge variant="info">{paymentsN1.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Paiements en attente de validation hiérarchique
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{paymentsN1.length}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">
              {(totalAmount / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Montant total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {paymentsN1.filter((p) => p.type === 'Situation').length}
            </p>
            <p className="text-[10px] text-slate-400">Situations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {paymentsN1.filter((p) => p.type === 'Facture').length}
            </p>
            <p className="text-[10px] text-slate-400">Factures</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des paiements */}
      <Card>
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
                    Bénéficiaire
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Montant
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Projet
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Échéance
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentsN1.map((payment, i) => (
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
                      <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        {payment.id}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          payment.type === 'Situation'
                            ? 'success'
                            : payment.type === 'Facture'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {payment.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-semibold">
                      {payment.beneficiary}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold text-amber-400">
                        {payment.amount}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-orange-400">
                      {payment.project}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {payment.dueDate}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <Button
                          size="xs"
                          variant="success"
                          onClick={() =>
                            addToast(`${payment.id} validé ✔`, 'success')
                          }
                        >
                          ✔
                        </Button>
                        <Button
                          size="xs"
                          variant="info"
                          onClick={() =>
                            addToast(`Détails ${payment.id}`, 'info')
                          }
                        >
                          👁
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() =>
                            addToast(`${payment.id} rejeté`, 'warning')
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Validation en lot */}
      <Card className="border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-bold text-sm text-emerald-400">
                  Validation en lot
                </h3>
                <p className="text-xs text-slate-400">
                  Valider tous les paiements en attente d&apos;un seul clic
                </p>
              </div>
            </div>
            <Button
              variant="success"
              onClick={() =>
                addToast(
                  `${paymentsN1.length} paiements validés en lot ✔`,
                  'success'
                )
              }
            >
              ✔ Valider tout ({paymentsN1.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
