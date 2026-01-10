export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
    prisma.delegation.count({ where: { status: 'active', endDate: { gte: now } } }),
    prisma.delegation.count({ 
      where: { 
        OR: [
          { status: 'expired' },
          { endDate: { lt: now }, status: { notIn: ['revoked', 'suspended'] } }
        ]
      } 
    }),
    prisma.delegation.count({ where: { status: 'revoked' } }),
    prisma.delegation.count({ where: { status: 'suspended' } }),
    prisma.delegation.count({ 
      where: { 
        status: 'active', 
        endDate: { gte: now, lte: in7Days } 
      } 
    }),
    prisma.delegation.aggregate({ _sum: { usageCount: true } }),
    prisma.delegation.groupBy({
      by: ['bureau'],
      _count: true,
      where: { status: 'active', endDate: { gte: now } },
      orderBy: { _count: { bureau: 'desc' } },
      take: 5,
    }),
    prisma.delegation.groupBy({
      by: ['type'],
      _count: true,
      where: { status: 'active', endDate: { gte: now } },
      orderBy: { _count: { type: 'desc' } },
      take: 5,
    }),
    prisma.delegationEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { delegation: { select: { id: true, type: true, agentName: true } } },
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
    byType: byType.map(t => ({ type: t.type, count: t._count })),
    recentActivity: recentActivity.map(e => ({
      id: e.id,
      delegationId: e.delegationId,
      delegationType: e.delegation.type,
      agentName: e.delegation.agentName,
      action: e.action,
      actorName: e.actorName,
      details: e.details,
      createdAt: e.createdAt.toISOString(),
    })),
    ts: new Date().toISOString(),
  });
}

