import { NextRequest, NextResponse } from 'next/server';
import { analyticsBTPArchitecture } from '@/lib/config/analyticsBTPArchitecture';
import { getKPIsForContext, getAlertsForContext } from '@/lib/config/analyticsDisplayLogic';

/**
 * POST /api/analytics/search
 * Recherche globale dans les analytics BTP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchTerm = query.toLowerCase().trim();
    const results: Array<{
      id: string;
      label: string;
      type: 'domain' | 'module' | 'submodule' | 'kpi' | 'alert';
      domainId?: string;
      moduleId?: string;
      description?: string;
      score?: number;
    }> = [];

    // Rechercher dans les domaines
    analyticsBTPArchitecture.forEach((domain) => {
      if (domain.label.toLowerCase().includes(searchTerm) ||
          domain.id.toLowerCase().includes(searchTerm)) {
        results.push({
          id: domain.id,
          label: domain.label,
          type: 'domain',
          domainId: domain.id,
          description: domain.description,
          score: 100,
        });
      }

      // Rechercher dans les modules
      domain.modules.forEach((module) => {
        if (module.label.toLowerCase().includes(searchTerm) ||
            module.id.toLowerCase().includes(searchTerm)) {
          results.push({
            id: module.id,
            label: module.label,
            type: 'module',
            domainId: domain.id,
            moduleId: module.id,
            description: module.description,
            score: 80,
          });
        }

        // Rechercher dans les sous-modules
        module.subModules.forEach((subModule) => {
          if (subModule.label.toLowerCase().includes(searchTerm) ||
              subModule.id.toLowerCase().includes(searchTerm)) {
            results.push({
              id: subModule.id,
              label: subModule.label,
              type: 'submodule',
              domainId: domain.id,
              moduleId: module.id,
              description: subModule.description,
              score: 60,
            });
          }
        });
      });
    });

    // Rechercher dans les KPIs (pour tous les domaines)
    analyticsBTPArchitecture.forEach((domain) => {
      const kpis = getKPIsForContext(domain.id);
      kpis.forEach((kpi) => {
        if (kpi.label.toLowerCase().includes(searchTerm) ||
            kpi.id.toLowerCase().includes(searchTerm)) {
          results.push({
            id: kpi.id,
            label: kpi.label,
            type: 'kpi',
            domainId: domain.id,
            description: `KPI: ${kpi.label}`,
            score: 70,
          });
        }
      });
    });

    // Rechercher dans les alertes
    analyticsBTPArchitecture.forEach((domain) => {
      const alerts = getAlertsForContext(domain.id);
      alerts.forEach((alert) => {
        if (alert.category.toLowerCase().includes(searchTerm)) {
          results.push({
            id: alert.id,
            label: `Alerte ${alert.category}`,
            type: 'alert',
            domainId: domain.id,
            description: `Alerte de type ${alert.type}`,
            score: 50,
          });
        }
      });
    });

    // Trier par score et limiter
    const sortedResults = results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return NextResponse.json({
      results: sortedResults,
      query,
      total: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

