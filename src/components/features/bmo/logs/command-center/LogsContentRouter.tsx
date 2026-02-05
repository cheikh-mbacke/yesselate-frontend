/**
 * ContentRouter pour Logs
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { Terminal, AlertCircle, AlertTriangle, Server, Globe, Shield, FileText, User, BarChart3 } from 'lucide-react';
import { LogsWorkspaceContent } from '@/components/features/bmo/workspace/logs/LogsWorkspaceContent';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';

interface LogsContentRouterProps {
  category: string;
  subCategory: string;
}

export const LogsContentRouter = React.memo(function LogsContentRouter({
  category,
  subCategory,
}: LogsContentRouterProps) {
  // Pour l'instant, on utilise le contenu workspace existant
  // TODO: Créer des vues spécifiques par catégorie
  
  return (
    <div className="h-full p-6">
      <LogsWorkspaceContent />
    </div>
  );
});

