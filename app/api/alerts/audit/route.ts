import { NextRequest, NextResponse } from 'next/server';
import type { AuditEntry, AuditStats } from '@/lib/api/pilotage/auditTrailClient';

/**
 * GET /api/alerts/audit
 * Récupérer l'audit trail global (toutes les alertes)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const alertId = searchParams.get('alertId');
    const actorId = searchParams.get('actorId');
    const actions = searchParams.get('actions')?.split(',');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Générer des entrées d'audit mockées globales
    const mockEntries: AuditEntry[] = [];
    
    for (let i = 0; i < 100; i++) {
      const alertIdGen = alertId || `alert-${Math.floor(Math.random() * 50) + 1}`;
      const actorIdGen = actorId || `user-${Math.floor(Math.random() * 5) + 1}`;
      const actionTypes: AuditEntry['action'][] = [
        'created', 'viewed', 'acknowledged', 'resolved', 'escalated',
        'assigned', 'updated', 'commented', 'exported',
      ];
      const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      
      mockEntries.push({
        id: `audit-global-${i}`,
        alertId: alertIdGen,
        action,
        actor: {
          id: actorIdGen,
          name: `User ${actorIdGen}`,
          email: `user${actorIdGen}@yesselate.com`,
          role: 'manager',
        },
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        changes: action === 'updated' ? {
          status: { from: 'open', to: 'acknowledged' },
        } : undefined,
        metadata: {
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Chrome/120.0',
        },
      });
    }

    // Filtres
    let filteredEntries = mockEntries;
    
    if (alertId) {
      filteredEntries = filteredEntries.filter((e) => e.alertId === alertId);
    }
    
    if (actorId) {
      filteredEntries = filteredEntries.filter((e) => e.actor.id === actorId);
    }
    
    if (actions && actions.length > 0) {
      filteredEntries = filteredEntries.filter((e) => actions.includes(e.action));
    }
    
    if (startDate) {
      filteredEntries = filteredEntries.filter(
        (e) => new Date(e.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredEntries = filteredEntries.filter(
        (e) => new Date(e.timestamp) <= new Date(endDate)
      );
    }

    // Tri par date décroissante
    filteredEntries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

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
    console.error('Error fetching global audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

