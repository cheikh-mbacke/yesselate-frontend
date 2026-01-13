/**
 * Vue Planification
 * Vue principale pour le domaine Planification et Ordonnancement
 */

'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface PlanificationViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function PlanificationView({ domainId, moduleId, subModuleId }: PlanificationViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={Calendar}
    />
  );
}

