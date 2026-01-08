'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBMOStore } from '@/lib/stores';
import { financials } from '@/lib/data';
import { useHashVerification } from '@/lib/utils/verifyHash';

type DecisionEntry = {
  type: 'Gain' | 'Perte' | 'Trésorerie';
  decisionId: string;
  origin: string;
  validatorRole: 'A' | 'R';
  hash: string;
  date: string;
  montant: number;
  description: string;
  projetName?: string;
  link: string;
};

export default function DecisionsPage() {
  const { addToast } = useBMOStore();
  const { verify } = useHashVerification();
  const [search, setSearch] = useState('');

  const decisions = useMemo(() => {
    const all: DecisionEntry[] = [];

    financials.gains.forEach(g => {
      if (g.decisionBMO) {
        all.push({
          type: 'Gain',
          decisionId: g.decisionBMO.decisionId,
          origin: g.decisionBMO.origin,
          validatorRole: g.decisionBMO.validatorRole,
          hash: g.decisionBMO.hash,
          date: g.date,
          montant: g.montant,
          description: g.description,
          projetName: g.projetName,
          link: g.decisionBMO.origin === 'validation-bc' ? `/validation-bc?id=${g.decisionBMO.decisionId}` : '#',
        });
      }
    });

    financials.pertes.forEach(p => {
      if (p.decisionBMO) {
        all.push({
          type: 'Perte',
          decisionId: p.decisionBMO.decisionId,
          origin: p.decisionBMO.origin,
          validatorRole: p.decisionBMO.validatorRole,
          hash: p.decisionBMO.hash,
          date: p.date,
          montant: p.montant,
          description: p.description,
          projetName: p.projetName,
          link: p.decisionBMO.origin === 'arbitrages' ? `/arbitrages?id=${p.decisionBMO.decisionId}` : '#',
        });
      }
    });

    financials.treasury.forEach(t => {
      if (t.decisionBMO) {
        all.push({
          type: 'Trésorerie',
          decisionId: t.decisionBMO.decisionId,
          origin: t.decisionBMO.origin,
          validatorRole: t.decisionBMO.validatorRole,
          hash: t.decisionBMO.hash,
          date: t.date,
          montant: t.montant,
          description: t.description,
          link: '/validation-paiements',
        });
      }
    });

    return all;
  }, []);

  const filtered = useMemo(() => {
    return decisions.filter(d =>
      d.decisionId.toLowerCase().includes(search.toLowerCase()) ||
      d.hash.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.projetName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, decisions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">🔐 Registre des décisions BMO</h1>
          <p className="text-sm text-slate-400">Toutes les décisions tracées — Hash + RACI + Origine</p>
        </div>
        <Input
          placeholder="Rechercher par ID, hash ou projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(decision => (
          <Card key={decision.decisionId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{decision.decisionId}</span>
                <Badge variant={decision.type === 'Gain' ? 'success' : decision.type === 'Perte' ? 'urgent' : 'info'}>
                  {decision.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span>{decision.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Montant</span>
                <span className="font-mono">
                  {decision.montant > 0 ? '+' : ''}{decision.montant.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projet</span>
                <span>{decision.projetName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rôle RACI</span>
                <Badge variant={decision.validatorRole === 'A' ? 'warning' : 'default'}>
                  {decision.validatorRole === 'A' ? 'Accountable (BMO)' : 'Responsible'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Origine</span>
                <span>{decision.origin}</span>
              </div>
              <div className="pt-2">
                <p className="text-slate-500">{decision.description}</p>
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                <code className="text-[10px] bg-slate-800/50 px-1 rounded">{decision.hash.slice(0, 32)}...</code>
                <Button
                  size="sm"
                  variant="link"
                  className="text-blue-400 p-0 h-auto"
                  onClick={() => window.open(decision.link, '_blank')}
                >
                  📄 Voir décision
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={async () => {
                    const isValid = await verify(decision.decisionId, decision.hash);
                    if (isValid) {
                      addToast('✅ Hash valide – décision authentique', 'success');
                    } else {
                      addToast('❌ Hash invalide – altération détectée', 'error');
                    }
                  }}
                >
                  🔍 Vérifier l'intégrité
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            Aucune décision trouvée.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
