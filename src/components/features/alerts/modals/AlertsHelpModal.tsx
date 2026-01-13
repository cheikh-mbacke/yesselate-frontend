/**
 * Help Modal - Alertes & Risques
 * Aide contextuelle complète pour le module Alertes
 */

'use client';

import React, { useState } from 'react';
import { X, Keyboard, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';

interface AlertsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertsHelpModal({ isOpen, onClose }: AlertsHelpModalProps) {
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'workflow' | 'severity' | 'faq'>('shortcuts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] m-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <HelpCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Centre d'aide - Alertes & Risques</h2>
              <p className="text-sm text-slate-400">Tout ce que vous devez savoir sur la gestion des alertes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-slate-700 bg-slate-800/30 p-3 flex flex-col gap-1">
            <button
              onClick={() => setActiveSection('shortcuts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'shortcuts'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Raccourcis
            </button>
            <button
              onClick={() => setActiveSection('workflow')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'workflow'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Workflow
            </button>
            <button
              onClick={() => setActiveSection('severity')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'severity'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Niveaux
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'faq'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'severity' && <SeveritySection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/30">
          <p className="text-xs text-slate-400">
            Appuyez sur <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">F1</kbd> pour afficher cette aide
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================
// SECTION: Raccourcis Clavier
// ================================
function ShortcutsSection() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Ouvrir la palette de commandes', category: 'Navigation' },
    { keys: ['Ctrl', 'F'], description: 'Rechercher une alerte', category: 'Navigation' },
    { keys: ['Ctrl', 'R'], description: 'Rafraîchir les données', category: 'Actions' },
    { keys: ['Ctrl', 'E'], description: 'Exporter les alertes', category: 'Actions' },
    { keys: ['Ctrl', 'A'], description: 'Acquitter l\'alerte sélectionnée', category: 'Actions' },
    { keys: ['Ctrl', 'Shift', 'R'], description: 'Résoudre l\'alerte sélectionnée', category: 'Actions' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Escalader l\'alerte sélectionnée', category: 'Actions' },
    { keys: ['F1'], description: 'Afficher cette aide', category: 'Aide' },
    { keys: ['Échap'], description: 'Fermer les modales', category: 'Navigation' },
  ];

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">⌨️ Raccourcis clavier</h3>
        <p className="text-sm text-slate-400">Utilisez ces raccourcis pour une gestion rapide et efficace des alertes.</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-red-400 mb-3">{category}</h4>
          <div className="space-y-2">
            {shortcuts
              .filter((s) => s.category === category)
              .map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-slate-500 text-xs mx-1">+</span>}
                        <kbd className="px-3 py-1.5 bg-slate-700 rounded-md text-xs font-mono text-slate-200 border border-slate-600">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================
// SECTION: Workflow
// ================================
function WorkflowSection() {
  const steps = [
    {
      number: 1,
      title: 'Détection',
      description: 'Le système détecte automatiquement une anomalie ou un événement critique. Une alerte est créée en temps réel.',
      icon: '🔍',
    },
    {
      number: 2,
      title: 'Classification',
      description: 'L\'alerte est classée par sévérité (Critique, Élevée, Moyenne, Basse) et catégorie (Sécurité, Performance, etc.).',
      icon: '🏷️',
    },
    {
      number: 3,
      title: 'Notification',
      description: 'Les équipes concernées sont notifiées via le dashboard, email, SMS ou webhook selon la configuration.',
      icon: '🔔',
    },
    {
      number: 4,
      title: 'Acquittement',
      description: 'Un membre de l\'équipe acquitte l\'alerte pour signaler qu\'elle est prise en charge. Le chrono de SLA démarre.',
      icon: '✋',
    },
    {
      number: 5,
      title: 'Investigation',
      description: 'L\'équipe analyse l\'alerte, ajoute des commentaires, attache des documents et détermine les actions correctives.',
      icon: '🔬',
    },
    {
      number: 6,
      title: 'Résolution',
      description: 'Les actions sont appliquées, l\'incident est résolu. L\'alerte est marquée comme résolue avec un résumé.',
      icon: '✅',
    },
    {
      number: 7,
      title: 'Post-mortem',
      description: 'Analyse des causes racines, documentation des leçons apprises et mise à jour des procédures.',
      icon: '📝',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">🔄 Workflow de gestion</h3>
        <p className="text-sm text-slate-400">Processus complet de traitement d\'une alerte, de la détection à la résolution.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative">
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-red-500/50 to-transparent" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-xl relative z-10 bg-slate-900">
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-red-400">ÉTAPE {step.number}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h4>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// SECTION: Niveaux de sévérité
// ================================
function SeveritySection() {
  const severities = [
    {
      name: 'Critique',
      icon: '🔴',
      color: 'red',
      sla: '< 15 min',
      description: 'Incident majeur affectant les services critiques. Impact business immédiat. Nécessite une intervention urgente.',
      examples: 'Panne totale, brèche de sécurité, perte de données, service inaccessible',
      actions: 'Escalade automatique, notification équipe on-call, communication management',
    },
    {
      name: 'Élevée',
      icon: '🟠',
      color: 'orange',
      sla: '< 1 heure',
      description: 'Problème important affectant une fonctionnalité majeure. Impact significatif mais service partiellement opérationnel.',
      examples: 'Dégradation performances, erreur récurrente, fonctionnalité bloquée',
      actions: 'Notification équipe support, investigation prioritaire, suivi régulier',
    },
    {
      name: 'Moyenne',
      icon: '🟡',
      color: 'amber',
      sla: '< 4 heures',
      description: 'Problème modéré nécessitant attention mais sans impact critique immédiat. Service opérationnel avec limitations.',
      examples: 'Bug non-bloquant, avertissement système, quota approchant',
      actions: 'Investigation standard, planification correction, documentation',
    },
    {
      name: 'Basse',
      icon: '🔵',
      color: 'blue',
      sla: '< 24 heures',
      description: 'Problème mineur ou information. Aucun impact opérationnel. Traitement dans le cadre normal.',
      examples: 'Avertissement préventif, recommandation, notification informative',
      actions: 'Enregistrement, vérification différée, suivi dans backlog',
    },
  ];

  const categories = [
    { name: 'Sécurité', icon: '🔒', description: 'Tentatives d\'intrusion, vulnérabilités, violations de politique' },
    { name: 'Performance', icon: '⚡', description: 'Latence élevée, temps de réponse, utilisation ressources' },
    { name: 'Infrastructure', icon: '🏗️', description: 'Serveurs, réseau, stockage, bases de données' },
    { name: 'Application', icon: '💻', description: 'Bugs, erreurs applicatives, crashes, exceptions' },
    { name: 'Réseau', icon: '🌐', description: 'Connectivité, bande passante, DNS, routage' },
    { name: 'Conformité', icon: '📋', description: 'Audits, réglementations, politiques internes' },
  ];

  return (
    <div className="space-y-8">
      {/* Niveaux de sévérité */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">⚠️ Niveaux de sévérité</h3>
        <p className="text-sm text-slate-400 mb-4">Quatre niveaux de criticité avec SLA et actions associées.</p>

        <div className="space-y-3">
          {severities.map((severity) => (
            <div key={severity.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{severity.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-200">{severity.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">SLA: {severity.sla}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{severity.description}</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Exemples:</span>
                      <span className="text-slate-400 ml-2">{severity.examples}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Actions:</span>
                      <span className="text-slate-400 ml-2">{severity.actions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">📚 Catégories d'alertes</h3>
        <p className="text-sm text-slate-400 mb-4">Six catégories principales pour classifier les alertes.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <div key={category.name} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{category.icon}</span>
                <h4 className="text-sm font-semibold text-slate-200">{category.name}</h4>
              </div>
              <p className="text-xs text-slate-400">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================
// SECTION: FAQ
// ================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Comment acquitter une alerte ?',
      answer:
        'Cliquez sur l\'alerte pour ouvrir ses détails, puis cliquez sur "Acquitter" ou utilisez Ctrl+A. L\'acquittement signale que vous prenez en charge l\'alerte et démarre le chronomètre de SLA.',
    },
    {
      question: 'Quelle est la différence entre acquitter et résoudre ?',
      answer:
        'Acquitter signifie "J\'ai vu et je m\'en occupe". Résoudre signifie "Le problème est corrigé". Une alerte passe généralement par ces deux états : nouvelle → acquittée → en cours → résolue.',
    },
    {
      question: 'Comment escalader une alerte ?',
      answer:
        'Si vous ne pouvez pas résoudre une alerte dans les SLA, utilisez le bouton "Escalader" (Ctrl+Shift+E). Cela notifie automatiquement le niveau supérieur (N+1, Direction, etc.) selon la matrice d\'escalade.',
    },
    {
      question: 'Puis-je filtrer les alertes par équipe ?',
      answer:
        'Oui ! Utilisez les filtres avancés (icône filtre) pour filtrer par équipe assignée, catégorie, sévérité, statut, ou période. Vous pouvez aussi créer des vues personnalisées et les épingler.',
    },
    {
      question: 'Comment recevoir des notifications ?',
      answer:
        'Configurez vos préférences de notification dans Paramètres > Notifications. Vous pouvez choisir les canaux (dashboard, email, SMS, webhook) et les seuils (critique uniquement, toutes alertes, etc.).',
    },
    {
      question: 'Que signifie "SLA dépassé" ?',
      answer:
        'Chaque niveau de sévérité a un délai maximal de réponse (SLA). Si ce délai est dépassé sans action, l\'alerte est marquée en rouge et peut être auto-escaladée selon la configuration.',
    },
    {
      question: 'Puis-je voir l\'historique d\'une alerte ?',
      answer:
        'Oui ! Ouvrez les détails de l\'alerte et consultez l\'onglet "Timeline". Vous verrez tous les événements : création, acquittement, commentaires, changements de statut, résolution, avec horodatage et auteur.',
    },
    {
      question: 'Comment exporter les alertes pour reporting ?',
      answer:
        'Utilisez le bouton "Exporter" (Ctrl+E). Choisissez le format (Excel, CSV, JSON, PDF), le périmètre (toutes, filtrées, sélection) et les colonnes à inclure. Idéal pour les rapports mensuels.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">❓ Questions fréquentes</h3>
        <p className="text-sm text-slate-400">Réponses aux questions les plus courantes sur la gestion des alertes.</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-sm font-medium text-slate-200 pr-4">{faq.question}</span>
              <span
                className={`text-red-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

