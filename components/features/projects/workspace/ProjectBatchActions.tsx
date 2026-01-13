'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  CheckSquare, 
  Play, 
  Pause, 
  AlertTriangle, 
  Trash2, 
  Calendar,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectItem {
  id: string;
  name: string;
  status: string;
}

interface ProjectBatchActionsProps {
  open: boolean;
  action: 'activate' | 'pause' | 'block' | 'cancel' | 'extend' | 'export';
  projects: ProjectItem[];
  onClose: () => void;
  onComplete: () => void;
}

export function ProjectBatchActions({ 
  open, 
  action, 
  projects, 
  onClose,
  onComplete 
}: ProjectBatchActionsProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});

  const actionConfig = {
    activate: {
      title: 'Activer les projets',
      description: 'Marquer les projets comme actifs',
      icon: <Play className="w-6 h-6 text-emerald-500" />,
      color: 'emerald',
    },
    pause: {
      title: 'Suspendre les projets',
      description: 'Mettre les projets en pause temporaire',
      icon: <Pause className="w-6 h-6 text-amber-500" />,
      color: 'amber',
    },
    block: {
      title: 'Bloquer les projets',
      description: 'Marquer les projets comme bloqués',
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      color: 'rose',
    },
    cancel: {
      title: 'Annuler les projets',
      description: 'Annuler définitivement les projets',
      icon: <Trash2 className="w-6 h-6 text-rose-500" />,
      color: 'rose',
    },
    extend: {
      title: 'Prolonger les projets',
      description: 'Étendre les dates de fin',
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      color: 'blue',
    },
    export: {
      title: 'Exporter les projets',
      description: 'Télécharger en CSV',
      icon: <Download className="w-6 h-6 text-purple-500" />,
      color: 'purple',
    },
  };

  const config = actionConfig[action];

  const handleExecute = async () => {
    setProcessing(true);
    setProgress(0);
    
    // Initialiser les résultats
    const initialResults: Record<string, 'success' | 'error' | 'pending'> = {};
    projects.forEach(p => {
      initialResults[p.id] = 'pending';
    });
    setResults(initialResults);

    // Traiter chaque projet
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      try {
        // Simuler l'API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // En prod: appeler l'API réelle
        // await fetch(`/api/projects/${project.id}/batch-action`, { ... });
        
        setResults(prev => ({ ...prev, [project.id]: 'success' }));
      } catch (error) {
        setResults(prev => ({ ...prev, [project.id]: 'error' }));
      }
      
      setProgress(Math.round(((i + 1) / projects.length) * 100));
    }

    setProcessing(false);
    
    // Attendre un peu avant de fermer pour montrer les résultats
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  const successCount = Object.values(results).filter(r => r === 'success').length;
  const errorCount = Object.values(results).filter(r => r === 'error').length;

  return (
    <FluentModal open={open} title={config.title} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className={cn(
          'p-4 rounded-xl border',
          `bg-${config.color}-500/10 border-${config.color}-500/30`
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              `bg-${config.color}-500/20`
            )}>
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{config.description}</div>
              <div className="text-sm text-slate-400 mt-1">
                {projects.length} projet{projects.length > 1 ? 's' : ''} sélectionné{projects.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Traitement en cours...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-300',
                  `bg-${config.color}-500`
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results summary */}
        {(successCount > 0 || errorCount > 0) && (
          <div className="flex gap-3">
            {successCount > 0 && (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {successCount} réussi{successCount > 1 ? 's' : ''}
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="urgent" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errorCount} échoué{errorCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {/* Projects list */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {projects.map((project) => {
            const status = results[project.id] || 'pending';
            
            return (
              <div
                key={project.id}
                className={cn(
                  'p-3 rounded-xl border transition-colors',
                  status === 'success' && 'border-emerald-500/30 bg-emerald-500/10',
                  status === 'error' && 'border-rose-500/30 bg-rose-500/10',
                  status === 'pending' && 'border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-orange-300/80">{project.id}</div>
                    <div className="text-sm font-medium truncate">{project.name}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[9px]">{project.status}</Badge>
                    
                    {status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {status === 'error' && (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    {status === 'pending' && processing && (
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning pour actions destructives */}
        {(action === 'cancel' || action === 'block') && !processing && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
              <div className="text-xs text-amber-300/90">
                <strong>Attention :</strong> Cette action aura un impact important sur les projets sélectionnés.
                Assurez-vous que c'est bien ce que vous voulez faire.
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton 
            size="sm" 
            variant="secondary" 
            onClick={onClose}
            disabled={processing}
          >
            {processing ? 'Traitement...' : 'Annuler'}
          </FluentButton>
          <FluentButton 
            size="sm" 
            variant={action === 'cancel' || action === 'block' ? 'destructive' : 'primary'}
            onClick={handleExecute}
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Traitement...
              </>
            ) : (
              'Exécuter'
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

