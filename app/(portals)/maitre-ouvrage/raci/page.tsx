'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { raciEnriched } from '@/lib/data';

const RACI_COLORS: Record<string, string> = {
  'R': 'bg-emerald-500 text-white',
  'A': 'bg-blue-500 text-white',
  'C': 'bg-amber-500 text-white',
  'I': 'bg-slate-500 text-white',
  '-': 'bg-slate-700/30 text-slate-500',
};

const RACI_LABELS: Record<string, string> = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '-': 'Non impliqué',
};

const BUREAUX = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];

export default function RACIPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Simuler le rôle utilisateur (en prod viendrait du store/auth)
  const userRole = 'BMO'; // Changer en 'DG' pour tester l'édition

  const stats = useMemo(() => {
    const critical = raciEnriched.filter(r => r.criticality === 'critical').length;
    const locked = raciEnriched.filter(r => r.locked).length;
    return { total: raciEnriched.length, critical, locked };
  }, []);

  const selectedR = selectedActivity ? raciEnriched.find(r => r.activity === selectedActivity) : null;

  const canEdit = userRole === 'DG';

  const handleEditAttempt = () => {
    if (!canEdit) {
      addToast('Édition réservée au DG', 'error');
      return;
    }
    setEditMode(!editMode);
    addActionLog({
      module: 'raci',
      action: editMode ? 'exit_edit' : 'enter_edit',
      targetId: 'RACI_MATRIX',
      targetType: 'RACI',
      details: editMode ? 'Sortie mode édition RACI' : 'Entrée mode édition RACI',
      status: 'info',
    });
  };

  const handleSaveRACI = () => {
    addActionLog({
      module: 'raci',
      action: 'save',
      targetId: 'RACI_MATRIX',
      targetType: 'RACI',
      details: 'Sauvegarde matrice RACI',
      status: 'success',
      hash: `SHA3-256:raci_${Date.now().toString(16)}`,
    });
    addToast('Matrice RACI sauvegardée - Hash généré', 'success');
    setEditMode(false);
  };

  const getCriticalityColor = (crit: string) => {
    const colors: Record<string, string> = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-emerald-400' };
    return colors[crit] || 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📐 Matrice RACI
            <Badge variant="info">{stats.total} activités</Badge>
          </h1>
          <p className="text-sm text-slate-400">Définition des responsabilités - Pilote l'UI de validation</p>
        </div>
        <div className="flex gap-2">
          {editMode && <Button variant="success" onClick={handleSaveRACI}>💾 Sauvegarder</Button>}
          <Button variant={editMode ? 'destructive' : 'default'} onClick={handleEditAttempt}>
            {editMode ? '✕ Annuler' : canEdit ? '✏️ Éditer' : '🔒 Édition DG'}
          </Button>
        </div>
      </div>

      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-400">RACI pilote l'interface</h3>
              <p className="text-sm text-slate-400">Si utilisateur n'a pas R ou A sur une activité → bouton "Valider" désactivé</p>
            </div>
            <Badge variant="warning">{stats.locked} verrouillées</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 p-3 rounded bg-slate-800/50">
        {Object.entries(RACI_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={cn("w-8 h-8 rounded flex items-center justify-center font-bold text-sm", RACI_COLORS[key])}>{key}</span>
            <span className="text-sm text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Tableau RACI */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("border-b", darkMode ? "border-slate-700" : "border-gray-200")}>
                <th className="p-3 text-left font-bold">Activité</th>
                <th className="p-3 text-center font-bold">Criticité</th>
                {BUREAUX.map(b => (
                  <th key={b} className="p-3 text-center font-bold">{b}</th>
                ))}
                <th className="p-3 text-center font-bold">🔒</th>
              </tr>
            </thead>
            <tbody>
              {raciEnriched.map((row) => {
                const isSelected = selectedActivity === row.activity;
                return (
                  <tr 
                    key={row.activity} 
                    className={cn(
                      "border-b cursor-pointer transition-all",
                      darkMode ? "border-slate-700/50 hover:bg-slate-800/50" : "border-gray-100 hover:bg-gray-50",
                      isSelected && "ring-2 ring-blue-500",
                      row.criticality === 'critical' && "bg-red-500/5",
                    )}
                    onClick={() => setSelectedActivity(row.activity)}
                  >
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{row.activity}</p>
                        <p className="text-xs text-slate-400">{row.category}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={row.criticality === 'critical' ? 'urgent' : row.criticality === 'high' ? 'warning' : 'default'}>
                        {row.criticality}
                      </Badge>
                    </td>
                    {BUREAUX.map(bureau => (
                      <td key={bureau} className="p-3 text-center">
                        <span className={cn("inline-flex w-8 h-8 rounded items-center justify-center font-bold text-sm", RACI_COLORS[row.roles[bureau] || '-'])}>
                          {row.roles[bureau] || '-'}
                        </span>
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      {row.locked ? <span className="text-amber-400">🔒</span> : <span className="text-slate-500">🔓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Panel détail */}
      {selectedR && (
        <Card className="border-blue-500/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={selectedR.criticality === 'critical' ? 'urgent' : selectedR.criticality === 'high' ? 'warning' : 'default'}>{selectedR.criticality}</Badge>
                  <Badge variant="info">{selectedR.category}</Badge>
                  {selectedR.locked && <Badge variant="warning">🔒 Verrouillée</Badge>}
                </div>
                <h3 className="font-bold text-lg">{selectedR.activity}</h3>
                <p className="text-slate-400">{selectedR.description}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Modifié le {selectedR.lastModified}</p>
                <p>Par {selectedR.modifiedBy}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                <h4 className="font-bold text-xs mb-2">Rôles attribués</h4>
                <div className="space-y-2">
                  {BUREAUX.map(bureau => (
                    <div key={bureau} className="flex items-center justify-between">
                      <span>{bureau}</span>
                      <span className={cn("w-8 h-8 rounded flex items-center justify-center font-bold text-sm", RACI_COLORS[selectedR.roles[bureau] || '-'])}>
                        {selectedR.roles[bureau] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedR.linkedProcedure && (
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Procédure liée</p>
                    <Badge variant="info">{selectedR.linkedProcedure}</Badge>
                  </div>
                )}

                <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                  <p className="text-xs text-slate-400 mb-1">Impact UI</p>
                  <p className="text-sm">
                    Bureaux avec <span className={cn("px-1 rounded", RACI_COLORS['R'])}>R</span> ou <span className={cn("px-1 rounded", RACI_COLORS['A'])}>A</span> : bouton "Valider" actif
                  </p>
                </div>

                {selectedR.locked && !canEdit && (
                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-400">🔒 Cette activité est verrouillée - Seul le DG peut la modifier</p>
                  </div>
                )}
              </div>
            </div>

            {editMode && canEdit && !selectedR.locked && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <Button size="sm" variant="warning" onClick={() => addToast('Édition RACI en cours...', 'info')}>✏️ Modifier cette activité</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
