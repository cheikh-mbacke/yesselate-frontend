'use client';

import { useState } from 'react';
import {
  FluentDialog,
  FluentDialogContent,
  FluentDialogDescription,
  FluentDialogFooter,
  FluentDialogHeader,
  FluentDialogTitle,
} from '@/components/ui/fluent-dialog';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import type { Demand } from '@/lib/types/bmo.types';

interface DemandDetailsModalProps {
  demand: Demand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate?: (demand: Demand, comment: string) => void;
  onReject?: (demand: Demand, reason: string) => void;
}

export function DemandDetailsModal({
  demand,
  open,
  onOpenChange,
  onValidate,
  onReject,
}: DemandDetailsModalProps) {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'view' | 'validate' | 'reject'>('view');

  if (!demand) return null;

  const handleValidate = () => {
    if (onValidate) {
      onValidate(demand, comment);
      setComment('');
      setAction('view');
      onOpenChange(false);
    }
  };

  const handleReject = () => {
    if (onReject && comment.trim()) {
      onReject(demand, comment);
      setComment('');
      setAction('view');
      onOpenChange(false);
    }
  };

  return (
    <FluentDialog open={open} onOpenChange={onOpenChange}>
      <FluentDialogContent className="max-w-2xl">
        <FluentDialogHeader>
          <FluentDialogTitle className="flex items-center gap-2">
            <span>Demande {demand.id}</span>
            <Badge
              variant={
                demand.priority === 'urgent'
                  ? 'urgent'
                  : demand.priority === 'high'
                  ? 'warning'
                  : 'default'
              }
              className="text-xs"
            >
              {demand.priority}
            </Badge>
          </FluentDialogTitle>
          <FluentDialogDescription>
            {demand.bureau} • {demand.type} • {demand.date}
          </FluentDialogDescription>
        </FluentDialogHeader>

        <div className="p-6 pt-0 space-y-4">
          {/* Détails de la demande */}
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[rgb(var(--muted))] mb-1">Objet</div>
              <div className="text-sm font-medium">{demand.subject}</div>
            </div>

            {demand.amount && demand.amount !== '—' && (
              <div>
                <div className="text-xs text-[rgb(var(--muted))] mb-1">Montant</div>
                <div className="text-lg font-mono font-bold text-amber-400">{demand.amount}</div>
              </div>
            )}

            <div>
              <div className="text-xs text-[rgb(var(--muted))] mb-1">Statut</div>
              <Badge variant={demand.status === 'validated' ? 'success' : 'default'}>
                {demand.status ?? 'pending'}
              </Badge>
            </div>
          </div>

          {/* Action de validation/rejet */}
          {action !== 'view' && (
            <div className="space-y-2">
              <div className="text-xs text-[rgb(var(--muted))]">
                {action === 'validate' ? 'Commentaire (optionnel)' : 'Motif du rejet *'}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  action === 'validate'
                    ? 'Ajouter un commentaire...'
                    : 'Indiquer le motif du rejet...'
                }
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <FluentDialogFooter>
          {action === 'view' && (
            <>
              {(demand.status === 'pending' || !demand.status) && (
                <>
                  <Button variant="destructive" size="sm" onClick={() => setAction('reject')}>
                    Rejeter
                  </Button>
                  <Button variant="success" size="sm" onClick={() => setAction('validate')}>
                    Valider
                  </Button>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </>
          )}

          {action === 'validate' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setAction('view')}>
                Annuler
              </Button>
              <Button variant="success" size="sm" onClick={handleValidate}>
                Confirmer la validation
              </Button>
            </>
          )}

          {action === 'reject' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setAction('view')}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={!comment.trim()}
              >
                Confirmer le rejet
              </Button>
            </>
          )}
        </FluentDialogFooter>
      </FluentDialogContent>
    </FluentDialog>
  );
}

