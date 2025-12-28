'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { bcToValidate, facturesToValidate, avenantsToValidate } from '@/lib/data';

type TabType = 'bc' | 'factures' | 'avenants';

export default function ValidationBCPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('bc');

  const tabs = [
    { id: 'bc' as TabType, label: 'BC', count: bcToValidate.length, color: 'emerald' },
    { id: 'factures' as TabType, label: 'Factures', count: facturesToValidate.length, color: 'blue' },
    { id: 'avenants' as TabType, label: 'Avenants', count: avenantsToValidate.length, color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ✅ Validation Documents
            <Badge variant="warning">
              {bcToValidate.length + facturesToValidate.length + avenantsToValidate.length}
            </Badge>
          </h1>
          <p className="text-sm text-slate-400">
            BC, Factures et Avenants en attente de validation
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? `bg-${tab.color}-500` : ''}
          >
            {tab.id === 'bc' ? '📋' : tab.id === 'factures' ? '🧾' : '📝'} {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* Tab BC */}
      {activeTab === 'bc' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">BC</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Objet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Fournisseur</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Priorité</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bcToValidate.map((bc, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-t',
                        darkMode ? 'border-slate-700/50 hover:bg-orange-500/5' : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {bc.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-orange-400">{bc.project}</td>
                      <td className="px-3 py-2.5 max-w-[150px] truncate">{bc.subject}</td>
                      <td className="px-3 py-2.5">{bc.supplier}</td>
                      <td className="px-3 py-2.5 font-mono font-bold">{bc.amount}</td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'}
                          pulse={bc.priority === 'urgent'}
                        >
                          {bc.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <Button size="xs" variant="success" onClick={() => addToast(`${bc.id} validé ✔`, 'success')}>✔</Button>
                          <Button size="xs" variant="info" onClick={() => addToast(`Détails ${bc.id}`, 'info')}>👁</Button>
                          <Button size="xs" variant="destructive" onClick={() => addToast(`${bc.id} rejeté`, 'warning')}>✕</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Factures */}
      {activeTab === 'factures' && (
        <div className="space-y-3">
          {facturesToValidate.map((facture, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">
                        {facture.id}
                      </span>
                      <BureauTag bureau={facture.bureau} />
                    </div>
                    <h3 className="font-bold text-sm mt-1">{facture.objet}</h3>
                    <p className="text-xs text-slate-400">{facture.fournisseur}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-lg text-blue-400">
                      {facture.montant} FCFA
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Échéance: {facture.dateEcheance}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-slate-400">Projet: </span>
                    <span className="text-orange-400">{facture.projet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date facture: </span>
                    {facture.dateFacture}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="flex-1" onClick={() => addToast(`Facture ${facture.id} validée ✔`, 'success')}>
                    ✔ Valider facture
                  </Button>
                  <Button size="sm" variant="info" onClick={() => addToast(`Détails facture`, 'info')}>
                    📄 Voir
                  </Button>
                  <Button size="sm" variant="warning" onClick={() => addToast(`Facture ${facture.id} contestée`, 'warning')}>
                    ⚠️ Contester
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => addToast(`Facture ${facture.id} rejetée`, 'error')}>
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Avenants */}
      {activeTab === 'avenants' && (
        <div className="space-y-3">
          {avenantsToValidate.map((avenant, i) => (
            <Card
              key={i}
              className={cn(
                avenant.impact === 'Financier'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-blue-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                        {avenant.id}
                      </span>
                      <Badge variant={avenant.impact === 'Financier' ? 'warning' : 'info'}>
                        {avenant.impact}
                      </Badge>
                      <BureauTag bureau={avenant.bureau} />
                    </div>
                    <h3 className="font-bold text-sm mt-1">{avenant.objet}</h3>
                    <p className="text-xs text-slate-400">
                      Contrat: {avenant.contratRef} • {avenant.partenaire}
                    </p>
                  </div>
                  {avenant.montant && (
                    <span className="font-mono font-bold text-lg text-amber-400">
                      +{avenant.montant} FCFA
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'p-2 rounded-lg text-xs mb-3',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}
                >
                  <span className="text-slate-400">Justification: </span>
                  {avenant.justification}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-slate-400">Préparé par: </span>
                    {avenant.preparedBy}
                  </div>
                  <div>
                    <span className="text-slate-400">Date: </span>
                    {avenant.date}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => addToast(`Avenant ${avenant.id} approuvé ✔`, 'success')}
                  >
                    ✔ Approuver avenant
                  </Button>
                  <Button size="sm" variant="info" onClick={() => addToast(`Détails avenant`, 'info')}>
                    📄 Voir contrat
                  </Button>
                  <Button size="sm" variant="warning" onClick={() => addToast(`Avenant ${avenant.id} renvoyé pour modification`, 'warning')}>
                    ↩️ Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => addToast(`Avenant ${avenant.id} rejeté`, 'error')}>
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
