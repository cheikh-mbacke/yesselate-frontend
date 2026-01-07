'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// WHY: Import des données enrichies avec decisionBMO
import { bcToValidate, facturesRecues, avenants, financials } from '@/lib/data';
import type { PurchaseOrder } from '@/lib/types/bmo.types';
import type { Facture } from '@/lib/types/bmo.types';
import type { Avenant } from '@/lib/data/avenants';
import { calculateBMOTotalImpact } from '@/lib/utils/bmo-stats';

type TabType = 'bc' | 'factures' | 'avenants' | 'finances';

// WHY: Parsing robuste des montants
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

export default function ValidationPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('bc');
  const [search, setSearch] = useState('');

  // WHY: Calcul des KPIs à partir des données tracées
  const totalEnAttente = useMemo(() => {
    const bcPending = bcToValidate
      .filter(bc => !bc.decisionBMO)
      .reduce((sum, bc) => {
        const amount = 'amount' in bc && typeof bc.amount === 'string' 
          ? parseMoney(bc.amount) 
          : ('montantTTC' in bc ? parseMoney(bc.montantTTC) : 0);
        return sum + amount;
      }, 0);

    const facturesPending = facturesRecues
      .filter(f => !f.decisionBMO)
      .reduce((sum, f) => sum + parseMoney(f.montantTTC), 0);

    const avenantsPending = avenants
      .filter(av => !av.decisionBMO)
      .reduce((sum, av) => sum + Math.abs(av.ecart), 0);

    return bcPending + facturesPending + avenantsPending;
  }, []);

  // WHY: Utiliser la fonction utilitaire pour l'impact total
  const impactTotal = useMemo(() => {
    return calculateBMOTotalImpact(financials, facturesRecues, avenants);
  }, []);

  // Filtrage par recherche
  const filteredBC = useMemo(() => {
    if (!search.trim()) return bcToValidate;
    const s = search.toLowerCase();
    return bcToValidate.filter(bc => {
      const id = ('id' in bc ? bc.id : '').toLowerCase();
      const projet = ('projetName' in bc ? bc.projetName : '').toLowerCase();
      const fournisseur = ('fournisseur' in bc ? bc.fournisseur : '').toLowerCase();
      return id.includes(s) || projet.includes(s) || fournisseur.includes(s);
    });
  }, [search]);

  const filteredFactures = useMemo(() => {
    if (!search.trim()) return facturesRecues;
    const s = search.toLowerCase();
    return facturesRecues.filter(f => 
      f.id.toLowerCase().includes(s) ||
      f.chantier.toLowerCase().includes(s) ||
      f.fournisseur.toLowerCase().includes(s)
    );
  }, [search]);

  const filteredAvenants = useMemo(() => {
    if (!search.trim()) return avenants;
    const s = search.toLowerCase();
    return avenants.filter(av => 
      av.id.toLowerCase().includes(s) ||
      av.chantier.toLowerCase().includes(s) ||
      av.bcReference.toLowerCase().includes(s)
    );
  }, [search]);

  // Flux financiers (gains + pertes)
  const filteredFlux = useMemo(() => {
    const gains = financials.gains.map(g => ({
      id: g.id,
      type: 'gain' as const,
      projetName: g.chantier,
      description: g.description,
      montant: g.montant,
      decisionBMO: g.decisionBMO,
    }));

    const pertes = financials.pertes.map(p => ({
      id: p.id,
      type: 'perte' as const,
      projetName: p.chantier,
      description: p.description,
      montant: p.montant,
      decisionBMO: p.decisionBMO,
    }));

    const all = [...gains, ...pertes];

    if (!search.trim()) return all;
    const s = search.toLowerCase();
    return all.filter(flux => 
      flux.id.toLowerCase().includes(s) ||
      (flux.projetName || '').toLowerCase().includes(s) ||
      flux.description.toLowerCase().includes(s)
    );
  }, [search]);

  const handleExportCSV = () => {
    const rows = [
      ['Type', 'ID', 'Projet/Chantier', 'Montant (FCFA)', 'Statut', 'Origine décision', 'ID décision', 'Rôle RACI', 'Hash', 'Commentaire BMO'],
      ...bcToValidate.map(bc => {
        const amount = 'amount' in bc && typeof bc.amount === 'string' 
          ? parseMoney(bc.amount).toString()
          : ('montantTTC' in bc ? parseMoney(bc.montantTTC).toString() : '0');
        return [
          'BC',
          bc.id || '',
          ('projetName' in bc ? bc.projetName : '') || '',
          amount,
          ('statut' in bc ? bc.statut : '') || '',
          bc.decisionBMO?.origin || 'Hors BMO',
          bc.decisionBMO?.decisionId || '',
          bc.decisionBMO?.validatorRole || '',
          bc.decisionBMO?.hash || '',
          `"${bc.decisionBMO?.comment || ''}"`,
        ];
      }),
      ...facturesRecues.map(f => [
        'Facture',
        f.id,
        f.chantier || '',
        f.montantTTC.toString(),
        f.statut,
        f.decisionBMO?.origin || 'Hors BMO',
        f.decisionBMO?.decisionId || '',
        f.decisionBMO?.validatorRole || '',
        f.decisionBMO?.hash || '',
        `"${f.decisionBMO?.comment || f.commentaire || ''}"`,
      ]),
      ...avenants.map(av => [
        'Avenant',
        av.id,
        av.chantier || '',
        av.ecart.toString(),
        av.statut,
        av.decisionBMO?.origin || 'Hors BMO',
        av.decisionBMO?.decisionId || '',
        av.decisionBMO?.validatorRole || '',
        av.decisionBMO?.hash || '',
        `"${av.decisionBMO?.comment || ''}"`,
      ]),
    ];

    const csvContent = rows.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('✅ Export avec traçabilité RACI généré', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Validation BMO Unifiée
            <Badge variant="info">Coordination & Contrôle</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Vue centralisée — BC, Factures, Avenants, Flux financiers
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Rechercher (ID, projet, fournisseur...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCSV}
          >
            📊 Export BMO (CSV RACI)
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400 mb-1">Total en attente</p>
            <p className="text-xl font-bold text-amber-400">
              {totalEnAttente.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400 mb-1">Impact total BMO</p>
            <p className="text-xl font-bold text-blue-400">
              {impactTotal.toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400 mb-1">Documents</p>
            <p className="text-xl font-bold">
              {bcToValidate.length + facturesRecues.length + avenants.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-slate-700/30">
        <button
          onClick={() => setActiveTab('bc')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'bc'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          Bons de commande
        </button>
        <button
          onClick={() => setActiveTab('factures')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'factures'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          Factures
        </button>
        <button
          onClick={() => setActiveTab('avenants')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'avenants'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          Avenants
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'finances'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          Flux financiers
        </button>
      </div>

      {/* BONS DE COMMANDE */}
      {activeTab === 'bc' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📦 Bons de commande à valider</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Fournisseur</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBC.map(bc => {
                    const amount = 'amount' in bc && typeof bc.amount === 'string' 
                      ? parseMoney(bc.amount)
                      : ('montantTTC' in bc ? parseMoney(bc.montantTTC) : 0);
                    return (
                      <tr key={bc.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                        <td className="px-3 py-2.5 font-mono text-slate-400">{bc.id || ''}</td>
                        <td className="px-3 py-2.5">{('projetName' in bc ? bc.projetName : '') || ''}</td>
                        <td className="px-3 py-2.5">{('fournisseur' in bc ? bc.fournisseur : '') || ''}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{amount.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={('statut' in bc && bc.statut === 'conforme') ? 'success' : 'warning'}>
                            {('statut' in bc ? bc.statut : '') || '—'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {bc.decisionBMO ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="default" className="text-[9px]">
                                {bc.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                              </Badge>
                              <Button
                                size="xs"
                                variant="link"
                                className="p-0 h-auto text-blue-400"
                                onClick={() => window.open(`/maitre-ouvrage/decisions?id=${bc.decisionBMO?.decisionId}`, '_blank')}
                              >
                                📄 Voir
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FACTURES */}
      {activeTab === 'factures' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧾 Factures reçues</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Chantier</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Fournisseur</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">TTC</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFactures.map(f => (
                    <tr key={f.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                      <td className="px-3 py-2.5 font-mono text-slate-400">{f.id}</td>
                      <td className="px-3 py-2.5">{f.chantier}</td>
                      <td className="px-3 py-2.5">{f.fournisseur}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{f.montantTTC.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={
                          f.statut === 'payée' ? 'success' :
                          f.statut === 'rejetée' ? 'urgent' : 'warning'
                        }>
                          {f.statut}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {f.decisionBMO ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="default" className="text-[9px]">
                              {f.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                            </Badge>
                            <Button
                              size="xs"
                              variant="link"
                              className="p-0 h-auto text-blue-400"
                              onClick={() => window.open(`/maitre-ouvrage/decisions?id=${f.decisionBMO?.decisionId}`, '_blank')}
                            >
                              📄 Voir
                            </Button>
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

      {/* AVENANTS */}
      {activeTab === 'avenants' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📄 Avenants proposés</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Chantier</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">BC de référence</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Écart</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvenants.map(av => (
                    <tr key={av.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                      <td className="px-3 py-2.5 font-mono text-slate-400">{av.id}</td>
                      <td className="px-3 py-2.5">{av.chantier}</td>
                      <td className="px-3 py-2.5 font-mono">{av.bcReference}</td>
                      <td className={cn("px-3 py-2.5 text-right font-mono", av.ecart >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {av.ecart >= 0 ? '+' : ''}{av.ecart.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={
                          av.statut === 'signé' ? 'success' :
                          av.statut === 'rejeté' ? 'urgent' : 'warning'
                        }>
                          {av.statut}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {av.decisionBMO ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="default" className="text-[9px]">
                              {av.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                            </Badge>
                            <Button
                              size="xs"
                              variant="link"
                              className="p-0 h-auto text-blue-400"
                              onClick={() => window.open(`/maitre-ouvrage/decisions?id=${av.decisionBMO?.decisionId}`, '_blank')}
                            >
                              📄 Voir
                            </Button>
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

      {/* FLUX FINANCIERS */}
      {activeTab === 'finances' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💰 Flux financiers pilotés</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Type</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Description</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlux.map(flux => (
                    <tr key={flux.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                      <td className="px-3 py-2.5">
                        <Badge variant={flux.type === 'gain' ? 'success' : 'urgent'}>
                          {flux.type === 'gain' ? 'Gain' : 'Perte'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">{flux.projetName || '—'}</td>
                      <td className="px-3 py-2.5">{flux.description}</td>
                      <td className={cn("px-3 py-2.5 text-right font-mono", flux.type === 'gain' ? 'text-emerald-400' : 'text-red-400')}>
                        {flux.type === 'gain' ? '+' : '-'}{flux.montant.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {flux.decisionBMO ? (
                          <>
                            <Badge variant="default" className="text-[9px]">
                              {flux.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                            </Badge>
                            <Button
                              size="xs"
                              variant="link"
                              className="p-0 h-auto text-blue-400 mt-1"
                              onClick={() => window.open(`/maitre-ouvrage/decisions?id=${flux.decisionBMO?.decisionId}`, '_blank')}
                            >
                              📄 Voir décision
                            </Button>
                          </>
                        ) : (
                          <Badge variant="warning" className="text-[9px]">⚠️ Hors BMO</Badge>
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
    </div>
  );
}

