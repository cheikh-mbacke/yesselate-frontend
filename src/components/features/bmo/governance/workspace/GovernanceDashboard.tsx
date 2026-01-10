/**
 * Dashboard d'accueil du Workspace Gouvernance
 * Vue principale avec actions rapides et compteurs
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  FileText, 
  TrendingUp,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { GovernanceLiveCounters } from './GovernanceLiveCounters';
import { GovernanceStats } from './GovernanceStats';

export function GovernanceDashboard() {
  const { openTab, setRACIQueue, setAlertQueue } = useGovernanceWorkspaceStore();
  
  const quickActions = [
    {
      icon: Users,
      label: 'Matrice RACI',
      description: 'Voir toutes les activités',
      color: 'from-blue-500 to-cyan-500',
      action: () => {
        setRACIQueue('all');
        openTab('raci-inbox', 'Matrice RACI');
      },
    },
    {
      icon: AlertTriangle,
      label: 'Alertes',
      description: 'Gérer les alertes système',
      color: 'from-red-500 to-orange-500',
      action: () => {
        setAlertQueue('all');
        openTab('alerts-inbox', 'Alertes');
      },
    },
    {
      icon: Shield,
      label: 'Conflits RACI',
      description: 'Voir les conflits de rôles',
      color: 'from-amber-500 to-yellow-500',
      action: () => {
        setRACIQueue('conflicts');
        openTab('raci-inbox', 'Conflits RACI');
      },
    },
    {
      icon: Zap,
      label: 'Alertes Critiques',
      description: 'Alertes haute priorité',
      color: 'from-purple-500 to-pink-500',
      action: () => {
        setAlertQueue('critical');
        openTab('alerts-inbox', 'Alertes Critiques');
      },
    },
  ];
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Card */}
      <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-400" />
            Gouvernance & Responsabilités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-base leading-relaxed">
            Gérez les responsabilités (matrice RACI) et surveillez les alertes système.
            Utilisez les compteurs en direct et les raccourcis clavier pour une navigation rapide.
          </p>
          
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Comment utiliser
            </h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• Cliquez sur un compteur pour ouvrir la vue correspondante</li>
              <li>• Utilisez <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">⌘K</kbd> pour ouvrir la palette de commandes</li>
              <li>• <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">⌘1-4</kbd> pour accès rapide aux files</li>
              <li>• <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">Ctrl+Tab</kbd> pour naviguer entre onglets</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Live Counters */}
      <GovernanceLiveCounters mode="extended" />
      
      {/* Stats avancées */}
      <GovernanceStats />
      
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="group border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl hover:scale-105 transition-all cursor-pointer"
            onClick={action.action}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full bg-gradient-to-br ${action.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{action.label}</h3>
                <p className="text-white/50 text-sm">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RACI Stats */}
        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Matrice RACI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="Activités totales" value="42" />
              <StatRow label="Rôles assignés" value="156" />
              <StatRow label="Conflits détectés" value="3" trend="warning" />
              <StatRow label="Non assignés" value="5" trend="warning" />
            </div>
          </CardContent>
        </Card>
        
        {/* Alerts Stats */}
        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="Alertes actives" value="8" trend="up" />
              <StatRow label="Critiques" value="2" trend="critical" />
              <StatRow label="Résolues aujourd'hui" value="5" trend="success" />
              <StatRow label="Temps moy. résolution" value="2.3h" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'success' | 'warning' | 'critical';
}

function StatRow({ label, value, trend }: StatRowProps) {
  const trendColors = {
    up: 'text-blue-400',
    down: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  };
  
  const trendColor = trend ? trendColors[trend] : 'text-white';
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={`font-semibold ${trendColor}`}>{value}</span>
    </div>
  );
}

