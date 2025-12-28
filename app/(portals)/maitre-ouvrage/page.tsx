'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/features/bmo/KPICard';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  performanceData,
  bureauPieData,
  projectStatusData,
  systemAlerts,
  demands,
  projects,
  timeline,
  substitutions,
} from '@/lib/data';

export default function DashboardPage() {
  const { darkMode } = useAppStore();
  const { liveStats, addToast } = useBMOStore();

  // Animation des KPIs
  const [animatedKPIs, setAnimatedKPIs] = useState({
    demands: 0,
    validated: 0,
    projects: 0,
    blocked: 0,
    budget: 0,
    employees: 0,
  });

  useEffect(() => {
    const targets = {
      demands: 14,
      validated: 47,
      projects: 8,
      blocked: 4,
      budget: 36.4,
      employees: 24,
    };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / 30, 3);
      setAnimatedKPIs({
        demands: Math.round(targets.demands * p),
        validated: Math.round(targets.validated * p),
        projects: Math.round(targets.projects * p),
        blocked: Math.round(targets.blocked * p),
        budget: parseFloat((targets.budget * p).toFixed(1)),
        employees: Math.round(targets.employees * p),
      });
      if (step >= 30) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Alerte critique */}
      <div
        className={cn(
          'rounded-xl p-3 flex items-center gap-3 border',
          darkMode
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-red-50 border-red-200'
        )}
      >
        <span className="text-2xl animate-pulse">🚨</span>
        <div className="flex-1">
          <p className="font-bold text-sm text-red-400">
            {liveStats.alertesCritiques} dossiers bloqués depuis plus de 5 jours
          </p>
          <p className="text-xs text-slate-400">
            Action de substitution requise pour débloquer
          </p>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => addToast('Ouverture du module substitution...', 'info')}
        >
          Intervenir
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          icon="📋"
          label="Demandes"
          value={animatedKPIs.demands}
          trend="+3 aujourd'hui"
          up={true}
          color="#F97316"
        />
        <KPICard
          icon="✅"
          label="Validées"
          value={animatedKPIs.validated}
          trend="Ce mois"
          color="#10B981"
        />
        <KPICard
          icon="🏗️"
          label="Projets actifs"
          value={animatedKPIs.projects}
          trend="5 en cours"
          color="#3B82F6"
        />
        <KPICard
          icon="🚨"
          label="Bloqués"
          value={animatedKPIs.blocked}
          trend="Action requise"
          up={false}
          color="#EF4444"
        />
        <KPICard
          icon="💰"
          label="Budget"
          value={`${animatedKPIs.budget}M`}
          sub="FCFA"
          trend="72% utilisé"
          color="#D4AF37"
        />
        <KPICard
          icon="👥"
          label="Effectif"
          value={animatedKPIs.employees}
          trend="1 en mission"
          color="#8B5CF6"
        />
      </div>

      {/* Stats temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {liveStats.tauxValidation}%
            </p>
            <p className="text-[10px] text-slate-400">Taux validation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {liveStats.tempsReponse}
            </p>
            <p className="text-[10px] text-slate-400">Temps moyen réponse</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {liveStats.validationsJour}
            </p>
            <p className="text-[10px] text-slate-400">Validations jour</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-400">
              {liveStats.montantTraite}
            </p>
            <p className="text-[10px] text-slate-400">Montant traité (FCFA)</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et contenu principal */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Graphique performance */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              📊 Performance annuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="validations"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par bureau */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏢 Répartition bureaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bureauPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {bureauPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {bureauPieData.map((item, i) => (
                <span
                  key={i}
                  className="text-[9px] flex items-center gap-1"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline et demandes récentes */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">⏱️ Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timeline.map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    item.type === 'validated'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : item.type === 'substitution'
                      ? 'bg-orange-500/20 text-orange-400'
                      : item.type === 'delegation'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  )}
                >
                  {item.type === 'validated'
                    ? '✓'
                    : item.type === 'substitution'
                    ? '🔄'
                    : item.type === 'delegation'
                    ? '🔑'
                    : '⚠️'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <div className="text-right">
                  <BureauTag bureau={item.bureau} />
                  <p className="text-[9px] text-slate-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Demandes urgentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>📋 Demandes urgentes</span>
              <Badge variant="urgent" pulse>
                {demands.filter((d) => d.priority === 'urgent').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demands
              .filter((d) => d.priority === 'urgent' || d.priority === 'high')
              .slice(0, 4)
              .map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                    darkMode
                      ? 'bg-slate-700/30 hover:bg-slate-700/50'
                      : 'bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <span className="text-lg">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{d.subject}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-orange-400">
                        {d.id}
                      </span>
                      <BureauTag bureau={d.bureau} />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={d.priority === 'urgent' ? 'urgent' : 'warning'}
                      pulse={d.priority === 'urgent'}
                    >
                      {d.priority}
                    </Badge>
                    <p className="text-[9px] text-slate-400 mt-1">{d.amount}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Substitutions requises */}
      {substitutions.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🔄 Substitutions requises
              <Badge variant="warning">{substitutions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {substitutions.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg border-l-4 border-l-amber-500',
                    darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-orange-400">
                          {s.ref}
                        </span>
                        <BureauTag bureau={s.bureau} icon={s.icon} />
                      </div>
                      <p className="text-xs font-semibold mt-1">{s.desc}</p>
                      <p className="text-[10px] text-slate-400">{s.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="urgent">J+{s.delay}</Badge>
                      <p className="text-[10px] font-mono text-amber-400 mt-1">
                        {s.amount}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="warning"
                    className="w-full mt-2"
                    onClick={() => addToast(`Substitution ${s.ref} en cours...`, 'warning')}
                  >
                    ⚡ Substituer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertes système */}
      <div className="grid md:grid-cols-4 gap-2">
        {systemAlerts.map((alert, i) => (
          <div
            key={i}
            className={cn(
              'p-2 rounded-lg flex items-center gap-2',
              alert.type === 'critical'
                ? 'bg-red-500/10 border border-red-500/30'
                : alert.type === 'warning'
                ? 'bg-amber-500/10 border border-amber-500/30'
                : alert.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-blue-500/10 border border-blue-500/30'
            )}
          >
            <span className="text-lg">
              {alert.type === 'critical'
                ? '🚨'
                : alert.type === 'warning'
                ? '⚠️'
                : alert.type === 'success'
                ? '✅'
                : 'ℹ️'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold truncate">{alert.title}</p>
              <p className="text-[9px] text-slate-400">{alert.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
