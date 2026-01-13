/**
 * Vue Ressources Humaines
 * Vue principale pour le domaine Gestion des Ressources Humaines
 */

'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface RHViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function RHView({ domainId, moduleId, subModuleId }: RHViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Users}
    />
  );
}

