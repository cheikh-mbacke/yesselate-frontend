import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/search
 * 
 * Recherche globale dans tous les modules
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const modules = searchParams.get('modules')?.split(',') || ['all'];
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query trop courte (minimum 2 caractères)' },
        { status: 400 }
      );
    }

    // Simuler une recherche dans différents modules
    const results = {
      calendar: modules.includes('all') || modules.includes('calendar') ? [
        {
          id: 'evt-1',
          type: 'calendar_event',
          title: 'Réunion Direction Générale',
          description: 'Présentation des résultats Q4 2025',
          match: 'title',
          relevance: 0.95,
          url: '/maitre-ouvrage/calendrier?event=evt-1',
          metadata: {
            date: '2026-01-15T09:00:00Z',
            priority: 'urgent',
            status: 'pending',
          },
        },
      ] : [],
      delegations: modules.includes('all') || modules.includes('delegations') ? [
        {
          id: 'del-1',
          type: 'delegation',
          title: 'DEL-2024-001 - Approbation paiements',
          description: 'Délégation de pouvoir pour approbations',
          match: 'title',
          relevance: 0.88,
          url: '/maitre-ouvrage/delegations?id=del-1',
          metadata: {
            status: 'active',
            bureau: 'BTP',
            expiresAt: '2026-02-01',
          },
        },
      ] : [],
      analytics: modules.includes('all') || modules.includes('analytics') ? [
        {
          id: 'kpi-1',
          type: 'kpi',
          title: 'Taux de validation',
          description: 'Pourcentage de demandes validées',
          match: 'title',
          relevance: 0.82,
          url: '/maitre-ouvrage/analytics?kpi=kpi-1',
          metadata: {
            value: 85,
            unit: '%',
            status: 'warning',
          },
        },
      ] : [],
      demandes: modules.includes('all') || modules.includes('demandes') ? [
        {
          id: 'dem-1',
          type: 'demande_rh',
          title: 'DEM-2024-001 - Congé annuel',
          description: 'Demande de congé annuel de 15 jours',
          match: 'title',
          relevance: 0.75,
          url: '/maitre-ouvrage/demandes?id=dem-1',
          metadata: {
            status: 'pending',
            requestor: 'Jean Dupont',
            createdAt: '2026-01-05',
          },
        },
      ] : [],
    };

    // Fusionner et trier les résultats par pertinence
    const allResults = [
      ...results.calendar,
      ...results.delegations,
      ...results.analytics,
      ...results.demandes,
    ].sort((a, b) => b.relevance - a.relevance).slice(0, limit);

    return NextResponse.json({
      query,
      results: allResults,
      total: allResults.length,
      summary: {
        calendar: results.calendar.length,
        delegations: results.delegations.length,
        analytics: results.analytics.length,
        demandes: results.demandes.length,
      },
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/search:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la recherche' },
      { status: 500 }
    );
  }
}

