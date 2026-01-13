// ============================================
// Hook pour gérer la logique RACI de la page Governance
// ============================================

import { useState, useMemo, useCallback, useRef } from 'react';
import { raciEnriched } from '@/lib/data';
import type { ActionLog, ActionLogType } from '@/lib/types/bmo.types';

const BUREAUX = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];

export interface RACIStats {
  total: number;
  critical: number;
  locked: number;
  bmoGoverned: number;
}

export interface RACIState {
  selectedActivity: string | null;
  editMode: boolean;
  showComparator: boolean;
  showAISuggestions: boolean;
  showHeatmap: boolean;
}

/**
 * Hook pour gérer l'état et la logique RACI
 */
export function useGovernanceRACI() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Stats RACI
  const stats: RACIStats = useMemo(() => {
    const critical = raciEnriched.filter(r => r.criticality === 'critical').length;
    const locked = raciEnriched.filter(r => r.locked).length;
    const bmoGoverned = raciEnriched.filter(r => r.decisionBMO !== undefined && r.decisionBMO !== null).length;
    return { 
      total: raciEnriched.length, 
      critical, 
      locked, 
      bmoGoverned 
    };
  }, []);

  // Activité sélectionnée
  const selectedR = useMemo(() => {
    return selectedActivity 
      ? raciEnriched.find(r => r.activity === selectedActivity) 
      : null;
  }, [selectedActivity]);

  // Export CSV
  const handleExport = useCallback((
    addToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void,
    addActionLog: (log: Omit<ActionLog, 'id' | 'timestamp'>) => void
  ) => {
    const csvContent = [
      ['Activité', 'Catégorie', 'Criticité', ...BUREAUX, 'Décision BMO', 'Verrouillée'],
      ...raciEnriched.map(r => [
        r.activity,
        r.category,
        r.criticality,
        ...BUREAUX.map(b => r.roles[b] || '-'),
        r.decisionBMO || 'Hors BMO',
        r.locked ? 'Oui' : 'Non'
      ])
    ].map(row => row.map(field => `"${String(field)}"`).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `matrice_raci_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('✅ Export CSV RACI généré avec rapport', 'success');
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'governance',
      action: 'export',
      targetId: 'RACI_MATRIX',
      targetType: 'Export',
      details: `Export matrice RACI - ${raciEnriched.length} activités`,
    });
  }, []);

  // Memoizer le retour pour éviter les re-renders inutiles
  return useMemo(
    () => ({
      // État
      selectedActivity,
      editMode,
      showComparator,
      showAISuggestions,
      showHeatmap,
      stats,
      selectedR,
      raciData: raciEnriched,
      bureaux: BUREAUX,

      // Actions (stable grâce à useCallback)
      setSelectedActivity,
      setEditMode,
      setShowComparator,
      setShowAISuggestions,
      setShowHeatmap,
      handleExport,
    }),
    [
      selectedActivity,
      editMode,
      showComparator,
      showAISuggestions,
      showHeatmap,
      stats,
      selectedR,
      setSelectedActivity,
      setEditMode,
      setShowComparator,
      setShowAISuggestions,
      setShowHeatmap,
      handleExport,
    ]
  );
}

