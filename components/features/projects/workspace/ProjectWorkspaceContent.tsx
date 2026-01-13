'use client';

import React from 'react';
import { useProjectWorkspaceStore } from '@/lib/stores/projectWorkspaceStore';

export function ProjectWorkspaceContent() {
  const { tabs, activeTabId } = useProjectWorkspaceStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return null;

  // Rendu selon le type d'onglet
  switch (activeTab.type) {
    case 'inbox':
      return <ProjectInboxView queue={activeTab.data?.queue as string} />;
    
    case 'project':
      return <ProjectDetailView projectId={activeTab.data?.projectId as string} />;
    
    case 'wizard':
      return <ProjectWizardView action={activeTab.data?.action as string} />;
    
    case 'analytics':
      return <ProjectAnalyticsView />;
    
    case 'search':
      return <ProjectSearchView />;
    
    default:
      return (
        <div className="p-8 text-center text-slate-500">
          Type d'onglet inconnu: {activeTab.type}
        </div>
      );
  }
}

// Composants placeholder pour chaque type de vue
function ProjectInboxView({ queue }: { queue: string }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">File : {queue}</h2>
      <p className="text-slate-500">Liste des projets dans cette file...</p>
    </div>
  );
}

function ProjectDetailView({ projectId }: { projectId: string }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Projet : {projectId}</h2>
      <p className="text-slate-500">Détails du projet...</p>
    </div>
  );
}

function ProjectWizardView({ action }: { action: string }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Assistant : {action}</h2>
      <p className="text-slate-500">Formulaire d'action sur le projet...</p>
    </div>
  );
}

function ProjectAnalyticsView() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Analytics</h2>
      <p className="text-slate-500">Statistiques et analyses du portefeuille...</p>
    </div>
  );
}

function ProjectSearchView() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recherche avancée</h2>
      <p className="text-slate-500">Recherche et filtres...</p>
    </div>
  );
}

