/**
 * Modal d'aide pour Validation Contrats
 * Guide utilisateur avec raccourcis, workflow, statuts, FAQ
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Keyboard,
  GitBranch,
  CheckCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContratHelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'shortcuts' | 'workflow' | 'statuses' | 'faq';

export function ContratHelpModal({ open, onClose }: ContratHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('shortcuts');

  const sections = [
    { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'statuses', label: 'Statuts', icon: CheckCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Aide - Validation Contrats</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Sidebar */}
          <div className="w-48 space-y-1 flex-shrink-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as HelpSection)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === section.id
                      ? 'bg-purple-500/20 text-purple-300 font-medium'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'statuses' && <StatusesSection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-700/50">
          <Button onClick={onClose} className="bg-purple-500 hover:bg-purple-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Raccourcis clavier
// ================================
function ShortcutsSection() {
  const shortcuts = [
    { key: 'Ctrl+K / ⌘K', description: 'Ouvrir la palette de commandes' },
    { key: 'Ctrl+F / ⌘F', description: 'Ouvrir le panneau de filtres' },
    { key: 'Ctrl+B / ⌘B', description: 'Afficher/masquer la sidebar' },
    { key: 'Ctrl+E / ⌘E', description: 'Exporter les données' },
    { key: 'Alt+←', description: 'Retour à la page précédente' },
    { key: 'F11', description: 'Mode plein écran' },
    { key: 'Échap', description: 'Fermer les modales/panels' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Raccourcis clavier</h3>
        <p className="text-sm text-slate-400">
          Utilisez ces raccourcis pour naviguer plus rapidement dans l'application
        </p>
      </div>

      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50"
          >
            <span className="text-sm text-slate-300">{shortcut.description}</span>
            <kbd className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Astuce :</strong> Appuyez sur Ctrl+K pour accéder rapidement à toutes les actions disponibles
        </p>
      </div>
    </div>
  );
}

// ================================
// Workflow de validation
// ================================
function WorkflowSection() {
  const steps = [
    {
      number: 1,
      title: 'Réception du contrat',
      description: 'Le contrat est reçu et enregistré dans le système',
      status: 'pending',
    },
    {
      number: 2,
      title: 'Analyse juridique',
      description: 'Vérification de la conformité légale et des clauses',
      status: 'in-progress',
    },
    {
      number: 3,
      title: 'Validation technique',
      description: 'Analyse des aspects techniques et faisabilité',
      status: 'in-progress',
    },
    {
      number: 4,
      title: 'Validation financière',
      description: 'Vérification du budget et des conditions de paiement',
      status: 'in-progress',
    },
    {
      number: 5,
      title: 'Validation Direction',
      description: 'Approbation finale par la direction',
      status: 'pending',
    },
    {
      number: 6,
      title: 'Signature',
      description: 'Signature du contrat et archivage',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Workflow de validation</h3>
        <p className="text-sm text-slate-400">
          Processus standard de validation d'un contrat
        </p>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-4 pb-6 last:pb-0">
            {/* Number badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-sm font-bold text-purple-300">
              {step.number}
            </div>

            {/* Vertical line */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-slate-700" />
            )}

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <h4 className="text-sm font-medium text-slate-200 mb-1">{step.title}</h4>
              <p className="text-xs text-slate-400">{step.description}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {step.status === 'in-progress' && (
                <span className="text-xs text-amber-400">En cours</span>
              )}
              {step.status === 'pending' && (
                <span className="text-xs text-slate-500">En attente</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <p className="text-sm text-purple-300">
          <strong>Note :</strong> Certaines étapes peuvent être effectuées en parallèle. Le workflow peut varier selon le type et la valeur du contrat.
        </p>
      </div>
    </div>
  );
}

// ================================
// Statuts expliqués
// ================================
function StatusesSection() {
  const statuses = [
    {
      status: 'pending',
      icon: '🟡',
      label: 'En attente',
      description: 'Le contrat a été reçu mais n\'a pas encore été traité. Il nécessite une action de votre part.',
      color: 'amber',
    },
    {
      status: 'validated',
      icon: '🟢',
      label: 'Validé',
      description: 'Toutes les validations requises ont été effectuées. Le contrat est approuvé.',
      color: 'emerald',
    },
    {
      status: 'rejected',
      icon: '🔴',
      label: 'Rejeté',
      description: 'Le contrat a été rejeté car il ne répond pas aux critères ou contient des clauses inacceptables.',
      color: 'red',
    },
    {
      status: 'negotiation',
      icon: '🔵',
      label: 'En négociation',
      description: 'Des discussions sont en cours avec le fournisseur pour modifier certaines clauses.',
      color: 'blue',
    },
    {
      status: 'expired',
      icon: '⚪',
      label: 'Expiré',
      description: 'La date d\'échéance du contrat est dépassée. Une action urgente est nécessaire.',
      color: 'slate',
    },
    {
      status: 'signed',
      icon: '✅',
      label: 'Signé',
      description: 'Le contrat a été validé et signé par toutes les parties. Il est maintenant actif.',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Statuts des contrats</h3>
        <p className="text-sm text-slate-400">
          Comprendre les différents états d'un contrat
        </p>
      </div>

      <div className="space-y-3">
        {statuses.map((item) => (
          <div
            key={item.status}
            className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <h4 className={`text-sm font-medium text-${item.color}-400`}>{item.label}</h4>
            </div>
            <p className="text-sm text-slate-400 ml-11">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// FAQ
// ================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment valider un contrat ?',
      answer: 'Cliquez sur le contrat dans la liste pour ouvrir ses détails. Vérifiez toutes les informations dans les onglets (Détails, Clauses, Documents). Si tout est conforme, cliquez sur le bouton "Valider" en bas de la modal. Vous pouvez ajouter un commentaire optionnel.',
    },
    {
      question: 'Que faire si une clause est marquée "KO" ?',
      answer: 'Une clause KO indique un problème qui nécessite attention. Vous avez plusieurs options : 1) Rejeter le contrat avec une raison détaillée, 2) Initier une négociation pour modifier la clause, ou 3) Escalader vers la direction pour une décision.',
    },
    {
      question: 'Comment utiliser les actions groupées ?',
      answer: 'Sélectionnez plusieurs contrats en cochant les cases à gauche de chaque ligne. Une barre d\'actions apparaîtra en bas de l\'écran avec les options : Valider tous, Rejeter, Escalader, ou Exporter. Cliquez sur l\'action souhaitée et confirmez.',
    },
    {
      question: 'Comment escalader une décision ?',
      answer: 'Ouvrez les détails du contrat et cliquez sur "Escalader". Sélectionnez le destinataire (Direction, DG, Comité) et indiquez la raison de l\'escalade (minimum 10 caractères). Le contrat sera transmis au niveau supérieur pour décision.',
    },
    {
      question: 'Comment exporter des contrats ?',
      answer: 'Cliquez sur le bouton "Actions" puis "Exporter", ou utilisez Ctrl+E. Choisissez le format (Excel, CSV, PDF, JSON), le périmètre (tous, filtrés, sélection), et les données à inclure. Vous pouvez activer l\'audit trail et l\'anonymisation.',
    },
    {
      question: 'Où trouver l\'historique d\'un contrat ?',
      answer: 'Ouvrez les détails du contrat et naviguez vers l\'onglet "Historique". Vous y trouverez toutes les actions effectuées sur le contrat : réception, analyses, validations, commentaires, avec les dates et auteurs.',
    },
    {
      question: 'Comment filtrer les contrats ?',
      answer: 'Utilisez le bouton "Filtres" en haut ou Ctrl+F. Vous pouvez filtrer par statut, urgence, type, montant, durée, période, bureau, fournisseur, validations, et état des clauses. Les filtres actifs sont affichés avec un badge.',
    },
    {
      question: 'Que signifie "Délai moyen" dans les KPIs ?',
      answer: 'C\'est le temps moyen entre la réception d\'un contrat et sa validation finale. Un délai plus court indique une meilleure efficacité du processus de validation.',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Foire Aux Questions</h3>
        <p className="text-sm text-slate-400">
          Réponses aux questions les plus fréquentes
        </p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/60 transition-colors"
            >
              <span className="text-sm font-medium text-slate-200">{faq.question}</span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ml-2',
                  openIndex === index && 'rotate-90'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <p className="text-sm text-emerald-300">
          <strong>Besoin d'aide supplémentaire ?</strong> Contactez le support technique ou consultez la documentation complète.
        </p>
      </div>
    </div>
  );
}

