export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bmo/blocked/stats
 * Statistiques temps réel des dossiers bloqués
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureauCode = searchParams.get('bureau');
    
    const where: any = {};
    if (bureauCode) {
      where.bureauCode = bureauCode;
    }
    
    // Exclure les dossiers résolus ou annulés pour les stats actives
    const activeWhere = { ...where, status: { in: ['pending', 'escalated'] } };
    
    // Compteurs par impact
    const [
      total,
      critical,
      high,
      medium,
      low,
      pending,
      escalated,
      resolved,
    ] = await Promise.all([
      prisma.blockedDossier.count({ where: activeWhere }),
      prisma.blockedDossier.count({ where: { ...activeWhere, impact: 'critical' } }),
      prisma.blockedDossier.count({ where: { ...activeWhere, impact: 'high' } }),
      prisma.blockedDossier.count({ where: { ...activeWhere, impact: 'medium' } }),
      prisma.blockedDossier.count({ where: { ...activeWhere, impact: 'low' } }),
      prisma.blockedDossier.count({ where: { ...where, status: 'pending' } }),
      prisma.blockedDossier.count({ where: { ...where, status: 'escalated' } }),
      prisma.blockedDossier.count({ where: { ...where, status: 'resolved' } }),
    ]);
    
    // Moyennes (sur dossiers actifs uniquement)
    const aggregates = await prisma.blockedDossier.aggregate({
      where: activeWhere,
      _avg: {
        delay: true,
        priority: true,
        amount: true,
      },
      _sum: {
        amount: true,
      },
      _max: {
        delay: true,
        priority: true,
      },
    });
    
    // Overdue SLA (delay > slaTarget ou slaBreached = 1)
    const overdueSLA = await prisma.blockedDossier.count({
      where: {
        ...activeWhere,
        slaBreached: 1,
      },
    });
    
    // Résolus aujourd'hui
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const resolvedToday = await prisma.blockedDossier.count({
      where: {
        status: 'resolved',
        resolvedAt: { gte: todayStart },
      },
    });
    
    // Escaladés aujourd'hui
    const escalatedToday = await prisma.blockedDossier.count({
      where: {
        escalatedAt: { gte: todayStart },
      },
    });
    
    // Par bureau (top 10)
    const byBureauRaw = await prisma.blockedDossier.groupBy({
      by: ['bureauCode'],
      where: activeWhere,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });
    
    // Pour chaque bureau, compter les critiques
    const byBureau = await Promise.all(
      byBureauRaw.map(async (b) => {
        const criticalCount = await prisma.blockedDossier.count({
          where: {
            ...activeWhere,
            bureauCode: b.bureauCode,
            impact: 'critical',
          },
        });
        
        return {
          bureau: b.bureauCode,
          count: b._count.id,
          critical: criticalCount,
        };
      })
    );
    
    // Par type (top 10)
    const byTypeRaw = await prisma.blockedDossier.groupBy({
      by: ['type'],
      where: activeWhere,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });
    
    const byType = byTypeRaw.map(t => ({
      type: t.type,
      count: t._count.id,
    }));
    
    // Dossiers urgents (isUrgent = 1 ou delay > 10)
    const urgent = await prisma.blockedDossier.count({
      where: {
        ...activeWhere,
        OR: [
          { isUrgent: 1 },
          { delay: { gt: 10 } },
        ],
      },
    });
    
    // Top 5 dossiers par priorité
    const topPriority = await prisma.blockedDossier.findMany({
      where: activeWhere,
      orderBy: {
        priority: 'desc',
      },
      take: 5,
      select: {
        id: true,
        refNumber: true,
        subject: true,
        impact: true,
        priority: true,
        delay: true,
        bureauCode: true,
      },
    });
    
    const stats = {
      total,
      critical,
      high,
      medium,
      low,
      pending,
      escalated,
      resolved,
      avgDelay: Math.round(aggregates._avg.delay || 0),
      maxDelay: aggregates._max.delay || 0,
      avgPriority: Math.round((aggregates._avg.priority || 0) * 100) / 100,
      maxPriority: Math.round((aggregates._max.priority || 0) * 100) / 100,
      totalAmount: aggregates._sum.amount || 0,
      avgAmount: Math.round(aggregates._avg.amount || 0),
      overdueSLA,
      resolvedToday,
      escalatedToday,
      urgent,
      byBureau,
      byType,
      topPriority,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching blocked stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked stats', details: String(error) },
      { status: 500 }
    );
  }
}

