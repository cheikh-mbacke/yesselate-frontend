import { NextRequest, NextResponse } from 'next/server';
import type { AuditStats } from '@/lib/api/pilotage/auditTrailClient';

/**
 * GET /api/alerts/audit/stats
 * Récupérer les statistiques d'audit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const bureau = searchParams.get('bureau');

    // Calculer les stats mockées
    const stats: AuditStats = {
      totalActions: 1247,
      byAction: {
        created: 156,
        viewed: 423,
        acknowledged: 187,
        resolved: 145,
        escalated: 34,
        assigned: 98,
        reassigned: 23,
        updated: 67,
        deleted: 12,
        commented: 89,
        exported: 45,
        snoozed: 15,
        archived: 8,
        restored: 3,
        rule_triggered: 78,
        notification_sent: 234,
      },
      byActor: [
        { actorId: 'user-001', actorName: 'Jean Dupont', count: 342 },
        { actorId: 'user-002', actorName: 'Marie Martin', count: 287 },
        { actorId: 'user-003', actorName: 'Pierre Dubois', count: 234 },
        { actorId: 'user-004', actorName: 'Sophie Bernard', count: 198 },
        { actorId: 'user-005', actorName: 'Luc Lefebvre', count: 186 },
      ],
      avgResponseTime: 1800000, // 30 minutes en ms
      avgResolutionTime: 10800000, // 3 heures en ms
      mostActiveHour: 14, // 14h (2PM)
      mostActiveDay: 'mardi',
    };

    return NextResponse.json({
      stats,
      period: {
        startDate: startDate || new Date(Date.now() - 86400000 * 30).toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
      bureau: bureau || 'all',
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

