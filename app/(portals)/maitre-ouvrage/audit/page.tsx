'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auditItems } from '@/lib/data';

export default function AuditPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Stats
  const avgScore = Math.round(
    auditItems.reduce((a, i) => a + i.score, 0) / auditItems.length
  );
  const conformeCount = auditItems.filter((i) => i.status === 'conforme').length;
  const attentionCount = auditItems.filter((i) => i.status === 'attention').length;
  const nonConformeCount = auditItems.filter((i) => i.status === 'non-conforme').length;

  const statusStyles = {
    conforme: { bg: 'bg-emerald-500', text: 'Conforme', icon: '✅' },
    attention: { bg: 'bg-amber-500', text: 'Attention', icon: '⚠️' },
    'non-conforme': { bg: 'bg-red-500', text: 'Non-conforme', icon: '❌' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔍 Audit & Conformité
          </h1>
          <p className="text-sm text-slate-400">
            Suivi des contrôles et conformité OHADA
          </p>
        </div>
        <Button onClick={() => addToast('Nouvel audit lancé', 'success')}>
          🔍 Lancer un audit
        </Button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-emerald-400">{avgScore}%</p>
            <p className="text-xs text-slate-400 mt-1">Score global</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{conformeCount}</p>
            <p className="text-xs text-slate-400">Conformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{attentionCount}</p>
            <p className="text-xs text-slate-400">Attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{nonConformeCount}</p>
            <p className="text-xs text-slate-400">Non-conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* Jauge de conformité */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Niveau de conformité global</h3>
            <span className="text-2xl font-bold text-emerald-400">{avgScore}%</span>
          </div>
          <div className={cn('h-4 rounded-full', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
            <div
              className={cn(
                'h-full rounded-full transition-all',
                avgScore >= 90
                  ? 'bg-emerald-500'
                  : avgScore >= 70
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${avgScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Liste des audits */}
      <div className="grid md:grid-cols-2 gap-4">
        {auditItems.map((item, i) => {
          const status = statusStyles[item.status as keyof typeof statusStyles];
          return (
            <Card
              key={i}
              className={cn(
                'hover:border-orange-500/50 transition-all',
                item.status === 'non-conforme' && 'border-l-4 border-l-red-500',
                item.status === 'attention' && 'border-l-4 border-l-amber-500',
                item.status === 'conforme' && 'border-l-4 border-l-emerald-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-[10px] text-orange-400">
                      {item.id}
                    </span>
                    <h3 className="font-bold text-sm">{item.type}</h3>
                  </div>
                  <Badge
                    variant={
                      item.status === 'conforme'
                        ? 'success'
                        : item.status === 'attention'
                        ? 'warning'
                        : 'urgent'
                    }
                  >
                    {status.icon} {status.text}
                  </Badge>
                </div>

                {/* Score */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Score</span>
                    <span
                      className={cn(
                        'font-bold',
                        item.score >= 90
                          ? 'text-emerald-400'
                          : item.score >= 70
                          ? 'text-amber-400'
                          : 'text-red-400'
                      )}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <div className={cn('h-2 rounded-full', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                    <div
                      className={cn(
                        'h-full rounded-full',
                        item.score >= 90
                          ? 'bg-emerald-500'
                          : item.score >= 70
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Dernier contrôle: </span>
                    <span>{item.lastCheck}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Prochain: </span>
                    <span className="text-orange-400">{item.nextCheck}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="xs"
                    variant="info"
                    onClick={() => addToast(`Détails audit ${item.id}`, 'info')}
                  >
                    📋 Rapport
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => addToast('Audit relancé', 'success')}
                  >
                    🔄 Relancer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info OHADA */}
      <Card className="border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="font-bold text-sm text-purple-400">
                Conformité OHADA
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tous les audits sont réalisés conformément aux Actes Uniformes
                de l&apos;OHADA (Organisation pour l&apos;Harmonisation en Afrique du Droit
                des Affaires). Les rapports sont archivés et horodatés pour
                garantir la traçabilité.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
