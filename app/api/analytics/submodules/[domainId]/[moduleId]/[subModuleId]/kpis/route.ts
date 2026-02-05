import { NextRequest, NextResponse } from 'next/server';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';
import { getKPIsForContext } from '@/lib/config/analyticsDisplayLogic';

/**
 * GET /api/analytics/submodules/[domainId]/[moduleId]/[subModuleId]/kpis
 * Récupère les KPIs d'un sous-module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domainId: string; moduleId: string; subModuleId: string }> }
) {
  try {
    const { domainId, moduleId, subModuleId } = await params;

    if (!domainId || !moduleId || !subModuleId) {
      return NextResponse.json(
        { error: 'Domain ID, Module ID and Sub-module ID are required' },
        { status: 400 }
      );
    }

    // Récupérer les définitions de KPIs
    const kpiDefinitions = getKPIsForContext(domainId, moduleId, subModuleId);
    
    // Pour l'instant, utiliser les données mockées
    // TODO: Remplacer par un appel à la base de données
    const mockData = getMockDataForDomain(domainId);
    const summary = mockData?.summary || {};

    // Mapper les KPIs avec leurs valeurs
    const kpis = kpiDefinitions.map((kpi) => {
      const kpiData = summary.kpis?.[kpi.id] || {};
      return {
        ...kpi,
        value: kpiData.value || 0,
        target: kpi.target || kpiData.target,
        unit: kpi.unit || kpiData.unit,
        status: kpiData.status || 'info',
        trend: kpiData.trend,
      };
    });

    return NextResponse.json({
      kpis,
      domainId,
      moduleId,
      subModuleId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching submodule KPIs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

