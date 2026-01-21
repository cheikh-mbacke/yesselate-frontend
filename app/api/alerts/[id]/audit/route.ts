import { NextRequest, NextResponse } from 'next/server';
import type { AuditEntry } from '@/lib/api/pilotage/auditTrailClient';

/**
 * GET /api/alerts/[id]/audit
 * Récupérer l'audit trail d'une alerte spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const actions = searchParams.get('actions')?.split(',');

    // Générer des entrées d'audit mockées
    const mockEntries: AuditEntry[] = [
      {
        id: `audit-${id}-1`,
        alertId: id,
        action: 'created',
        actor: {
          id: 'user-001',
          name: 'Jean Dupont',
          email: 'jean.dupont@yesselate.com',
          role: 'manager',
        },
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        metadata: {
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0',
        },
      },
      {
        id: `audit-${id}-2`,
        alertId: id,
        action: 'viewed',
        actor: {
          id: 'user-002',
          name: 'Marie Martin',
          email: 'marie.martin@yesselate.com',
          role: 'operator',
        },
        timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
        metadata: {
          ip: '192.168.1.101',
          userAgent: 'Firefox/119.0',
        },
      },
      {
        id: `audit-${id}-3`,
        alertId: id,
        action: 'acknowledged',
        actor: {
          id: 'user-001',
          name: 'Jean Dupont',
          email: 'jean.dupont@yesselate.com',
          role: 'manager',
        },
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        changes: {
          status: { from: 'open', to: 'acknowledged' },
        },
        metadata: {
          note: 'Prise en charge du dossier',
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0',
          duration: 1800000, // 30 minutes
        },
      },
      {
        id: `audit-${id}-4`,
        alertId: id,
        action: 'commented',
        actor: {
          id: 'user-003',
          name: 'Pierre Dubois',
          email: 'pierre.dubois@yesselate.com',
          role: 'admin',
        },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        metadata: {
          note: 'En attente de validation du paiement',
          ip: '192.168.1.102',
        },
      },
      {
        id: `audit-${id}-5`,
        alertId: id,
        action: 'resolved',
        actor: {
          id: 'user-001',
          name: 'Jean Dupont',
          email: 'jean.dupont@yesselate.com',
          role: 'manager',
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        changes: {
          status: { from: 'acknowledged', to: 'resolved' },
        },
        metadata: {
          note: 'Paiement validé et traité',
          ip: '192.168.1.100',
          userAgent: 'Chrome/120.0',
          duration: 3600000, // 1 heure
        },
      },
    ];

    // Filtrer par actions si spécifié
    let filteredEntries = mockEntries;
    if (actions && actions.length > 0) {
      filteredEntries = mockEntries.filter((e) => actions.includes(e.action));
    }

    // Pagination
    const total = filteredEntries.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    return NextResponse.json({
      entries: paginatedEntries,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    });
  } catch (error) {
    console.error('Error fetching alert audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

