/**
 * Vue Sous-traitants
 * Vue principale pour le domaine Gestion des Sous-traitants
 */

'use client';

import React from 'react';
import { HardHat } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface SousTraitantsViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function SousTraitantsView({ domainId, moduleId, subModuleId }: SousTraitantsViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={HardHat}
    />
  );
}

