/**
 * Modale de traitement d'alerte
 */

'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useTreatAlert } from '@/lib/api/hooks/useCentreAlertes';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function TreatModal() {
  const { modal, closeModal } = useCentreAlertesCommandCenterStore();
  const { user } = useCurrentUser();
  const treatAlert = useTreatAlert();
  
  const isOpen = modal.isOpen && modal.type === 'treat';
  const alert = modal.data?.alert;

  const [note, setNote] = useState('');
  const [resolutionType, setResolutionType] = useState<string>('');

  const handleSubmit = async () => {
    if (!alert) return;

    try {
      await treatAlert.mutateAsync({
        id: alert.id,
        payload: {
          note,
          resolutionType: resolutionType || undefined,
          userId: user?.id,
        },
      });

      toast.success('Alerte traitée avec succès');
      closeModal();
      setNote('');
      setResolutionType('');
    } catch (error) {
      toast.error('Erreur lors du traitement de l\'alerte');
      console.error(error);
    }
  };

  if (!alert) return null;

  return (
    <FluentModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Traiter l'alerte"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{alert.title}</h3>
          <p className="text-xs text-slate-400">{alert.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution-type">Type de résolution (optionnel)</Label>
          <Select value={resolutionType} onValueChange={setResolutionType}>
            <SelectTrigger id="resolution-type">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun (acquittement simple)</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="false-positive">Faux positif</SelectItem>
              <SelectItem value="duplicate">Doublon</SelectItem>
              <SelectItem value="no-action">Aucune action requise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optionnel)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note sur le traitement..."
            rows={4}
            className="bg-slate-800/50 border-slate-700/50"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={treatAlert.isPending}>
            Annuler
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={treatAlert.isPending}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {treatAlert.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              'Traiter'
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}
