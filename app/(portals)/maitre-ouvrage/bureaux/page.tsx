'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bureaux } from '@/lib/data';

export default function BureauxPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Stats globales
  const totalAgents = bureaux.reduce((a, b) => a + b.agents, 0);
  const totalTasks = bureaux.reduce((a, b) => a + b.tasks, 0);
  const avgCompletion = Math.round(
    bureaux.reduce((a, b) => a + b.completion, 0) / bureaux.length
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🏢 Bureaux
            <Badge variant="success">{bureaux.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Organisation et performance des bureaux
          </p>
        </div>
        <Button onClick={() => addToast('Configuration bureaux', 'info')}>
          ⚙️ Configurer
        </Button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{bureaux.length}</p>
            <p className="text-[10px] text-slate-400">Bureaux actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalAgents}</p>
            <p className="text-[10px] text-slate-400">Agents total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalTasks}</p>
            <p className="text-[10px] text-slate-400">Tâches en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{avgCompletion}%</p>
            <p className="text-[10px] text-slate-400">Complétion moy.</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des bureaux */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {bureaux.map((bureau, i) => (
          <Card
            key={i}
            className="hover:border-orange-500/50 transition-all cursor-pointer"
            style={{ borderTopColor: bureau.color, borderTopWidth: '3px' }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{bureau.icon}</span>
                  <div>
                    <CardTitle className="text-sm">{bureau.code}</CardTitle>
                    <p className="text-[10px] text-slate-400">{bureau.name}</p>
                  </div>
                </div>
                <Badge
                  variant={bureau.completion >= 90 ? 'success' : bureau.completion >= 70 ? 'warning' : 'urgent'}
                >
                  {bureau.completion}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-400">{bureau.desc}</p>

              {/* Stats du bureau */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    'p-2 rounded-lg text-center',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}
                >
                  <p className="text-lg font-bold">{bureau.agents}</p>
                  <p className="text-[9px] text-slate-400">Agents</p>
                </div>
                <div
                  className={cn(
                    'p-2 rounded-lg text-center',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}
                >
                  <p className="text-lg font-bold">{bureau.tasks}</p>
                  <p className="text-[9px] text-slate-400">Tâches</p>
                </div>
              </div>

              {/* Responsable */}
              <div
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: bureau.color }}
                >
                  {bureau.head
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{bureau.head}</p>
                  <p className="text-[10px] text-slate-400">Chef de bureau</p>
                </div>
              </div>

              {/* Budget */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Budget mensuel</span>
                <span className="font-mono font-bold text-amber-400">
                  {bureau.budget} FCFA
                </span>
              </div>

              {/* Barre de progression */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400">Avancement</span>
                  <span className="font-bold">{bureau.completion}%</span>
                </div>
                <div
                  className={cn(
                    'h-2 rounded-full',
                    darkMode ? 'bg-slate-700' : 'bg-gray-200'
                  )}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${bureau.completion}%`,
                      backgroundColor: bureau.color,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 pt-2">
                <Button
                  size="xs"
                  variant="info"
                  className="flex-1"
                  onClick={() => addToast(`Détails ${bureau.code}`, 'info')}
                >
                  📊 Détails
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => addToast(`Équipe ${bureau.code}`, 'info')}
                >
                  👥 Équipe
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
