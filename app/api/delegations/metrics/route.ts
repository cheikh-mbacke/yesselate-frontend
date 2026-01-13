/**
 * API Métriques avancées délégations
 * ==================================
 * 
 * GET /api/delegations/metrics
 * 
 * Fournit des métriques avancées pour le tableau de bord de direction :
 * - KPIs globaux
 * - Tendances
 * - Risques
 * - Activité
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30'; // jours
    const days = parseInt(period, 10);
    
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);
    const expiringSoonThreshold = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // ========================================
    // COMPTEURS GLOBAUX
    // ========================================
    const [
      total,
      active,
      suspended,
      revoked,
      expired,
      draft,
      submitted,
      expiringSoon,
    ] = await Promise.all([
      prisma.delegation.count(),
      prisma.delegation.count({ where: { status: 'active' } }),
      prisma.delegation.count({ where: { status: 'suspended' } }),
      prisma.delegation.count({ where: { status: 'revoked' } }),
      prisma.delegation.count({ where: { status: 'expired' } }),
      prisma.delegation.count({ where: { status: 'draft' } }),
      prisma.delegation.count({ where: { status: 'submitted' } }),
      prisma.delegation.count({
        where: {
          status: 'active',
          endsAt: { lte: expiringSoonThreshold, gt: now },
        },
      }),
    ]);

    // ========================================
    // USAGES
    // ========================================
    const usageStats = await prisma.delegation.aggregate({
      _sum: {
        usageCount: true,
        usageTotalAmount: true,
      },
    });

    const usagesThisPeriod = await prisma.delegationUsage.count({
      where: {
        createdAt: { gte: periodStart },
      },
    });

    const usagesPreviousPeriod = await prisma.delegationUsage.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: periodStart },
      },
    });

    const usageTrend = usagesPreviousPeriod > 0
      ? Math.round(((usagesThisPeriod - usagesPreviousPeriod) / usagesPreviousPeriod) * 100)
      : usagesThisPeriod > 0 ? 100 : 0;

    // ========================================
    // PAR BUREAU
    // ========================================
    const byBureau = await prisma.delegation.groupBy({
      by: ['bureau'],
      where: { status: 'active' },
      _count: { id: true },
      _sum: { usageCount: true, usageTotalAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // ========================================
    // PAR CATÉGORIE
    // ========================================
    const byCategory = await prisma.delegation.groupBy({
      by: ['category'],
      where: { status: 'active' },
      _count: { id: true },
      _sum: { usageTotalAmount: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // ========================================
    // ACTIVITÉ RÉCENTE
    // ========================================
    const recentEvents = await prisma.delegationEvent.findMany({
      where: {
        createdAt: { gte: periodStart },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        delegationId: true,
        eventType: true,
        actorName: true,
        summary: true,
        createdAt: true,
        delegation: {
          select: {
            title: true,
            bureau: true,
          },
        },
      },
    });

    // ========================================
    // CONTRÔLES EN ATTENTE
    // ========================================
    const pendingControls = await prisma.delegationUsage.count({
      where: {
        status: 'PENDING_CONTROL',
      },
    });

    // ========================================
    // RISQUES
    // ========================================
    
    // Délégations à forte utilisation (>80% du plafond)
    const highUsageDelegations = await prisma.delegation.findMany({
      where: {
        status: 'active',
        maxTotalAmount: { gt: 0 },
      },
      select: {
        id: true,
        title: true,
        bureau: true,
        maxTotalAmount: true,
        usageTotalAmount: true,
        delegateName: true,
      },
    });

    const atCapacityRisk = highUsageDelegations.filter(d => {
      const usage = d.usageTotalAmount / (d.maxTotalAmount || 1);
      return usage >= 0.8;
    });

    // Délégations sans activité depuis longtemps
    const dormantDelegations = await prisma.delegation.count({
      where: {
        status: 'active',
        OR: [
          { lastUsedAt: null },
          { lastUsedAt: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    // Délégations avec beaucoup de rejets
    const highRejectionDelegations = await prisma.$queryRaw`
      SELECT 
        d.id, 
        d.title, 
        d.bureau,
        COUNT(CASE WHEN u.status = 'DENIED' THEN 1 END) as rejections,
        COUNT(u.id) as total_usages
      FROM Delegation d
      LEFT JOIN DelegationUsage u ON d.id = u.delegationId
      WHERE d.status = 'active'
      GROUP BY d.id, d.title, d.bureau
      HAVING COUNT(CASE WHEN u.status = 'DENIED' THEN 1 END) > 2
      ORDER BY rejections DESC
      LIMIT 5
    ` as any[];

    // ========================================
    // TENDANCES (création sur les derniers mois)
    // ========================================
    const creationTrend = await prisma.delegation.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
      },
    });

    // Regrouper par mois
    const monthlyCreations: Record<string, number> = {};
    creationTrend.forEach(item => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7);
      monthlyCreations[month] = (monthlyCreations[month] || 0) + item._count.id;
    });

    // ========================================
    // SCORE DE SANTÉ GLOBAL
    // ========================================
    let healthScore = 100;
    
    // Pénalités
    if (expiringSoon > 0) healthScore -= Math.min(20, expiringSoon * 3);
    if (pendingControls > 0) healthScore -= Math.min(15, pendingControls * 2);
    if (atCapacityRisk.length > 0) healthScore -= Math.min(15, atCapacityRisk.length * 5);
    if (dormantDelegations > 5) healthScore -= 10;
    if (suspended > 0) healthScore -= Math.min(10, suspended * 2);
    
    healthScore = Math.max(0, healthScore);
    
    const healthLevel = healthScore >= 80 ? 'GOOD' : healthScore >= 60 ? 'WARNING' : 'CRITICAL';

    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      period: {
        days,
        start: periodStart.toISOString(),
        end: now.toISOString(),
      },
      
      counts: {
        total,
        active,
        suspended,
        revoked,
        expired,
        draft,
        submitted,
        expiringSoon,
      },
      
      usage: {
        totalCount: usageStats._sum.usageCount || 0,
        totalAmount: usageStats._sum.usageTotalAmount || 0,
        thisPeriod: usagesThisPeriod,
        trend: usageTrend,
        pendingControls,
      },
      
      byBureau: byBureau.map(b => ({
        bureau: b.bureau,
        count: b._count.id,
        usageCount: b._sum.usageCount || 0,
        totalAmount: b._sum.usageTotalAmount || 0,
      })),
      
      byCategory: byCategory.map(c => ({
        category: c.category,
        count: c._count.id,
        totalAmount: c._sum.usageTotalAmount || 0,
      })),
      
      recentActivity: recentEvents.map(e => ({
        id: e.id,
        delegationId: e.delegationId,
        delegationTitle: e.delegation?.title,
        bureau: e.delegation?.bureau,
        eventType: e.eventType,
        actorName: e.actorName,
        summary: e.summary,
        createdAt: e.createdAt,
      })),
      
      risks: {
        expiringSoon,
        pendingControls,
        atCapacity: atCapacityRisk.map(d => ({
          id: d.id,
          title: d.title,
          bureau: d.bureau,
          delegate: d.delegateName,
          usagePercent: Math.round((d.usageTotalAmount / (d.maxTotalAmount || 1)) * 100),
        })),
        dormant: dormantDelegations,
        highRejections: highRejectionDelegations,
      },
      
      trends: {
        monthlyCreations: Object.entries(monthlyCreations)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
      },
      
      health: {
        score: healthScore,
        level: healthLevel,
        factors: {
          expiringSoon: expiringSoon > 0,
          pendingControls: pendingControls > 0,
          atCapacity: atCapacityRisk.length > 0,
          dormant: dormantDelegations > 5,
          suspended: suspended > 0,
        },
      },
      
      ts: now.toISOString(),
    });
  } catch (error) {
    console.error('[API] Erreur métriques délégations:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des métriques.' },
      { status: 500 }
    );
  }
}

