'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { financials, recouvrements, litiges } from '@/lib/data';

type TabType = 'gains' | 'pertes' | 'tresorerie';

export default function FinancesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('gains');

  // Calculs dérivés
  const stats = useMemo(() => {
    const totalRecouvrement = recouvrements.reduce(
      (a, r) => a + parseFloat(r.montant.replace(/,/g, '')),
      0
    );
    const totalLitiges = litiges.reduce(
      (a, l) => a + parseFloat(l.montant.replace(/,/g, '')),
      0
    );
    const expositionLitiges = litiges.reduce(
      (a, l) => a + parseFloat(l.exposure.replace(/,/g, '')),
      0
    );

    return {
      totalRecouvrement,
      totalLitiges,
      expositionLitiges,
    };
  }, []);

  // Formatage monétaire
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant);
  };

  const tabs = [
    { id: 'gains' as TabType, label: 'Gains', icon: '📈', count: financials.gains.length },
    { id: 'pertes' as TabType, label: 'Pertes', icon: '📉', count: financials.pertes.length },
    { id: 'tresorerie' as TabType, label: 'Trésorerie', icon: '🏦', count: financials.treasury.length },
  ];

  const categoryIcons: Record<string, string> = {
    paiement_client: '💰',
    retenue_garantie: '🔓',
    penalite_recue: '⚠️',
    remboursement: '↩️',
    subvention: '🏛️',
    penalite_retard: '⏰',
    malfacon: '🔧',
    sinistre: '🚨',
    creance_irrecuperable: '❌',
    frais_contentieux: '⚖️',
    provision_litige: '📊',
    autre: '📋',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💰 Finances
            <Badge variant="success">{financials.tauxMarge}% marge</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Suivi des gains, pertes et trésorerie
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('Export en cours...', 'info')}
          >
            📊 Exporter
          </Button>
        </div>
      </div>

      {/* Résumé global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">
              {formatMontant(financials.totalGains / 1000000)}M
            </p>
            <p className="text-[10px] text-slate-400">Total Gains</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">
              {formatMontant(financials.totalPertes / 1000000)}M
            </p>
            <p className="text-[10px] text-slate-400">Total Pertes</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">
              {formatMontant(financials.resultatNet / 1000000)}M
            </p>
            <p className="text-[10px] text-slate-400">Résultat Net</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-400">
              {formatMontant(financials.tresorerieActuelle / 1000000)}M
            </p>
            <p className="text-[10px] text-slate-400">Trésorerie</p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs supplémentaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Marge nette</span>
              <Badge variant="success">{financials.kpis.margeNette}%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Taux recouvrement</span>
              <Badge variant="info">{financials.kpis.ratioRecouvrement}%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Exposition litiges</span>
              <Badge variant="warning">{formatMontant(stats.expositionLitiges / 1000000)}M</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Provisions</span>
              <Badge variant="default">{formatMontant(financials.kpis.provisionContentieux / 1000000)}M</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-700/50'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <Badge variant="default" className="text-[9px] px-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'gains' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                📈 Gains financiers
                <Badge variant="success">{financials.gains.length}</Badge>
              </span>
              <span className="text-emerald-400 font-mono">
                {formatMontant(financials.gains.reduce((a, g) => a + g.montant, 0))} FCFA
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Catégorie</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Traçabilité</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.gains.map((gain) => (
                    <tr
                      key={gain.id}
                      className={cn(
                        'border-t',
                        darkMode
                          ? 'border-slate-700/50 hover:bg-emerald-500/5'
                          : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <td className="px-3 py-2.5 text-slate-400">{gain.date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span>{categoryIcons[gain.category] || '📋'}</span>
                          <span className="text-[10px]">{gain.categoryLabel}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{gain.description}</p>
                        {gain.clientName && (
                          <p className="text-[10px] text-slate-400">Client: {gain.clientName}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {gain.projetName ? (
                          <Badge variant="info" className="text-[9px]">{gain.projetName}</Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400">
                        +{formatMontant(gain.montant)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          {gain.reference && (
                            <span className="text-[9px] text-slate-400">Réf: {gain.reference}</span>
                          )}
                          {gain.hash && (
                            <span className="text-[9px] font-mono text-emerald-500/70">{gain.hash.slice(0, 20)}...</span>
                          )}
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

      {activeTab === 'pertes' && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                📉 Pertes financières
                <Badge variant="urgent">{financials.pertes.length}</Badge>
              </span>
              <span className="text-red-400 font-mono">
                -{formatMontant(financials.pertes.reduce((a, p) => a + p.montant, 0))} FCFA
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Catégorie</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Lien incident</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.pertes.map((perte) => (
                    <tr
                      key={perte.id}
                      className={cn(
                        'border-t',
                        darkMode
                          ? 'border-slate-700/50 hover:bg-red-500/5'
                          : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <td className="px-3 py-2.5 text-slate-400">{perte.date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span>{categoryIcons[perte.category] || '📋'}</span>
                          <span className="text-[10px]">{perte.categoryLabel}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{perte.description}</p>
                        {perte.projetName && (
                          <p className="text-[10px] text-slate-400">Projet: {perte.projetName}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {perte.incident ? (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-[9px] text-orange-400"
                            onClick={() => addToast(`Voir incident ${perte.incident}`, 'info')}
                          >
                            🔗 {perte.incident}
                          </Button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-red-400">
                        -{formatMontant(perte.montant)}
                      </td>
                      <td className="px-3 py-2.5">
                        {perte.decision ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono text-amber-400">{perte.decision}</span>
                            <span className="text-[9px] text-slate-500">{perte.decisionDate}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tresorerie' && (
        <div className="space-y-4">
          {/* Indicateurs trésorerie */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Trésorerie actuelle</p>
                    <p className="text-xl font-bold text-blue-400">
                      {formatMontant(financials.tresorerieActuelle)} FCFA
                    </p>
                  </div>
                  <span className="text-3xl">🏦</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Prévision J+30</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {formatMontant(financials.tresoreriePrevisionnelle)} FCFA
                    </p>
                  </div>
                  <span className="text-3xl">📊</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journal de trésorerie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                📜 Mouvements de trésorerie
                <Badge variant="info">{financials.treasury.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Type</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Source</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Solde après</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financials.treasury.map((entry) => (
                      <tr
                        key={entry.id}
                        className={cn(
                          'border-t',
                          darkMode
                            ? 'border-slate-700/50 hover:bg-blue-500/5'
                            : 'border-gray-100 hover:bg-gray-50'
                        )}
                      >
                        <td className="px-3 py-2.5 text-slate-400">{entry.date}</td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              entry.type === 'encaissement'
                                ? 'success'
                                : entry.type === 'decaissement'
                                ? 'urgent'
                                : 'warning'
                            }
                            className="text-[9px]"
                          >
                            {entry.type === 'encaissement' ? '↑' : entry.type === 'decaissement' ? '↓' : '~'}{' '}
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium">{entry.description}</p>
                          {entry.tiers && (
                            <p className="text-[10px] text-slate-400">{entry.tiers}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="default" className="text-[9px]">
                            {entry.source}
                          </Badge>
                          {entry.sourceRef && (
                            <p className="text-[9px] text-orange-400 mt-0.5">{entry.sourceRef}</p>
                          )}
                        </td>
                        <td
                          className={cn(
                            'px-3 py-2.5 text-right font-mono font-bold',
                            entry.montant >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}
                        >
                          {entry.montant >= 0 ? '+' : ''}
                          {formatMontant(entry.montant)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-blue-400">
                          {formatMontant(entry.soldeApres)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Répartition par catégorie */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📊 Répartition des gains
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {financials.gainsParCategorie.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{cat.label}</span>
                    <span className="text-emerald-400">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right">
                  {formatMontant(cat.montant / 1000000)}M
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📊 Répartition des pertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {financials.pertesParCategorie.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{cat.label}</span>
                    <span className="text-red-400">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right">
                  {formatMontant(cat.montant / 1000000)}M
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
