'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { systemAlerts, consignesBureaux } from '@/lib/data';

type TabType = 'alerts' | 'consignes';

export default function AlertsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('alerts');

  const alertTypeStyles = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🚨', color: 'text-red-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '⚠️', color: 'text-amber-400' },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '✅', color: 'text-emerald-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'ℹ️', color: 'text-blue-400' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚠️ Alertes et Consignes
            <Badge variant="warning">
              {systemAlerts.length + consignesBureaux.length}
            </Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Alertes système et consignes aux bureaux
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle consigne créée', 'success')}>
          + Nouvelle consigne
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeTab === 'alerts' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alertes ({systemAlerts.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'consignes' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('consignes')}
        >
          📢 Consignes ({consignesBureaux.length})
        </Button>
      </div>

      {/* Tab Alertes */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {/* Stats alertes */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-red-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-400">
                  {systemAlerts.filter((a) => a.type === 'critical').length}
                </p>
                <p className="text-[10px] text-slate-400">Critiques</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">
                  {systemAlerts.filter((a) => a.type === 'warning').length}
                </p>
                <p className="text-[10px] text-slate-400">Avertissements</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {systemAlerts.filter((a) => a.type === 'success').length}
                </p>
                <p className="text-[10px] text-slate-400">Succès</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {systemAlerts.filter((a) => a.type === 'info').length}
                </p>
                <p className="text-[10px] text-slate-400">Infos</p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des alertes */}
          {systemAlerts.map((alert, i) => {
            const style = alertTypeStyles[alert.type as keyof typeof alertTypeStyles];
            return (
              <Card key={i} className={cn(style.bg, style.border)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{style.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-orange-400">
                          {alert.id}
                        </span>
                        <Badge
                          variant={
                            alert.type === 'critical'
                              ? 'urgent'
                              : alert.type === 'warning'
                              ? 'warning'
                              : alert.type === 'success'
                              ? 'success'
                              : 'info'
                          }
                        >
                          {alert.type}
                        </Badge>
                      </div>
                      <h3 className={cn('font-bold text-sm', style.color)}>
                        {alert.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{alert.action}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => addToast(`Alerte ${alert.id} acquittée`, 'success')}
                      >
                        ✓
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => addToast(`Détails alerte`, 'info')}
                      >
                        👁
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab Consignes */}
      {activeTab === 'consignes' && (
        <div className="space-y-3">
          {consignesBureaux.map((consigne, i) => (
            <Card
              key={i}
              className={cn(
                'hover:border-orange-500/50 transition-all',
                consigne.priority === 'urgent' && 'border-l-4 border-l-red-500',
                consigne.priority === 'high' && 'border-l-4 border-l-amber-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-orange-400">
                        {consigne.id}
                      </span>
                      {consigne.bureau === 'ALL' ? (
                        <Badge variant="gold">Tous bureaux</Badge>
                      ) : (
                        <BureauTag bureau={consigne.bureau} />
                      )}
                      <Badge
                        variant={
                          consigne.priority === 'urgent'
                            ? 'urgent'
                            : consigne.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {consigne.priority}
                      </Badge>
                      <Badge variant={consigne.status === 'active' ? 'success' : 'default'}>
                        {consigne.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm">{consigne.title}</h3>
                    <p className="text-xs text-slate-400">De: {consigne.from}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{consigne.date}</span>
                </div>

                {/* Contenu de la consigne */}
                <div
                  className={cn(
                    'p-3 rounded-lg text-xs',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}
                >
                  {consigne.content}
                </div>

                {/* Accusés de réception */}
                {consigne.acknowledgement && consigne.acknowledgement.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-500 mb-1">
                      Accusés de réception ({consigne.acknowledgement.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {consigne.acknowledgement.map((name, ni) => (
                        <span
                          key={ni}
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px]',
                            darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          ✓ {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => addToast('Rappel envoyé aux destinataires', 'info')}
                  >
                    📧 Relancer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addToast('Consigne modifiée', 'success')}
                  >
                    ✏️ Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addToast('Consigne archivée', 'info')}
                  >
                    📦 Archiver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
