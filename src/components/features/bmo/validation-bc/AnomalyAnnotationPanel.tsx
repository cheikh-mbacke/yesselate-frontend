'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, CheckCircle, MessageSquare, X, 
  Plus, Edit2, Trash2, Save 
} from 'lucide-react';
import type { 
  DocumentAnomaly, 
  DocumentAnnotation,
  AnomalyType,
  DocumentType 
} from '@/lib/types/document-validation.types';

interface AnomalyAnnotationPanelProps {
  documentId: string;
  documentType: DocumentType;
  anomalies: DocumentAnomaly[];
  annotations: DocumentAnnotation[];
  onAddAnnotation: (annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'>) => void;
  onResolveAnomaly: (anomalyId: string) => void;
  onUpdateAnnotation?: (annotationId: string, comment: string) => void;
  onDeleteAnnotation?: (annotationId: string) => void;
}

export function AnomalyAnnotationPanel({
  documentId,
  documentType,
  anomalies,
  annotations,
  onAddAnnotation,
  onResolveAnomaly,
  onUpdateAnnotation,
  onDeleteAnnotation,
}: AnomalyAnnotationPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [annotationComment, setAnnotationComment] = useState('');
  const [annotationType, setAnnotationType] = useState<'comment' | 'correction' | 'approval' | 'rejection'>('comment');
  const [linkedAnomalyId, setLinkedAnomalyId] = useState<string>('');
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

  const unresolvedAnomalies = anomalies.filter(a => !a.resolved);
  const resolvedAnomalies = anomalies.filter(a => a.resolved);

  // Champs disponibles pour annotation
  const availableFields = [
    'montant_ht', 'montant_ttc', 'tva', 'date_emission', 'date_limite',
    'fournisseur', 'projet', 'objet', 'bc_associe', 'motif', 'impact_financier', 'impact_delai'
  ];

  const handleAddAnnotation = () => {
    if (!annotationComment.trim()) {
      addToast('Le commentaire est obligatoire', 'warning');
      return;
    }

    onAddAnnotation({
      documentId,
      documentType,
      field: selectedField || undefined,
      comment: annotationComment,
      anomalyId: linkedAnomalyId || undefined,
      createdBy: 'BMO-USER', // Normalement depuis auth
      type: annotationType,
    });

    setAnnotationComment('');
    setSelectedField('');
    setLinkedAnomalyId('');
    setShowAddAnnotation(false);
    addToast('Annotation ajoutée', 'success');
  };

  const handleResolveAnomaly = (anomalyId: string) => {
    onResolveAnomaly(anomalyId);
    addToast('Anomalie marquée comme résolue', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Anomalies non résolues */}
      {unresolvedAnomalies.length > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Anomalies détectées ({unresolvedAnomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unresolvedAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  'p-3 rounded-lg border',
                  anomaly.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                  anomaly.severity === 'error' ? 'border-red-500/30 bg-red-500/10' :
                  anomaly.severity === 'warning' ? 'border-orange-500/30 bg-orange-500/10' :
                  'border-blue-500/30 bg-blue-500/10'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          anomaly.severity === 'critical' || anomaly.severity === 'error' ? 'urgent' :
                          anomaly.severity === 'warning' ? 'warning' :
                          'info'
                        }
                        className="text-[10px]"
                      >
                        {anomaly.severity}
                      </Badge>
                      <span className="text-xs text-slate-400">{anomaly.field}</span>
                      <Badge variant="default" className="text-[10px]">
                        {anomaly.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm">{anomaly.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Détecté le {new Date(anomaly.detectedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleResolveAnomaly(anomaly.id)}
                    className="ml-2"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Résoudre
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Anomalies résolues */}
      {resolvedAnomalies.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Anomalies résolues ({resolvedAnomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resolvedAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{anomaly.message}</p>
                    {anomaly.resolvedAt && anomaly.resolvedBy && (
                      <p className="text-xs text-slate-400 mt-1">
                        Résolu le {new Date(anomaly.resolvedAt).toLocaleDateString('fr-FR')} par {anomaly.resolvedBy}
                      </p>
                    )}
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Résolu
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Annotations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Annotations ({annotations.length})
            </CardTitle>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAddAnnotation(!showAddAnnotation)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Formulaire d'ajout d'annotation */}
          {showAddAnnotation && (
            <Card className="border-blue-500/30 bg-blue-500/10">
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Champ concerné (optionnel)</label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-sm border',
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
                    )}
                  >
                    <option value="">Tous les champs</option>
                    {availableFields.map(field => (
                      <option key={field} value={field}>
                        {field.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Lier à une anomalie (optionnel)</label>
                  <select
                    value={linkedAnomalyId}
                    onChange={(e) => setLinkedAnomalyId(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-sm border',
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
                    )}
                  >
                    <option value="">Aucune</option>
                    {unresolvedAnomalies.map(anomaly => (
                      <option key={anomaly.id} value={anomaly.id}>
                        {anomaly.field} - {anomaly.type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Type d'annotation</label>
                  <select
                    value={annotationType}
                    onChange={(e) => setAnnotationType(e.target.value as any)}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-sm border',
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
                    )}
                  >
                    <option value="comment">Commentaire</option>
                    <option value="correction">Correction</option>
                    <option value="approval">Approbation</option>
                    <option value="rejection">Rejet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Commentaire *</label>
                  <textarea
                    value={annotationComment}
                    onChange={(e) => setAnnotationComment(e.target.value)}
                    rows={3}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-sm border',
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
                    )}
                    placeholder="Saisir votre commentaire..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={handleAddAnnotation}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowAddAnnotation(false);
                      setAnnotationComment('');
                      setSelectedField('');
                      setLinkedAnomalyId('');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des annotations */}
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className={cn(
                'p-3 rounded-lg border',
                darkMode ? 'bg-slate-800/30 border-slate-700/30' : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info" className="text-[10px]">
                      {annotation.type || 'comment'}
                    </Badge>
                    {annotation.field && (
                      <span className="text-xs text-slate-400">
                        Champ: {annotation.field.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{annotation.comment}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Par {annotation.createdBy} le {new Date(annotation.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {onUpdateAnnotation && onDeleteAnnotation && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingAnnotationId(annotation.id)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {annotations.length === 0 && !showAddAnnotation && (
            <p className="text-sm text-slate-400 text-center py-4 italic">
              Aucune annotation pour le moment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

