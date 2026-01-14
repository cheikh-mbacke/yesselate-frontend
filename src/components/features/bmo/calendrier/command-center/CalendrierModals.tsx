/**
 * Système centralisé de modales pour Calendrier
 * Gère toutes les modales : détail SLA, conflit, jalon, absence, simulation IA, fenêtres avancées
 */

'use client';

import React from 'react';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Calendar, Users, Brain, History, TrendingUp, Grid, BarChart3, FolderKanban } from 'lucide-react';
import { ExportCalendrierModal } from '../modals/ExportCalendrierModal';
import { AlertConfigModal } from '../modals/AlertConfigModal';
import type { CalendrierModalType } from '@/lib/types/calendrier-modal.types';

export function CalendrierModals() {
  const { modal, closeModal } = useCalendrierStore();

  if (!modal.isOpen || !modal.type) return null;

  // Modales de détail
  if (modal.type === 'sla-detail') {
    return <DetailSLAModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'conflit-detail') {
    return <DetailConflitModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'jalon-detail') {
    return <DetailJalonModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'absence-detail') {
    return <DetailAbsenceModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'simulation-ia') {
    return <SimulationIAModal open={true} onClose={closeModal} data={modal.data} />;
  }

  // Fenêtres avancées
  if (modal.type === 'timeline-globale') {
    return <TimelineGlobaleModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'heatmap-charges') {
    return <HeatmapChargesModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'multi-ressources') {
    return <MultiRessourcesModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'vue-croisee') {
    return <VueCroiseeModal open={true} onClose={closeModal} data={modal.data} />;
  }

  if (modal.type === 'planning-projet') {
    return <PlanningProjetModal open={true} onClose={closeModal} data={modal.data} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return (
      <ExportCalendrierModal
        open={true}
        onClose={closeModal}
        domain={modal.data?.domain}
        section={modal.data?.section}
        period={modal.data?.period}
        onExport={modal.data?.onExport}
      />
    );
  }

  // Alert Config Modal
  if (modal.type === 'alert-config') {
    return (
      <AlertConfigModal
        open={true}
        onClose={closeModal}
        onSave={modal.data?.onSave}
      />
    );
  }

  return null;
}

// ================================
// Modales de détail
// ================================

function DetailSLAModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  const sla = data?.sla || {};

  return (
    <FluentModal open={open} onClose={onClose} title="Détail SLA" maxWidth="4xl" dark>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Élément</p>
            <p className="text-base text-slate-200 font-medium">{sla.elementLabel || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Statut</p>
            <Badge variant={sla.statut === 'en-retard' ? 'destructive' : 'default'}>
              {sla.statut || 'N/A'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Échéance prévue</p>
            <p className="text-base text-slate-200">{sla.echeancePrevue ? new Date(sla.echeancePrevue).toLocaleDateString('fr-FR') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Retard</p>
            <p className="text-base text-amber-400">{sla.retard ? `${sla.retard} jours` : 'Aucun'}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={() => {
            // Ouvrir modale de traitement
            onClose();
          }}>Traiter</Button>
        </div>
      </div>
    </FluentModal>
  );
}

function DetailConflitModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  const conflit = data?.conflit || {};

  return (
    <FluentModal open={open} onClose={onClose} title="Détail Conflit" maxWidth="4xl" dark>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Type</p>
            <p className="text-base text-slate-200 font-medium">{conflit.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Impact</p>
            <Badge variant={conflit.impact === 'critique' ? 'destructive' : 'default'}>
              {conflit.impact || 'N/A'}
            </Badge>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={() => {
            // Ouvrir modale de résolution
            onClose();
          }}>Résoudre</Button>
        </div>
      </div>
    </FluentModal>
  );
}

function DetailJalonModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  const jalon = data?.jalon || {};

  return (
    <FluentModal open={open} onClose={onClose} title="Détail Jalon Projet" maxWidth="4xl" dark>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Projet</p>
            <p className="text-base text-slate-200 font-medium">{jalon.projetLabel || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Jalon</p>
            <p className="text-base text-slate-200">{jalon.jalonLabel || 'N/A'}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </FluentModal>
  );
}

function DetailAbsenceModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  const absence = data?.absence || {};

  return (
    <FluentModal open={open} onClose={onClose} title="Détail Absence" maxWidth="4xl" dark>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Employé</p>
            <p className="text-base text-slate-200 font-medium">{absence.employeNom || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Type</p>
            <p className="text-base text-slate-200">{absence.type || 'N/A'}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </FluentModal>
  );
}

function SimulationIAModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Simulation IA - Planification" maxWidth="6xl" dark>
      <div className="space-y-6">
        <p className="text-slate-400">Analyse et recommandations de l'IA pour optimiser la planification.</p>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// Fenêtres avancées
// ================================

function TimelineGlobaleModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Timeline Globale" maxWidth="7xl" dark>
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <History className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p>Timeline globale - Vue temporelle complète</p>
        </div>
      </div>
    </FluentModal>
  );
}

function HeatmapChargesModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Heatmap des Charges" maxWidth="7xl" dark>
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p>Heatmap des charges - Analyse charge/disponibilité</p>
        </div>
      </div>
    </FluentModal>
  );
}

function MultiRessourcesModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Calendrier Multi-Ressources" maxWidth="7xl" dark>
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p>Calendrier multi-ressources - Gestion des conflits</p>
        </div>
      </div>
    </FluentModal>
  );
}

function VueCroiseeModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Vue Croisée SLA / Retards / Conflits" maxWidth="7xl" dark>
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p>Vue croisée SLA / Retards / Conflits</p>
        </div>
      </div>
    </FluentModal>
  );
}

function PlanningProjetModal({ open, onClose, data }: { open: boolean; onClose: () => void; data?: Record<string, any> }) {
  return (
    <FluentModal open={open} onClose={onClose} title="Planning Projet Intégré" maxWidth="7xl" dark>
      <div className="h-[600px] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p>Planning projet intégré</p>
        </div>
      </div>
    </FluentModal>
  );
}

