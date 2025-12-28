'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { projects } from '@/lib/data';
import type { ProjectStatus } from '@/lib/types/bmo.types';

export default function ProjetsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');

  // Filtrer les projets
  const filteredProjects = projects.filter(
    (p) => filter === 'all' || p.status === filter
  );

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    blocked: projects.filter((p) => p.status === 'blocked').length,
    avgProgress: Math.round(
      projects.reduce((a, p) => a + p.progress, 0) / projects.length
    ),
  };

  // Calcul budget total
  const totalBudget = projects.reduce(
    (a, p) => a + parseFloat(p.budget.replace(/[M,]/g, '')) * 1000000,
    0
  );
  const totalSpent = projects.reduce(
    (a, p) => a + parseFloat(p.spent.replace(/[M,]/g, '')) * 1000000,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🏗️ Projets
            <Badge variant="gold">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Suivi et gestion des projets de construction
          </p>
        </div>
        <Button onClick={() => addToast('Nouveau projet créé', 'success')}>
          + Nouveau projet
        </Button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {stats.completed}
            </p>
            <p className="text-[10px] text-slate-400">Terminés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-[10px] text-slate-400">Bloqués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {stats.avgProgress}%
            </p>
            <p className="text-[10px] text-slate-400">Avancement moy.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-400">
              {(totalBudget / 1000000).toFixed(0)}M
            </p>
            <p className="text-[10px] text-slate-400">Budget total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous', count: stats.total },
          { id: 'active', label: 'En cours', count: stats.active },
          { id: 'completed', label: 'Terminés', count: stats.completed },
          { id: 'blocked', label: 'Bloqués', count: stats.blocked },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as 'all' | ProjectStatus)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      {/* Liste des projets */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all',
              project.status === 'blocked' && 'border-l-4 border-l-red-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-[10px] text-orange-400">
                    {project.id}
                  </span>
                  <h3 className="font-bold text-sm">{project.name}</h3>
                  <p className="text-xs text-slate-400">{project.client}</p>
                  <BureauTag bureau={project.bureau} />
                </div>
                <Badge
                  variant={
                    project.status === 'active'
                      ? 'success'
                      : project.status === 'blocked'
                      ? 'urgent'
                      : project.status === 'completed'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {project.status === 'active'
                    ? 'En cours'
                    : project.status === 'blocked'
                    ? 'Bloqué'
                    : project.status === 'completed'
                    ? 'Terminé'
                    : 'Attente'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Budget</span>
                  <span className="font-bold">{project.budget} FCFA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Dépensé</span>
                  <span className="font-semibold text-amber-400">
                    {project.spent} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Reste</span>
                  <span className="font-semibold text-emerald-400">
                    {(
                      parseFloat(project.budget.replace(/[M,]/g, '')) -
                      parseFloat(project.spent.replace(/[M,]/g, ''))
                    ).toFixed(1)}
                    M FCFA
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Équipe</span>
                  <span>{project.team} agents</span>
                </div>

                {/* Barre de progression */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex-1 h-2 rounded-full',
                      darkMode ? 'bg-slate-700' : 'bg-gray-200'
                    )}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full',
                        project.progress >= 90
                          ? 'bg-emerald-500'
                          : project.progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-orange-500'
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{project.progress}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-700/50">
                <Button
                  size="xs"
                  variant="info"
                  onClick={() => addToast(`Détails ${project.name}`, 'info')}
                >
                  📊 Détails
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => addToast(`Édition ${project.name}`, 'info')}
                >
                  ✏️ Éditer
                </Button>
                <Button size="xs" variant="ghost">
                  📅
                </Button>
                <Button size="xs" variant="ghost">
                  👥
                </Button>
                <Button size="xs" variant="ghost">
                  💰
                </Button>
                <Button size="xs" variant="ghost">
                  📁
                </Button>
              </div>

              {project.status === 'blocked' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full mt-2 animate-pulse"
                  onClick={() =>
                    addToast(`Déblocage ${project.name} en cours...`, 'warning')
                  }
                >
                  🚨 Débloquer ce projet
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
