/**
 * Vue Matériel
 * Vue principale pour le domaine Gestion du Matériel et Équipements
 */

'use client';

import React from 'react';
import { Wrench } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface MaterielViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function MaterielView({ domainId, moduleId, subModuleId }: MaterielViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Wrench}
    />
  );
}

