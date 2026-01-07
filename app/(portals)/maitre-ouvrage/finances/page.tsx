'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { financials, recouvrements, litiges, bcToValidate, facturesRecues, avenants } from '@/lib/data';
import type { Financials, FinancialGain, FinancialLoss, TreasuryEntry } from '@/lib/types/bmo.types';
import { calculateBMOTotalImpact } from '@/lib/utils/bmo-stats';

type TabType = 'gains' | 'pertes' | 'tresorerie';

// WHY: Parsing robuste des montants (FCFA)
const parseMontant = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// WHY: Export CSV traçable — inclut origine, RACI, hash, statut
const exportFinancesAsCSV = (
  financials: Financials,
  addToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'Type',
    'Date',
    'Description',
    'Montant (FCFA)',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
    'Projet/Chantier',
    'Commentaire'
  ];

  const rows: string[][] = [];

  financials.gains.forEach((g: FinancialGain) => {
    rows.push([
      'Gain',
      g.date,
      `"${g.description}"`,
      g.montant.toString(),
      g.decisionBMO?.origin || 'Hors périmètre BMO',
      g.decisionBMO?.decisionId || '',
      g.decisionBMO?.validatorRole || '',
      g.decisionBMO?.hash || '',
      g.decisionBMO ? 'Validé' : 'Non piloté',
      g.projetName || '',
      g.decisionBMO?.comment || ''
    ]);
  });

  financials.pertes.forEach((p: FinancialLoss) => {
    rows.push([
      'Perte',
      p.date,
      `"${p.description}"`,
      p.montant.toString(),
      p.decisionBMO?.origin || 'Hors périmètre BMO',
      p.decisionBMO?.decisionId || '',
      p.decisionBMO?.validatorRole || '',
      p.decisionBMO?.hash || '',
      p.decisionBMO ? 'Escaladé/Validé' : 'Non piloté',
      p.projetName || '',
      p.decisionBMO?.comment || ''
    ]);
  });

  financials.treasury.forEach((t: TreasuryEntry) => {
    rows.push([
      `Trésorerie (${t.type})`,
      t.date,
      `"${t.description}"`,
      t.montant.toString(),
      t.decisionBMO?.origin || 'Hors périmètre BMO',
      t.decisionBMO?.decisionId || '',
      t.decisionBMO?.validatorRole || '',
      t.decisionBMO?.hash || '',
      t.decisionBMO ? 'Autorisé' : 'Non piloté',
      '',
      t.decisionBMO?.comment || ''
    ]);
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pilotage_financier_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Pilotage BMO généré (traçabilité RACI incluse)', 'success');
};

export default function FinancesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('gains');

  const stats = useMemo(() => {
    const totalRecouvrement = recouvrements.reduce((a, r) => a + parseMontant(r.montant), 0);
    const totalLitiges = litiges.reduce((a, l) => a + parseMontant(l.montant), 0);
    const expositionLitiges = litiges.reduce((a, l) => a + parseMontant(l.exposure), 0);
    
    // Total des BC en attente (sans decisionBMO)
    const totalEnAttente = bcToValidate
      .filter(bc => !bc.decisionBMO)
      .reduce((a, bc) => a + parseMontant(bc.amount), 0);
    
    // Impact total des décisions BMO (gains, pertes, factures validées, avenants validés)
    const impactTotal = calculateBMOTotalImpact(financials, facturesRecues, avenants);
    
    return { 
      totalRecouvrement, 
      totalLitiges, 
      expositionLitiges,
      totalEnAttente,
      impactTotal,
    };
  }, []);

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(montant);
  };

  const formatMontantCompact = (montant: number): string => {
    if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1)}M`;
    if (montant >= 1_000) return `${(montant / 1_000).toFixed(1)}k`;
    return formatMontant(montant);
  };

  const handleExport = () => {
    exportFinancesAsCSV(financials, addToast);
  };

  const tabs = [
    { id: 'gains' as TabType, label: 'Gains pilotés', icon: '📈', count: financials.gains.length },
    { id: 'pertes' as TabType, label: 'Pertes pilotées', icon: '📉', count: financials.pertes.length },
    { id: 'tresorerie' as TabType, label: 'Trésorerie autorisée', icon: '🏦', count: financials.treasury.length },
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
      {/* Header — réorienté pilotage BMO */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Pilotage Financier BMO
            <Badge variant="info">Coordination & Contrôle</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Flux <strong>validés, autorisés ou escaladés</strong> par le BMO — Unité : FCFA
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleExport}>
            📊 Exporter (CSV RACI)
          </Button>
        </div>
      </div>

      {/* Résumé global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{formatMontantCompact(financials.totalGains)}</p>
            <p className="text-[10px] text-slate-400">Gains pilotés</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">{formatMontantCompact(financials.totalPertes)}</p>
            <p className="text-[10px] text-slate-400">Pertes pilotées</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{formatMontantCompact(financials.resultatNet)}</p>
            <p className="text-[10px] text-slate-400">Résultat net</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{formatMontantCompact(financials.tresorerieActuelle)}</p>
            <p className="text-[10px] text-slate-400">Trésorerie autorisée</p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de pilotage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Marge nette BMO</span>
              <Badge variant="success">{financials.kpis.margeNette}%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Taux recouvrement piloté</span>
              <Badge variant="info">{financials.kpis.ratioRecouvrement}%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                Litiges non résolus
                <span className="text-[10px]" title="Hors périmètre BMO si non lié à une décision">⚠️</span>
              </span>
              <Badge variant="warning">{formatMontantCompact(stats.expositionLitiges)}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Provisions validées</span>
              <Badge variant="default">{formatMontantCompact(financials.kpis.provisionContentieux)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium',
              activeTab === tab.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-700/50'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <Badge variant="default" className="text-[9px] px-1">{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* Gains pilotés */}
      {activeTab === 'gains' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">📈 Flux validés par BMO <Badge variant="success">{financials.gains.length}</Badge></span>
              <span className="text-emerald-400 font-mono">{formatMontant(financials.gains.reduce((a, g) => a + g.montant, 0))} FCFA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.gains.map((gain) => (
                    <tr key={gain.id} className={cn('border-t', darkMode ? 'border-slate-700/50 hover:bg-emerald-500/5' : 'border-gray-100 hover:bg-gray-50')}>
                      <td className="px-3 py-2.5 text-slate-400">{gain.date}</td>
                      <td className="px-3 py-2.5">
                        {gain.projetName ? (
                          <Badge variant="info" className="text-[9px]">🏗️ {gain.projetName}</Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{gain.description}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400">+{formatMontant(gain.montant)}</td>
                      <td className="px-3 py-2.5 text-xs">
                        {gain.decisionBMO ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="default" className="text-[9px]">
                              {gain.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                            </Badge>
                            {gain.decisionBMO?.decisionId && (
                              <Button
                                size="xs"
                                variant="link"
                                className="p-0 h-auto text-blue-400"
                                onClick={() => window.open(`/decisions?id=${gain.decisionBMO?.decisionId}`, '_blank')}
                              >
                                📄 Voir
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
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

      {/* Pertes pilotées */}
      {activeTab === 'pertes' && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">📉 Pertes escaladées <Badge variant="urgent">{financials.pertes.length}</Badge></span>
              <span className="text-red-400 font-mono">-{formatMontant(financials.pertes.reduce((a, p) => a + p.montant, 0))} FCFA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.pertes.map((perte) => (
                    <tr key={perte.id} className={cn('border-t', darkMode ? 'border-slate-700/50 hover:bg-red-500/5' : 'border-gray-100 hover:bg-gray-50')}>
                      <td className="px-3 py-2.5 text-slate-400">{perte.date}</td>
                      <td className="px-3 py-2.5">
                        {perte.projetName ? (
                          <Badge variant="info" className="text-[9px]">🏗️ {perte.projetName}</Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{perte.description}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-red-400">-{formatMontant(perte.montant)}</td>
                      <td className="px-3 py-2.5 text-xs">
                        {perte.decisionBMO ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="urgent" className="text-[9px]">🚨 Escaladé</Badge>
                            {perte.decisionBMO?.decisionId && (
                              <Button
                                size="xs"
                                variant="link"
                                className="p-0 h-auto text-orange-400"
                                onClick={() => window.open(`/arbitrages?id=${perte.decisionBMO?.decisionId}`, '_blank')}
                              >
                                ⚖️ Voir arbitrage
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
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

      {/* Trésorerie autorisée */}
      {activeTab === 'tresorerie' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">🏦 Paiements autorisés <Badge variant="info">{financials.treasury.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Type</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Autorisation BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {financials.treasury.map((entry) => (
                    <tr key={entry.id} className={cn('border-t', darkMode ? 'border-slate-700/50 hover:bg-blue-500/5' : 'border-gray-100 hover:bg-gray-50')}>
                      <td className="px-3 py-2.5 text-slate-400">{entry.date}</td>
                      <td className="px-3 py-2.5 font-medium">{entry.description}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={entry.type === 'encaissement' ? 'success' : 'urgent'} className="text-[9px]">
                          {entry.type === 'encaissement' ? '↑ Encaissement' : '↓ Décaissement'}
                        </Badge>
                      </td>
                      <td className={cn('px-3 py-2.5 text-right font-mono font-bold', entry.montant >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {entry.montant >= 0 ? '+' : ''}{formatMontant(entry.montant)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {entry.decisionBMO ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="default" className="text-[9px]">
                              {entry.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                            </Badge>
                            {entry.decisionBMO?.decisionId && (
                              <Button
                                size="xs"
                                variant="link"
                                className="p-0 h-auto text-blue-400"
                                onClick={() => window.open(`/decisions?id=${entry.decisionBMO?.decisionId}`, '_blank')}
                              >
                                📄 Voir
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
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

      {/* Répartition — inchangée */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">📊 Répartition gains pilotés</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {financials.gainsParCategorie.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{cat.label}</span>
                    <span className="text-emerald-400">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right">{formatMontantCompact(cat.montant)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">📊 Répartition pertes pilotées</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {financials.pertesParCategorie.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{cat.label}</span>
                    <span className="text-red-400">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right">{formatMontantCompact(cat.montant)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
