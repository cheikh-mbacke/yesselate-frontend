export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockDelegationsStats } from '@/lib/data/delegations-mock-data';

// Mode mock pour développement
const USE_MOCK_FALLBACK = process.env.NODE_ENV === 'development' || process.env.USE_DELEGATIONS_MOCK === 'true';

export async function GET() {
  // Mode mock: utiliser les mock data
  if (USE_MOCK_FALLBACK) {
    try {
      return NextResponse.json({
        ...mockDelegationsStats,
        _mock: true,
      });
    } catch (error) {
      console.error('[API] Erreur avec mock stats:', error);
      // Fallback vers Prisma
    }
  }

  const now = new Date();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Essayer Prisma avec fallback
  try {

  // Compter par statut
  const [
    total,
    active,
    expired,
    revoked,
    suspended,
    expiringSoon,
    totalUsage,
    byBureau,
    byType,
    recentActivity,
  ] = await Promise.all([
    prisma.delegation.count(),
    prisma.delegation.count({ where: { status: 'active', endsAt: { gte: now } } }),
    prisma.delegation.count({ 
      where: { 
        OR: [
          { status: 'expired' },
          { endsAt: { lt: now }, status: { notIn: ['revoked', 'suspended'] } }
        ]
      } 
    }),
    prisma.delegation.count({ where: { status: 'revoked' } }),
    prisma.delegation.count({ where: { status: 'suspended' } }),
    prisma.delegation.count({ 
      where: { 
        status: 'active', 
        endsAt: { gte: now, lte: in7Days } 
      } 
    }),
    prisma.delegation.aggregate({ _sum: { usageCount: true } }),
    prisma.delegation.groupBy({
      by: ['bureau'],
      _count: true,
      where: { status: 'active', endsAt: { gte: now } },
      orderBy: { _count: { bureau: 'desc' } },
      take: 5,
    }),
    prisma.delegation.groupBy({
      by: ['category'],
      _count: true,
      where: { status: 'active', endsAt: { gte: now } },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    }),
    prisma.delegationEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { delegation: { select: { id: true, category: true, object: true, delegateName: true } } },
    }),
  ]);

    return NextResponse.json({
      total,
      active,
      expired,
      revoked,
      suspended,
      expiringSoon,
      totalUsage: totalUsage._sum.usageCount ?? 0,
      byBureau: byBureau.map(b => ({ bureau: b.bureau, count: b._count })),
      byType: byType.map(t => ({ type: t.category, count: t._count })),
      recentActivity: recentActivity.map(e => ({
        id: e.id,
        delegationId: e.delegationId,
        delegationType: e.delegation.category || e.delegation.object,
        agentName: e.delegation.delegateName,
        action: e.eventType,
        actorName: e.actorName,
        details: e.details,
        createdAt: e.createdAt.toISOString(),
      })),
      ts: new Date().toISOString(),
      _mock: false,
    });
  } catch (error) {
    console.error('[API] Erreur Prisma stats, fallback vers mock data:', error);
    
    // Fallback vers mock data
    return NextResponse.json({
      ...mockDelegationsStats,
      _mock: true,
    });
  }
}

