/**
 * Modale d'assignation d'alerte
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useAssignAlert } from '@/lib/api/hooks/useCentreAlertes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Mock users - À remplacer par une vraie API
const mockUsers = [
  { id: 'user1', name: 'A. DIALLO', role: 'Directeur Général' },
  { id: 'user2', name: 'B. MARTIN', role: 'Responsable Exécution' },
  { id: 'user3', name: 'C. DUPONT', role: 'Responsable Projets' },
  { id: 'user4', name: 'D. BERNARD', role: 'Responsable Finance' },
];

export function AssignModal() {
  const { modal, closeModal } = useCentreAlertesCommandCenterStore();
  const assignAlert = useAssignAlert();
  
  const isOpen = modal.isOpen && modal.type === 'assign';
  const alert = modal.data?.alert;

  const [userId, setUserId] = useState<string>('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!alert || !userId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      await assignAlert.mutateAsync({
        id: alert.id,
        payload: {
          userId,
          note: note || undefined,
        },
      });

      toast.success('Alerte assignée avec succès');
      closeModal();
      setUserId('');
      setNote('');
    } catch (error) {
      toast.error('Erreur lors de l\'assignation de l\'alerte');
      console.error(error);
    }
  };

  if (!alert) return null;

  return (
    <FluentModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Assigner l'alerte"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{alert.title}</h3>
          <p className="text-xs text-slate-400">{alert.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user">Assigner à *</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="user">
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} - {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optionnel)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note pour l'assignation..."
            rows={3}
            className="bg-slate-800/50 border-slate-700/50"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={assignAlert.isPending}>
            Annuler
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={assignAlert.isPending || !userId}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {assignAlert.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}
