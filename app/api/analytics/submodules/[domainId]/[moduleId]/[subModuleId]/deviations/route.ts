import { NextRequest, NextResponse } from 'next/server';
import { getAlertsForContext } from '@/lib/config/analyticsDisplayLogic';

/**
 * GET /api/analytics/submodules/[domainId]/[moduleId]/[subModuleId]/deviations
 * Récupère les dérives détectées pour un sous-module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string; moduleId: string; subModuleId: string } }
) {
  try {
    const { domainId, moduleId, subModuleId } = params;

    if (!domainId || !moduleId || !subModuleId) {
      return NextResponse.json(
        { error: 'Domain ID, Module ID and Sub-module ID are required' },
        { status: 400 }
      );
    }

    // Récupérer les alertes qui correspondent aux dérives
    const alerts = getAlertsForContext(domainId, moduleId, subModuleId);
    
    // Transformer les alertes en dérives
    // TODO: Remplacer par un appel à la base de données pour les vraies dérives
    const deviations = alerts
      .filter((alert) => alert.type === 'critical' || alert.type === 'warning')
      .map((alert) => ({
        id: alert.id,
        type: alert.category === 'budget' ? 'budget' : 
              alert.category === 'delay' ? 'delai' : 
              alert.category,
        description: `Dérive détectée: ${alert.category}`,
        impact: alert.type === 'critical' ? 'Élevé' : 'Moyen',
        recommendation: 'Analyser les causes et prendre des mesures correctives',
        detectedAt: new Date().toISOString(),
      }));

    return NextResponse.json({
      deviations,
      domainId,
      moduleId,
      subModuleId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching submodule deviations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

