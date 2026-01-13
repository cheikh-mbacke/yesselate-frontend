import { NextRequest, NextResponse } from 'next/server';
import type { AuditEntry } from '@/lib/api/pilotage/auditTrailClient';

/**
 * GET /api/alerts/audit/search
 * Rechercher dans l'audit trail
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        limit,
        message: 'Query too short (minimum 2 characters)',
      });
    }

    // Générer des résultats mockés
    const mockResults: AuditEntry[] = [
      {
        id: 'audit-search-1',
        alertId: 'alert-042',
        action: 'resolved',
        actor: {
          id: 'user-001',
          name: 'Jean Dupont',
          email: 'jean.dupont@yesselate.com',
          role: 'manager',
        },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        metadata: {
          note: `Résolution contenant: ${query}`,
          ip: '192.168.1.100',
        },
      },
      {
        id: 'audit-search-2',
        alertId: 'alert-089',
        action: 'commented',
        actor: {
          id: 'user-002',
          name: 'Marie Martin',
          email: 'marie.martin@yesselate.com',
          role: 'operator',
        },
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        metadata: {
          note: `Commentaire mentionnant: ${query}`,
          ip: '192.168.1.101',
        },
      },
    ];

    // Filtrer les résultats par pertinence
    const searchLower = query.toLowerCase();
    const filteredResults = mockResults.filter((entry) => {
      const noteMatch = entry.metadata?.note?.toLowerCase().includes(searchLower);
      const actorMatch = entry.actor.name.toLowerCase().includes(searchLower);
      const alertMatch = entry.alertId.toLowerCase().includes(searchLower);
      
      return noteMatch || actorMatch || alertMatch;
    });

    // Pagination
    const total = filteredResults.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return NextResponse.json({
      results: paginatedResults,
      total,
      page,
      limit,
      hasMore: endIndex < total,
      query,
    });
  } catch (error) {
    console.error('Error searching audit:', error);
    return NextResponse.json(
      { error: 'Failed to search audit', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

