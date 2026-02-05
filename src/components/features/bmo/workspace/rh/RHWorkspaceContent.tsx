'use client';

import { useRHWorkspaceStore } from '@/lib/stores/rhWorkspaceStore';
import { RHInboxView } from './views/RHInboxView';
import { DemandeRHView } from './views/DemandeRHView';
import { Inbox, FileText, Clock, AlertTriangle, CheckCircle2, HeartPulse, Plane, Wallet } from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'pending', label: 'À traiter', icon: Inbox, color: 'text-amber-500', queue: 'pending' },
  { id: 'urgent', label: 'Urgences', icon: AlertTriangle, color: 'text-rose-500', queue: 'urgent' },
  { id: 'conges', label: 'Congés', icon: HeartPulse, color: 'text-emerald-500', queue: 'Congé' },
  { id: 'depenses', label: 'Dépenses', icon: Wallet, color: 'text-amber-500', queue: 'Dépense' },
  { id: 'deplacements', label: 'Déplacements', icon: Plane, color: 'text-blue-500', queue: 'Déplacement' },
  { id: 'validated', label: 'Validées', icon: CheckCircle2, color: 'text-emerald-500', queue: 'validated' },
];

export function RHWorkspaceContent() {
  const { tabs, activeTabId, openTab } = useRHWorkspaceStore();
  const tab = tabs.find(t => t.id === activeTabId);

  if (!tab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Console Demandes RH</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Gérez les congés, dépenses, déplacements et avances. Traçabilité complète pour audit.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const icons: Record<string, string> = {
                pending: '⏳',
                urgent: '🚨',
                conges: '🏖️',
                depenses: '💸',
                deplacements: '✈️',
                validated: '✅',
              };
              return (
                <button
                  key={action.id}
                  onClick={() => openTab({
                    type: 'inbox',
                    id: `inbox:${action.queue}`,
                    title: action.label,
                    icon: icons[action.id] ?? '📄',
                    data: { queue: action.queue },
                  })}
                  className="p-4 rounded-xl border border-slate-200/70 bg-white/50 
                             hover:bg-slate-50 hover:border-slate-300 transition-all
                             dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60
                             group"
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              💡 Astuce : Utilisez <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">⌘K</kbd> pour rechercher rapidement une demande.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tab.type === 'inbox') return <RHInboxView tab={tab} />;
  if (tab.type === 'demande-rh') return <DemandeRHView tab={tab} />;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="text-center text-slate-500">
        Vue non supportée : {tab.type}
      </div>
    </div>
  );
}

