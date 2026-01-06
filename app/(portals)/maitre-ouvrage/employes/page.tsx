'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { 
  employees, 
  employeesDetails, 
  delegations,
  evaluations,
  criticalSkills,
  bureaux,
} from '@/lib/data';
import type { EmployeeStatus } from '@/lib/types/bmo.types';

export default function EmployesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | EmployeeStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'delegations' | 'evaluations'>('info');

  // Filtrer les employés
  const filteredEmployees = employees.filter((e) => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.bureau.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    mission: employees.filter((e) => e.status === 'mission').length,
    absent: employees.filter((e) => e.status === 'absent' || e.status === 'conge').length,
    cdi: employeesDetails.filter((d) => d.contractType === 'CDI').length,
    cdd: employeesDetails.filter((d) => d.contractType === 'CDD').length,
    risquesMono: employees.filter((e) => e.isSinglePointOfFailure).length,
  }), []);

  // Risques mono-compétence par bureau
  const risquesParBureau = useMemo(() => {
    const risques: Record<string, number> = {};
    criticalSkills.filter(s => s.isAtRisk).forEach(skill => {
      risques[skill.bureau] = (risques[skill.bureau] || 0) + 1;
    });
    return risques;
  }, []);

  // Masse salariale
  const totalSalary = employees.reduce(
    (a, e) => a + parseFloat(e.salary.replace(/,/g, '')),
    0
  );

  const getEmployeeDetails = (empId: string) =>
    employeesDetails.find((d) => d.employeeId === empId);

  const getEmployeeDelegations = (empId: string) =>
    delegations.filter((d) => d.agent === employees.find(e => e.id === empId)?.name);

  const getEmployeeEvaluations = (empId: string) =>
    evaluations.filter((e) => e.employeeId === empId);

  const selectedEmp = selectedEmployee ? employees.find(e => e.id === selectedEmployee) : null;
  const selectedDetails = selectedEmployee ? getEmployeeDetails(selectedEmployee) : null;
  const selectedDelegations = selectedEmployee ? getEmployeeDelegations(selectedEmployee) : [];
  const selectedEvaluations = selectedEmployee ? getEmployeeEvaluations(selectedEmployee) : [];

  // Actions
  const handleViewProfile = (empId: string) => {
    setSelectedEmployee(empId);
    setActiveTab('info');
  };

  const handleExport = () => {
    addActionLog({
      module: 'employes',
      action: 'export',
      targetId: 'ALL',
      targetType: 'Employee',
      details: `Export liste employés (${employees.length})`,
      status: 'success',
    });
    addToast('Export employés généré', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            👤 Employés & Agents
            <Badge variant="info">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Gestion proactive du capital humain
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            📥 Export
          </Button>
          <Button onClick={() => addToast('Nouvel employé ajouté', 'success')}>
            + Nouvel employé
          </Button>
        </div>
      </div>

      {/* Alerte risques mono-compétence */}
      {stats.risquesMono > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">
                  Risques mono-compétence détectés
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {stats.risquesMono} employé(s) détiennent des compétences critiques uniques. 
                  En cas d'absence, aucun backup disponible.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(risquesParBureau).map(([bureau, count]) => (
                    <Badge key={bureau} variant="urgent">
                      {bureau}: {count} risque{count > 1 ? 's' : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="warning" onClick={() => addToast('Plan de mitigation à définir', 'warning')}>
                📋 Plan d'action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats employés */}
      <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.mission}</p>
            <p className="text-[10px] text-slate-400">En mission</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
            <p className="text-[10px] text-slate-400">Absents</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.cdi}</p>
            <p className="text-[10px] text-slate-400">CDI</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.cdd}</p>
            <p className="text-[10px] text-slate-400">CDD</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-400">
              {(totalSalary / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Masse salariale</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-red-500/30",
          stats.risquesMono > 0 ? "bg-red-500/20" : "bg-slate-500/10"
        )}>
          <CardContent className="p-3 text-center">
            <p className={cn(
              "text-2xl font-bold",
              stats.risquesMono > 0 ? "text-red-400" : "text-slate-400"
            )}>
              {stats.risquesMono}
            </p>
            <p className="text-[10px] text-slate-400">Risques mono</p>
          </CardContent>
        </Card>
      </div>

      {/* Effectif par bureau */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">📊 Effectif par bureau</h3>
          <div className="flex flex-wrap gap-2">
            {bureaux.map(bureau => {
              const count = employees.filter(e => e.bureau === bureau.code).length;
              const hasRisk = risquesParBureau[bureau.code] > 0;
              return (
                <div 
                  key={bureau.code}
                  className={cn(
                    "px-3 py-2 rounded-lg text-center min-w-[100px]",
                    hasRisk ? "bg-red-500/20 border border-red-500/50" : "bg-slate-700/30"
                  )}
                >
                  <span className="text-lg">{bureau.icon}</span>
                  <p className="font-bold text-sm">{count}</p>
                  <p className="text-[10px] text-slate-400">{bureau.code}</p>
                  {hasRisk && (
                    <Badge variant="urgent" className="mt-1 text-[8px]">
                      ⚠️ {risquesParBureau[bureau.code]}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recherche et filtres */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Rechercher un employé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 min-w-[200px] px-4 py-2 rounded-lg text-sm',
            darkMode
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          )}
        />
        {[
          { id: 'all', label: 'Tous' },
          { id: 'active', label: 'Actifs' },
          { id: 'mission', label: 'En mission' },
          { id: 'absent', label: 'Absents' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as 'all' | EmployeeStatus)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des employés */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          {filteredEmployees.map((employee) => {
            const details = getEmployeeDetails(employee.id);
            const isSelected = selectedEmployee === employee.id;
            return (
              <Card
                key={employee.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  employee.isSinglePointOfFailure && 'border-l-4 border-l-red-500',
                  details?.contractType === 'CDD' && details?.contractEnd && !employee.isSinglePointOfFailure && 'border-l-4 border-l-amber-500'
                )}
                onClick={() => handleViewProfile(employee.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white">
                        {employee.initials}
                      </div>
                      <span
                        className={cn(
                          'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2',
                          darkMode ? 'border-slate-800' : 'border-white',
                          employee.status === 'active'
                            ? 'bg-emerald-500'
                            : employee.status === 'mission'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm truncate">
                          {employee.name}
                        </h3>
                        {employee.delegated && (
                          <Badge variant="gold" className="text-[8px]">🔑</Badge>
                        )}
                        {employee.isSinglePointOfFailure && (
                          <Badge variant="urgent" className="text-[8px]">⚠️ SPOF</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{employee.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BureauTag bureau={employee.bureau} />
                        <Badge
                          variant={
                            employee.status === 'active'
                              ? 'success'
                              : employee.status === 'mission'
                              ? 'warning'
                              : 'urgent'
                          }
                        >
                          {employee.status === 'active'
                            ? 'Actif'
                            : employee.status === 'mission'
                            ? 'Mission'
                            : 'Absent'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Mini infos */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">💰</span>
                      <span className="font-mono text-emerald-400">{employee.salary}</span>
                    </div>
                    {details && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">🏖️</span>
                        <span className={cn(
                          details.congesRestants < 5 ? 'text-red-400' : 'text-emerald-400'
                        )}>
                          {details.congesRestants}j restants
                        </span>
                      </div>
                    )}
                    {details?.scoreEvaluation && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">📊</span>
                        <span className={cn(
                          details.scoreEvaluation >= 80 ? 'text-emerald-400' : 
                          details.scoreEvaluation >= 60 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          {details.scoreEvaluation}/100
                        </span>
                      </div>
                    )}
                    {employee.nextEvaluation && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">📅</span>
                        <span className="text-blue-400">{employee.nextEvaluation}</span>
                      </div>
                    )}
                  </div>

                  {/* Compétences critiques */}
                  {employee.criticalSkills && employee.criticalSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {employee.criticalSkills.map((skill, si) => (
                        <span
                          key={si}
                          className="px-2 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30"
                        >
                          🔒 {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail employé */}
        <div className="lg:col-span-1">
          {selectedEmp && selectedDetails ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header employé */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl font-bold text-white">
                    {selectedEmp.initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{selectedEmp.name}</h3>
                    <p className="text-sm text-slate-400">{selectedEmp.role}</p>
                    <div className="flex gap-1 mt-1">
                      <BureauTag bureau={selectedEmp.bureau} />
                      <Badge variant={selectedDetails.contractType === 'CDI' ? 'info' : 'warning'}>
                        {selectedDetails.contractType}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4">
                  {[
                    { id: 'info', label: '📋 Infos' },
                    { id: 'delegations', label: '🔑 Délégations' },
                    { id: 'evaluations', label: '📊 Évaluations' },
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      size="xs"
                      variant={activeTab === tab.id ? 'default' : 'secondary'}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Contenu tabs */}
                {activeTab === 'info' && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Congés restants</p>
                        <p className={cn(
                          "font-bold",
                          selectedDetails.congesRestants < 5 ? "text-red-400" : "text-emerald-400"
                        )}>
                          {selectedDetails.congesRestants} jours
                        </p>
                      </div>
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Congés pris</p>
                        <p className="font-bold">{selectedDetails.congesPris} jours</p>
                      </div>
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Retards (mois)</p>
                        <p className={cn(
                          "font-bold",
                          selectedDetails.retards > 0 ? "text-amber-400" : "text-emerald-400"
                        )}>
                          {selectedDetails.retards}
                        </p>
                      </div>
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Absences NJ</p>
                        <p className={cn(
                          "font-bold",
                          selectedDetails.absencesNonJustifiees > 0 ? "text-red-400" : "text-emerald-400"
                        )}>
                          {selectedDetails.absencesNonJustifiees}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">📧 Email</span>
                        <span className="text-xs">{selectedEmp.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">📱 Téléphone</span>
                        <span>{selectedEmp.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">💰 Salaire</span>
                        <span className="font-mono text-emerald-400">{selectedEmp.salary} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">📅 Embauche</span>
                        <span>{selectedDetails.contractStart}</span>
                      </div>
                      {selectedDetails.contractEnd && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">⏰ Fin contrat</span>
                          <span className="text-amber-400">{selectedDetails.contractEnd}</span>
                        </div>
                      )}
                    </div>

                    {/* Formations */}
                    {selectedDetails.formations && selectedDetails.formations.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs mb-2">🎓 Formations</h4>
                        <div className="space-y-1">
                          {selectedDetails.formations.map(f => (
                            <div key={f.id} className={cn(
                              "p-2 rounded text-xs",
                              darkMode ? "bg-slate-700/30" : "bg-gray-100"
                            )}>
                              <div className="flex justify-between">
                                <span className="font-medium">{f.title}</span>
                                <Badge variant={
                                  f.status === 'completed' ? 'success' : 
                                  f.status === 'in_progress' ? 'warning' : 'info'
                                }>
                                  {f.status === 'completed' ? '✓' : f.status === 'in_progress' ? '⏳' : '📅'}
                                </Badge>
                              </div>
                              <p className="text-slate-400">{f.date} - {f.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sanctions */}
                    {selectedDetails.sanctions && selectedDetails.sanctions.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs mb-2 text-red-400">⚠️ Sanctions</h4>
                        <div className="space-y-1">
                          {selectedDetails.sanctions.map(s => (
                            <div key={s.id} className="p-2 rounded text-xs bg-red-500/10 border border-red-500/30">
                              <div className="flex justify-between">
                                <span className="font-medium text-red-400">{s.type}</span>
                                <span className="text-slate-400">{s.date}</span>
                              </div>
                              <p className="text-slate-300">{s.motif}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'delegations' && (
                  <div className="space-y-2">
                    {selectedDelegations.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Aucune délégation active
                      </p>
                    ) : (
                      selectedDelegations.map(d => (
                        <div key={d.id} className={cn(
                          "p-3 rounded",
                          darkMode ? "bg-slate-700/30" : "bg-gray-100"
                        )}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{d.type}</p>
                              <p className="text-xs text-slate-400">{d.scope}</p>
                            </div>
                            <Badge variant={d.status === 'active' ? 'success' : 'default'}>
                              {d.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className="text-slate-400">
                              {d.start} → {d.end}
                            </span>
                            <span className="text-orange-400">
                              {d.usageCount} utilisations
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'evaluations' && (
                  <div className="space-y-2">
                    {selectedEvaluations.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Aucune évaluation enregistrée
                      </p>
                    ) : (
                      selectedEvaluations.map(ev => (
                        <div key={ev.id} className={cn(
                          "p-3 rounded",
                          darkMode ? "bg-slate-700/30" : "bg-gray-100"
                        )}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{ev.period}</p>
                              <p className="text-xs text-slate-400">{ev.date}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                ev.status === 'completed' ? 
                                  (ev.scoreGlobal >= 80 ? 'success' : ev.scoreGlobal >= 60 ? 'warning' : 'urgent') :
                                  'info'
                              }>
                                {ev.status === 'completed' ? `${ev.scoreGlobal}/100` : 'Planifiée'}
                              </Badge>
                            </div>
                          </div>
                          {ev.status === 'completed' && ev.recommendations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-600/50">
                              <p className="text-[10px] text-slate-400 mb-1">Recommandations:</p>
                              {ev.recommendations.map(r => (
                                <Badge key={r.id} variant={
                                  r.status === 'implemented' ? 'success' : 
                                  r.status === 'approved' ? 'info' : 'default'
                                } className="mr-1 mb-1 text-[9px]">
                                  {r.type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="info" className="flex-1">
                    ✏️ Modifier
                  </Button>
                  <Button size="sm" variant="warning" className="flex-1">
                    📊 Évaluer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">👤</span>
                <p className="text-slate-400">
                  Sélectionnez un employé pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
