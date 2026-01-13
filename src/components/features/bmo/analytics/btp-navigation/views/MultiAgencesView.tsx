/**
 * Vue Multi-Agences
 * Vue principale pour le domaine Gestion Multi-Agences
 */

'use client';

import React from 'react';
import { Network } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface MultiAgencesViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function MultiAgencesView({ domainId, moduleId, subModuleId }: MultiAgencesViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Network}
    />
  );
}

