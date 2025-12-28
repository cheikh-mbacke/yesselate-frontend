'use client';

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
  ComposedChart,
  Line,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performanceData, bureauPieData, projectStatusData } from '@/lib/data';

export default function AnalyticsPage() {
  const { darkMode } = useAppStore();

  // Données pour les graphiques
  const monthlyData = performanceData.map((d) => ({
    ...d,
    tauxValidation: Math.round((d.validations / d.demandes) * 100),
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          📈 Tableaux de bord BI
        </h1>
        <p className="text-sm text-slate-400">
          Analyses et indicateurs de performance
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">94.2%</p>
            <p className="text-xs text-slate-400">Taux de validation</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">513.4M</p>
            <p className="text-xs text-slate-400">Budget total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">2.4h</p>
            <p className="text-xs text-slate-400">Temps réponse moy.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">92</p>
            <p className="text-xs text-slate-400">Validations ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Performance mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📊 Performance mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData}>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
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
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="demandes"
                    fill="#3B82F6"
                    name="Demandes"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="validations"
                    fill="#10B981"
                    name="Validations"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tauxValidation"
                    stroke="#F97316"
                    strokeWidth={2}
                    name="Taux %"
                    dot={{ fill: '#F97316' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              💰 Évolution budget (Milliards FCFA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
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
                    dataKey="budget"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#colorBudget)"
                    name="Budget (Mds)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Répartition par bureau */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🏢 Charge par bureau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bureauPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
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
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {bureauPieData.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px]">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statut des projets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🏗️ Statut projets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {projectStatusData.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px]">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rejets par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">❌ Rejets mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                  <Bar
                    dataKey="rejets"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    name="Rejets"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📋 Données mensuelles détaillées</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-4 py-2.5 text-left font-bold text-amber-500">Mois</th>
                  <th className="px-4 py-2.5 text-right font-bold text-blue-400">Demandes</th>
                  <th className="px-4 py-2.5 text-right font-bold text-emerald-400">Validations</th>
                  <th className="px-4 py-2.5 text-right font-bold text-red-400">Rejets</th>
                  <th className="px-4 py-2.5 text-right font-bold text-orange-400">Taux %</th>
                  <th className="px-4 py-2.5 text-right font-bold text-amber-400">Budget (Mds)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      'border-t',
                      darkMode ? 'border-slate-700/50' : 'border-gray-100'
                    )}
                  >
                    <td className="px-4 py-2 font-medium">{row.month}</td>
                    <td className="px-4 py-2 text-right text-blue-400">{row.demandes}</td>
                    <td className="px-4 py-2 text-right text-emerald-400">{row.validations}</td>
                    <td className="px-4 py-2 text-right text-red-400">{row.rejets}</td>
                    <td className="px-4 py-2 text-right text-orange-400">{row.tauxValidation}%</td>
                    <td className="px-4 py-2 text-right text-amber-400">{row.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
