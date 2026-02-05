/**
 * Vue Financier
 * Vue principale pour le domaine Gestion Financière
 */

'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface FinancierViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function FinancierView({ domainId, moduleId, subModuleId }: FinancierViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={DollarSign}
    />
  );
}

