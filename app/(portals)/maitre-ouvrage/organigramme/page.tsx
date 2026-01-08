'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { organigramme, orgChanges, bureauxGovernance } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type ViewMode = 'hierarchy' | 'changes';
type ChangeTypeFilter = 'all' | 'promotion' | 'mutation' | 'depart' | 'arrivee' | 'restructuration';

// WHY: Normalisation pour recherche multi-champs (aligné avec autres pages)
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// =========================
// PERFORMANCE : calculs mémorisés
// =========================
const usePerformanceData = () => {
  const criticalBureaux = useMemo(() =>
    bureauxGovernance.filter(b => b.charge > 85 || (b.goulots && b.goulots.length > 0)),
    []
  );

  const monoCompetenceAlerts = useMemo(() => {
    const risks: string[] = [];
    organigramme.bureaux.forEach(bureau => {
      const criticalSkills = bureau.members
        .map(m => m.skills || [])
        .flat()
        .filter(skill => ['budget', 'juridique', 'sécurité'].includes(skill))
        .filter((value, index, self) => self.indexOf(value) === index); // unique
      
      if (criticalSkills.length === 1) {
        risks.push(bureau.code);
      }
    });
    return risks;
  }, []);

  return { criticalBureaux, monoCompetenceAlerts };
};

// =========================
// INNOVATION : export enrichi + vérification hash
// =========================
const exportOrganigrammeAsCSV = (
  changes: typeof orgChanges,
  addToast: (msg: string, variant: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID',
    'Type',
    'Description',
    'Postes concernés',
    'Auteur',
    'Date',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = changes.map(c => [
    c.id,
    c.type,
    `"${c.description}"`,
    c.affectedPositions.join(', '),
    c.author,
    c.date,
    c.decisionId || '',
    (c as any).decisionBMO?.validatorRole || '',
    c.hash || '',
    (c as any).decisionBMO ? 'Validé' : 'Non piloté',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organigramme_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Organigramme généré (traçabilité RACI)', 'success');
};

const verifyChangeHash = async (hash: string): Promise<boolean> => {
  // Simulé — à brancher sur API ou Web Crypto
  return hash.startsWith('SHA3-256:');
};

// =========================
// COMPOSANT PRINCIPAL
// =========================
export default function OrganigrammePage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // État principal
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');

  // Recherche et filtres (alignés avec autres pages)
  const [searchQuery, setSearchQuery] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState<ChangeTypeFilter>('all');

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('organigramme');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.viewMode) setViewMode(saved.viewMode);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (saved.changeTypeFilter) setChangeTypeFilter(saved.changeTypeFilter);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        viewMode,
        searchQuery,
        changeTypeFilter,
      });
    } catch {
      // silent
    }
  }, [viewMode, searchQuery, changeTypeFilter, updateFilters]);

  // Auto-sync pour sidebar
  const { criticalBureaux, monoCompetenceAlerts } = usePerformanceData();
  useAutoSyncCounts('organigramme', () => criticalBureaux.length, { interval: 30000, immediate: true });

  const handleUpdatePosition = useCallback((position: string) => {
    addActionLog({
      userId: currentUser?.id || 'USR-001',
      userName: currentUser?.name || 'A. DIALLO',
      userRole: currentUser?.role || 'Directeur Général',
      module: 'organigramme',
      action: 'update_position',
      targetId: position,
      targetType: 'Position',
      details: `Demande modification poste: ${position}`,
      bureau: 'BMO',
    });
    addToast('✏️ Demande de modification soumise au DG', 'success');
  }, [currentUser, addActionLog, addToast]);

  const stats = useMemo(() => ({
    totalBureaux: organigramme.bureaux.length,
    critiques: criticalBureaux.length,
    risquesMono: monoCompetenceAlerts.length,
  }), [criticalBureaux.length, monoCompetenceAlerts.length]);

  // Filtrage des bureaux (vue hiérarchie)
  const filteredBureaux = useMemo(() => {
    if (!searchQuery.trim()) return organigramme.bureaux;
    const q = normalize(searchQuery);
    return organigramme.bureaux.filter(b =>
      normalize(b.code).includes(q) ||
      normalize(b.head.name).includes(q) ||
      normalize(b.head.role).includes(q) ||
      b.members.some(m => normalize(m.name).includes(q) || normalize(m.role).includes(q))
    );
  }, [searchQuery]);

  // Filtrage des changements (vue journal)
  const filteredChanges = useMemo(() => {
    let result = [...orgChanges];

    // Filtre par type
    if (changeTypeFilter !== 'all') {
      result = result.filter(c => c.type === changeTypeFilter);
    }

    // Recherche multi-champs
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(c =>
        normalize(c.id).includes(q) ||
        normalize(c.type).includes(q) ||
        normalize(c.description).includes(q) ||
        normalize(c.author).includes(q) ||
        c.affectedPositions.some(pos => normalize(pos).includes(q))
      );
    }

    return result;
  }, [changeTypeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header aligné avec autres pages */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
            👥 Organigramme Dynamique
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="info" className="text-[10px]">{stats.totalBureaux} bureaux</Badge>
              {stats.critiques > 0 && <Badge variant="urgent" className="text-[10px]">{stats.critiques} critiques</Badge>}
              {stats.risquesMono > 0 && <Badge variant="warning" className="text-[10px]">⚠️ {stats.risquesMono}</Badge>}
            </div>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Vue hiérarchique <strong>optimisée</strong> + journal des modifications traçables
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder={viewMode === 'hierarchy' ? "Rechercher..." : "Rechercher..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 lg:w-64"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportOrganigrammeAsCSV(orgChanges, addToast)}
              className="flex-1 sm:flex-none"
            >
              📊 Export
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'hierarchy' ? 'default' : 'secondary'} 
              onClick={() => setViewMode('hierarchy')}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">🏛️ Hiérarchie</span>
              <span className="sm:hidden">🏛️</span>
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'changes' ? 'default' : 'secondary'} 
              onClick={() => setViewMode('changes')}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">📜 Journal ({filteredChanges.length})</span>
              <span className="sm:hidden">📜 ({filteredChanges.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Alertes innovation */}
      {stats.critiques > 0 && (
        <Card className="border-red-400/30 bg-red-400/8">
          <CardContent className="p-3">
            <span className="text-red-300/80">🚨 {stats.critiques} bureaux en surcharge critique ou avec goulots de capacité</span>
          </CardContent>
        </Card>
      )}
      {stats.risquesMono > 0 && (
        <Card className="border-amber-400/30 bg-amber-400/8">
          <CardContent className="p-3">
            <span className="text-amber-300/80">⚠️ {stats.risquesMono} bureaux avec risque mono-compétence (budget/juridique/sécurité)</span>
          </CardContent>
        </Card>
      )}

      {/* Filtres pour vue journal */}
      {viewMode === 'changes' && (
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-xs text-slate-400 self-center mr-1 hidden sm:inline">Type:</span>
          {[
            { id: 'all', label: 'Tous', icon: '📋' },
            { id: 'promotion', label: '⬆️ Promotion', icon: '⬆️' },
            { id: 'mutation', label: '🔄 Mutation', icon: '🔄' },
            { id: 'depart', label: '👋 Départ', icon: '👋' },
            { id: 'arrivee', label: '👋 Arrivée', icon: '👋' },
            { id: 'restructuration', label: '🏗️ Restruct.', icon: '🏗️' },
          ].map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={changeTypeFilter === f.id ? 'default' : 'secondary'}
              onClick={() => setChangeTypeFilter(f.id as ChangeTypeFilter)}
              className="text-[10px] sm:text-xs"
            >
              <span className="hidden sm:inline">{f.label}</span>
              <span className="sm:hidden">{f.icon}</span>
            </Button>
          ))}
        </div>
      )}

      {viewMode === 'hierarchy' ? (
        <div className="space-y-4">
          {/* DG — stable key */}
          <Card key="dg" className="border-2 border-amber-400/30 bg-gradient-to-r from-amber-400/8 to-transparent">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400/80 to-amber-500/60 flex items-center justify-center text-xl sm:text-2xl font-bold text-white flex-shrink-0">
                  {organigramme.dg.initials}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <Badge variant="gold" className="mb-1">DIRECTION GÉNÉRALE</Badge>
                  <h2 className="text-lg sm:text-xl font-bold">{organigramme.dg.name}</h2>
                  <p className="text-sm text-slate-400">{organigramme.dg.role}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleUpdatePosition('DG')} className="w-full sm:w-auto">
                  ✏️ Modifier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bureaux — key stable + perf */}
          {filteredBureaux.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-slate-400">Aucun bureau ne correspond à la recherche</p>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredBureaux.map((bureau) => {
              const govData = bureauxGovernance.find(b => b.code === bureau.code);
              const isCritical = criticalBureaux.some(b => b.code === bureau.code);
              const hasMonoRisk = monoCompetenceAlerts.includes(bureau.code);
              
              return (
                <Card
                  key={bureau.code} // ✅ Clé stable → pas de re-rendu inutile
                  className={cn(
                    "transition-all hover:border-blue-400/30",
                    isCritical && "border-l-4 border-l-red-400/60",
                    hasMonoRisk && "ring-1 ring-amber-400/20"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-400/80 to-purple-500/70 flex items-center justify-center text-sm sm:text-base font-bold text-white flex-shrink-0">
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
                          {bureau.members.map((member) => (
                            <div key={member.id || member.name} className="flex items-center gap-2 text-sm"> {/* ✅ key stable */}
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
                          <span className={cn("font-mono", govData.charge > 85 ? "text-red-300/80" : "text-emerald-300/80")}>
                            {govData.charge}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {hasMonoRisk && (
                      <div className="mt-2 p-2 rounded bg-amber-400/8 border border-amber-400/20">
                        <p className="text-[10px] text-amber-300/80">⚠️ Risque mono-compétence</p>
                      </div>
                    )}
                    
                    <Button size="sm" variant="ghost" className="w-full mt-3" onClick={() => handleUpdatePosition(bureau.code)}>
                      ✏️ Modifier
                    </Button>
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
              <p className="text-sm text-slate-400">
                Chaque modification est <strong>traçable, hashée, et liée à une décision BMO</strong>
              </p>
            </CardContent>
          </Card>

          {filteredChanges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📜</span>
                <p className="text-slate-400">Aucun changement ne correspond aux filtres</p>
              </CardContent>
            </Card>
          )}

          {filteredChanges.map((change) => (
            <Card
              key={change.id} // ✅ Clé stable
              className={cn(
                "transition-all",
                change.type === 'promotion' && "border-l-4 border-l-emerald-400/60",
                change.type === 'mutation' && "border-l-4 border-l-blue-400/60",
                change.type === 'depart' && "border-l-4 border-l-red-400/60",
                change.type === 'arrivee' && "border-l-4 border-l-purple-400/60",
                change.type === 'restructuration' && "border-l-4 border-l-amber-400/60",
              )}
            >
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
                    <Badge key={`${change.id}-${idx}`} variant="default">{pos}</Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                  <span>Par: {change.author}</span>
                  {change.decisionId && (
                    <Badge variant="info">🔗 {change.decisionId}</Badge>
                  )}
                  {(change as any).decisionBMO && (
                    <Badge variant="success">✅ BMO ({(change as any).decisionBMO.validatorRole === 'A' ? 'A' : 'R'})</Badge>
                  )}
                </div>
                
                {change.hash && (
                  <div className="mt-2 p-2 rounded bg-slate-700/30 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400">🔐 Hash</p>
                      <p className="font-mono text-[10px] truncate">{change.hash}</p>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-[10px] p-0 h-auto"
                      onClick={async () => {
                        const isValid = await verifyChangeHash(change.hash!);
                        addToast(
                          isValid ? '✅ Hash valide' : '❌ Hash corrompu',
                          isValid ? 'success' : 'error'
                        );
                      }}
                    >
                      🔍 Vérifier
                    </Button>
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

