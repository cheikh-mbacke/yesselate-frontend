'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { auditEnriched } from '@/lib/data';

export default function AuditPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'findings' | 'actions' | 'docs'>('findings');

  const stats = useMemo(() => {
    const conforme = auditEnriched.filter(a => a.status === 'conforme').length;
    const attention = auditEnriched.filter(a => a.status === 'attention').length;
    const avgScore = Math.round(auditEnriched.reduce((acc, a) => acc + a.score, 0) / auditEnriched.length);
    const totalFindings = auditEnriched.reduce((acc, a) => acc + a.findings.length, 0);
    const openFindings = auditEnriched.reduce((acc, a) => acc + a.findings.filter(f => f.status === 'open').length, 0);
    const overdueActions = auditEnriched.reduce((acc, a) => acc + a.actionPlan.filter(ap => ap.status === 'overdue').length, 0);
    return { total: auditEnriched.length, conforme, attention, avgScore, totalFindings, openFindings, overdueActions };
  }, []);

  const selectedA = selectedAudit ? auditEnriched.find(a => a.id === selectedAudit) : null;

  const handleCreateAction = (auditId: string) => {
    addActionLog({
      module: 'audit',
      action: 'create_action',
      targetId: auditId,
      targetType: 'AuditItem',
      details: 'Création action corrective',
      status: 'info',
    });
    addToast('Action corrective créée', 'success');
  };

  const handleMarkResolved = (findingId: string) => {
    addActionLog({
      module: 'audit',
      action: 'resolve_finding',
      targetId: findingId,
      targetType: 'AuditFinding',
      details: `Constat ${findingId} résolu`,
      status: 'success',
    });
    addToast('Constat marqué comme résolu', 'success');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { conforme: 'emerald', attention: 'amber', 'non-conforme': 'red' };
    return colors[status] || 'slate';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'urgent' | 'warning' | 'info' | 'default'> = { critical: 'urgent', major: 'warning', minor: 'info', observation: 'default' };
    return variants[severity] || 'default';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔍 Audit & Conformité
            <Badge variant="info">{stats.total} audits</Badge>
          </h1>
          <p className="text-sm text-slate-400">Scores, constats, plans d'actions et conformité OHADA</p>
        </div>
      </div>

      {/* Alertes */}
      {(stats.openFindings > 0 || stats.overdueActions > 0) && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400">Actions requises</h3>
                <p className="text-sm text-slate-400">
                  {stats.openFindings} constat(s) ouvert(s) • {stats.overdueActions} action(s) en retard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.avgScore}%</p>
            <p className="text-[10px] text-slate-400">Score moyen</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.conforme}</p>
            <p className="text-[10px] text-slate-400">Conformes</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.attention}</p>
            <p className="text-[10px] text-slate-400">Attention</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.totalFindings}</p>
            <p className="text-[10px] text-slate-400">Constats</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.openFindings}</p>
            <p className="text-[10px] text-slate-400">Ouverts</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.overdueActions}</p>
            <p className="text-[10px] text-slate-400">En retard</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste audits */}
        <div className="lg:col-span-2 space-y-3">
          {auditEnriched.map((audit) => {
            const isSelected = selectedAudit === audit.id;
            const statusColor = getStatusColor(audit.status);
            const openCount = audit.findings.filter(f => f.status === 'open').length;
            
            return (
              <Card
                key={audit.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  `border-l-4 border-l-${statusColor}-500`,
                )}
                onClick={() => setSelectedAudit(audit.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-400">{audit.id}</span>
                        <Badge variant={audit.status === 'conforme' ? 'success' : 'warning'}>{audit.status}</Badge>
                        <Badge variant="default">{audit.category}</Badge>
                      </div>
                      <h3 className="font-bold mt-1">{audit.type}</h3>
                      <p className="text-sm text-slate-400">{audit.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-3xl font-bold", `text-${statusColor}-400`)}>{audit.score}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                    <span>Responsable: {audit.responsible}</span>
                    <span>Dernier contrôle: {audit.lastCheck}</span>
                    <span>Prochain: {audit.nextCheck}</span>
                  </div>

                  {/* Barre score */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div className={cn("h-full transition-all", `bg-${statusColor}-500`)} style={{ width: `${audit.score}%` }} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {audit.findings.length > 0 && (
                      <Badge variant={openCount > 0 ? 'warning' : 'success'}>
                        {audit.findings.length} constat(s) • {openCount} ouvert(s)
                      </Badge>
                    )}
                    {audit.actionPlan.length > 0 && (
                      <Badge variant="info">{audit.actionPlan.length} action(s)</Badge>
                    )}
                    {audit.documents.length > 0 && (
                      <Badge variant="default">📎 {audit.documents.length} doc(s)</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedA ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={selectedA.status === 'conforme' ? 'success' : 'warning'}>{selectedA.status}</Badge>
                    <p className={cn("text-2xl font-bold", `text-${getStatusColor(selectedA.status)}-400`)}>{selectedA.score}%</p>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedA.id}</span>
                  <h3 className="font-bold">{selectedA.type}</h3>
                </div>

                {/* Onglets */}
                <div className="flex gap-2 mb-4">
                  <Button size="sm" variant={viewTab === 'findings' ? 'default' : 'secondary'} onClick={() => setViewTab('findings')}>Constats ({selectedA.findings.length})</Button>
                  <Button size="sm" variant={viewTab === 'actions' ? 'default' : 'secondary'} onClick={() => setViewTab('actions')}>Actions ({selectedA.actionPlan.length})</Button>
                  <Button size="sm" variant={viewTab === 'docs' ? 'default' : 'secondary'} onClick={() => setViewTab('docs')}>Docs ({selectedA.documents.length})</Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {viewTab === 'findings' && (
                    selectedA.findings.length > 0 ? selectedA.findings.map((finding) => (
                      <div key={finding.id} className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={getSeverityBadge(finding.severity)}>{finding.severity}</Badge>
                          <Badge variant={finding.status === 'resolved' ? 'success' : finding.status === 'in_progress' ? 'info' : 'warning'}>{finding.status}</Badge>
                        </div>
                        <p className="text-sm">{finding.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{finding.date}</p>
                        {finding.status === 'open' && (
                          <Button size="sm" variant="success" className="mt-2" onClick={() => handleMarkResolved(finding.id)}>✓ Résolu</Button>
                        )}
                      </div>
                    )) : <p className="text-slate-400 text-center py-4">Aucun constat</p>
                  )}

                  {viewTab === 'actions' && (
                    selectedA.actionPlan.length > 0 ? selectedA.actionPlan.map((action) => (
                      <div key={action.id} className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100", action.status === 'overdue' && "border border-red-500/50")}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={action.status === 'completed' ? 'success' : action.status === 'overdue' ? 'urgent' : action.status === 'in_progress' ? 'info' : 'default'}>{action.status}</Badge>
                        </div>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-slate-400">{action.responsible} • Échéance: {action.deadline}</p>
                      </div>
                    )) : <p className="text-slate-400 text-center py-4">Aucune action</p>
                  )}

                  {viewTab === 'docs' && (
                    selectedA.documents.length > 0 ? selectedA.documents.map((doc, idx) => (
                      <div key={idx} className={cn("p-3 rounded flex items-center gap-2", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <span>📄</span>
                        <span className="text-sm">{doc}</span>
                      </div>
                    )) : <p className="text-slate-400 text-center py-4">Aucun document</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => handleCreateAction(selectedA.id)}>+ Action</Button>
                  <Button size="sm" variant="info" className="flex-1" onClick={() => addToast('Rapport généré', 'success')}>📄 Rapport</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🔍</span><p className="text-slate-400">Sélectionnez un audit</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
