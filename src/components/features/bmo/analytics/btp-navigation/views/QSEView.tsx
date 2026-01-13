/**
 * Vue QSE
 * Vue principale pour le domaine Qualité, Sécurité, Environnement
 */

'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface QSEViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function QSEView({ domainId, moduleId, subModuleId }: QSEViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Shield}
    />
  );
}

