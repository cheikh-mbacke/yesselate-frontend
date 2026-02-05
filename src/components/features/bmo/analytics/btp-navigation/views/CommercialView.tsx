/**
 * Vue Commercial
 * Vue principale pour le domaine Gestion Commerciale et Appels d'Offres
 */

'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface CommercialViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function CommercialView({ domainId, moduleId, subModuleId }: CommercialViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={FileText}
    />
  );
}

