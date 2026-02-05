'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/lib/api/ticketsClientAPI';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpCircle,
  Clock,
  Users,
  Tag,
  Download,
  RefreshCw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface BulkActionsModalProps {
  open: boolean;
  onClose: () => void;
  selectedTickets: Ticket[];
  onActionComplete?: () => void;
}

type BulkAction =
  | 'affecter'
  | 'changer_statut'
  | 'changer_priorite'
  | 'escalader'
  | 'ajouter_tags'
  | 'exporter';

// ============================================
// COMPONENT
// ============================================

export function TicketsClientBulkActionsModal({
  open,
  onClose,
  selectedTickets,
  onActionComplete,
}: BulkActionsModalProps) {
  const [action, setAction] = useState<BulkAction>('affecter');
  const [responsable, setResponsable] = useState('');
  const [statut, setStatut] = useState<string>('');
  const [priorite, setPriorite] = useState<string>('');
  const [niveauEscalade, setNiveauEscalade] = useState<number>(1);
  const [tags, setTags] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleExecute = async () => {
    setProcessing(true);

    // Simuler le traitement
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setProcessing(false);
    onActionComplete?.();
    onClose();
  };

  const actions = [
    {
      id: 'affecter',
      label: 'Affecter à un responsable',
      icon: Users,
      description: 'Assigner les tickets sélectionnés à un membre de l\'équipe',
    },
    {
      id: 'changer_statut',
      label: 'Changer le statut',
      icon: RefreshCw,
      description: 'Modifier le statut de tous les tickets sélectionnés',
    },
    {
      id: 'changer_priorite',
      label: 'Changer la priorité',
      icon: AlertCircle,
      description: 'Ajuster la priorité des tickets',
    },
    {
      id: 'escalader',
      label: 'Escalader',
      icon: ArrowUpCircle,
      description: 'Remonter les tickets au niveau supérieur',
    },
    {
      id: 'ajouter_tags',
      label: 'Ajouter des tags',
      icon: Tag,
      description: 'Étiqueter plusieurs tickets simultanément',
    },
    {
      id: 'exporter',
      label: 'Exporter la sélection',
      icon: Download,
      description: 'Télécharger les tickets sélectionnés',
    },
  ];

  const responsables = [
    'Jean Dupont',
    'Marie Martin',
    'Pierre Diallo',
    'Sophie Ndiaye',
    'Ahmed Sow',
  ];

  const statuts = [
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'en_attente_client', label: 'En attente client' },
    { value: 'en_attente_interne', label: 'En attente interne' },
    { value: 'resolu', label: 'Résolu' },
    { value: 'clos', label: 'Clos' },
  ];

  const priorites = [
    { value: 'critique', label: 'Critique', color: 'text-rose-600' },
    { value: 'haute', label: 'Haute', color: 'text-amber-600' },
    { value: 'normale', label: 'Normale', color: 'text-blue-600' },
    { value: 'basse', label: 'Basse', color: 'text-slate-600' },
  ];

  return (
    <FluentModal
      open={open}
      title="Actions en masse"
      onClose={onClose}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Info banner */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} sélectionné{selectedTickets.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Les modifications seront appliquées à tous les tickets sélectionnés
          </p>
        </div>

        {/* Action selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-3">
            Choisir une action
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => setAction(act.id as BulkAction)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all',
                    action === act.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        action === act.id ? 'text-orange-600' : 'text-slate-400'
                      )}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {act.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{act.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action parameters */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {action === 'affecter' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Responsable
              </label>
              <select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <option value="">Sélectionner un responsable</option>
                {responsables.map((resp) => (
                  <option key={resp} value={resp}>
                    {resp}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'changer_statut' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Nouveau statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <option value="">Sélectionner un statut</option>
                {statuts.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'changer_priorite' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Nouvelle priorité
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {priorites.map((prio) => (
                  <button
                    key={prio.value}
                    onClick={() => setPriorite(prio.value)}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      priorite === prio.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                  >
                    <div className={cn('font-medium', prio.color)}>{prio.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {action === 'escalader' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Niveau d'escalade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((niveau) => (
                  <button
                    key={niveau}
                    onClick={() => setNiveauEscalade(niveau)}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      niveauEscalade === niveau
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                  >
                    <div className="font-bold">N{niveau}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {niveau === 1 && 'Équipe'}
                      {niveau === 2 && 'Direction'}
                      {niveau === 3 && 'DG'}
                      {niveau === 4 && 'Crise'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {action === 'ajouter_tags' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="urgent, important, suivre"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          )}

          {action === 'exporter' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Format d'export
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['CSV', 'Excel', 'JSON', 'PDF'].map((format) => (
                  <button
                    key={format}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-center transition-all"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tickets preview */}
        <div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tickets concernés ({selectedTickets.length})
          </div>
          <div className="max-h-[200px] overflow-auto space-y-1">
            {selectedTickets.slice(0, 10).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
              >
                <span className="font-mono text-slate-500">{ticket.numero}</span>
                <span className="flex-1 px-3 truncate">{ticket.titre}</span>
                <span className="text-xs text-slate-400">{ticket.status}</span>
              </div>
            ))}
            {selectedTickets.length > 10 && (
              <div className="text-center text-sm text-slate-400 py-2">
                ... et {selectedTickets.length - 10} autre(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <FluentButton variant="secondary" onClick={onClose} disabled={processing}>
          Annuler
        </FluentButton>
        <FluentButton variant="primary" onClick={handleExecute} disabled={processing}>
          {processing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Appliquer à {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''}
            </>
          )}
        </FluentButton>
      </div>
    </FluentModal>
  );
}

