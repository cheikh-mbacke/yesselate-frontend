'use client';

import { useMemo } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinanceDashboardProps {
  financials: any;
  evolution: Array<{ month: string; gains: number; pertes: number; solde: number }>;
}

const fmtFcfa = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';

export function FinanceDashboard({ financials, evolution }: FinanceDashboardProps) {
  const summary = useMemo(() => {
    return {
      totalGains: financials?.totalGains ?? 0,
      totalPertes: financials?.totalPertes ?? 0,
      resultatNet: financials?.resultatNet ?? 0,
      tauxMarge: financials?.tauxMarge ?? 0,
      tresorerieActuelle: financials?.tresorerieActuelle ?? 0,
      tresoreriePrevisionnelle: financials?.tresoreriePrevisionnelle ?? 0,
      kpis: financials?.kpis ?? {},
    };
  }, [financials]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              💰 Gains (total)
              <Badge variant="success">+</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-400">{fmtFcfa(summary.totalGains)}</div>
            <p className="text-xs text-slate-400 mt-1">Inclut paiements clients + subventions</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              📉 Pertes (total)
              <Badge variant="urgent">-</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-400">{fmtFcfa(summary.totalPertes)}</div>
            <p className="text-xs text-slate-400 mt-1">Malfacons + contentieux</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              🧾 Résultat net
              <Badge variant="warning">{Number(summary.tauxMarge).toFixed(1)}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-400">{fmtFcfa(summary.resultatNet)}</div>
            <p className="text-xs text-slate-400 mt-1">Marge nette + indicateurs clés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-sm">🏦 Trésorerie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Actuelle</span>
              <span className="font-semibold">{fmtFcfa(summary.tresorerieActuelle)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Prévisionnelle</span>
              <span className="font-semibold">{fmtFcfa(summary.tresoreriePrevisionnelle)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recouvrement</span>
                <span className="text-emerald-400 font-semibold">{Number(summary.kpis?.ratioRecouvrement ?? 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Exposition litiges</span>
                <span className="text-red-300 font-semibold">{fmtFcfa(summary.kpis?.expositionLitiges ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/40">
          <CardHeader>
            <CardTitle className="text-sm">📌 Lecture DG (anti-contestation)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 space-y-2">
            <p>
              Cette vue est alimentée par les données <code className="text-[10px] px-1 py-0.5 rounded bg-slate-700">financials</code> et son historique
              <code className="text-[10px] px-1 py-0.5 rounded bg-slate-700 ml-1">financials.evolution</code>.
            </p>
            <p>
              Objectif: permettre un pilotage rapide (résultat net, trésorerie, exposition litiges) avec export PDF/PNG.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-600/40">
        <CardHeader>
          <CardTitle className="text-sm">📈 Évolution mensuelle (gains / pertes / solde)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [fmtFcfa(Number(value)), name]}
                />
                <Legend />
                <Line type="monotone" dataKey="gains" stroke="#10B981" strokeWidth={2} name="Gains" dot={false} />
                <Line type="monotone" dataKey="pertes" stroke="#EF4444" strokeWidth={2} name="Pertes" dot={false} />
                <Line type="monotone" dataKey="solde" stroke="#F97316" strokeWidth={2} name="Solde" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


