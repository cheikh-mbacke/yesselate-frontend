/**
 * Vue Performance
 * Vue principale pour le domaine Performance Opérationnelle
 */

'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';

interface PerformanceViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function PerformanceView({ domainId, moduleId, subModuleId }: PerformanceViewProps) {
  return (
    <BaseDomainView
      domainId={domainId}
      moduleId={moduleId}
      subModuleId={subModuleId}
      icon={TrendingUp}
    />
  );
}

