'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { substitutions, blockedDossiers } from '@/lib/data';

export default function SubstitutionPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Stats
  const totalBlocked = substitutions.length + blockedDossiers.length;
  const avgDelay = Math.round(
    [...substitutions, ...blockedDossiers].reduce((a, d) => a + d.delay, 0) / totalBlocked
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔄 Substitution
            <Badge variant="warning">{totalBlocked}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Dossiers bloqués nécessitant une intervention du DG
          </p>
        </div>
      </div>

      {/* Alerte critique */}
      <div
        className={cn(
          'rounded-xl p-4 flex items-center gap-3 border',
          darkMode
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-red-50 border-red-200'
        )}
      >
        <span className="text-3xl animate-pulse">🚨</span>
        <div className="flex-1">
          <p className="font-bold text-red-400">
            {totalBlocked} dossiers bloqués - Intervention requise
          </p>
          <p className="text-xs text-slate-400">
            Retard moyen: {avgDelay} jours. Ces dossiers attendent votre décision pour déblocage.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => addToast('Substitution de masse lancée...', 'warning')}
        >
          ⚡ Tout substituer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{totalBlocked}</p>
            <p className="text-[10px] text-slate-400">Dossiers bloqués</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Retard moyen</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {blockedDossiers.filter((d) => d.delay > 5).length}
            </p>
            <p className="text-[10px] text-slate-400">Critiques (&gt;5j)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-400">
              {substitutions.reduce(
                (a, s) =>
                  a + parseFloat(s.amount.replace(/[M,]/g, '').replace('FCFA', '').trim()),
                0
              ).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Montant bloqué</p>
          </CardContent>
        </Card>
      </div>

      {/* Dossiers en attente de substitution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            📋 Dossiers en attente de substitution
            <Badge variant="urgent">{substitutions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {substitutions.map((sub, i) => (
            <div
              key={i}
              className={cn(
                'p-4 rounded-lg border-l-4 border-l-amber-500',
                darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
              )}
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sub.icon}</span>
                    <span className="font-mono text-[10px] text-orange-400">
                      {sub.ref}
                    </span>
                    <BureauTag bureau={sub.bureau} />
                    <Badge variant="urgent">J+{sub.delay}</Badge>
                  </div>
                  <p className="font-bold text-sm mt-1">{sub.desc}</p>
                  <p className="text-xs text-slate-400">{sub.reason}</p>
                </div>
                <span className="font-mono font-bold text-lg text-amber-400">
                  {sub.amount}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                  onClick={() =>
                    addToast(`Substitution ${sub.ref} effectuée ✔`, 'success')
                  }
                >
                  ⚡ Substituer (valider à la place)
                </Button>
                <Button
                  variant="info"
                  onClick={() => addToast(`Détails ${sub.ref}`, 'info')}
                >
                  📋 Voir
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    addToast(`Relance envoyée au responsable`, 'info')
                  }
                >
                  📧 Relancer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dossiers bloqués (autres) */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            🚨 Autres dossiers bloqués
            <Badge variant="urgent">{blockedDossiers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockedDossiers.map((dossier, i) => (
            <div
              key={i}
              className={cn(
                'p-4 rounded-lg border-l-4 border-l-red-500',
                darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
              )}
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-orange-400">
                      {dossier.id}
                    </span>
                    <BureauTag bureau={dossier.bureau} />
                    <Badge variant="urgent" pulse>
                      J+{dossier.delay}
                    </Badge>
                  </div>
                  <p className="font-bold text-sm mt-1">{dossier.type}</p>
                  <p className="text-xs text-slate-400">{dossier.reason}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400">
                    {dossier.amount}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Bloqué par: {dossier.blockedBy}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() =>
                    addToast(`Dossier ${dossier.id} débloqué ✔`, 'success')
                  }
                >
                  🔓 Débloquer
                </Button>
                <Button
                  variant="info"
                  onClick={() => addToast(`Détails ${dossier.id}`, 'info')}
                >
                  📋
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addToast(`Escalade effectuée`, 'warning')}
                >
                  ⬆️
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-orange-400">
                Principe de substitution
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                La substitution permet au DG d&apos;agir à la place d&apos;un validateur
                absent ou défaillant. Cette action est tracée avec horodatage et
                génère une notification automatique au validateur initial.
                Conformément à la politique interne, tout dossier bloqué depuis
                plus de 5 jours peut faire l&apos;objet d&apos;une substitution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
