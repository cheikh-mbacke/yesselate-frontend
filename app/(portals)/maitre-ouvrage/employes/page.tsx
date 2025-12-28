'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { employees, employeesDetails } from '@/lib/data';
import type { EmployeeStatus } from '@/lib/types/bmo.types';

export default function EmployesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [filter, setFilter] = useState<'all' | EmployeeStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les employés
  const filteredEmployees = employees.filter((e) => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    mission: employees.filter((e) => e.status === 'mission').length,
    absent: employees.filter((e) => e.status === 'absent').length,
    cdi: employeesDetails.filter((d) => d.contractType === 'CDI').length,
    cdd: employeesDetails.filter((d) => d.contractType === 'CDD').length,
  };

  // Masse salariale
  const totalSalary = employees.reduce(
    (a, e) => a + parseFloat(e.salary.replace(/,/g, '')),
    0
  );

  const getEmployeeDetails = (empId: string) =>
    employeesDetails.find((d) => d.employeeId === empId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            👤 Employés
            <Badge variant="info">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Gestion des ressources humaines
          </p>
        </div>
        <Button onClick={() => addToast('Nouvel employé ajouté', 'success')}>
          + Nouvel employé
        </Button>
      </div>

      {/* Stats employés */}
      <div className="grid grid-cols-6 gap-3">
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
      </div>

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

      {/* Liste des employés */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((employee, i) => {
          const details = getEmployeeDetails(employee.id);
          return (
            <Card
              key={i}
              className={cn(
                'hover:border-orange-500/50 transition-all',
                details?.contractType === 'CDD' &&
                  details?.contractEnd &&
                  'border-l-4 border-l-amber-500'
              )}
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate">
                        {employee.name}
                      </h3>
                      {employee.delegated && (
                        <Badge variant="gold" className="text-[8px]">
                          🔑
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{employee.role}</p>
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

                {/* Détails */}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">📧 Email</span>
                    <span className="truncate ml-2">{employee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">📱 Téléphone</span>
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">💰 Salaire</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {employee.salary} FCFA
                    </span>
                  </div>
                  {details && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">📄 Contrat</span>
                        <Badge
                          variant={
                            details.contractType === 'CDI' ? 'info' : 'warning'
                          }
                        >
                          {details.contractType}
                        </Badge>
                      </div>
                      {details.contractEnd && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">📅 Fin contrat</span>
                          <span className="text-amber-400">
                            {details.contractEnd}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Compétences */}
                {employee.skills && employee.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {employee.skills.map((skill, si) => (
                      <span
                        key={si}
                        className={cn(
                          'px-2 py-0.5 rounded text-[9px]',
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1 mt-3 pt-3 border-t border-slate-700/50">
                  <Button
                    size="xs"
                    variant="info"
                    className="flex-1"
                    onClick={() =>
                      addToast(`Profil ${employee.name}`, 'info')
                    }
                  >
                    👤 Profil
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    className="flex-1"
                    onClick={() =>
                      addToast(`Historique ${employee.name}`, 'info')
                    }
                  >
                    📊 Stats
                  </Button>
                  <Button size="xs" variant="ghost">
                    ✏️
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
