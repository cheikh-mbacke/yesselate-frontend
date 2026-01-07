'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { systemLogs } from '@/lib/data';

const LEVEL_CONFIG: Record<string, { color: string; icon: string; variant: 'default' | 'info' | 'warning' | 'urgent' | 'success' }> = {
  debug: { color: 'slate', icon: '🔧', variant: 'default' },
  info: { color: 'blue', icon: 'ℹ️', variant: 'info' },
  warning: { color: 'amber', icon: '⚠️', variant: 'warning' },
  error: { color: 'red', icon: '❌', variant: 'urgent' },
  critical: { color: 'red', icon: '🚨', variant: 'urgent' },
  security: { color: 'purple', icon: '🔐', variant: 'warning' },
};

const CATEGORY_ICONS: Record<string, string> = {
  auth: '🔑',
  data: '📊',
  system: '⚙️',
  api: '🔌',
  security: '🛡️',
  audit: '📋',
  user_action: '👤',
};

export default function SystemLogsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const filteredLogs = systemLogs.filter(log => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    return true;
  });

  const stats = useMemo(() => {
    const critical = systemLogs.filter(l => l.level === 'critical' || l.level === 'error').length;
    const security = systemLogs.filter(l => l.level === 'security' || l.category === 'security').length;
    const today = systemLogs.filter(l => l.timestamp.includes('2025-01-15')).length;
    const byLevel = {
      debug: systemLogs.filter(l => l.level === 'debug').length,
      info: systemLogs.filter(l => l.level === 'info').length,
      warning: systemLogs.filter(l => l.level === 'warning').length,
      error: systemLogs.filter(l => l.level === 'error').length,
      critical: systemLogs.filter(l => l.level === 'critical').length,
      security: systemLogs.filter(l => l.level === 'security').length,
    };
    return { total: systemLogs.length, critical, security, today, byLevel };
  }, []);

  const selectedL = selectedLog ? systemLogs.find(l => l.id === selectedLog) : null;

  const handleExportLogs = () => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'system-logs',
      action: 'export',
      targetId: 'ALL',
      targetType: 'SystemLogs',
      details: `Export journal système (${filteredLogs.length} entrées)`,
    });
    addToast('Export des logs généré', 'success');
  };

  const handleVerifyHash = (log: typeof selectedL) => {
    if (!log) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'system-logs',
      action: 'verify_hash',
      targetId: log.id,
      targetType: 'SystemLog',
      details: `Vérification intégrité log ${log.id}`,
    });
    addToast('Hash vérifié ✓ - Log intègre', 'success');
  };

  const handleInvestigate = (log: typeof selectedL) => {
    if (!log) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'system-logs',
      action: 'investigate',
      targetId: log.id,
      targetType: 'SystemLog',
      details: `Investigation démarrée sur ${log.id}`,
    });
    addToast('Investigation démarrée', 'info');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Journal Système
            <Badge variant="info">{stats.total} entrées</Badge>
          </h1>
          <p className="text-sm text-slate-400">Logs centralisés, événements de sécurité, traçabilité immuable</p>
        </div>
        <Button onClick={handleExportLogs}>📥 Exporter</Button>
      </div>

      {/* Alertes critiques */}
      {stats.critical > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">{stats.critical} erreur(s) critique(s)</h3>
                <p className="text-sm text-slate-400">Nécessitent investigation immédiate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats par niveau */}
      <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-2 text-center">
            <p className="text-xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[9px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byLevel).map(([level, count]) => {
          const config = LEVEL_CONFIG[level];
          return (
            <Card key={level} className={cn(`bg-${config.color}-500/10 border-${config.color}-500/30`)}>
              <CardContent className="p-2 text-center">
                <p className={cn(`text-xl font-bold text-${config.color}-400`)}>{count}</p>
                <p className="text-[9px] text-slate-400 capitalize">{level}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-slate-400 self-center mr-2">Niveau:</span>
          {['all', 'debug', 'info', 'warning', 'error', 'critical', 'security'].map((level) => (
            <Button key={level} size="sm" variant={levelFilter === level ? 'default' : 'secondary'} onClick={() => setLevelFilter(level)}>
              {level === 'all' ? 'Tous' : LEVEL_CONFIG[level]?.icon} {level !== 'all' && level}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-slate-400 self-center mr-2">Catégorie:</span>
          {['all', 'auth', 'data', 'system', 'api', 'security', 'audit', 'user_action'].map((cat) => (
            <Button key={cat} size="sm" variant={categoryFilter === cat ? 'default' : 'secondary'} onClick={() => setCategoryFilter(cat)}>
              {cat === 'all' ? 'Toutes' : CATEGORY_ICONS[cat]} {cat !== 'all' && cat.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste logs */}
        <div className="lg:col-span-2 space-y-2">
          {filteredLogs.length > 0 ? filteredLogs.map((log) => {
            const isSelected = selectedLog === log.id;
            const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
            
            return (
              <Card
                key={log.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  `border-l-4 border-l-${config.color}-500`,
                )}
                onClick={() => setSelectedLog(log.id)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{config.icon}</span>
                      <Badge variant={config.variant}>{log.level}</Badge>
                      <Badge variant="default">{CATEGORY_ICONS[log.category]} {log.category}</Badge>
                      <span className="font-mono text-xs text-slate-400">{log.source}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">{log.timestamp}</span>
                  </div>

                  <p className="text-sm">{log.message}</p>

                  {log.userId && (
                    <p className="text-xs text-slate-400 mt-1">👤 {log.userId}</p>
                  )}

                  {log.linkedEntity && (
                    <Badge variant="info" className="mt-2">{log.linkedEntity.type}: {log.linkedEntity.id}</Badge>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <Card><CardContent className="p-8 text-center text-slate-400">Aucun log correspondant aux filtres</CardContent></Card>
          )}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedL ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{LEVEL_CONFIG[selectedL.level]?.icon}</span>
                    <Badge variant={LEVEL_CONFIG[selectedL.level]?.variant || 'default'}>{selectedL.level}</Badge>
                    <Badge variant="default">{selectedL.category}</Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedL.id}</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Message</p>
                    <p>{selectedL.message}</p>
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">Source</p>
                        <p className="font-mono">{selectedL.source}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Timestamp</p>
                        <p className="font-mono">{selectedL.timestamp}</p>
                      </div>
                      {selectedL.userId && (
                        <div>
                          <p className="text-slate-400">Utilisateur</p>
                          <p>{selectedL.userId}</p>
                        </div>
                      )}
                      {selectedL.ip && (
                        <div>
                          <p className="text-slate-400">IP</p>
                          <p className="font-mono">{selectedL.ip}</p>
                        </div>
                      )}
                      {selectedL.sessionId && (
                        <div className="col-span-2">
                          <p className="text-slate-400">Session</p>
                          <p className="font-mono text-xs truncate">{selectedL.sessionId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedL.details && Object.keys(selectedL.details).length > 0 && (
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400 mb-1">Détails</p>
                      <pre className="text-xs font-mono overflow-x-auto">{JSON.stringify(selectedL.details, null, 2)}</pre>
                    </div>
                  )}

                  {selectedL.linkedEntity && (
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400 mb-1">Entité liée</p>
                      <Badge variant="info">{selectedL.linkedEntity.type}: {selectedL.linkedEntity.id}</Badge>
                    </div>
                  )}

                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <p className="text-[10px] text-purple-400">🔐 Hash immuable</p>
                    <p className="font-mono text-[10px] break-all">{selectedL.hash}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => handleVerifyHash(selectedL)}>🔍 Vérifier</Button>
                  {(selectedL.level === 'error' || selectedL.level === 'critical' || selectedL.level === 'security') && (
                    <Button size="sm" variant="warning" className="flex-1" onClick={() => handleInvestigate(selectedL)}>🔎 Investiguer</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">📜</span><p className="text-slate-400">Sélectionnez un log</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
