/**
 * Modale d'acquittement d'alerte
 */

'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useAcknowledgeAlert } from '@/lib/api/hooks/useCentreAlertes';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AcknowledgeModal() {
  const { modal, closeModal } = useCentreAlertesCommandCenterStore();
  const { user } = useCurrentUser();
  const acknowledgeAlert = useAcknowledgeAlert();
  
  const isOpen = modal.isOpen && modal.type === 'acknowledge';
  const alert = modal.data?.alert;

  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!alert) return;

    try {
      await acknowledgeAlert.mutateAsync({
        id: alert.id,
        payload: {
          note: note || undefined,
          userId: user?.id,
        },
      });

      toast.success('Alerte acquittée avec succès');
      closeModal();
      setNote('');
    } catch (error) {
      toast.error('Erreur lors de l\'acquittement de l\'alerte');
      console.error(error);
    }
  };

  if (!alert) return null;

  return (
    <FluentModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Acquitter l'alerte"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{alert.title}</h3>
          <p className="text-xs text-slate-400">{alert.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optionnel)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note sur l'acquittement..."
            rows={4}
            className="bg-slate-800/50 border-slate-700/50"
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-400">
            L'acquittement marque l'alerte comme prise en compte. Elle restera visible mais sera marquée comme acquittée.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={acknowledgeAlert.isPending}>
            Annuler
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={acknowledgeAlert.isPending}
            className="bg-green-500 hover:bg-green-600"
          >
            {acknowledgeAlert.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Acquittement...
              </>
            ) : (
              'Acquitter'
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}
