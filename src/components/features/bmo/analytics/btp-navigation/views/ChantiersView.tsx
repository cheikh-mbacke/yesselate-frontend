/**
 * Vue Chantiers
 * Vue principale pour le domaine Gestion de Chantiers
 */

'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface ChantiersViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function ChantiersView({ domainId, moduleId, subModuleId }: ChantiersViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Building2}
    />
  );
}

