/**
 * ContentRouter pour Missions
 * Route le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Compass, Loader2, AlertTriangle } from 'lucide-react';
import { MissionsWorkspaceContent } from '@/components/features/bmo/workspace/missions/MissionsWorkspaceContent';

interface MissionsContentRouterProps {
  category: string;
  subCategory: string | null;
}

export function MissionsContentRouter({ category, subCategory }: MissionsContentRouterProps) {
  // Pour l'instant, on utilise le contenu workspace existant
  // TODO: Créer des vues spécifiques par catégorie si nécessaire
  return (
    <div className="p-4">
      <MissionsWorkspaceContent />
    </div>
  );
}
