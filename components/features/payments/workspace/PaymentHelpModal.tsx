'use client';

import React from 'react';
import { X, Keyboard, Zap, Search, BarChart2, Download, Target, HelpCircle } from 'lucide-react';

export function PaymentHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      icon: <Search className="w-4 h-4 text-blue-500" />,
      items: [
        { keys: ['⌘', 'K'], description: 'Ouvrir Command Palette' },
        { keys: ['Ctrl', '1'], description: 'Paiements à 7 jours' },
        { keys: ['Ctrl', '2'], description: 'Paiements en retard' },
        { keys: ['Ctrl', '3'], description: 'Paiements critiques (BF→DG)' },
        { keys: ['Ctrl', '4'], description: 'Paiements à risque' },
        { keys: ['Escape'], description: 'Fermer modal/dialogue' },
      ],
    },
    {
      category: 'Actions rapides',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      items: [
        { keys: ['⌘', 'S'], description: 'Ouvrir Statistiques' },
        { keys: ['⌘', 'D'], description: 'Centre de décision' },
        { keys: ['⌘', 'E'], description: 'Export rapide (JSON)' },
        { keys: ['Shift', '?'], description: 'Afficher cette aide' },
      ],
    },
  ];

  const tips = [
    {
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      title: 'Centre de décision',
      description: 'Accédez aux paiements critiques nécessitant une action immédiate : retards, double validation BF→DG, et paiements à risque.',
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-purple-500" />,
      title: 'Statistiques temps réel',
      description: 'Consultez les analytics détaillés : répartition par bureau, tendances, validation rate, temps moyen de traitement.',
    },
    {
      icon: <Download className="w-5 h-5 text-emerald-500" />,
      title: 'Exports audit-grade',
      description: 'Exportez vos paiements en CSV, JSON avec métadonnées RACI, ou Evidence Pack avec hash SHA-256 pour audit.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Aide & Raccourcis</h2>
              <p className="text-sm text-slate-500">Validation Paiements - Guide rapide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Raccourcis clavier */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-lg">Raccourcis clavier</h3>
            </div>
            
            <div className="space-y-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <div className="flex items-center gap-2 mb-3">
                    {section.icon}
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">{section.category}</h4>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.description}</span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, kidx) => (
                            <React.Fragment key={kidx}>
                              <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
                                {key}
                              </kbd>
                              {kidx < item.keys.length - 1 && (
                                <span className="text-xs text-slate-400">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Astuces */}
          <div>
            <h3 className="font-semibold text-lg mb-4">💡 Astuces</h3>
            <div className="space-y-3">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{tip.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Langage de requête */}
          <div>
            <h3 className="font-semibold text-lg mb-4">🔍 Langage de requête avancée</h3>
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Filtrez avec précision vos paiements :
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold w-32">Champs :</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    id:, type:, ref:, beneficiary:, project:, bureau:, status:, due:, risk:, amount:, facture:
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold w-32">Opérateurs :</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    -term (négation), "phrase exacte", || (OU)
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-semibold">Exemples :</p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p><code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800">beneficiary:"SEN-ELEC" -status:validated</code></p>
                  <p><code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800">risk:8 || due:15/02/2025</code></p>
                  <p><code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800">project:CH-02 amount:5000000</code></p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow BF→DG */}
          <div>
            <h3 className="font-semibold text-lg mb-4">🔐 Workflow double validation (BF→DG)</h3>
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                Pour les paiements ≥ 5 000 000 FCFA :
              </p>
              <ol className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 w-6">1.</span>
                  <span><strong>Bureau Finance (R - Responsible)</strong> : Validation technique et conformité.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 w-6">2.</span>
                  <span><strong>Direction Générale (A - Accountable)</strong> : Autorisation finale décisionnelle.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 w-6">✓</span>
                  <span>Chaque étape génère un hash SHA-256 traçable dans le journal append-only.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Score de risque */}
          <div>
            <h3 className="font-semibold text-lg mb-4">⚠️ Score de risque</h3>
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Calcul automatique basé sur :
              </p>
              <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <div className="flex justify-between items-center">
                  <span>Retard (échéance dépassée)</span>
                  <span className="font-semibold">+55 pts + 2×jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Échéance 0-3 jours</span>
                  <span className="font-semibold">+25 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Montant ≥ 5M FCFA</span>
                  <span className="font-semibold">+18 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Montant ≥ 20M FCFA</span>
                  <span className="font-semibold">+8 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pas de facture matchée</span>
                  <span className="font-semibold">+12 pts</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800 grid grid-cols-4 gap-2 text-xs font-semibold">
                <div className="text-center p-2 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  0-34<br/>FAIBLE
                </div>
                <div className="text-center p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  35-64<br/>MOYEN
                </div>
                <div className="text-center p-2 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  65-84<br/>ÉLEVÉ
                </div>
                <div className="text-center p-2 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  85-100<br/>CRITIQUE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500">
            Version 1.0.0 • Documentation complète : <code className="text-xs bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">docs/validation-paiements-README.md</code>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

