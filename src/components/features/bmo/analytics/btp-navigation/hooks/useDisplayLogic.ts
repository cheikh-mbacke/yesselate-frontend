/**
 * Hook pour gérer la logique d'affichage selon le contexte de navigation
 */

import { useMemo } from 'react';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import {
  getDisplayLogicForDomain,
  getDisplayLogicForModule,
  getKPIsForContext,
  getAlertsForContext,
  getActionsForContext,
  type DisplayLogic,
  type KPIDefinition,
  type AlertDefinition,
  type ActionDefinition,
} from '@/lib/config/analyticsDisplayLogic';

export function useDisplayLogic(userPermissions?: string[]) {
  const { navigation } = useAnalyticsBTPNavigationStore();
  const { domainId, moduleId, subModuleId } = navigation;

  const displayLogic = useMemo<DisplayLogic | null>(() => {
    if (!domainId) return null;
    if (moduleId) {
      return getDisplayLogicForModule(domainId, moduleId);
    }
    return getDisplayLogicForDomain(domainId);
  }, [domainId, moduleId]);

  const kpis = useMemo<KPIDefinition[]>(() => {
    return getKPIsForContext(domainId || '', moduleId || undefined, subModuleId || undefined);
  }, [domainId, moduleId, subModuleId]);

  const alerts = useMemo<AlertDefinition[]>(() => {
    return getAlertsForContext(domainId || '', moduleId || undefined, subModuleId || undefined);
  }, [domainId, moduleId, subModuleId]);

  const actions = useMemo<ActionDefinition[]>(() => {
    return getActionsForContext(
      domainId || '',
      moduleId || undefined,
      subModuleId || undefined,
      userPermissions
    );
  }, [domainId, moduleId, subModuleId, userPermissions]);

  return {
    displayLogic,
    kpis,
    alerts,
    actions,
    hasData: !!displayLogic,
  };
}

