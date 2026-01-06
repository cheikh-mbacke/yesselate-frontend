'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { organigramme, orgChanges, bureauxGovernance } from '@/lib/data';

export default function OrganigrammePage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<'hierarchy' | 'changes'>('hierarchy');

  const handleUpdatePosition = (position: string) => {
    addActionLog({
      module: 'organigramme',
      action: 'update_position',
      targetId: position,
      targetType: 'Position',
      details: `Demande modification poste: ${position}`,
      status: 'info',
    });
    addToast('Demande de modification soumise au DG', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            👥 Organigramme
            <Badge variant="info">{bureauxGovernance.length} bureaux</Badge>
          </h1>
          <p className="text-sm text-slate-400">Vue hiérarchique et journal des modifications structurelles</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === 'hierarchy' ? 'default' : 'secondary'} onClick={() => setViewMode('hierarchy')}>🏛️ Hiérarchie</Button>
          <Button size="sm" variant={viewMode === 'changes' ? 'default' : 'secondary'} onClick={() => setViewMode('changes')}>📜 Journal ({orgChanges.length})</Button>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        <div className="space-y-4">
          {/* DG */}
          <Card className="border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                  {organigramme.dg.initials}
                </div>
                <div className="flex-1">
                  <Badge variant="gold" className="mb-1">DIRECTION GÉNÉRALE</Badge>
                  <h2 className="text-xl font-bold">{organigramme.dg.name}</h2>
                  <p className="text-slate-400">{organigramme.dg.role}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleUpdatePosition('DG')}>✏️ Modifier</Button>
              </div>
            </CardContent>
          </Card>

          {/* Bureaux */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organigramme.bureaux.map((bureau) => {
              const govData = bureauxGovernance.find(b => b.code === bureau.code);
              return (
                <Card key={bureau.code} className={cn("transition-all hover:border-blue-500/50", govData && govData.charge > 85 && "border-l-4 border-l-red-500")}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        {bureau.head.initials}
                      </div>
                      <div className="flex-1">
                        <Badge variant="info" className="mb-1">{bureau.code}</Badge>
                        <h3 className="font-bold">{bureau.head.name}</h3>
                        <p className="text-xs text-slate-400">{bureau.head.role}</p>
                      </div>
                    </div>
                    
                    {bureau.members && bureau.members.length > 0 && (
                      <div className="border-t border-slate-700/50 pt-3 mt-3">
                        <p className="text-xs text-slate-400 mb-2">Équipe ({bureau.members.length})</p>
                        <div className="space-y-2">
                          {bureau.members.map((member, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-medium">
                                {member.initials}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-slate-400">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {govData && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Charge</span>
                          <span className={cn("font-mono", govData.charge > 85 ? "text-red-400" : "text-emerald-400")}>{govData.charge}%</span>
                        </div>
                      </div>
                    )}
                    
                    <Button size="sm" variant="ghost" className="w-full mt-3" onClick={() => handleUpdatePosition(bureau.code)}>✏️ Modifier</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Card className="bg-slate-800/50">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2">📜 Journal des modifications structurelles</h3>
              <p className="text-sm text-slate-400">Chaque modification est liée à une décision et hashée pour traçabilité</p>
            </CardContent>
          </Card>

          {orgChanges.map((change) => (
            <Card key={change.id} className={cn(
              "transition-all",
              change.type === 'promotion' && "border-l-4 border-l-emerald-500",
              change.type === 'mutation' && "border-l-4 border-l-blue-500",
              change.type === 'depart' && "border-l-4 border-l-red-500",
              change.type === 'arrivee' && "border-l-4 border-l-purple-500",
              change.type === 'restructuration' && "border-l-4 border-l-amber-500",
            )}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      change.type === 'promotion' ? 'success' :
                      change.type === 'mutation' ? 'info' :
                      change.type === 'depart' ? 'urgent' :
                      change.type === 'arrivee' ? 'default' : 'warning'
                    }>
                      {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                    </Badge>
                    <span className="font-mono text-xs text-slate-400">{change.id}</span>
                  </div>
                  <span className="text-sm text-slate-400">{change.date}</span>
                </div>
                
                <p className="font-medium mb-2">{change.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {change.affectedPositions.map((pos, idx) => (
                    <Badge key={idx} variant="default">{pos}</Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                  <span>Par: {change.author}</span>
                  {change.decisionId && (
                    <Badge variant="info">🔗 {change.decisionId}</Badge>
                  )}
                </div>
                
                {change.hash && (
                  <div className="mt-2 p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash</p>
                    <p className="font-mono text-[10px] truncate">{change.hash}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
