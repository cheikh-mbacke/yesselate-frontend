/**
 * Help Modal - Gestion Employés
 * Aide contextuelle complète pour le module Employés
 */

'use client';

import React, { useState } from 'react';
import { X, Keyboard, Users, HelpCircle, BookOpen } from 'lucide-react';

interface EmployeesHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeesHelpModal({ isOpen, onClose }: EmployeesHelpModalProps) {
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'workflow' | 'roles' | 'faq'>('shortcuts');

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
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <HelpCircle className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Centre d'aide - Gestion Employés</h2>
              <p className="text-sm text-slate-400">Tout sur la gestion RH, compétences et évaluations</p>
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
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
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
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Workflow
            </button>
            <button
              onClick={() => setActiveSection('roles')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'roles'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Rôles
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'faq'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
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
            {activeSection === 'roles' && <RolesSection />}
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
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
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
    { keys: ['Ctrl', 'R'], description: 'Rafraîchir les données', category: 'Actions' },
    { keys: ['Ctrl', 'I'], description: 'Ouvrir les statistiques', category: 'Actions' },
    { keys: ['Ctrl', 'E'], description: 'Exporter les données', category: 'Actions' },
    { keys: ['F1'], description: 'Afficher cette aide', category: 'Aide' },
    { keys: ['F11'], description: 'Plein écran', category: 'Affichage' },
    { keys: ['Échap'], description: 'Fermer les modales', category: 'Navigation' },
    { keys: ['?'], description: 'Afficher les raccourcis', category: 'Aide' },
  ];

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">⌨️ Raccourcis clavier</h3>
        <p className="text-sm text-slate-400">Utilisez ces raccourcis pour une gestion RH rapide et efficace.</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-teal-400 mb-3">{category}</h4>
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
      title: 'Recrutement',
      description: 'Publication de l\'offre, tri des candidatures, entretiens RH et techniques, décision d\'embauche.',
      icon: '📢',
    },
    {
      number: 2,
      title: 'Onboarding',
      description: 'Création du dossier, contrat de travail, accès systèmes, formation initiale, présentation équipe.',
      icon: '👋',
    },
    {
      number: 3,
      title: 'Gestion quotidienne',
      description: 'Suivi présences, gestion congés, notes de frais, demandes administratives, mise à jour dossier.',
      icon: '📋',
    },
    {
      number: 4,
      title: 'Développement',
      description: 'Plans de formation, montée en compétences, certifications, mobilité interne, accompagnement carrière.',
      icon: '📚',
    },
    {
      number: 5,
      title: 'Évaluation',
      description: 'Entretiens annuels, fixation objectifs, évaluation performances, retours managers, plans d\'amélioration.',
      icon: '⭐',
    },
    {
      number: 6,
      title: 'Évolution',
      description: 'Promotions, augmentations, changements de poste, reconnaissance, gestion des talents.',
      icon: '🚀',
    },
    {
      number: 7,
      title: 'Départ',
      description: 'Démission ou licenciement, entretien de sortie, récupération accès, solde de tout compte, archivage dossier.',
      icon: '👋',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">🔄 Cycle de vie RH</h3>
        <p className="text-sm text-slate-400">Processus complet de gestion d\'un employé, du recrutement au départ.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative">
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-teal-500/50 to-transparent" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-500/50 flex items-center justify-center text-xl relative z-10 bg-slate-900">
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-teal-400">ÉTAPE {step.number}</span>
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
// SECTION: Rôles et Responsabilités
// ================================
function RolesSection() {
  const roles = [
    {
      name: 'Manager Direct',
      icon: '👔',
      color: 'teal',
      permissions: 'Gestion équipe, évaluations, demandes congés/formation',
      responsibilities: 'Suivi quotidien, entretiens, objectifs, développement',
    },
    {
      name: 'RH',
      icon: '👥',
      color: 'blue',
      permissions: 'Accès complet dossiers, gestion administrative, paie',
      responsibilities: 'Recrutement, onboarding, contrats, conformité légale',
    },
    {
      name: 'Direction',
      icon: '🎯',
      color: 'purple',
      permissions: 'Vue globale effectifs, analytics, décisions stratégiques',
      responsibilities: 'Budget RH, politique salariale, plans succession',
    },
    {
      name: 'Employé',
      icon: '👤',
      color: 'slate',
      permissions: 'Consultation dossier personnel, demandes, formation',
      responsibilities: 'Mise à jour infos, respect process, développement',
    },
  ];

  const spofConcept = {
    title: 'SPOF (Single Point of Failure)',
    description: 'Employé détenant une compétence critique unique, créant un risque opérationnel si absent.',
    risks: [
      'Blocage total d\'une activité en cas d\'absence',
      'Dépendance excessive sur une personne',
      'Risque business élevé',
      'Difficulté de continuité',
    ],
    solutions: [
      'Documentation des processus critiques',
      'Formation de backup/shadowing',
      'Transfert progressif de compétences',
      'Recrutement ou mobilité interne',
    ],
  };

  return (
    <div className="space-y-8">
      {/* Rôles */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">👥 Rôles dans le système</h3>
        <p className="text-sm text-slate-400 mb-4">Quatre niveaux d\'accès avec permissions et responsabilités.</p>

        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{role.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 mb-1">{role.name}</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Permissions:</span>
                      <span className="text-slate-400 ml-2">{role.permissions}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Responsabilités:</span>
                      <span className="text-slate-400 ml-2">{role.responsibilities}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPOF Concept */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">🛡️ Concept SPOF</h3>
        <p className="text-sm text-slate-400 mb-4">{spofConcept.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risques */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <h4 className="text-sm font-semibold text-red-400 mb-2">⚠️ Risques</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {spofConcept.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <h4 className="text-sm font-semibold text-teal-400 mb-2">✅ Solutions</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {spofConcept.solutions.map((solution, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
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
      question: 'Comment ajouter un nouvel employé ?',
      answer:
        'Utilisez le bouton "Nouveau" dans le dashboard ou Ctrl+N. Remplissez le formulaire d\'onboarding avec les informations essentielles (identité, poste, contrat, bureau). Le système créera automatiquement les accès et le dossier RH.',
    },
    {
      question: 'Comment gérer les évaluations annuelles ?',
      answer:
        'Allez dans "Évaluations" pour voir les employés à évaluer. Pour chaque employé, remplissez la grille d\'évaluation (objectifs atteints, compétences, points forts/amélioration), fixez les nouveaux objectifs et planifiez l\'entretien de restitution.',
    },
    {
      question: 'Qu\'est-ce qu\'un employé SPOF ?',
      answer:
        'SPOF = Single Point of Failure. C\'est un employé détenant une compétence critique unique dans l\'organisation. Si absent, cela bloque une activité importante. Le système les identifie automatiquement pour que vous puissiez mettre en place des plans de backup.',
    },
    {
      question: 'Comment suivre les compétences ?',
      answer:
        'Chaque employé a une matrice de compétences dans son dossier. Vous pouvez ajouter/mettre à jour les compétences, leur niveau (débutant à expert), et les certifications. Le système génère des analytics sur les compétences disponibles dans l\'organisation.',
    },
    {
      question: 'Comment identifier les employés à risque ?',
      answer:
        'Le système marque automatiquement les employés "à risque" selon plusieurs critères : performance en baisse, absences fréquentes, retards récurrents, conflits, démotivation signalée. Consultez "À Risque" pour la liste et prenez des actions correctives.',
    },
    {
      question: 'Puis-je exporter les données RH ?',
      answer:
        'Oui ! Utilisez le bouton "Exporter" (Ctrl+E) pour générer des rapports en Excel, CSV ou PDF. Vous pouvez exporter l\'effectif complet, un département, ou des données spécifiques (compétences, évaluations, présences, etc.).',
    },
    {
      question: 'Comment gérer les départs ?',
      answer:
        'Dans le dossier de l\'employé, utilisez "Gérer le départ". Choisissez le type (démission, licenciement, fin contrat), la date, remplissez l\'entretien de sortie si applicable. Le système guide le processus : récupération accès, solde de tout compte, archivage.',
    },
    {
      question: 'Les managers peuvent-ils voir tous les dossiers ?',
      answer:
        'Non, par défaut un manager ne voit que son équipe directe. Seuls les RH et la Direction ont accès à tous les dossiers. Cependant, vous pouvez configurer des permissions spéciales pour des managers seniors ayant plusieurs équipes sous leur responsabilité.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">❓ Questions fréquentes</h3>
        <p className="text-sm text-slate-400">Réponses aux questions les plus courantes sur la gestion des employés.</p>
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
                className={`text-teal-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
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

