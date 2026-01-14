/**
 * Modale d'escalade d'alerte
 */

'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useEscalateAlert } from '@/lib/api/hooks/useCentreAlertes';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function EscalateModal() {
  const { modal, closeModal } = useCentreAlertesCommandCenterStore();
  const { user } = useCurrentUser();
  const escalateAlert = useEscalateAlert();
  
  const isOpen = modal.isOpen && modal.type === 'escalate';
  const alert = modal.data?.alert;

  const [escalateTo, setEscalateTo] = useState<string>('governance');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'high' | 'critical'>('high');

  const handleSubmit = async () => {
    if (!alert || !reason.trim()) {
      toast.error('Veuillez fournir une raison pour l\'escalade');
      return;
    }

    try {
      await escalateAlert.mutateAsync({
        id: alert.id,
        payload: {
          escalateTo,
          reason,
          priority,
          userId: user?.id,
        },
      });

      toast.success('Alerte escaladée avec succès');
      closeModal();
      setReason('');
      setEscalateTo('governance');
      setPriority('high');
    } catch (error) {
      toast.error('Erreur lors de l\'escalade de l\'alerte');
      console.error(error);
    }
  };

  if (!alert) return null;

  return (
    <FluentModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Escalader l'alerte"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{alert.title}</h3>
          <p className="text-xs text-slate-400">{alert.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="escalate-to">Escalader vers</Label>
          <Select value={escalateTo} onValueChange={setEscalateTo}>
            <SelectTrigger id="escalate-to">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="governance">Gouvernance</SelectItem>
              <SelectItem value="dg">Direction Générale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as 'high' | 'critical')}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Raison de l'escalade *</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquer pourquoi cette alerte nécessite une escalade..."
            rows={4}
            className="bg-slate-800/50 border-slate-700/50"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={escalateAlert.isPending}>
            Annuler
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={escalateAlert.isPending || !reason.trim()}
            className="bg-red-500 hover:bg-red-600"
          >
            {escalateAlert.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Escalade...
              </>
            ) : (
              'Escalader'
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}
