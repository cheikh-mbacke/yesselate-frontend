'use client';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useParametresWorkspaceStore } from '@/lib/stores/parametresWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import { ParametresWorkspaceTabs, ParametresWorkspaceContent, ParametresCommandPalette } from '@/components/features/bmo/workspace/parametres';
import { Settings, Search, Save, Keyboard, Maximize, Minimize, Shield, Bell, Plug, Users, Database } from 'lucide-react';

export default function ParametresPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen } = useParametresWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [fullscreen, setFullscreen] = useState(false);

  const handleSave = useCallback(() => { addToast('Paramètres sauvegardés', 'success'); addActionLog({ userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, action: 'update', module: 'parametres', targetId: 'SETTINGS', targetType: 'system', targetLabel: 'Paramètres', details: 'Sauvegarde des paramètres', bureau: 'BMO' }); }, [addToast, addActionLog, currentUser]);

  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); } if (e.key === 'Escape' && commandPaletteOpen) setCommandPaletteOpen(false); if (e.key === 's' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSave(); } if (e.key === 'F11') { e.preventDefault(); setFullscreen(f => !f); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [commandPaletteOpen, setCommandPaletteOpen, handleSave]);

  const quickNav = [
    { type: 'general' as const, icon: Settings, label: 'Général', color: 'teal' },
    { type: 'security' as const, icon: Shield, label: 'Sécurité', color: 'red' },
    { type: 'notifications' as const, icon: Bell, label: 'Notifications', color: 'amber' },
    { type: 'integrations' as const, icon: Plug, label: 'Intégrations', color: 'blue' },
    { type: 'permissions' as const, icon: Users, label: 'Permissions', color: 'indigo' },
    { type: 'backup' as const, icon: Database, label: 'Sauvegardes', color: 'emerald' },
  ];

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50/20 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-teal-950/10", fullscreen && "fixed inset-0 z-50")}>
      <header className="flex-none border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25"><Settings className="w-5 h-5 text-white" /></div>
              <div><h1 className="text-xl font-bold">Paramètres</h1><p className="text-sm text-slate-500">Configuration du système</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 hover:border-teal-500/50 transition-colors"><Search className="w-4 h-4" /><span className="hidden md:inline">Rechercher...</span><kbd className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">⌘K</kbd></button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"><Save className="w-4 h-4" /><span className="hidden md:inline">Sauvegarder</span></button>
              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">{fullscreen ? <Minimize className="w-4 h-4 text-slate-500" /> : <Maximize className="w-4 h-4 text-slate-500" />}</button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-2"><ParametresWorkspaceTabs /></div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex">
          <aside className="w-64 flex-none p-4 border-r border-slate-200/70 dark:border-slate-800 hidden lg:block">
            <nav className="space-y-1">{quickNav.map(item => { const Icon = item.icon; return <button key={item.type} onClick={() => openTab({ type: item.type, id: item.type, title: item.label, icon: '⚙️', data: {}, closable: item.type !== 'general' })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Icon className={cn("w-5 h-5", item.color === 'teal' ? 'text-teal-500' : item.color === 'red' ? 'text-red-500' : item.color === 'amber' ? 'text-amber-500' : item.color === 'blue' ? 'text-blue-500' : item.color === 'indigo' ? 'text-indigo-500' : 'text-emerald-500')} /><span className="font-medium">{item.label}</span></button>; })}</nav>
          </aside>
          <div className="flex-1 p-6"><ParametresWorkspaceContent /></div>
        </div>
      </main>
      <ParametresCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSave={handleSave} />
    </div>
  );
}
