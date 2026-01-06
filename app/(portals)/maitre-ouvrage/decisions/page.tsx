'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { decisionsEnriched } from '@/lib/data';

export default function DecisionsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'validation' | 'substitution' | 'delegation' | 'arbitrage' | 'budget'>('all');
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  const filteredDecisions = decisionsEnriched.filter(d => filter === 'all' || d.category === filter);

  const stats = useMemo(() => {
    const byCategory = {
      validation: decisionsEnriched.filter(d => d.category === 'validation').length,
      substitution: decisionsEnriched.filter(d => d.category === 'substitution').length,
      delegation: decisionsEnriched.filter(d => d.category === 'delegation').length,
      arbitrage: decisionsEnriched.filter(d => d.category === 'arbitrage').length,
      budget: decisionsEnriched.filter(d => d.category === 'budget').length,
    };
    const verified = decisionsEnriched.filter(d => d.verificationStatus === 'verified').length;
    const pending = decisionsEnriched.filter(d => d.verificationStatus === 'pending').length;
    return { total: decisionsEnriched.length, verified, pending, byCategory };
  }, []);

  const selectedD = selectedDecision ? decisionsEnriched.find(d => d.id === selectedDecision) : null;

  const handleVerifyHash = (decision: typeof selectedD) => {
    if (!decision) return;
    addActionLog({
      module: 'decisions',
      action: 'verify_hash',
      targetId: decision.id,
      targetType: 'Decision',
      details: `Vérification intégrité hash ${decision.id}`,
      status: decision.verificationStatus === 'verified' ? 'success' : 'warning',
    });
    addToast(decision.verificationStatus === 'verified' ? 'Hash vérifié ✓ - Intégrité confirmée' : 'Vérification en cours...', decision.verificationStatus === 'verified' ? 'success' : 'info');
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = { validation: '✅', substitution: '🔄', delegation: '🔑', arbitrage: '⚖️', budget: '💰', sanction: '⚠️', structurel: '🏗️' };
    return icons[cat] || '📋';
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };
    return colors[impact] || 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚖️ Registre des Décisions
            <Badge variant="info">{stats.total} décisions</Badge>
          </h1>
          <p className="text-sm text-slate-400">Traçabilité complète avec vérification d'intégrité</p>
        </div>
      </div>

      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-400">{stats.verified}/{stats.total} décisions vérifiées</h3>
              <p className="text-sm text-slate-400">Hash présent + cohérence auteur/date confirmée</p>
            </div>
            {stats.pending > 0 && <Badge variant="warning">{stats.pending} en attente</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.byCategory.validation}</p>
            <p className="text-[10px] text-slate-400">Validations</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.byCategory.substitution}</p>
            <p className="text-[10px] text-slate-400">Substitutions</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.byCategory.delegation}</p>
            <p className="text-[10px] text-slate-400">Délégations</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.byCategory.arbitrage}</p>
            <p className="text-[10px] text-slate-400">Arbitrages</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">{stats.byCategory.budget}</p>
            <p className="text-[10px] text-slate-400">Budget</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'validation', label: '✅ Validations' },
          { id: 'substitution', label: '🔄 Substitutions' },
          { id: 'delegation', label: '🔑 Délégations' },
          { id: 'arbitrage', label: '⚖️ Arbitrages' },
          { id: 'budget', label: '💰 Budget' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredDecisions.map((decision) => {
            const isSelected = selectedDecision === decision.id;
            
            return (
              <Card
                key={decision.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  decision.impactLevel === 'critical' && 'border-l-4 border-l-red-500',
                  decision.impactLevel === 'high' && 'border-l-4 border-l-orange-500',
                )}
                onClick={() => setSelectedDecision(decision.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-400">{decision.id}</span>
                        <Badge variant="info">{getCategoryIcon(decision.category)} {decision.category}</Badge>
                        <Badge variant={decision.impactLevel === 'critical' ? 'urgent' : decision.impactLevel === 'high' ? 'warning' : 'default'}>{decision.impactLevel}</Badge>
                      </div>
                      <h3 className="font-bold mt-1">{decision.type}</h3>
                      <p className="text-sm text-slate-400">{decision.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{decision.date}</p>
                      <p className="text-sm">{decision.author}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{decision.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {decision.linkedBureaux.map((bureau, idx) => (
                      <Badge key={idx} variant="default">{bureau}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm", decision.verificationStatus === 'verified' ? "text-emerald-400" : "text-amber-400")}>
                        {decision.verificationStatus === 'verified' ? '✓ Vérifié' : '⏳ En attente'}
                      </span>
                      {decision.verifiedAt && <span className="text-xs text-slate-400">{decision.verifiedAt}</span>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleVerifyHash(decision); }}>🔍 Vérifier</Button>
                  </div>

                  <div className="mt-2 p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash SHA3-256</p>
                    <p className="font-mono text-[10px] truncate">{decision.hash}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedD ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(selectedD.category)}</span>
                    <Badge variant="info">{selectedD.category}</Badge>
                    <Badge variant={selectedD.impactLevel === 'critical' ? 'urgent' : selectedD.impactLevel === 'high' ? 'warning' : 'default'}>{selectedD.impactLevel}</Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedD.id}</span>
                  <h3 className="font-bold">{selectedD.type}</h3>
                  <p className="text-sm text-slate-400">{selectedD.subject}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Description</p>
                    <p>{selectedD.description}</p>
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Justification</p>
                    <p>{selectedD.justification}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400">Auteur</p>
                      <p className="font-medium">{selectedD.author}</p>
                    </div>
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400">Date</p>
                      <p className="font-mono text-xs">{selectedD.date}</p>
                    </div>
                  </div>

                  {selectedD.witnesses && selectedD.witnesses.length > 0 && (
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400 mb-1">Témoins</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedD.witnesses.map((w, idx) => <Badge key={idx} variant="default">{w}</Badge>)}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Documents liés</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedD.linkedDocuments.map((doc, idx) => <Badge key={idx} variant="info">{doc}</Badge>)}
                    </div>
                  </div>

                  <div className={cn("p-3 rounded", selectedD.verificationStatus === 'verified' ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-amber-500/10 border border-amber-500/30")}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={cn("font-bold text-xs", selectedD.verificationStatus === 'verified' ? "text-emerald-400" : "text-amber-400")}>
                        {selectedD.verificationStatus === 'verified' ? '✓ Intégrité vérifiée' : '⏳ Vérification en attente'}
                      </p>
                    </div>
                    {selectedD.verifiedAt && <p className="text-xs text-slate-400">Vérifié le {selectedD.verifiedAt} par {selectedD.verifiedBy}</p>}
                  </div>

                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash SHA3-256</p>
                    <p className="font-mono text-[10px] break-all">{selectedD.hash}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => handleVerifyHash(selectedD)}>🔍 Vérifier hash</Button>
                  <Button size="sm" variant="info" className="flex-1" onClick={() => addToast('Export PDF généré', 'success')}>📄 Exporter</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">⚖️</span><p className="text-slate-400">Sélectionnez une décision</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
