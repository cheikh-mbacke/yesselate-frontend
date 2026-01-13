'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Download, FileText, FileJson, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ExportFormat = 'csv' | 'json' | 'pdf' | 'excel';
type ExportQueue = 'all' | 'active' | 'blocked' | 'late' | 'completed';

interface ProjectExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, queue: ExportQueue) => Promise<void>;
}

export function ProjectExportModal({ open, onClose, onExport }: ProjectExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [queue, setQueue] = useState<ExportQueue>('all');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    
    try {
      await onExport(format, queue);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <FluentModal open={open} title="Exporter le portefeuille" onClose={onClose}>
      <div className="space-y-4">
        {/* Sélection du format */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Format d'export</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              className={cn(
                'p-4 rounded-xl border transition-colors text-left',
                format === 'csv'
                  ? 'border-purple-500/50 bg-purple-500/20'
                  : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
              )}
              onClick={() => setFormat('csv')}
            >
              <FileText className="w-6 h-6 text-purple-400 mb-2" />
              <div className="font-semibold text-sm">CSV</div>
              <div className="text-xs text-slate-400">Excel, LibreOffice</div>
            </button>

            <button
              className={cn(
                'p-4 rounded-xl border transition-colors text-left',
                format === 'json'
                  ? 'border-purple-500/50 bg-purple-500/20'
                  : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
              )}
              onClick={() => setFormat('json')}
            >
              <FileJson className="w-6 h-6 text-blue-400 mb-2" />
              <div className="font-semibold text-sm">JSON</div>
              <div className="text-xs text-slate-400">API, intégrations</div>
            </button>

            <button
              className={cn(
                'p-4 rounded-xl border transition-colors text-left',
                format === 'pdf'
                  ? 'border-purple-500/50 bg-purple-500/20'
                  : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
              )}
              onClick={() => setFormat('pdf')}
            >
              <FileCode className="w-6 h-6 text-rose-400 mb-2" />
              <div className="font-semibold text-sm">PDF</div>
              <div className="text-xs text-slate-400">Rapport imprimable</div>
            </button>

            <button
              className={cn(
                'p-4 rounded-xl border transition-colors text-left',
                format === 'excel'
                  ? 'border-purple-500/50 bg-purple-500/20'
                  : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
              )}
              onClick={() => setFormat('excel')}
            >
              <FileText className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="font-semibold text-sm">Excel</div>
              <div className="text-xs text-slate-400">Avec formules</div>
            </button>
          </div>
        </div>

        {/* Sélection de la file */}
        <div>
          <label className="text-sm font-medium text-slate-400 mb-2 block">Projets à exporter</label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'Tous les projets', color: 'slate' },
              { value: 'active', label: 'Projets actifs', color: 'emerald' },
              { value: 'blocked', label: 'Projets bloqués', color: 'rose' },
              { value: 'late', label: 'Projets en retard', color: 'amber' },
              { value: 'completed', label: 'Projets terminés', color: 'blue' },
            ].map((option) => (
              <button
                key={option.value}
                className={cn(
                  'w-full p-3 rounded-xl border transition-colors text-left flex items-center justify-between',
                  queue === option.value
                    ? 'border-purple-500/50 bg-purple-500/20'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40 hover:border-purple-500/30'
                )}
                onClick={() => setQueue(option.value as ExportQueue)}
              >
                <span className="font-medium text-sm">{option.label}</span>
                {queue === option.value && (
                  <Badge variant="success" className="text-[9px]">✓</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h4 className="font-semibold text-sm mb-2 text-blue-300/90">Contenu de l'export</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Informations du projet (ID, nom, phase, statut)</li>
            <li>• Gouvernance (bureau, PM, décision BMO)</li>
            <li>• Planning (dates début/fin, retards)</li>
            <li>• Budgets (planifié, engagé, dépensé)</li>
            <li>• Scores (complexité, risque)</li>
            <li>• RACI (responsabilités)</li>
            <li>• Work packages et indicateurs</li>
            <li>• Hash d'audit pour traçabilité</li>
          </ul>
        </div>

        {/* Erreur */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton 
            size="sm" 
            variant="primary" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </>
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

